import {useEffect,useState,type ComponentType,type ReactNode} from 'react'
import type {AuthController} from '../auth/controller'
import type {PlanStatus} from '../plans/planStatus'
import {planLabel} from '../plans/planStatus'
import {BrandLogo} from '../brand/BrandLogo'
import '../auth/personal.css'
export function MechanicWorkspace({controller,plan,controls}:{controller:AuthController;plan:PlanStatus|null;controls:ReactNode}) {
 const [Orders,setOrders]=useState<ComponentType<{controller:AuthController}>|null>(null),[failed,setFailed]=useState(false)
 const context=controller.getSnapshot().context
 useEffect(()=>{let active=true;if(import.meta.env.VITE_BT_CP04_PRIVATE_ENABLED==='true')
  void import('../ordenes/Cp04PrivatePanel').then(m=>{if(active)setOrders(()=>m.Cp04PrivatePanel)}).catch(()=>{if(active)setFailed(true)});
  return()=>{active=false}},[controller])
 if(context?.role!=='mechanic')return <p role="alert">Acceso técnico no autorizado.</p>
 return <main className="personal-home"><header><BrandLogo surface="dark"/><div><strong>{context.displayName||'Mecánico'} · {context.workshop.name}</strong><p>{planLabel(plan)}</p></div>{controls}</header>
  <section className="dashboard-card"><h1>Tu espacio de trabajo técnico</h1><p>No pagas una suscripción individual por trabajar en este taller. Los permisos dependen de tu membresía activa.</p></section>
  <section>{failed?<p role="alert">No se pudo cargar el área técnica.</p>:Orders?<Orders controller={controller}/>:<p role="status">Las órdenes requieren el módulo operativo autorizado del taller.</p>}</section></main>
}
