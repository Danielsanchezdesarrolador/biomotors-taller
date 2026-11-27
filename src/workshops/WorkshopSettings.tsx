import {Store,UsersRound,Crown,FileText} from 'lucide-react'
import {CommercialHeader,PlanBenefits,parseCommercial} from './commercialPresentation'
import { useEffect,useRef,useState,type FormEvent } from 'react'
import type { AuthController } from '../auth/controller'
import { parseTeam,requestIdentity,workshopRpc,type Team } from './client'
import './workshops.css'
import {
  validPdfTemplateStatus, uploadWorkshopPdfTemplate, restoreOfficialPdfTemplate,
  type PdfTemplateStatus
} from './pdfTemplate'
export function WorkshopSettings({controller,planSnapshot,isActive=true}:{controller:AuthController;planSnapshot?:string;isActive?:boolean}) {
  const wid=controller.getSnapshot().context?.workshop.id
  const [tab,setTab]=useState('commercial'),[teamQuery,setTeamQuery]=useState(''),[teamFilter,setTeamFilter]=useState('all'),[inviting,setInviting]=useState(false)
  const [commercial,setCommercial]=useState<unknown>(null)
  const [savedProfile,setSavedProfile]=useState<{name:string;address:string}|null>(null)
  const [logoUrl,setLogoUrl]=useState('')
  const [pdfTemplate,setPdfTemplate]=useState<PdfTemplateStatus|null>(null)
  const [team,setTeam]=useState<Team|null>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
  const [profile,setProfile]=useState({name:'',email:'',phone:'',address:''}),[email,setEmail]=useState(''),[link,setLink]=useState('')
  const locked=useRef(false),identity=useRef(requestIdentity()),revision=useRef(0),metadataRevision=useRef(0)
  async function refreshMetadata(){const rev=++metadataRevision.current;if(!wid)return false;try{
    const [c,t]=await Promise.all([workshopRpc(controller,'bt_commercial_status',{p_workshop_id:wid}),workshopRpc(controller,'bt_plan04_team',{p_workshop_id:wid})]);if(rev!==metadataRevision.current)return false
    setCommercial(parseCommercial(c,wid));setTeam(parseTeam(t,wid));return true
  }catch{if(rev===metadataRevision.current){setCommercial(null);setTeam(null)}return false}}
  async function load() {
    const rev=++revision.current;if(!wid)return
    try{const [c,t,p]=await Promise.all([workshopRpc(controller,'bt_commercial_status',{p_workshop_id:wid}),workshopRpc(controller,'bt_plan04_team',{p_workshop_id:wid}),workshopRpc(controller,'bt_plan04_profile',{p_workshop_id:wid})])
      if(rev!==revision.current)return
      setCommercial(parseCommercial(c,wid));setTeam(parseTeam(t,wid));const row=p as Record<string,unknown>
      if(row.workshopId!==wid||!['name','email','phone','address'].every(k=>typeof row[k]==='string'))throw Error('INVALID_PROFILE')
      setProfile({name:row.name as string,email:row.email as string,phone:row.phone as string,address:row.address as string});setSavedProfile({name:row.name as string,address:row.address as string})
      setLogoUrl('')
      if(import.meta.env.VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED==='true') {
        void workshopRpc(controller,'bt_plan04_pdf_template_status',{p_workshop_id:wid})
          .then(row=>{if(rev===revision.current)setPdfTemplate(validPdfTemplateStatus(row,wid))})
          .catch(()=>{if(rev===revision.current)setPdfTemplate(null)})
      }
      if(typeof row.logoPath==='string' && new RegExp('^'+wid+'/[a-f0-9-]{36}\\.png$').test(row.logoPath)) {
        const client=await controller.directoryClient()
        const signed=await client?.storage.from('bt-workshop-branding').createSignedUrl(row.logoPath,60)
        if(rev===revision.current && signed?.data?.signedUrl) {
          const url=new URL(signed.data.signedUrl)
          if(url.protocol==='https:'&&url.hostname==='suxcqqnmcjoezfxltoms.supabase.co')setLogoUrl(url.href)
        }
      }
    }catch{if(rev===revision.current){setTeam(null);setNotice('No se pudo verificar la gestión del taller. Conserva los datos y reintenta.')}}
  }
  useEffect(()=>{if(wid&&isActive&&team)void refreshMetadata()},[controller,wid,planSnapshot,isActive,tab])
  useEffect(()=>{void load();return()=>{revision.current++;metadataRevision.current++}},[controller,wid]) // Auth changes unmount this scoped panel.
  useEffect(()=>{if(!link)return;const clear=()=>setLink(''),hidden=()=>{if(document.visibilityState!=='visible')clear()};const timer=window.setTimeout(clear,300_000);
    window.addEventListener('pagehide',clear);window.addEventListener('offline',clear);document.addEventListener('visibilitychange',hidden);
    return()=>{window.clearTimeout(timer);window.removeEventListener('pagehide',clear);window.removeEventListener('offline',clear);document.removeEventListener('visibilitychange',hidden)}},[link])
  async function action(kind:'invite'|'rotate'|'revoke'|'disable'|'reactivate',target:string|null=null) {
    if(locked.current||!wid)return
    if((kind==='disable'||kind==='revoke'||kind==='reactivate')&&!window.confirm('¿Confirmar la operación? No se borran usuarios ni historiales.'))return
    locked.current=true;setBusy(true);setLink('');setNotice('')
    try{const result=await workshopRpc(controller,'bt_plan04_manage_mechanic',{p_workshop_id:wid,p_action:kind,p_email:kind==='invite'?email.trim():null,p_target_id:target,
      p_request_id:identity.current.for(JSON.stringify([wid,kind,target,email.trim()]))}) as {token?:unknown}
      identity.current.clear()
      if(typeof result.token==='string'&&/^[a-f0-9]{64}$/.test(result.token))setLink('https://bytetorque.cl/#/auth/aceptar-invitacion?token='+result.token)
      setNotice(kind==='reactivate'?'Mecánico reactivado. Se conserva su identidad e historial.':kind==='disable'?'Mecánico desactivado. Se conserva su historial.':kind==='revoke'?'Invitación revocada.':'Invitación confirmada. No se envió correo ni se efectuó cobro. Comparte el enlace únicamente con su destinatario.')
      if(!await refreshMetadata())setNotice('Operación confirmada. No se pudo actualizar la vista; consulta los datos antes de repetir la operación.')
    }catch{setNotice('No se pudo confirmar. Revisa sesión, cupos y permisos. Reintenta la misma operación sin cambiar sus datos.')}
    finally{locked.current=false;setBusy(false)}
  }
  async function save(e:FormEvent){e.preventDefault();if(locked.current||!wid)return;locked.current=true;setBusy(true)
    try{await workshopRpc(controller,'bt_plan04_update_profile',{p_workshop_id:wid,p_name:profile.name,p_email:profile.email,p_phone:profile.phone,p_address:profile.address});setNotice('Guardado correctamente.');await load()}
    catch{setNotice('No se pudo guardar. Verifica sesión y permisos.')}finally{locked.current=false;setBusy(false)}}
  return <div className="workshop-settings"><header className="commercial-heading"><div><span className="official-eyebrow">Administración del taller</span><h1>Mi taller</h1><p>Administra la información, el equipo y el plan de tu negocio.</p></div><button type="button" disabled={busy} onClick={()=>void load()}>Actualizar datos del taller</button>{notice&&<p role="status">{notice}</p>}</header>
    <CommercialHeader name={savedProfile?.name||controller.getSnapshot().context?.workshop.name||'Mi taller'} address={savedProfile?.address??''} status={commercial} team={team}/>
    <div className="commercial-tabs" role="tablist" aria-label="Administración del taller">{([['commercial','Información comercial',Store],['team','Mi equipo',UsersRound],['plan','Plan y beneficios',Crown],['documents','Documentos e identidad',FileText]] as const).map(([id,label,Icon])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)}><Icon size={18} aria-hidden="true"/><span>{label}</span></button>)}</div>
    <section hidden={tab!=='commercial'} className="dashboard-card"><h2>Información comercial</h2>{logoUrl&&<img src={logoUrl} alt="Logo de mi taller" style={{maxWidth:220,maxHeight:80,objectFit:'contain'}}/>}<div className="commercial-profile-layout"><form className="commercial-profile-form" onSubmit={e=>void save(e)}>{(['name','email','phone','address'] as const).map((key,i)=><label key={key}>{['Nombre comercial','Correo del taller','Teléfono','Dirección'][i]}<input disabled={busy||!team} value={profile[key]} maxLength={[120,254,30,240][i]} type={key==='email'?'email':'text'} required={key==='name'} onChange={e=>setProfile({...profile,[key]:e.target.value})}/></label>)}<button disabled={busy||!team} className="rp-primary">Guardar cambios</button><button type="button" disabled={busy} onClick={()=>void load()}>Cancelar</button></form><aside><h3>Logo personalizado</h3>
      <div className="commercial-logo">Logo personalizado pendiente</div><button type="button" disabled>Cambiar logo · pendiente</button>
      <p>Logo privado pendiente de habilitación del respaldo. Los nuevos documentos usan los datos comerciales guardados; los históricos se conservan.</p></aside></div></section>
    {import.meta.env.VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED==='true' && 
    <section hidden={tab!=='documents'} className="dashboard-card"><h2>Plantilla PDF de cotizaciones</h2>
      <p>El formato oficial premium de ByteTorque viene incluido. Plus y Full pueden usar una hoja base PDF A4 privada de su propio taller, dejando libres las zonas donde se imprimen cliente, vehículo, partidas y totales. No se aceptan PDF con datos de clientes reales.</p>
      {!pdfTemplate ? <p role="status">No se pudo verificar un plan habilitado; la carga está bloqueada.</p> :
        !pdfTemplate.eligible ? <p>Esta opción requiere Plus o Full activo. El formato oficial sigue disponible.</p> :
        <>
          <p role="status">{pdfTemplate.templatePath ? 'Plantilla propia vinculada a este taller.' : 'Usando plantilla oficial ByteTorque.'}</p>
          <label>Subir una hoja base A4 (PDF, una página, máximo 4 MiB)
            <input type="file" accept="application/pdf" disabled={busy||!team}
              onChange={e=>{const file=e.target.files?.[0];e.target.value='';
                if(!file||locked.current)return;
                if(!window.confirm('¿Subir esta hoja base privada como plantilla de cotizaciones de tu taller? Debe dejar espacio libre para la información dinámica.'))return;
                locked.current=true;setBusy(true);setNotice('');
                void uploadWorkshopPdfTemplate(controller,file)
                  .then(()=>{setNotice('Plantilla privada guardada. Previsualiza una cotización antes de emitir.');return load()})
                  .catch(()=>setNotice('No se guardó la plantilla. Verifica el PDF A4 y el plan de tu taller.'))
                  .finally(()=>{locked.current=false;setBusy(false)})
              }} />
          </label>
          <button type="button" disabled={busy||!pdfTemplate.templatePath}
            onClick={()=>{if(locked.current)return;locked.current=true;setBusy(true);
              void restoreOfficialPdfTemplate(controller).then(()=>{setNotice('Restaurada la plantilla oficial.');return load()})
                .catch(()=>setNotice('No se pudo restaurar la plantilla oficial.'))
                .finally(()=>{locked.current=false;setBusy(false)})}}>
            Usar nuevamente el PDF oficial ByteTorque
          </button>
          <p>La plantilla es privada, no reemplaza cotizaciones históricas y no autoriza facturación ni aceptación del cliente.</p>
        </>
      }
    </section>}
    <section hidden={tab!=='team'} className="dashboard-card"><h2>Mi equipo</h2>{team&&<><p><strong>{team.active}/{team.capacity} mecánicos activos</strong> · {team.pending} invitaciones reservadas.</p>
      <p>Propietarios y administradores no ocupan cupos. Los mecánicos no pagan por trabajar aquí.</p>
      {team.overCapacity&&<p role="alert">Hay más plazas ocupadas o reservadas que las disponibles. Regulariza el equipo; no se borró ni desactivó a nadie automáticamente.</p>}
      <button type="button" onClick={()=>setInviting(!inviting)} disabled={busy||team.active+team.pending>=team.capacity}>Invitar mecánico</button>{inviting&&<form onSubmit={e=>{e.preventDefault();void action('invite')}}><label>Correo del mecánico<input type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label><button disabled={busy||team.active+team.pending>=team.capacity}>Reservar invitación</button></form>}
      {link&&<div role="status"><p>Enlace confidencial de un solo uso, válido para el correo invitado. Compártelo solo con su titular. No se guarda en este navegador.</p><button onClick={()=>void navigator.clipboard.writeText(link).then(()=>setNotice('Enlace copiado. Compártelo únicamente con su destinatario.')).catch(()=>setNotice('El navegador bloqueó la copia. Genera un enlace nuevo desde una conexión segura.'))}>Copiar enlace seguro</button><button onClick={()=>setLink('')}>Descartar enlace</button></div>}
      <div className="commercial-team-filter"><label>Buscar mecánico<input value={teamQuery} onChange={e=>setTeamQuery(e.target.value)} placeholder="Nombre o correo"/></label><label>Estado<select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}><option value="all">Todos los estados</option><option value="active">Activos</option><option value="disabled">Desactivados</option></select></label></div>
      <div className="commercial-team-table"><table><thead><tr><th>Mecánico</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th>Administración</th></tr></thead><tbody>{team.members.filter(m=>(teamFilter==='all'||m.status===teamFilter)&&[m.name,m.email??''].join(' ').toLocaleLowerCase().includes(teamQuery.toLocaleLowerCase())).map(m=><tr key={m.id}><td><span className="commercial-avatar" aria-hidden="true">{m.name.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('')}</span><strong>{m.name}</strong></td><td>{m.email??'No disponible'}</td><td>Mecánico</td><td><span className={'commercial-member '+m.status}>{m.status==='active'?'Activo':'Desactivado'}</span></td><td>{m.status==='active'?<button disabled={busy} onClick={()=>void action('disable',m.id)}>Desactivar mecánico</button>:<button disabled={busy||team.active+team.pending>=team.capacity} onClick={()=>void action('reactivate',m.id)}>Reactivar mecánico</button>}</td></tr>)}</tbody></table></div>
      <ul>{team.invites.map(invite=><li key={invite.id}>{invite.email} · Pendiente <button disabled={busy} onClick={()=>void action('rotate',invite.id)}>Generar enlace nuevo</button><button disabled={busy} onClick={()=>void action('revoke',invite.id)}>Revocar invitación</button></li>)}</ul></>}</section>
    <section hidden={tab!=='plan'} className="dashboard-card"><PlanBenefits status={commercial} team={team}/></section>
    <section hidden={tab!=='documents'} className="dashboard-card"><h2>Documentos e identidad</h2><p>Los documentos nuevos utilizan la identidad comercial confirmada. Los documentos históricos se conservan intactos.</p><p>Logo privado: carga pendiente de habilitación segura y cobertura de recuperación.</p><button disabled>Cambiar logo · pendiente</button><p>Formato oficial ByteTorque disponible según las capacidades y cuotas del taller. Las plantillas personalizadas requieren su habilitación vigente.</p></section>
  </div>
}
export function GeneralSettings({controller}:{controller:AuthController}){return <div className="workshop-settings"><section className="dashboard-card"><h1>Configuración</h1><p>Ajustes generales de tu cuenta y sesión.</p><h2>Cuenta y seguridad</h2><p>Sesión verificada · {controller.getSnapshot().context?.displayName||'Cuenta autorizada'}</p><p>Permisos y acceso sujetos a validación del servidor.</p><button onClick={()=>void controller.logout()}>Cerrar sesión</button><h2>Preferencias</h2><p>Zona de operación: America/Santiago. Las cuotas usan la hora del servidor.</p><h2>Servicios</h2><p>Correo automático, pagos, carga de logos y registro público permanecen pendientes de activación autorizada. Esta pantalla no simula guardados ni cambios de seguridad.</p><p>Administra identidad, equipo, documentos y plan desde Mi taller.</p></section></div>}
