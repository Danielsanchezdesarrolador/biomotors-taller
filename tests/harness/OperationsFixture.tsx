import {useEffect,useState} from 'react'
import {OperationsView} from '../../src/guided/OperationsCenter'
import {operationsRepository,type Operation} from '../../src/guided/operations'
import {operationsFixture,context} from '../operationsFixture'
import {AppShell} from '../../src/layout/AppShell'
export default function OperationsFixture(){const [rows,setRows]=useState<Operation[]>([]),[selected,setSelected]=useState('');useEffect(()=>{void operationsFixture(28).then(f=>operationsRepository(f.client,context).load()).then(setRows)},[]);return <AppShell copy={{workshopTitle:context.workshop.name,workshopSubtitle:"Datos sintéticos",workshopStatus:"Sesión de laboratorio",version:"BT-FLOW-NEXT-02",accountTitle:"Operador sintético",accountSubtitle:"Propietario",notifications:"Sin notificaciones"}} screen="inicio" onNavigate={()=>{}}><p>Laboratorio sintético · sin acceso alojado</p><OperationsView rows={rows} workshop={context.workshop.name} onNew={()=>setSelected('Nueva atención independiente')} onResume={id=>setSelected(id)} onRefresh={()=>{}} busy={!rows.length} error=""/><output aria-label="OT seleccionada">{selected}</output></AppShell>}
