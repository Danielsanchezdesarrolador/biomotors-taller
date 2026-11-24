import {useEffect,useState} from 'react'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {finalArchiveRepository} from './repository'
import {FinalArchivePanel} from './FinalArchivePanel'
export default function FinalArchiveLoader({client,context,vehicleId,onBack}:{client:SupabaseClient;context:Context;vehicleId?:string;onBack:()=>void}){
 const scope=context.userId+':'+context.workshop.id+':'+context.role
 const [bound,setBound]=useState<{scope:string;repository:ReturnType<typeof finalArchiveRepository>}|null>(null)
 useEffect(()=>{const r=finalArchiveRepository(client,context);setBound({scope,repository:r});return()=>r.dispose()},[client,context,scope])
 return bound?.scope===scope?<FinalArchivePanel repository={bound.repository} vehicleId={vehicleId} onBack={onBack}/>:<p role="status">Verificando archivo privado…</p>
}
