import type { SupabaseClient } from '@supabase/supabase-js'
import type { RegistrationProfile } from './registrationProfile'

export const roles = ['owner', 'admin', 'mechanic', 'reception'] as const
export type Role = (typeof roles)[number]
export type Identity = { id: string; confirmed: boolean; displayName?: string }
export type Membership = { user_id: string; workshop_id: string; role: string; status: string }
export type Workshop = { id: string; name: string; status: string }
export type Choice = { workshop: Workshop; role: Role }
export type WorkshopAccess = { operationsEnabled: boolean; documentsEnabled: boolean }
export type Context = Choice & { userId: string; displayName?: string; operationsEnabled?: boolean; documentsEnabled?: boolean }
export interface AuthGateway {
  /** Obtain the same SDK instance used for login, not a second browser session. */
  getDataClient?(): Promise<SupabaseClient | null>
  hasSession(): Promise<boolean>
  getUser(): Promise<Identity | null>
  signIn(email: string, password: string): Promise<void>
  register?(email: string, password: string, profile: RegistrationProfile): Promise<void>
  signOut(): Promise<void>
  memberships(userId: string): Promise<Membership[]>
  workshops(ids: string[]): Promise<Workshop[]>
  workshopAccess?(id: string): Promise<WorkshopAccess>
  subscribe(callback: (event: string, observedUserId?: string) => void): () => void
}
export type AuthState = {
  phase:
    | 'disabled'
    | 'checking'
    | 'signing-in'
    | 'registering'
    | 'registration-sent'
    | 'anonymous'
    | 'unconfirmed'
    | 'no-membership'
    | 'choose'
    | 'authorized'
    | 'restricted'
    | 'offline'
    | 'error'
    | 'signing-out'
  message: string
  identityName?: string
  identityId?: string
  /** Changes on a new verified authority, not on routine checks of the same scope. */
  authorityVersion?: number
  choices?: Choice[]
  context?: Context
}
export class AuthFailure extends Error {
  constructor(public kind: 'credentials' | 'offline' | 'expired' | 'unconfirmed' | 'permission') {
    super(kind)
  }
}
const expired = 'La sesión venció o dejó de ser válida. Vuelve a iniciar sesión.'
export class AuthController {
  private state: AuthState
  private listeners = new Set<() => void>()
  private epoch = 0
  private cleanup?: () => void
  private eventTimer?: ReturnType<typeof setTimeout>
  private selected?: string
  private blocked = false
  private signingIn = false
  private registering = false
  private validation?: Promise<void>
  constructor(
    private gateway: AuthGateway | null,
    disabledReason = ''
  ) {
    this.state = gateway
      ? { phase: 'checking', message: 'Verificando sesión y autorización…' }
      : { phase: 'disabled', message: disabledReason }
  }
  /** A confirmed personal account may query self-only RPCs without workshop membership. */
  async personalPlanClient(): Promise<SupabaseClient | null> {
    const scope = this.authorityKey()
    if (!this.gateway?.getDataClient || !scope) return null
    try {
      const user = await this.gateway.getUser()
      if (this.authorityKey() !== scope) return null
      if (!user?.confirmed) throw new AuthFailure(user ? 'unconfirmed' : 'expired')
      if (user.id !== (this.state.context?.userId ?? this.state.identityId)) {
        this.epoch++; this.validation=undefined; this.selected=undefined
        this.set({phase:'checking',message:'Verificando sesión y autorización…'})
        this.requestRevalidation()
        return null
      }
      const client = await this.gateway.getDataClient()
      return this.authorityKey() === scope ? client : null
    } catch (error) {
      if (this.authorityKey() === scope) {
        this.epoch++; this.validation=undefined
        if (this.eventTimer) clearTimeout(this.eventTimer)
        this.fail(error)
      }
      return null
    }
  }
  private authorityKey() {
    if (!['authorized','restricted','no-membership'].includes(this.state.phase)) return null
    return [this.state.phase,this.state.context?.userId ?? this.state.identityId,
      this.state.context?.workshop.id,this.state.context?.role,this.state.authorityVersion].join(':')
  }
  async directoryClient(): Promise<SupabaseClient | null> {
    const scope = this.authorityKey()
    if (!this.gateway?.getDataClient || !scope ||
        !['authorized', 'restricted'].includes(this.state.phase)) return null
    try {
      const client = await this.gateway.getDataClient()
      // Lazy SDK resolution must not outlive logout or a change of authority.
      return this.authorityKey() === scope ? client : null
    } catch {
      return null
    }
  }
  getSnapshot = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  private set(state: AuthState) {
    this.state = state
    this.listeners.forEach((fn) => fn())
  }
  private fail(error: unknown, login = false) {
    this.selected = undefined
    if (error instanceof AuthFailure && error.kind === 'offline')
      this.set({
        phase: 'offline',
        message:
          'Sin conexión. Se ha bloqueado el acceso al taller. Reconecta y vuelve a verificar.'
      })
    else if (error instanceof AuthFailure && error.kind === 'unconfirmed')
      this.set({
        phase: 'unconfirmed',
        message:
          'Se requiere correo confirmado. La verificación y el reenvío no están habilitados en esta etapa.'
      })
    else if (login)
      this.set({
        phase: 'anonymous',
        message: 'No se pudo iniciar sesión. Revisa las credenciales o inténtalo más tarde.'
      })
    else if (error instanceof AuthFailure && error.kind === 'expired')
      this.set({ phase: 'anonymous', message: expired })
    else
      this.set({
        phase: 'error',
        message:
          'No se pudo verificar la autorización. El taller permanece bloqueado. Inténtalo de nuevo.'
      })
  }
  start() {
    if (!this.gateway || this.cleanup) return () => {}
    this.cleanup = this.gateway.subscribe((event, observedUserId) => {
      if (event === 'SIGNED_OUT') {
        if (this.blocked && this.state.phase === 'signing-out') return
        this.epoch++
        this.validation = undefined
        if (this.eventTimer) clearTimeout(this.eventTimer)
        this.selected = undefined
        this.set({ phase: 'anonymous', message: this.blocked ? 'Sesión cerrada.' : expired })
      } else if (!this.blocked && !this.signingIn && !this.registering) {
        // Never await SDK calls inside onAuthStateChange (Auth lock).
        const known = this.state.context?.userId ?? this.state.identityId
        if ((observedUserId && known && observedUserId !== known) ||
            (event === 'SIGNED_IN' && known && !observedUserId)) {
          this.epoch++
          this.validation = undefined
          this.selected = undefined
          this.set({ phase: 'checking', message: 'Verificando sesión y autorización…' })
        }
        this.requestRevalidation()
      }
    })
    // Explicit sign-out remains blocked across route changes; do not replace
    // its anonymous/error state with a checking screen validate cannot finish.
    if (!this.blocked) void this.validate()
    return () => {
      this.epoch++
      this.validation = undefined
      if (this.eventTimer) clearTimeout(this.eventTimer)
      this.cleanup?.()
      this.cleanup = undefined
      this.selected = undefined
      if (!this.blocked) this.set({ phase: 'checking', message: 'Verificando sesión y autorización…' })
    }
  }
  /** Coalesce SDK/focus/visibility bursts, without skipping a server check. */
  requestRevalidation = () => {
    if (!this.gateway || this.blocked) return
    if (this.eventTimer) clearTimeout(this.eventTimer)
    this.eventTimer = setTimeout(() => { this.eventTimer = undefined; void this.validate() }, 60)
  }
  goOffline = () => {
    if (this.blocked || !this.gateway) return
    this.epoch++
    this.validation = undefined
    if (this.eventTimer) clearTimeout(this.eventTimer)
    this.fail(new AuthFailure('offline'))
  }
  async validate(selection?: string) {
    if (!this.gateway || this.blocked || this.signingIn || this.registering) return
    if (selection === undefined && this.validation) return this.validation
    const request = this.performValidation(selection)
    this.validation = request
    try { await request } finally { if (this.validation === request) this.validation = undefined }
  }
  private async performValidation(selection?: string) {
    if (!this.gateway) return
    const epoch = ++this.epoch
    const previous = this.state
    let requested = selection ?? this.selected
    const routine = selection === undefined && ['authorized','restricted','no-membership','anonymous'].includes(previous.phase)
    if (!routine) this.set({ phase: 'checking', message: 'Verificando sesión y autorización…' })
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false)
        throw new AuthFailure('offline')
      if (!(await this.gateway.hasSession())) {
        if (epoch !== this.epoch) return
        this.selected = undefined
        this.set({
          phase: 'anonymous',
          message:
            'Ingresa con tu cuenta autorizada. El rol depende de tu membresía, no del selector.'
        })
        return
      }
      const user = await this.gateway.getUser()
      if (epoch !== this.epoch) return
      if (!user) throw new AuthFailure('expired')
      if (!user.confirmed) throw new AuthFailure('unconfirmed')
      const priorUser = previous.context?.userId ?? previous.identityId
      if (priorUser && priorUser !== user.id) {
        requested = undefined
        this.selected = undefined
        this.set({phase:'checking',message:'Verificando sesión y autorización…'})
      }
      const rows = await this.gateway.memberships(user.id)
      if (epoch !== this.epoch) return
      const active = rows.filter(
        (row) =>
          row.user_id === user.id && row.status === 'active' && roles.includes(row.role as Role)
      )
      const workshops = active.length
        ? await this.gateway.workshops([...new Set(active.map((row) => row.workshop_id))])
        : []
      const choices: Choice[] = workshops
        .filter((w) => w.status === 'active')
        .flatMap((workshop) => {
          const matching = active.filter((row) => row.workshop_id === workshop.id)
          return matching.length === 1 ? [{ workshop, role: matching[0].role as Role }] : []
        })
      if (epoch !== this.epoch) return
      if (!choices.length || (requested && !choices.some((c) => c.workshop.id === requested))) {
        this.selected = undefined
        if (routine && previous.phase==='no-membership' && previous.identityId===user.id &&
            previous.identityName===user.displayName) return
        this.set({
          phase: 'no-membership',
          message: 'Cuenta personal verificada. Todavía no tienes un taller autorizado. Tu plan y las invitaciones se verifican en el servidor.',
          identityName: user.displayName,
          identityId: user.id,
          authorityVersion: routine && previous.phase==='no-membership' && previous.identityId===user.id
            ? previous.authorityVersion ?? epoch : epoch
        })
        return
      }
      if (!requested && choices.length > 1) {
        this.set({
          phase: 'choose',
          message: 'Selecciona un taller autorizado. Se verificará nuevamente la membresía.',
          identityName: user.displayName,
          identityId: user.id,
          choices
        })
        return
      }
      const choice = choices.find((c) => c.workshop.id === requested) ?? choices[0]
      this.selected = choice.workshop.id
      // Capability is read from private server rollout records, never metadata or build IDs.
      const access = this.gateway.workshopAccess
        ? await this.gateway.workshopAccess(choice.workshop.id)
        : { operationsEnabled: false, documentsEnabled: false }
      if (epoch !== this.epoch) return
      const nextContext = { ...choice, userId: user.id, displayName: user.displayName, ...access }
      const sameContext = JSON.stringify(previous.context) === JSON.stringify(nextContext)
      const phase = choice.role === 'reception' ? 'restricted' : 'authorized'
      const sameAuthority = previous.context?.userId===user.id && previous.context?.workshop.id===choice.workshop.id && previous.context?.role===choice.role && previous.context?.operationsEnabled===access.operationsEnabled && previous.context?.documentsEnabled===access.documentsEnabled
      if (routine && previous.phase === phase && sameContext && JSON.stringify(previous.choices) === JSON.stringify(choices)) return
      this.set({
        phase,
        message:
          choice.role === 'reception'
            ? 'Acceso restringido. Las funciones de recepción están pendientes de definición.'
            : 'Sesión y membresía verificadas. Operaciones de negocio aún no habilitadas.',
        choices,
        authorityVersion: routine && sameAuthority ? previous.authorityVersion ?? epoch : epoch,
        context: sameContext ? previous.context : nextContext
      })
    } catch (error) {
      if (epoch === this.epoch) this.fail(error)
    }
  }
  async login(email: string, password: string) {
    if (!this.gateway || this.signingIn || ['checking', 'signing-out'].includes(this.state.phase))
      return
    this.blocked = false
    this.selected = undefined
    this.signingIn = true
    const epoch = ++this.epoch
    this.validation = undefined
    this.set({ phase: 'signing-in', message: 'Comprobando credenciales…' })
    try {
      await this.gateway.signIn(email.trim(), password)
      if (epoch !== this.epoch) return
      this.signingIn = false
      await this.validate()
    } catch (error) {
      if (epoch === this.epoch) this.fail(error, true)
    } finally {
      this.signingIn = false
      // Navigation can unmount/remount access while signIn still owns its request.
      // Recover that loading screen through a fresh server check, never the stale result.
      if (epoch !== this.epoch && this.cleanup && !this.blocked && this.state.phase === 'checking')
        void this.validate()
    }
  }
  async register(email: string, password: string, profile: RegistrationProfile) {
    if (!this.gateway?.register || this.registering || this.signingIn || this.blocked) return
    this.registering = true
    const epoch = ++this.epoch
    this.validation = undefined
    this.set({ phase: 'registering', message: 'Solicitando confirmación de correo…' })
    try {
      await this.gateway.register(email.trim().toLowerCase(), password, profile)
      if (epoch === this.epoch) {
        this.set({
          phase: 'registration-sent',
          message: 'Si esta dirección es válida y puede recibir correos, llegará un enlace de confirmación. Revísalo, confirma tu correo y luego inicia sesión. La autorización de un taller se asigna por separado.'
        })
      }
    } catch {
      if (epoch === this.epoch) {
        this.set({
          phase: 'error',
          message: 'No se pudo completar la solicitud de registro. Comprueba la configuración de correo del proyecto o inténtalo más tarde.'
        })
      }
    } finally {
      this.registering = false
    }
  }
  async logout() {
    if (!this.gateway || this.state.phase === 'signing-out') return
    const epoch = ++this.epoch
    this.validation = undefined
    this.blocked = true
    this.selected = undefined
    this.set({ phase: 'signing-out', message: 'Cerrando sesión…' })
    try {
      await this.gateway.signOut()
      if (epoch === this.epoch || (this.blocked && this.getSnapshot().phase === 'signing-out'))
        this.set({ phase: 'anonymous', message: 'Sesión cerrada.' })
    } catch {
      if (epoch === this.epoch || (this.blocked && this.getSnapshot().phase === 'signing-out'))
        this.set({
          phase: 'error',
          message:
            'Acceso local bloqueado. No se pudo confirmar el cierre en el servidor. Reconecta y vuelve a cerrar sesión.'
        })
    }
  }
  choose = (id: string) => this.validate(id)
  changeWorkshop = () => {
    this.epoch++
    this.validation = undefined
    this.selected = undefined
    this.set({phase:'checking',message:'Verificando sesión y autorización…'})
    return this.validate()
  }
}
