/** BT-ANDROID-02 · Pantallas R2 conectadas SOLO al adaptador de lectura ficticio.
 * No hay autenticación, backend, persistencia, correos ni documentos productivos.
 */
import { useState, type ComponentProps, type ReactNode } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import {
  createDemoGateway, demoErrorText,
  type DemoSession, type DemoOrderState, type DemoFailureMode,
} from '../data/demoGateway'

type Gateway = ReturnType<typeof createDemoGateway>
type IconName = ComponentProps<typeof Ionicons>['name']
type ModuleSection = 'ordenes' | 'clientes' | 'informes' | 'configuracion'
type OrderState = DemoOrderState
const colors = {
  navy: '#091E3C', deep: '#122C53', blue: '#086EF2', bg: '#F5F8FD',
  border: '#D5E2F3', soft: '#EAF3FF', ink: '#142A49', muted: '#647A98',
  green: '#157B54', lightGreen: '#E4F6ED', white: '#FFFFFF',
}
const orderStates: Record<OrderState,{label:string;tint:string;background:string}> = {
  diagnostico: {label:'En diagnóstico',tint:'#0866CF',background:'#E5F1FF'},
  servicio: {label:'En servicio',tint:'#9C6300',background:'#FFF4DF'},
  repuestos: {label:'Por repuestos',tint:'#764ABE',background:'#F1E9FF'},
  entrega: {label:'Lista para entrega',tint:'#167C55',background:'#E4F7EC'},
}
const money = (amount: number) => '$' + amount.toLocaleString('es-CL') + ' CLP'
function read<T>(fn: () => T): {value:T;error:null}|{value:null;error:string} {
  try { return {value:fn(),error:null} }
  catch(e) { return {value:null,error:demoErrorText(e)} }
}
function locked(message:string) {
  Alert.alert('Función pendiente de activación',
    message + '\n\nNo se han guardado datos ni enviado correos o documentos.')
}
function Headline({label,title,description,icon}:{
  label:string;title:string;description:string;icon:IconName
}) {
  return <View style={s.heading}>
    <View style={s.headingIcon}><Ionicons name={icon} size={24} color={colors.blue}/></View>
    <Text style={s.kicker}>{label}</Text>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{description}</Text>
  </View>
}
function Card({title,children,icon}:{title?:string;children:ReactNode;icon?:IconName}) {
  return <View style={s.card}>
    {title && <View style={s.cardHeader}>
      {icon && <Ionicons name={icon} size={19} color={colors.blue}/>}
      <Text style={s.cardTitle}>{title}</Text>
    </View>}
    {children}
  </View>
}
function Label({children}:{children:ReactNode}) { return <Text style={s.fieldLabel}>{children}</Text> }
function Row({label,value}:{label:string;value:string}) {
  return <View style={s.detailRow}><Label>{label}</Label><Text style={s.fieldValue}>{value}</Text></View>
}
function Action({label,icon,onPress,secondary=false}:{
  label:string;icon:IconName;onPress:()=>void;secondary?:boolean
}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label}
    style={[s.action,secondary&&s.actionSecondary]} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={19} color={secondary?colors.blue:'#FFFFFF'}/>
    <Text style={[s.actionLabel,secondary&&s.actionSecondaryLabel]}>{label}</Text>
  </TouchableOpacity>
}
function Chip({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{selected:active}}
    onPress={onPress} style={[s.chip,active&&s.chipActive]}>
    <Text style={[s.chipText,active&&s.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
}
function StatusPill({state}:{state:OrderState}) {
  const item=orderStates[state]
  return <View style={[s.status,{backgroundColor:item.background}]}>
    <Text style={[s.statusText,{color:item.tint}]}>{item.label}</Text>
  </View>
}
function ReadError({message}:{message:string}) {
  return <View style={s.info}><Ionicons name="alert-circle-outline" color={colors.blue} size={20}/>
    <Text style={s.infoText}>{message} No se muestran datos de otro taller ni se permiten escrituras.</Text>
  </View>
}

function OrdersModule({session,gateway,initialOrderId,onOpenQuote}:{
  session:DemoSession;gateway:Gateway;initialOrderId?:string;onOpenQuote:(orderId:string)=>void
}) {
  const [selected,setSelected]=useState<string|null>(initialOrderId??null)
  const [filter,setFilter]=useState<OrderState|'todas'>('todas')
  const [term,setTerm]=useState('')
  const result=read(()=>gateway.listOrders(session))
  const orders=(result.value??[]).filter(item=>
    (filter==='todas'||item.state===filter)&&
    (!term.trim()||[item.id,item.plate,item.vehicle,item.service]
      .join(' ').toLocaleLowerCase('es-CL').includes(term.trim().toLocaleLowerCase('es-CL'))))
  const opened=(result.value??[]).find(o=>o.id===selected)
  return <>
    <Headline label="ÓRDENES · LECTURA OFFLINE" title="Órdenes de trabajo"
      description="Consulta de órdenes asignadas al taller y rol de prueba, sin modificar registros reales."
      icon="construct-outline"/>
    <Card>
      <View style={s.search}><Ionicons name="search-outline" size={18} color={colors.muted}/>
        <TextInput placeholder="Buscar OT, patente o vehículo ficticio"
          placeholderTextColor={colors.muted} style={s.searchInput} autoCorrect={false}
          accessibilityLabel="Buscar órdenes de demostración" value={term} onChangeText={setTerm}/>
      </View>
      <View style={s.chips}>
        <Chip label="Todas" active={filter==='todas'} onPress={()=>setFilter('todas')}/>
        <Chip label="Diagnóstico" active={filter==='diagnostico'} onPress={()=>setFilter('diagnostico')}/>
        <Chip label="Servicio" active={filter==='servicio'} onPress={()=>setFilter('servicio')}/>
        <Chip label="Repuestos" active={filter==='repuestos'} onPress={()=>setFilter('repuestos')}/>
        <Chip label="Entrega" active={filter==='entrega'} onPress={()=>setFilter('entrega')}/>
      </View>
      {result.error&&<ReadError message={result.error}/>}
      {!result.error&&!orders.length&&<Text style={s.empty}>Sin órdenes ficticias para este filtro.</Text>}
      {orders.map(item=><TouchableOpacity accessibilityRole="button" key={item.id}
        accessibilityLabel={'Abrir detalle ficticio '+item.id}
        onPress={()=>setSelected(selected===item.id?null:item.id)} style={s.listItem}>
        <View style={s.listIcon}><Ionicons name="car-sport-outline" size={22} color={colors.blue}/></View>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{item.id} · {item.plate}</Text>
          <Text style={s.itemText}>{item.vehicle}</Text>
          <Text style={s.itemMuted}>{item.service}</Text>
          <StatusPill state={item.state}/>
        </View>
        <Ionicons name={selected===item.id?'chevron-up':'chevron-forward'} size={18} color={colors.muted}/>
      </TouchableOpacity>)}
    </Card>
    {opened&&<Card title={'Detalle de '+opened.id} icon="document-text-outline">
      <Row label="Vehículo" value={opened.vehicle}/>
      <Row label="Cliente" value={opened.client}/>
      <Row label="Patente" value={opened.plate}/>
      <Row label="Kilometraje de ingreso" value={opened.odometer}/>
      <Row label="Motivo" value={opened.service}/>
      {session.role==='administrador'&&<Action label="Consultar cotizaciones relacionadas"
        icon="receipt-outline" secondary onPress={()=>onOpenQuote(opened.id)}/>}
      <View style={s.info}><Ionicons name="shield-checkmark-outline" color={colors.blue} size={19}/>
        <Text style={s.infoText}>La inspección multipunto y el autoguardado real permanecen bloqueados hasta validar permisos y respaldos.</Text>
      </View>
      <Action label="Abrir inspección real" icon="lock-closed-outline"
        onPress={()=>locked('La inspección real exige una sesión verificada, RLS y respaldos probados.')} secondary/>
    </Card>}
    <Action label="Nueva recepción" icon="lock-closed-outline"
      onPress={()=>locked('La creación de órdenes aún no está activada en Android.')}/>
  </>
}
function CustomersModule({session,gateway,onOpenOrder}:{
  session:DemoSession;gateway:Gateway;onOpenOrder:(id:string)=>void
}) {
  const [selected,setSelected]=useState<string|null>(null)
  const [term,setTerm]=useState('')
  const result=read(()=>{
    const customers=gateway.listCustomers(session)
    return gateway.listVehicles(session).map(vehicle=>({
      ...vehicle,client:customers.find(c=>c.id===vehicle.customerId)?.name??'Cliente ficticio',
    }))
  })
  const all=result.value??[]
  const clients=all.filter(item=>[item.client,item.plate,item.label]
    .join(' ').toLocaleLowerCase('es-CL').includes(term.trim().toLocaleLowerCase('es-CL')))
  const current=all.find(v=>v.id===selected)
  const history=current?read(()=>gateway.listHistory(session,current.id)):null
  return <>
    <Headline label="DIRECTORIO · LECTURA OFFLINE" title="Clientes y vehículos"
      description="Consulta un directorio sintético y el historial por vehículo sin compartir datos entre talleres."
      icon="car-sport-outline"/>
    <Card>
      <View style={s.search}><Ionicons name="search-outline" size={18} color={colors.muted}/>
        <TextInput placeholder="Buscar cliente, patente o vehículo" placeholderTextColor={colors.muted}
          style={s.searchInput} accessibilityLabel="Buscar clientes ficticios" value={term}
          onChangeText={setTerm} autoCorrect={false}/>
      </View>
      {result.error&&<ReadError message={result.error}/>}
      {!result.error&&!clients.length&&<Text style={s.empty}>No hay coincidencias de ejemplo.</Text>}
      {clients.map(item=><TouchableOpacity key={item.id} accessibilityRole="button"
        accessibilityLabel={'Ver ficha ficticia '+item.plate}
        onPress={()=>setSelected(selected===item.id?null:item.id)} style={s.listItem}>
        <View style={s.listIcon}><Ionicons name="person-outline" size={22} color={colors.blue}/></View>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{item.client}</Text>
          <Text style={s.itemText}>{item.label}</Text>
          <Text style={s.itemMuted}>Patente: {item.plate}</Text>
        </View>
        <Ionicons name={selected===item.id?'chevron-up':'chevron-forward'} size={18} color={colors.muted}/>
      </TouchableOpacity>)}
    </Card>
    {current&&<Card title="Ficha e historial del vehículo" icon="car-outline">
      <Row label="Cliente" value={current.client}/>
      <Row label="Vehículo" value={current.label}/>
      <Row label="Patente" value={current.plate}/>
      <Row label="Kilometraje ficticio" value={current.odometer}/>
      <Text style={[s.cardTitle,{marginTop:15,marginBottom:7}]}>Historial de visitas de ejemplo</Text>
      {history?.error&&<ReadError message={history.error}/>}
      {history?.value?.map(item=><TouchableOpacity key={item.id} style={s.listItem}
        accessibilityRole="button" onPress={()=>onOpenOrder(item.orderId)}>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{item.date} · {item.orderId}</Text>
          <Text style={s.itemText}>{item.summary}</Text>
          <Text style={s.itemMuted}>{item.quoteId?'Cotización asociada (ficticia)':'Sin cotización asociada'}</Text>
        </View>
        <Ionicons name="chevron-forward" color={colors.blue} size={18}/>
      </TouchableOpacity>)}
      {history?.value?.length===0&&<Text style={s.empty}>Sin visitas de ejemplo.</Text>}
      <Text style={s.disclaimer}>No hay documentos archivados ni trabajos confirmados en estos datos ficticios.</Text>
    </Card>}
    <Action label="Registrar cliente y vehículo" icon="lock-closed-outline"
      onPress={()=>locked('El registro real de clientes y vehículos necesita autorización del taller.')}/>
  </>
}
function QuotesModule({session,gateway,initialOrderId,onOpenOrder}:{
  session:DemoSession;gateway:Gateway;initialOrderId?:string;onOpenOrder:(id:string)=>void
}) {
  const [selected,setSelected]=useState<string|null>(null)
  const result=read(()=>gateway.listQuotes(session))
  const quotes=result.value??[]
  const current=quotes.find(q=>q.id===selected) ??
    (selected===null&&initialOrderId?quotes.find(q=>q.orderId===initialOrderId):undefined)
  return <>
    <Headline label="INFORMES · LECTURA OFFLINE" title="Informes y cotizaciones"
      description="Consulta partidas y totales ficticios; las revisiones R3 y PDF reales siguen desactivados."
      icon="document-text-outline"/>
    <Card title="Cotizaciones de ejemplo" icon="receipt-outline">
      {result.error&&<ReadError message={result.error}/>}
      {!result.error&&!quotes.length&&<Text style={s.empty}>Sin cotizaciones de ejemplo.</Text>}
      {quotes.map(q=><TouchableOpacity key={q.id} accessibilityRole="button"
        accessibilityLabel={'Ver cotización ficticia '+q.id}
        onPress={()=>setSelected(current?.id===q.id?'':q.id)} style={s.listItem}>
        <View style={s.listIcon}><Ionicons name="document-outline" size={22} color={colors.blue}/></View>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{q.id}</Text>
          <Text style={s.itemText}>{q.vehicle} · {q.orderId}</Text>
          <Text style={s.itemMuted}>{q.status}</Text>
        </View>
        <Ionicons name={current?.id===q.id?'chevron-up':'chevron-forward'} size={18} color={colors.muted}/>
      </TouchableOpacity>)}
    </Card>
    {current&&<Card title="Detalle de cotización ficticia" icon="clipboard-outline">
      <Row label="Número" value={current.id}/>
      <Row label="Cliente" value={current.client}/>
      <Row label="Trabajo" value={current.title}/>
      <Row label="Orden" value={current.orderId}/>
      {current.lines.map((line,i)=><Row key={i} label={line.label} value={money(line.amountClp)}/>)}
      <View style={s.total}>
        <Text style={s.totalTitle}>TOTAL DE EJEMPLO</Text><Text style={s.totalAmount}>{money(current.totalClp)}</Text>
      </View>
      <Text style={s.disclaimer}>Solo simulación de lectura. No hay IVA documental, aprobación, revisión emitida ni PDF generado.</Text>
      <Action label="Ver orden relacionada" icon="construct-outline" secondary
        onPress={()=>onOpenOrder(current.orderId)}/>
      <Action label="Descargar PDF archivado" icon="lock-closed-outline" secondary
        onPress={()=>locked('El archivo privado CP05 exige validar membresía, permisos, integridad y respaldos.')}/>
    </Card>}
    <Card title="Estado de documentos" icon="shield-checkmark-outline">
      <View style={s.info}><Ionicons name="lock-closed-outline" size={20} color={colors.blue}/>
        <Text style={s.infoText}>Emisión, descarga de PDF, Storage, correos y aceptación del cliente están desactivados.</Text>
      </View>
    </Card>
    <Action label="Preparar cotización" icon="lock-closed-outline"
      onPress={()=>locked('La edición de cotizaciones reales aún no está habilitada.')}/>
  </>
}
function SettingsModule({session,gateway,mode,onToggleOffline,onExpire,onSignOut}:{
  session:DemoSession;gateway:Gateway;mode:DemoFailureMode
  onToggleOffline:()=>void;onExpire:()=>void;onSignOut:()=>void
}) {
  const result=read(()=>gateway.getWorkshop(session))
  return <>
    <Headline label="ADMINISTRACIÓN · LECTURA OFFLINE" title="Configuración"
      description="Simulación local de taller, rol, sesión y errores, sin credenciales de Supabase."
      icon="settings-outline"/>
    <Card title="Taller de demostración" icon="business-outline">
      {result.error?<ReadError message={result.error}/>:<>
        <Row label="Nombre" value={result.value.name}/>
        <Row label="Identificador" value={result.value.id}/>
        <Row label="Plan de muestra" value={result.value.plan}/>
      </>}
      <Row label="Perfil ficticio" value={session.role==='administrador'?'Administrador de ejemplo':'Mecánico de ejemplo'}/>
      <Row label="Conexión simulada" value={mode==='none'?'Activa':mode==='offline'?'Sin conexión':'Error de servicio'}/>
      <View style={s.info}><Ionicons name="information-circle-outline" size={19} color={colors.blue}/>
        <Text style={s.infoText}>La sesión existe solo en memoria. No hay login real, cuenta creada, usuario conectado, permisos RLS ni datos productivos.</Text>
      </View>
    </Card>
    <Card title="Planes de talleres" icon="card-outline">
      <Row label="Básico" value="Cuenta personal gratuita"/>
      <Row label="Plus" value="4 mecánicos incluidos"/>
      <Row label="Full" value="8 mecánicos incluidos"/>
      <Row label="Plaza adicional" value="USD 2 / mes por mecánico"/>
      <Text style={s.disclaimer}>Referencias comerciales, no suscripciones activadas. Sin pagos.</Text>
    </Card>
    <Card title="Accesos y documentos" icon="people-outline">
      <View style={s.settingRow}><Ionicons name="person-add-outline" size={21} color={colors.blue}/><Text style={s.flexText}>Invitaciones y Auth/RLS reales</Text><Text style={s.pending}>Pendiente</Text></View>
      <View style={s.settingRow}><Ionicons name="document-text-outline" size={21} color={colors.blue}/><Text style={s.flexText}>PDF R3 y archivo privado</Text><Text style={s.pending}>Pendiente</Text></View>
      <View style={s.settingRow}><Ionicons name="shield-checkmark-outline" size={21} color={colors.blue}/><Text style={s.flexText}>Respaldos y recuperación</Text><Text style={s.pending}>Pendiente</Text></View>
    </Card>
    <Card title="Laboratorio de lecturas" icon="flask-outline">
      <Text style={s.disclaimer}>Prueba errores de sesión y red. Puedes restaurar la vista sin conectar un servidor.</Text>
      <Action label={mode==='none'?'Simular sin conexión':'Restablecer conexión simulada'}
        icon="wifi-outline" onPress={onToggleOffline} secondary/>
      <Action label="Simular sesión vencida" icon="time-outline" onPress={onExpire} secondary/>
    </Card>
    <Action label="Salir de sesión de prueba" icon="log-out-outline" onPress={onSignOut}/>
  </>
}
export function NativeModule({section,session,gateway,mode,initialOrderId,
  onOpenOrder,onOpenQuote,onSignOut,onToggleOffline,onExpire}:{
  section:ModuleSection;session:DemoSession;gateway:Gateway;mode:DemoFailureMode
  initialOrderId?:string;onOpenOrder:(id:string)=>void;onOpenQuote:(orderId:string)=>void
  onSignOut:()=>void;onToggleOffline:()=>void;onExpire:()=>void
}) {
  return <View style={s.root}>
    <View style={s.safetyBadge}>
      <Ionicons name="information-circle-outline" size={18} color="#855D0C"/>
      <Text style={s.safetyText}>DATOS FICTICIOS · SESIÓN SIMULADA · SIN SERVICIOS REALES</Text>
    </View>
    {section==='ordenes'?<OrdersModule session={session} gateway={gateway}
      initialOrderId={initialOrderId} onOpenQuote={onOpenQuote}/>:
     section==='clientes'?<CustomersModule session={session} gateway={gateway} onOpenOrder={onOpenOrder}/>:
     section==='informes'?<QuotesModule session={session} gateway={gateway}
       initialOrderId={initialOrderId} onOpenOrder={onOpenOrder}/>:
       <SettingsModule session={session} gateway={gateway} mode={mode}
         onSignOut={onSignOut} onToggleOffline={onToggleOffline} onExpire={onExpire}/>}
  </View>
}

const s=StyleSheet.create({
  root:{paddingBottom:14},
  safetyBadge:{flexDirection:'row',alignItems:'center',gap:8,padding:10,borderWidth:1,borderColor:'#E6D5A5',borderRadius:12,backgroundColor:'#FFF9EA',marginBottom:16},
  safetyText:{flex:1,color:'#815D16',fontSize:10,fontWeight:'800',lineHeight:15},
  heading:{marginBottom:16,gap:5},
  headingIcon:{width:43,height:43,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:colors.soft,marginBottom:5},
  kicker:{fontSize:10,fontWeight:'800',color:colors.blue,letterSpacing:1.0},
  title:{color:colors.navy,fontWeight:'900',fontSize:24,letterSpacing:-.6},
  subtitle:{color:colors.muted,fontSize:13,lineHeight:19},
  card:{borderRadius:16,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,padding:15,marginBottom:13,elevation:1},
  cardHeader:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:8},
  cardTitle:{fontSize:17,color:colors.deep,fontWeight:'800',flex:1},
  detailRow:{borderBottomWidth:1,borderBottomColor:'#E9F0F9',paddingVertical:9,gap:3},
  fieldLabel:{fontSize:11,color:colors.muted},
  fieldValue:{fontSize:13,fontWeight:'700',color:colors.ink},
  search:{minHeight:45,borderRadius:10,borderWidth:1,borderColor:colors.border,backgroundColor:'#F8FBFF',flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:11,marginBottom:8},
  searchInput:{flex:1,fontSize:12,color:colors.ink,paddingVertical:8},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:5},
  chip:{minHeight:38,borderColor:'#C8DDF7',borderWidth:1,backgroundColor:colors.soft,borderRadius:10,paddingVertical:8,paddingHorizontal:11,justifyContent:'center'},
  chipActive:{backgroundColor:colors.blue,borderColor:colors.blue},
  chipText:{fontSize:11,fontWeight:'700',color:'#20578F'},
  chipTextActive:{color:'#FFFFFF'},
  listItem:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:13,borderTopWidth:1,borderTopColor:'#E8EFF7',minHeight:66},
  listIcon:{height:41,width:41,alignItems:'center',justifyContent:'center',backgroundColor:colors.soft,borderRadius:11},
  flex:{flex:1,minWidth:0,gap:4},
  itemTitle:{fontSize:13,fontWeight:'800',color:colors.ink},
  itemText:{fontSize:12,color:'#354C6F',lineHeight:17},
  itemMuted:{fontSize:11,color:colors.muted},
  status:{alignSelf:'flex-start',paddingHorizontal:8,paddingVertical:5,borderRadius:7,marginTop:4},
  statusText:{fontSize:10,fontWeight:'800'},
  action:{minHeight:48,borderRadius:12,backgroundColor:colors.blue,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingHorizontal:15,paddingVertical:10,gap:9,marginBottom:13},
  actionSecondary:{backgroundColor:colors.soft,borderWidth:1,borderColor:'#B6D6FF'},
  actionLabel:{color:colors.white,fontWeight:'800',fontSize:13,textAlign:'center',flexShrink:1},
  actionSecondaryLabel:{color:'#0C5DBD'},
  info:{borderRadius:11,backgroundColor:colors.soft,padding:12,flexDirection:'row',alignItems:'flex-start',gap:9,marginTop:12,marginBottom:12},
  infoText:{fontSize:12,lineHeight:18,color:'#31547A',flex:1},
  empty:{color:colors.muted,paddingVertical:15,fontSize:12},
  total:{borderRadius:11,backgroundColor:colors.blue,padding:14,marginTop:13,marginBottom:9},
  totalTitle:{fontSize:10,color:'#E2EEFF',fontWeight:'800',letterSpacing:1},
  totalAmount:{fontSize:23,fontWeight:'900',color:'#FFFFFF',marginTop:4},
  disclaimer:{fontSize:11,color:colors.muted,lineHeight:17,marginVertical:10},
  settingRow:{flexDirection:'row',alignItems:'center',minHeight:48,borderTopWidth:1,borderTopColor:'#EBF1FA',gap:9},
  flexText:{flex:1,color:colors.ink,fontSize:12,fontWeight:'700'},
  pending:{fontSize:10,color:colors.muted}
})
