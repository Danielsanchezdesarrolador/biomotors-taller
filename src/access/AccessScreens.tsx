import { BrandLogo } from '../brand/BrandLogo'
import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CarFront,
  CalendarDays,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Link,
  LockKeyhole,
  LogIn,
  Mail,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Store,
  UserPlus,
  UserRound,
  UsersRound,
  Wrench
} from 'lucide-react'
import {
  accessPaths,
  passwordCriteria,
  type AccessPage,
  type AccessPresentation
} from './accessContract'
import { ReviewBanner } from './ReviewBanner'
import { parseRegistrationProfile, type RegistrationProfile } from '../auth/registrationProfile'
import './access.css'
export type AccessDraft = {
  email: string
  password: string
  confirmPassword: string
  name: string
  birthDate: string
  phone: string
  workshop: string
  terms: boolean
  remember: boolean
}
const blank: AccessDraft = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  birthDate: '',
  phone: '',
  workshop: '',
  terms: false,
  remember: false
}
export function AccessScreens({
  page,
  presentation,
  onNavigate,
  onReviewSubmit,
  auth
}: {
  page: AccessPage
  presentation: AccessPresentation
  onNavigate: (path: string) => void
  auth?: {
    enabled: boolean
    busy: boolean
    message: string
    onLogin: (email: string, password: string) => void
    registrationEnabled?: boolean
    completed?: boolean
    onRegister?: (email: string, password: string, profile: RegistrationProfile) => void
    content?: ReactNode
  }
  onReviewSubmit?: (draft: AccessDraft, presentation: AccessPresentation) => string | void
}) {
  const [draft, setDraft] = useState<AccessDraft>({ ...blank }),
    [visible, setVisible] = useState(false),
    [confirmVisible, setConfirmVisible] = useState(false),
    [message, setMessage] = useState(''),
    [legal, setLegal] = useState(false),
    [registrationRole, setRegistrationRole] = useState<AccessPresentation>(presentation)
  const realLogin = !!auth?.enabled && page === 'login'
  const realRegistration = !!auth?.enabled && !!auth?.registrationEnabled && page === 'register'
  const realPage = realLogin || realRegistration
  const interactive = !!onReviewSubmit ||
    (realPage && !auth?.busy && !(realRegistration && auth?.completed))
  const patch = <K extends keyof AccessDraft>(key: K, value: AccessDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))
  const criteria = passwordCriteria(draft.password),
    score = Object.values(criteria).filter(Boolean).length
  const navigate = (path: string) => {
    setMessage('')
    onNavigate(path)
  }
  const context = page === 'register' ? registrationRole : presentation
  const titles: Record<AccessPage, [string, string]> = {
    login: [
      'Inicia sesión',
      context === 'mecanico'
        ? 'El acceso técnico requerirá correo verificado y asignación del taller.'
        : 'El acceso al taller requerirá correo verificado y autorización.'
    ],
    register: ['Crea tu cuenta', 'Comienza a preparar el acceso a ByteTorque para tu taller.'],
    verify: [
      'Verifica tu correo',
      'La verificación de la cuenta estará disponible con el acceso seguro.'
    ],
    recover: ['¿Olvidaste tu contraseña?', 'Te ayudaremos a recuperar el acceso a tu cuenta.'],
    recoveryNotice: ['Revisa tu correo', 'Vista previa de la recuperación de acceso.'],
    newPassword: [
      'Crear nueva contraseña',
      'Define una contraseña segura cuando se habilite la recuperación.'
    ],
    passwordUpdated: ['Contraseña actualizada', 'Vista previa del estado de confirmación.']
  }
  function field(
    key: keyof AccessDraft,
    label: string,
    placeholder: string,
    type = 'text',
    icon: ReactNode = <UserRound />
  ) {
    const secret = key === 'password' || key === 'confirmPassword',
      shown = key === 'confirmPassword' ? confirmVisible : visible
    return (
      <label className="access-field" key={key}>
        <span>{label}</span>
        <span className="access-input">
          {icon}
          <input
            name={key}
            aria-label={label}
            type={secret ? (shown ? 'text' : 'password') : type}
            placeholder={placeholder}
            value={String(draft[key])}
            disabled={!interactive}
            min={type === 'date' ? '1900-01-01' : undefined}
            max={type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
            autoComplete={
              realLogin
                ? key === 'email'
                  ? 'username'
                  : key === 'password'
                    ? 'current-password'
                    : 'off'
                : realRegistration
                  ? key === 'name' ? 'name' : key === 'birthDate' ? 'bday' : key === 'email' ? 'email' : secret ? 'new-password' : 'off'
                  : 'off'
            }
            autoCapitalize={type === 'email' ? 'none' : undefined}
            spellCheck={false}
            onChange={(e) => patch(key, e.target.value)}
          />
          {secret && (
            <button
              type="button"
              aria-label={(shown ? 'Ocultar' : 'Mostrar') + ' ' + label.toLocaleLowerCase('es-CL')}
              aria-pressed={shown}
              onClick={() =>
                key === 'confirmPassword'
                  ? setConfirmVisible(!confirmVisible)
                  : setVisible(!visible)
              }
            >
              {shown ? <Eye /> : <EyeOff />}
            </button>
          )}
        </span>
      </label>
    )
  }
  function action(label: string, icon: ReactNode) {
    return (
      <button
        className="access-primary"
        type="submit"
        disabled={!interactive}
        title={
          !interactive ? 'Acceso en preparación. No hay autenticación ni envío real.' : undefined
        }
      >
        {icon}
        {label}
      </button>
    )
  }
  function previewLink(label: string, path: string, icon: ReactNode = <ArrowRight />) {
    return (
      <button type="button" className="access-preview-link" onClick={() => navigate(path)}>
        {label}
        {icon}
      </button>
    )
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    if (realLogin && auth && !auth.busy) {
      if (!draft.email.trim() || !draft.password) {
        setMessage('Completa el correo y la contraseña.')
        return
      }
      const password = draft.password
      patch('password', '')
      auth.onLogin(draft.email, password)
      return
    }
    if (realRegistration && auth?.onRegister && !auth.busy) {
      const email = draft.email.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('Ingresa un correo electrónico válido.')
        return
      }
      let profile: RegistrationProfile
      try {
        profile = parseRegistrationProfile({ fullName: draft.name, dateOfBirth: draft.birthDate })
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Revisa tus datos personales.')
        return
      }
      if (!Object.values(passwordCriteria(draft.password)).every(Boolean)) {
        setMessage('Utiliza 8 o más caracteres, mayúscula, número y símbolo.')
        return
      }
      if (draft.password !== draft.confirmPassword) {
        setMessage('Las contraseñas no coinciden.')
        return
      }
      const password = draft.password
      setDraft((current) => ({ ...current, password: '', confirmPassword: '' }))
      auth.onRegister(email, password, profile)
      return
    }
    if (!onReviewSubmit) return
    if (page === 'login') {
      if (!draft.email.trim() || !draft.password) {
        setMessage('Completa el correo y la contraseña de revisión.')
        return
      }
      setMessage(onReviewSubmit(draft, context) || '')
    } else
      setMessage(
        'Solo revisión visual: no se ha creado una cuenta, enviado un correo ni actualizado una contraseña.'
      )
  }
  return (
    <main className="access-stage">
      <section className="access-brand-panel" aria-label="ByteTorque, gestión de talleres">
        <div className="access-workshop-art" aria-hidden="true" />
        <div className="access-brand-content">
          <a
            className="access-brand"
            href="/#/acceso"
            onClick={(e) => {
              e.preventDefault()
              navigate(accessPaths.login)
            }}
          >
            <BrandLogo surface="dark" />
          </a>
          <div className="access-marketing">
            <h2>
              Gestión inteligente
              <br />
              para <em>talleres mecánicos</em>
            </h2>
            <p>
              Controla órdenes de trabajo, vehículos, clientes, cotizaciones e informes en un solo
              lugar.
            </p>
            <ul>
              <li>
                <span>
                  <CarFront />
                </span>
                Optimiza la operación de tu taller
              </li>
              <li>
                <span>
                  <BarChart3 />
                </span>
                Mayor control y trazabilidad
              </li>
              <li>
                <span>
                  <UsersRound />
                </span>
                Mejor experiencia para tus clientes
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="access-form-side">
        <div className={'access-card access-card-' + page}>
          {realPage ? (
            <div className="access-review-note" role="note">
              <ShieldCheck />
              <div>
                <strong>Acceso seguro · Supabase Auth</strong>
                <span>
                  {realRegistration
                    ? 'Registro con correo verificado. Crear una cuenta no concede acceso a ningún taller.'
                    : 'El taller y el rol se verifican en el servidor. El acceso no concede permisos sin membresía.'}
                </span>
              </div>
            </div>
          ) : (
            <ReviewBanner compact />
          )}
          {auth && !realPage && (
            <p className="access-message auth-login-message" role="status">
              {auth.message}
            </p>
          )}
          {page === 'passwordUpdated' && (
            <div className="access-success-art" aria-hidden="true">
              <Check />
            </div>
          )}
          <header className="access-card-heading">
            <h1>{titles[page][0]}</h1>
            <p>{realRegistration
              ? 'Registra tu correo y una contraseña. La confirmación es obligatoria y el acceso al taller requiere autorización posterior.'
              : titles[page][1]}</p>
          </header>
          {auth?.content}
          {!auth?.content && (page === 'login' || (page === 'register' && !realRegistration)) && (
            <section className="access-type">
              <strong>{page === 'login' ? 'Acceso para' : 'Tipo de acceso'}</strong>
              <div role="group" aria-label="Tipo de acceso visual">
                {(['administrador', 'mecanico'] as const).map((role) => (
                  <button
                    type="button"
                    key={role}
                    disabled={auth?.busy}
                    className={role === context ? 'selected' : ''}
                    aria-pressed={role === context}
                    onClick={() =>
                      page === 'register'
                        ? setRegistrationRole(role)
                        : navigate(
                            role === 'administrador'
                              ? accessPaths.administrator
                              : accessPaths.mechanic
                          )
                    }
                  >
                    {role === 'administrador' ? <ShieldCheck /> : <Wrench />}
                    {role === 'administrador'
                      ? 'Administrador'
                      : page === 'register'
                        ? 'Mecánico invitado'
                        : 'Mecánico'}
                  </button>
                ))}
              </div>
            </section>
          )}
          {!auth?.content &&
            (page === 'login' ||
              page === 'register' ||
              page === 'recover' ||
              page === 'newPassword') && (
              <form className="access-form" onSubmit={submit} noValidate>
                {page === 'register' && context === 'mecanico' && !realRegistration ? (
                  <div className="access-information">
                    <Info />
                    <p>
                      El mecánico accede mediante invitación de su taller. No hay autorregistro ni
                      invitaciones habilitadas en esta vista.
                    </p>
                  </div>
                ) : (
                  <>
                    {page === 'recover' && (
                      <p className="access-instructions">
                        Ingresa el correo de tu cuenta cuando el servicio esté habilitado para
                        solicitar un enlace de recuperación.
                      </p>
                    )}
                    {page === 'register' && (
                      <>
                        {field('name', 'Nombre completo', 'Ingresa tu nombre y apellido')}
                        {realRegistration && (
                          <>
                            {field('birthDate', 'Fecha de nacimiento', 'Selecciona tu fecha de nacimiento', 'date', <CalendarDays />)}
                            <p className="access-profile-notice">Tu fecha de nacimiento se guarda en tu cuenta y no concede acceso a talleres.</p>
                          </>
                        )}
                      </>
                    )}
                    {page !== 'newPassword' &&
                      field(
                        'email',
                        'Correo electrónico',
                        'Ingresa tu correo electrónico',
                        'email',
                        <Mail />
                      )}
                    {page === 'register' && !realRegistration && (
                      <>
                        {field('phone', 'Teléfono', 'Ej. +56 9 XXXX XXXX', 'tel', <Smartphone />)}
                        {field(
                          'workshop',
                          'Nombre del taller',
                          'Ingresa el nombre de tu taller',
                          'text',
                          <Store />
                        )}
                      </>
                    )}
                    {(page === 'login' || page === 'register' || page === 'newPassword') &&
                      field(
                        'password',
                        page === 'newPassword' ? 'Nueva contraseña' : 'Contraseña',
                        page === 'register'
                          ? 'Crea una contraseña segura'
                          : page === 'newPassword'
                            ? 'Ingresa tu nueva contraseña'
                            : 'Ingresa tu contraseña',
                        'password',
                        <LockKeyhole />
                      )}
                    {(page === 'register' || page === 'newPassword') &&
                      field(
                        'confirmPassword',
                        page === 'newPassword'
                          ? 'Confirmar nueva contraseña'
                          : 'Confirmar contraseña',
                        'Confirma tu contraseña',
                        'password',
                        <LockKeyhole />
                      )}
                    {page === 'login' && (
                      <div className="access-form-options">
                        <label>
                          <input
                            type="checkbox"
                            checked={realLogin || draft.remember}
                            disabled={realLogin || !interactive}
                            onChange={(e) => patch('remember', e.target.checked)}
                          />
                          {realLogin ? 'Sesión guardada por Supabase' : 'Recordarme'}
                        </label>
                        <button type="button" onClick={() => navigate(accessPaths.recover)}>
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                    )}
                    {page === 'register' && !realRegistration && (
                      <label className="access-terms">
                        <input
                          type="checkbox"
                          checked={draft.terms}
                          disabled={!interactive}
                          onChange={(e) => patch('terms', e.target.checked)}
                        />
                        <span>
                          Acepto los{' '}
                          <button type="button" onClick={() => setLegal(true)}>
                            Términos de servicio
                          </button>{' '}
                          y la{' '}
                          <button type="button" onClick={() => setLegal(true)}>
                            Política de privacidad
                          </button>
                        </span>
                      </label>
                    )}
                    {page === 'newPassword' && (
                      <div className="access-password-guide">
                        <div>
                          <strong>Seguridad de la contraseña</strong>
                          <span>
                            {score === 4
                              ? 'Criterios completos'
                              : score > 1
                                ? 'Media'
                                : score
                                  ? 'Inicial'
                                  : 'Por definir'}
                          </span>
                        </div>
                        <meter
                          min={0}
                          max={4}
                          value={score}
                          aria-label="Criterios visuales de contraseña"
                        />
                        <section>
                          <strong>Tu contraseña debe cumplir con:</strong>
                          {(
                            [
                              ['length', '8 o más caracteres'],
                              ['uppercase', 'Al menos una letra mayúscula (A–Z)'],
                              ['number', 'Al menos un número (0–9)'],
                              ['symbol', 'Al menos un símbolo (p. ej., !@#$%)']
                            ] as const
                          ).map(([key, label]) => (
                            <p key={key} className={criteria[key] ? 'met' : ''}>
                              <span>{criteria[key] ? <Check /> : '○'}</span>
                              {label}
                            </p>
                          ))}
                        </section>
                      </div>
                    )}
                    {(message || (realPage && auth?.message)) && (
                      <p
                        className={
                          'access-message' + (realPage && !message ? ' auth-login-message' : '')
                        }
                        role="status"
                      >
                        {message || auth?.message}
                      </p>
                    )}
                    {action(
                      page === 'login'
                        ? auth?.busy
                          ? 'Verificando…'
                          : 'Ingresar'
                        : page === 'register'
                          ? 'Crear cuenta'
                          : page === 'recover'
                            ? 'Enviar enlace de recuperación'
                            : 'Actualizar contraseña',
                      page === 'login' ? (
                        <LogIn />
                      ) : page === 'register' ? (
                        <UserPlus />
                      ) : page === 'recover' ? (
                        <Mail />
                      ) : (
                        <RotateCcw />
                      )
                    )}
                  </>
                )}
              </form>
            )}
          {page === 'login' && (
            <>
              <div className="access-divider">O también puedes</div>
              <button
                className="access-secondary"
                disabled
                title="Los enlaces de acceso seguro aún no están habilitados."
              >
                <Link />
                Ingresar con enlace seguro
              </button>
              <p className="access-account-question">
                ¿Aún no tienes una cuenta?
                <button type="button" onClick={() => navigate(accessPaths.register)}>
                  Crear cuenta
                  <ArrowRight />
                </button>
              </p>
            </>
          )}
          {page === 'register' && (
            <p className="access-account-question">
              ¿Ya tienes una cuenta?
              <button type="button" onClick={() => navigate(accessPaths.login)}>
                Iniciar sesión
                <ArrowRight />
              </button>
            </p>
          )}
          {(page === 'verify' || page === 'recoveryNotice') && (
            <div className="access-mail-state">
              <div
                className={'access-envelope ' + (page === 'verify' ? 'verification' : '')}
                aria-hidden="true"
              >
                <Mail />
                {page === 'verify' && (
                  <span>
                    <Check />
                  </span>
                )}
              </div>
              <p>
                {page === 'verify'
                  ? auth?.registrationEnabled
                    ? 'Si abriste el enlace de confirmación, vuelve a Iniciar sesión para comprobar que tu correo quedó verificado.'
                    : 'La cuenta requerirá confirmar su dirección de correo antes del primer acceso.'
                  : 'La recuperación se realizará siguiendo el enlace enviado por el servicio de acceso seguro cuando esté habilitado.'}
              </p>
              <div className="access-address">
                <Mail />
                <strong>Dirección pendiente de verificación</strong>
              </div>
              <span className="access-state-reference">
                {page === 'verify' && auth?.registrationEnabled
                  ? 'La confirmación solo se valida al iniciar sesión con el servidor.'
                  : 'Estado de referencia · No se ha enviado un correo'}
              </span>
              {page === 'verify' ? (
                <>
                  <button className="access-primary" disabled>
                    <ExternalLink />
                    Abrir correo
                  </button>
                  <button className="access-secondary" disabled>
                    <RotateCcw />
                    Reenviar correo
                  </button>
                  <button
                    className="access-text-button"
                    type="button"
                    onClick={() => navigate(accessPaths.register)}
                  >
                    Cambiar dirección
                  </button>
                  <div className="access-divider">¿Qué sucede después?</div>
                  <ol className="access-next-steps">
                    {[
                      'Confirmar tu correo electrónico.',
                      'Activar tu cuenta en ByteTorque con autorización del taller.',
                      'Acceder a las funciones verificadas de tu perfil.'
                    ].map((text, i) => (
                      <li key={text}>
                        <span>{i + 1}</span>
                        {text}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <>
                  <button className="access-primary" disabled>
                    <RotateCcw />
                    Reenviar enlace
                  </button>
                  <div className="access-information">
                    <Info />
                    <p>
                      La vigencia del enlace se informará cuando la recuperación segura esté
                      habilitada.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          {page === 'recover' && (
            <div className="access-information">
              <Info />
              <p>
                No se enviará correo en esta revisión. El enlace se generará únicamente cuando el
                acceso seguro esté habilitado.
              </p>
            </div>
          )}
          {page === 'passwordUpdated' && (
            <>
              <div className="access-information access-positive">
                <ShieldCheck />
                <div>
                  <strong>Protección de tu cuenta</strong>
                  <p>
                    Este es un estado visual de referencia. No se ha cambiado ninguna contraseña ni
                    activado una cuenta.
                  </p>
                </div>
              </div>
              <button className="access-primary" onClick={() => navigate(accessPaths.login)}>
                <LogIn />
                Ir a iniciar sesión
              </button>
              <button
                className="access-secondary"
                onClick={() => navigate(accessPaths.administratorReview)}
              >
                <ExternalLink />
                Abrir ByteTorque · Revisión
              </button>
            </>
          )}
          {page !== 'login' && page !== 'register' && page !== 'passwordUpdated' && (
            <button
              className="access-back"
              type="button"
              onClick={() => navigate(accessPaths.login)}
            >
              <ArrowLeft />
              Volver al inicio de sesión
            </button>
          )}
          <footer className="access-review-tools">
            {(page === 'login' || page === 'register') && (
              <nav className="access-legal-links" aria-label="Documentos legales públicos">
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" aria-label="Política de Privacidad (se abre en otra pestaña)">Política de Privacidad</a>
                <a href="/terminos" target="_blank" rel="noopener noreferrer" aria-label="Términos y Condiciones (se abre en otra pestaña)">Términos y Condiciones</a>
              </nav>
            )}
            {interactive && !realLogin && (
              <p>
                Usa exclusivamente la credencial ficticia de revisión. Nunca una contraseña real.
              </p>
            )}
            {page === 'login'
              ? previewLink(
                  'Abrir vista de revisión de ' +
                    (presentation === 'mecanico' ? 'mecánico' : 'administrador'),
                  presentation === 'mecanico'
                    ? accessPaths.mechanicReview
                    : accessPaths.administratorReview
                )
              : page === 'register'
                ? previewLink('Previsualizar verificación de correo', accessPaths.verify)
                : page === 'recover'
                  ? previewLink('Previsualizar revisión del correo', accessPaths.recoveryNotice)
                  : page === 'recoveryNotice'
                    ? previewLink('Previsualizar nueva contraseña', accessPaths.newPassword)
                    : page === 'newPassword'
                      ? previewLink('Previsualizar confirmación', accessPaths.passwordUpdated)
                      : page === 'verify'
                        ? previewLink('Volver al acceso', accessPaths.login)
                        : null}
            <button
              type="button"
              className="access-public-home"
              onClick={() => navigate(accessPaths.publicPreview)}
            >
              <ArrowLeft />
              Ver interfaz pública sin sesión
            </button>
          </footer>
          {legal && (
            <dialog
              className="access-legal"
              ref={(node) => {
                if (node && !node.open) node.showModal()
              }}
              onCancel={() => setLegal(false)}
              aria-label="Borradores legales públicos"
            >
              <h2>Borradores legales públicos</h2>
              <p>
                Consulta los borradores de la{' '}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad (otra pestaña)</a>{' '}
                y los{' '}
                <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones (otra pestaña)</a>.
                Están sujetos a revisión legal y aprobación del propietario; su publicación no activa funciones ni cobros.
              </p>
              <button type="button" onClick={() => setLegal(false)}>
                Cerrar
              </button>
            </dialog>
          )}
        </div>
      </section>
    </main>
  )
}
