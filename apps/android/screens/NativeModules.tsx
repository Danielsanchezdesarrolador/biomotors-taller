/** BT-ANDROID-01 · Four native R2 screens using explicit, synthetic data only.
 * No network, Supabase client, persistent data, signed PDFs, or client secrets.
 */
import { useMemo, useState, type ComponentProps } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  Alert, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'

type IconName = ComponentProps<typeof Ionicons>['name']
type ModuleSection = 'ordenes' | 'clientes' | 'informes' | 'configuracion'
type OrderState = 'diagnostico' | 'servicio' | 'repuestos' | 'entrega'
type SampleOrder = {
  id: string
  plate: string
  vehicle: string
  client: string
  service: string
  state: OrderState
  odometer: string
}
const colors = {
  navy: '#091E3C', deep: '#122C53', blue: '#086EF2', bg: '#F5F8FD',
  border: '#D5E2F3', soft: '#EAF3FF', ink: '#142A49', muted: '#647A98',
  green: '#157B54', lightGreen: '#E4F6ED', white: '#FFFFFF'
}
const orderStates: Record<OrderState, {label: string; tint: string; background: string}> = {
  diagnostico: {label:'En diagnóstico',tint:'#0866CF',background:'#E5F1FF'},
  servicio: {label:'En servicio',tint:'#9C6300',background:'#FFF4DF'},
  repuestos: {label:'Por repuestos',tint:'#764ABE',background:'#F1E9FF'},
  entrega: {label:'Lista para entrega',tint:'#167C55',background:'#E4F7EC'},
}
const sampleOrders: SampleOrder[] = [
  {id:'OT-1001',plate:'DEMO-01',vehicle:'Toyota Corolla · 2020',
    client:'Cliente de ejemplo A',service:'Mantención de 10.000 km',state:'diagnostico',odometer:'68.420 km'},
  {id:'OT-1002',plate:'DEMO-02',vehicle:'Hyundai Tucson · 2021',
    client:'Cliente de ejemplo B',service:'Revisión de frenos',state:'servicio',odometer:'91.850 km'},
  {id:'OT-1003',plate:'DEMO-03',vehicle:'Chevrolet Tracker · 2022',
    client:'Cliente de ejemplo C',service:'Cambio de aceite',state:'repuestos',odometer:'42.700 km'},
  {id:'OT-1004',plate:'DEMO-04',vehicle:'Mitsubishi L200 · 2019',
    client:'Cliente de ejemplo D',service:'Diagnóstico de motor',state:'entrega',odometer:'125.310 km'},
]
const sampleQuotes = [
  {id:'COT-DEMO-001',orderId:'OT-1002',title:'Revisión de frenos',
    client:'Cliente de ejemplo B',vehicle:'Hyundai Tucson',total:'$107.411 CLP',status:'Borrador de demostración'},
  {id:'COT-DEMO-002',orderId:'OT-1001',title:'Mantención preventiva',
    client:'Cliente de ejemplo A',vehicle:'Toyota Corolla',total:'$84.900 CLP',status:'Borrador de demostración'},
]

function locked(message: string) {
  Alert.alert('Función pendiente de activación', message +
    '\n\nNo se han guardado datos, enviado correos ni emitido documentos.')
}
function Headline({label,title,description,icon}: {
  label:string;title:string;description:string;icon:IconName
}) {
  return <View style={s.heading}>
    <View style={s.headingIcon}><Ionicons name={icon} size={24} color={colors.blue}/></View>
    <Text style={s.kicker}>{label}</Text>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{description}</Text>
  </View>
}
function Card({title,children,icon}: {title?:string;children:React.ReactNode;icon?:IconName}) {
  return <View style={s.card}>
    {title && <View style={s.cardHeader}>
      {icon && <Ionicons name={icon} size={19} color={colors.blue}/>}
      <Text style={s.cardTitle}>{title}</Text>
    </View>}
    {children}
  </View>
}
function Label({children}: {children:React.ReactNode}) {
  return <Text style={s.fieldLabel}>{children}</Text>
}
function Row({label,value}: {label:string;value:string}) {
  return <View style={s.detailRow}>
    <Label>{label}</Label><Text style={s.fieldValue}>{value}</Text>
  </View>
}
function Action({label,icon,onPress,secondary=false}: {
  label:string;icon:IconName;onPress:()=>void;secondary?:boolean
}) {
  return <TouchableOpacity accessibilityRole="button"
    accessibilityLabel={label} style={[s.action,secondary&&s.actionSecondary]}
    onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={19} color={secondary?colors.blue:'#FFFFFF'}/>
    <Text style={[s.actionLabel,secondary&&s.actionSecondaryLabel]}>{label}</Text>
  </TouchableOpacity>
}
function Chip({label,active,onPress}: {label:string;active:boolean;onPress:()=>void}) {
  return <TouchableOpacity accessibilityRole="button"
    accessibilityState={{selected:active}}
    onPress={onPress} style={[s.chip,active&&s.chipActive]}>
    <Text style={[s.chipText,active&&s.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
}
function StatusPill({state}: {state:OrderState}) {
  const item=orderStates[state]
  return <View style={[s.status,{backgroundColor:item.background}]}>
    <Text style={[s.statusText,{color:item.tint}]}>{item.label}</Text>
  </View>
}
function OrdersModule({initialOrderId}: {initialOrderId?:string}) {
  const [selected,setSelected]=useState<string|null>(initialOrderId??null)
  const [filter,setFilter]=useState<OrderState|'todas'>('todas')
  const [term,setTerm]=useState('')
  const orders=useMemo(()=>sampleOrders.filter(item=>
    (filter==='todas'||item.state===filter)&&
    (!term.trim()||[item.id,item.plate,item.vehicle,item.service]
      .join(' ').toLocaleLowerCase('es-CL').includes(term.trim().toLocaleLowerCase('es-CL')))),
    [term,filter])
  const opened=sampleOrders.find(x=>x.id===selected)
  return <>
    <Headline label="ÓRDENES · VISTA NATIVA" title="Órdenes de trabajo"
      description="Consulta el recorrido de una OT de ejemplo, sin modificar datos reales."
      icon="construct-outline"/>
    <Card>
      <View style={s.search}>
        <Ionicons name="search-outline" size={18} color={colors.muted}/>
        <TextInput placeholder="Buscar OT, patente o vehículo de ejemplo"
          placeholderTextColor={colors.muted} style={s.searchInput} autoCorrect={false}
          accessibilityLabel="Buscar órdenes de demostración"
          value={term} onChangeText={setTerm}/>
      </View>
      <View style={s.chips}>
        <Chip label="Todas" active={filter==='todas'} onPress={()=>setFilter('todas')}/>
        <Chip label="Diagnóstico" active={filter==='diagnostico'} onPress={()=>setFilter('diagnostico')}/>
        <Chip label="Servicio" active={filter==='servicio'} onPress={()=>setFilter('servicio')}/>
        <Chip label="Repuestos" active={filter==='repuestos'} onPress={()=>setFilter('repuestos')}/>
        <Chip label="Entrega" active={filter==='entrega'} onPress={()=>setFilter('entrega')}/>
      </View>
      {!orders.length&&<Text style={s.empty}>Sin órdenes ficticias para este filtro.</Text>}
      {orders.map(item=><TouchableOpacity accessibilityRole="button" key={item.id}
        accessibilityLabel={'Abrir detalle de ejemplo '+item.id}
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
      <View style={s.info}><Ionicons name="shield-checkmark-outline" color={colors.blue} size={19}/>
        <Text style={s.infoText}>La inspección multipunto, el autoguardado y la ejecución de trabajos requieren la cuenta y los permisos reales del taller.</Text>
      </View>
      <Action label="Abrir inspección real" icon="lock-closed-outline"
        onPress={()=>locked('La inspección nativa se conectará después de verificar la sesión, los permisos y los respaldos.')} secondary/>
    </Card>}
    <Action label="Nueva recepción" icon="add-circle-outline"
      onPress={()=>locked('El registro nativo de clientes y órdenes estará disponible después de activar la conexión segura del taller.')}/>
  </>
}
function CustomersModule() {
  const [selected,setSelected]=useState<string|null>(null)
  const [term,setTerm]=useState('')
  const clients=sampleOrders.filter(item=>[item.client,item.plate,item.vehicle]
    .join(' ').toLocaleLowerCase('es-CL').includes(term.trim().toLocaleLowerCase('es-CL')))
  const current=sampleOrders.find(x=>x.plate===selected)
  return <>
    <Headline label="DIRECTORIO · VISTA NATIVA" title="Clientes y vehículos"
      description="Fichas de ejemplo con una estructura preparada para el historial por vehículo."
      icon="car-sport-outline"/>
    <Card>
      <View style={s.search}>
        <Ionicons name="search-outline" size={18} color={colors.muted}/>
        <TextInput placeholder="Buscar cliente, patente o vehículo"
          placeholderTextColor={colors.muted} style={s.searchInput}
          accessibilityLabel="Buscar vehículos ficticios"
          value={term} onChangeText={setTerm} autoCorrect={false}/>
      </View>
      {!clients.length&&<Text style={s.empty}>No hay coincidencias en los ejemplos.</Text>}
      {clients.map(item=><TouchableOpacity key={item.id} accessibilityRole="button"
        accessibilityLabel={'Ver ficha de ejemplo '+item.plate}
        onPress={()=>setSelected(selected===item.plate?null:item.plate)} style={s.listItem}>
        <View style={s.listIcon}><Ionicons name="person-outline" size={22} color={colors.blue}/></View>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{item.client}</Text>
          <Text style={s.itemText}>{item.vehicle}</Text>
          <Text style={s.itemMuted}>Patente: {item.plate}</Text>
        </View>
        <Ionicons name={selected===item.plate?'chevron-up':'chevron-forward'} size={18} color={colors.muted}/>
      </TouchableOpacity>)}
    </Card>
    {current&&<Card title="Ficha del vehículo" icon="car-outline">
      <Row label="Cliente" value={current.client}/>
      <Row label="Vehículo" value={current.vehicle}/>
      <Row label="Patente" value={current.plate}/>
      <Row label="Última OT de ejemplo" value={current.id}/>
      <View style={s.info}><Ionicons name="time-outline" color={colors.blue} size={19}/>
        <Text style={s.infoText}>El historial real conservará visitas, inspecciones, problemas pendientes y revisiones PDF sin inventar trabajos realizados.</Text>
      </View>
      <Action label="Ver historial real" icon="lock-closed-outline" secondary
        onPress={()=>locked('El historial CP06 de esta pantalla nativa necesita autenticación y aislamiento de taller antes de usar registros reales.')}/>
    </Card>}
    <Action label="Registrar cliente y vehículo" icon="person-add-outline"
      onPress={()=>locked('El alta real de clientes requiere conexión autenticada y validación del taller.')}/>
  </>
}
function QuotesModule() {
  const [selected,setSelected]=useState<string|null>(null)
  const current=sampleQuotes.find(q=>q.id===selected)
  return <>
    <Headline label="INFORMES · VISTA NATIVA" title="Informes y cotizaciones"
      description="Vista preliminar del formato corporativo R3 y de las futuras revisiones inmutables."
      icon="document-text-outline"/>
    <Card title="Cotizaciones de ejemplo" icon="receipt-outline">
      {sampleQuotes.map(q=><TouchableOpacity key={q.id} accessibilityRole="button"
        accessibilityLabel={'Ver cotización de ejemplo '+q.id}
        onPress={()=>setSelected(selected===q.id?null:q.id)} style={s.listItem}>
        <View style={s.listIcon}><Ionicons name="document-outline" size={22} color={colors.blue}/></View>
        <View style={s.flex}>
          <Text style={s.itemTitle}>{q.id}</Text>
          <Text style={s.itemText}>{q.vehicle} · {q.orderId}</Text>
          <Text style={s.itemMuted}>{q.status}</Text>
        </View>
        <Ionicons name={selected===q.id?'chevron-up':'chevron-forward'} size={18} color={colors.muted}/>
      </TouchableOpacity>)}
    </Card>
    {current&&<Card title="Detalle de cotización de ejemplo" icon="clipboard-outline">
      <Row label="Número" value={current.id}/>
      <Row label="Cliente" value={current.client}/>
      <Row label="Trabajo" value={current.title}/>
      <Row label="Orden" value={current.orderId}/>
      <View style={s.total}>
        <Text style={s.totalTitle}>TOTAL DE EJEMPLO</Text><Text style={s.totalAmount}>{current.total}</Text>
      </View>
      <Text style={s.disclaimer}>Cifra ficticia para probar la presentación. No se ha generado un PDF real ni una revisión emitida.</Text>
      <Action label="Descargar PDF archivado" icon="lock-closed-outline" secondary
        onPress={()=>locked('Las revisiones PDF reales se descargarán desde el archivo privado CP05, previa validación de SHA-256 y membresía.')}/>
    </Card>}
    <Card title="Estado de documentos" icon="shield-checkmark-outline">
      <View style={s.info}><Ionicons name="lock-closed-outline" size={20} color={colors.blue}/>
        <Text style={s.infoText}>Emisión, archivo privado, envío por correo y aprobación de cliente están desactivados en Android hasta las pruebas y autorizaciones correspondientes.</Text>
      </View>
    </Card>
    <Action label="Preparar cotización" icon="add-circle-outline"
      onPress={()=>locked('La preparación nativa de cotizaciones se conectará al flujo CP05 con permisos verificados.')}/>
  </>
}
function SettingsModule() {
  return <>
    <Headline label="ADMINISTRACIÓN · VISTA NATIVA" title="Configuración"
      description="Estructura preparada para datos del taller, permisos y suscripciones."
      icon="settings-outline"/>
    <Card title="Taller de demostración" icon="business-outline">
      <Row label="Nombre" value="Taller de ejemplo (sin conexión)"/>
      <Row label="Identidad" value="ByteTorque R2"/>
      <Row label="Plan" value="Sin suscripción real"/>
      <Row label="Usuarios conectados" value="Ninguno"/>
      <View style={s.info}><Ionicons name="information-circle-outline" size={19} color={colors.blue}/>
        <Text style={s.infoText}>Esta APK de demostración no contiene credenciales ni accede a cuentas, documentos o datos de Supabase.</Text>
      </View>
    </Card>
    <Card title="Planes de talleres" icon="card-outline">
      <Row label="Básico" value="Cuenta personal gratuita"/>
      <Row label="Plus" value="4 mecánicos incluidos"/>
      <Row label="Full" value="8 mecánicos incluidos"/>
      <Row label="Plaza adicional" value="USD 2 / mes por mecánico"/>
      <Text style={s.disclaimer}>Las plazas adicionales se cobran al propietario, nunca al mecánico. Los pagos reales no están habilitados.</Text>
    </Card>
    <Card title="Accesos y documentos" icon="people-outline">
      <View style={s.settingRow}><Ionicons name="person-add-outline" size={21} color={colors.blue}/><Text style={s.flexText}>Invitaciones seguras por taller</Text><Text style={s.pending}>Pendiente</Text></View>
      <View style={s.settingRow}><Ionicons name="document-text-outline" size={21} color={colors.blue}/><Text style={s.flexText}>Plantilla PDF R3 y Plus/Full</Text><Text style={s.pending}>Pendiente</Text></View>
      <View style={s.settingRow}><Ionicons name="shield-checkmark-outline" size={21} color={colors.blue}/><Text style={s.flexText}>Respaldos y recuperación</Text><Text style={s.pending}>Pendiente</Text></View>
    </Card>
    <Action label="Administrar mi taller" icon="lock-closed-outline"
      onPress={()=>locked('La administración de talleres y usuarios necesita iniciar sesión con autorización verificada.')}/>
  </>
}
export function NativeModule({section,initialOrderId}: {
  section:ModuleSection
  initialOrderId?:string
}) {
  return <View style={s.root}>
    <View style={s.safetyBadge}>
      <Ionicons name="information-circle-outline" size={18} color="#855D0C"/>
      <Text style={s.safetyText}>DATOS FICTICIOS · NAVEGACIÓN NATIVA SIN SERVICIOS REALES</Text>
    </View>
    {section==='ordenes'?<OrdersModule initialOrderId={initialOrderId}/>:
     section==='clientes'?<CustomersModule/>:
     section==='informes'?<QuotesModule/>:<SettingsModule/>}
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
