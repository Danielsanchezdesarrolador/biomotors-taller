import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CarFront,
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
import './access.css'
export type AccessDraft = {
  email: string
  password: string
  confirmPassword: string
  name: string
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
  phone: '',
  workshop: '',
  terms: false,
  remember: false
}
export function AccessScreens({
  page,
  presentation,
  onNavigate,
  onReviewSubmit
}: {
  page: AccessPage
  presentation: AccessPresentation
  onNavigate: (path: string) => void
  onReviewSubmit?: (draft: AccessDraft, presentation: AccessPresentation) => string | void
}) {
  const [draft, setDraft] = useState<AccessDraft>({ ...blank }),
    [visible, setVisible] = useState(false),
    [confirmVisible, setConfirmVisible] = useState(false),
    [message, setMessage] = useState(''),
    [legal, setLegal] = useState(false),
    [registrationRole, setRegistrationRole] = useState<AccessPresentation>(presentation)
  const interactive = !!onReviewSubmit
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
        ? 'Acceso técnico a órdenes asignadas e inspecciones.'
        : 'Accede a ByteTorque y gestiona tu taller.'
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
            autoComplete="off"
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
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
          >
            <span className="access-brand-mark">
              <Wrench />
            </span>
            <span>
              Byte<b>Torque</b>
              <small>Gestión de Talleres</small>
            </span>
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
          <ReviewBanner compact />
          {page === 'passwordUpdated' && (
            <div className="access-success-art" aria-hidden="true">
              <Check />
            </div>
          )}
          <header className="access-card-heading">
            <h1>{titles[page][0]}</h1>
            <p>{titles[page][1]}</p>
          </header>
          {(page === 'login' || page === 'register') && (
            <section className="access-type">
              <strong>{page === 'login' ? 'Acceso para' : 'Tipo de acceso'}</strong>
              <div role="group" aria-label="Tipo de acceso visual">
                {(['administrador', 'mecanico'] as const).map((role) => (
                  <button
                    type="button"
                    key={role}
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
          {(page === 'login' ||
            page === 'register' ||
            page === 'recover' ||
            page === 'newPassword') && (
            <form className="access-form" onSubmit={submit} noValidate>
              {page === 'register' && context === 'mecanico' ? (
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
                  {page === 'register' &&
                    field('name', 'Nombre completo', 'Ingresa tu nombre completo')}
                  {page !== 'newPassword' &&
                    field(
                      'email',
                      'Correo electrónico',
                      'Ingresa tu correo electrónico',
                      'email',
                      <Mail />
                    )}
                  {page === 'register' && (
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
                          checked={draft.remember}
                          disabled={!interactive}
                          onChange={(e) => patch('remember', e.target.checked)}
                        />
                        Recordarme
                      </label>
                      <button type="button" onClick={() => navigate(accessPaths.recover)}>
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                  {page === 'register' && (
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
                  {message && (
                    <p className="access-message" role="status">
                      {message}
                    </p>
                  )}
                  {action(
                    page === 'login'
                      ? 'Ingresar'
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
                  ? 'La cuenta requerirá confirmar su dirección de correo antes del primer acceso.'
                  : 'La recuperación se realizará siguiendo el enlace enviado por el servicio de acceso seguro cuando esté habilitado.'}
              </p>
              <div className="access-address">
                <Mail />
                <strong>Dirección pendiente de verificación</strong>
              </div>
              <span className="access-state-reference">
                Estado de referencia · No se ha enviado un correo
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
            {interactive && (
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
            <button type="button" className="access-public-home" onClick={() => navigate('/')}>
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
              aria-label="Información legal en preparación"
            >
              <h2>Información legal en preparación</h2>
              <p>
                Los términos y la política de privacidad se publicarán antes de activar el registro.
                Esta revisión no permite aceptar un contrato ni crear una cuenta.
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
