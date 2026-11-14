import { useMemo, useState, type ComponentProps } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'

type IconName = ComponentProps<typeof Ionicons>['name']
type Section = 'inicio' | 'ordenes' | 'clientes' | 'informes' | 'configuracion'
type StatusKey = 'diagnostico' | 'servicio' | 'repuestos' | 'entrega'
type Status = { key: StatusKey; label: string; color: string; light: string; count: number; icon: IconName }
type WorkOrder = { id: string; vehicle: string; service: string; plate: string; status: StatusKey }
const NAV_ITEMS: { key: Section; label: string; icon: IconName }[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline' },
  { key: 'ordenes', label: 'Órdenes', icon: 'construct-outline' },
  { key: 'clientes', label: 'Clientes', icon: 'people-outline' },
  { key: 'informes', label: 'Informes', icon: 'document-text-outline' },
  { key: 'configuracion', label: 'Más', icon: 'ellipsis-horizontal' },
]
const STATUSES: Status[] = [
  { key: 'diagnostico', label: 'En diagnóstico', color: '#0875F5', light: '#E1F0FF', count: 4, icon: 'search-outline' },
  { key: 'servicio', label: 'En servicio', color: '#F5AC00', light: '#FFF4D5', count: 6, icon: 'construct-outline' },
  { key: 'repuestos', label: 'Por repuestos', color: '#8950E8', light: '#F2EAFF', count: 5, icon: 'cube-outline' },
  { key: 'entrega', label: 'Lista para entrega', color: '#16B950', light: '#E0F8E7', count: 3, icon: 'checkmark-circle-outline' },
]
const ORDERS: WorkOrder[] = [
  { id: 'OT-1001', vehicle: 'Toyota Corolla · 2020', service: 'Mantención de 10.000 km', plate: 'DEMO-01', status: 'diagnostico' },
  { id: 'OT-1002', vehicle: 'Hyundai Tucson · 2021', service: 'Revisión de frenos', plate: 'DEMO-02', status: 'servicio' },
  { id: 'OT-1003', vehicle: 'Chevrolet Tracker · 2022', service: 'Cambio de aceite', plate: 'DEMO-03', status: 'repuestos' },
  { id: 'OT-1004', vehicle: 'Mitsubishi L200 · 2019', service: 'Diagnóstico de motor', plate: 'DEMO-04', status: 'entrega' },
]
const ACTIVITY: { id: string; title: string; detail: string; icon: IconName; color: string; light: string }[] = [
  { id: 'A1', title: 'Orden de ejemplo creada', detail: 'OT-1001 · Toyota Corolla', icon: 'construct-outline', color: '#0875F5', light: '#E1F0FF' },
  { id: 'A2', title: 'Informe simulado', detail: 'OT-1002 · Sin correo enviado', icon: 'document-text-outline', color: '#7950D9', light: '#F1EAFF' },
  { id: 'A3', title: 'Revisión de muestra finalizada', detail: 'OT-1004 · Datos ficticios', icon: 'checkmark-outline', color: '#16B950', light: '#E0F8E7' },
]
const DETAILS: Record<Exclude<Section, 'inicio'>, { title: string; description: string; items: string[]; icon: IconName }> = {
  ordenes: { title: 'Órdenes de trabajo', description: 'Revisiones y estado de las reparaciones.', icon: 'construct-outline', items: ['Nueva orden de trabajo', 'Inspección multipunto', 'Seguimiento de diagnóstico y reparación'] },
  clientes: { title: 'Clientes y vehículos', description: 'Registro y antecedentes de cada vehículo.', icon: 'people-outline', items: ['Enlace de registro para clientes', 'Ficha del cliente y sus vehículos', 'Historial de mantenciones y observaciones'] },
  informes: { title: 'Informes y cotizaciones', description: 'Presupuestos y documentos para tus clientes.', icon: 'document-text-outline', items: ['Revisión multipunto en PDF', 'Cotización formal', 'Envío autorizado y trazable por correo'] },
  configuracion: { title: 'Configuración', description: 'Datos y herramientas de tu taller.', icon: 'settings-outline', items: ['Datos del taller', 'Usuarios y permisos', 'Correos y plantillas'] },
}
const COLORS = { navy: '#0B1F3B', blue: '#006EFF', ink: '#14233E', muted: '#6F829A', bg: '#F5F8FD' }

function IconCircle({ name, color = COLORS.blue, background = '#E4F0FF', size = 22 }: { name: IconName; color?: string; background?: string; size?: number }) {
  return <View style={[styles.iconCircle, { backgroundColor: background }]}><Ionicons name={name} size={size} color={color} /></View>
}

function LabelBadge({ status }: { status: StatusKey }) {
  const value = STATUSES.find(item => item.key === status) ?? STATUSES[0]
  return <View style={[styles.labelBadge, { backgroundColor: value.light }]}><Text style={[styles.labelBadgeText, { color: value.color }]}>{value.label}</Text></View>
}

function Metric({ label, value, icon, color, background, onPress }: {
  label: string; value: string; icon: IconName; color: string; background: string; onPress: () => void
}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label + ', ' + value + ', dato de demostración'} style={styles.metric} onPress={onPress} activeOpacity={0.75}>
    <IconCircle name={icon} color={color} background={background} />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricDemo}>Dato de ejemplo</Text>
  </TouchableOpacity>
}

export default function App() {
  const [section, setSection] = useState<Section>('inicio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todas' | StatusKey>('todas')
  const filteredOrders = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es-CL')
    return ORDERS.filter(item =>
      (statusFilter === 'todas' || item.status === statusFilter) &&
      (!term || [item.id, item.vehicle, item.service, item.plate].some(text => text.toLocaleLowerCase('es-CL').includes(term))))
  }, [query, statusFilter])
  const today = useMemo(() => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' }).format(new Date()), [])

  function go(target: Section) {
    setSection(target)
    setMenuOpen(false)
  }
  function notReady() {
    Alert.alert('Disponible próximamente', 'Esta versión es solo una demostración visual. La información real se habilitará después de implementar acceso seguro y base de datos.')
  }
  const module = section === 'inicio' ? null : DETAILS[section]
  return (
    <View style={styles.app}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityLabel="Abrir menú" accessibilityRole="button" style={styles.topAction} onPress={() => setMenuOpen(!menuOpen)}><Ionicons name={menuOpen ? 'close-outline' : 'menu-outline'} size={27} color="white" /></TouchableOpacity>
        <View style={styles.topBrand}><Image source={require('./assets/brand/logo-horizontal.png')} accessibilityLabel="ByteTorque — Gestión de Talleres" accessible resizeMode="contain" style={{width:156,height:44,backgroundColor:'#fff',borderRadius:8}} /></View>
        <TouchableOpacity accessibilityLabel="Ver notificaciones" accessibilityRole="button" style={styles.topAction} onPress={() => Alert.alert('Notificaciones', 'Aún no existen notificaciones reales. Estás viendo la demostración.')}><Ionicons name="notifications-outline" size={22} color="white" /><View style={styles.notificationDot} /></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Cuenta de demostración" accessibilityRole="button" style={styles.topAvatar} onPress={() => go('configuracion')}><Text style={styles.avatarText}>BT</Text></TouchableOpacity>
      </View>

      {menuOpen && <View style={styles.menuLayer}>
        <View style={styles.menuHeading}><Text style={styles.menuTitle}>Menú ByteTorque</Text><Text style={styles.menuSubtitle}>Navegación de demostración</Text></View>
        {NAV_ITEMS.map(item => <TouchableOpacity key={item.key} style={[styles.menuRow, section === item.key && styles.menuRowActive]} onPress={() => go(item.key)} accessibilityRole="button">
          <Ionicons name={item.icon} size={21} color={section === item.key ? COLORS.blue : COLORS.ink} />
          <Text style={[styles.menuRowText, section === item.key && styles.menuRowTextActive]}>{item.label === 'Más' ? 'Configuración' : item.label}</Text>
        </TouchableOpacity>)}
        <Text style={styles.menuFoot}>Sin conexión a datos reales</Text>
      </View>}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.demoNotice}><Ionicons name="information-circle-outline" size={18} color="#8B6E34" /><Text style={styles.demoNoticeText}><Text style={styles.demoNoticeBold}>DEMO VISUAL · </Text>Órdenes, vehículos y cifras ficticias; no se registran datos ni se envían correos.</Text></View>
        {section === 'inicio' ? <>
          <View style={styles.welcome}>
            <View style={styles.welcomeHeading}><Text style={styles.kicker}>PANEL PRINCIPAL</Text><Text style={styles.greeting}>¡Hola, equipo! 👋</Text><Text style={styles.welcomeSubtitle}>Resumen de tu taller hoy.</Text></View>
            <View style={styles.dateBadge}><Ionicons name="calendar-outline" size={17} color="#1D447B" /><Text style={styles.dateText}>{today}</Text></View>
          </View>
          <View style={styles.searchBar}><Ionicons name="search-outline" size={21} color="#355D90" /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar OT, patente o vehículo de ejemplo..." placeholderTextColor="#70849F" style={styles.searchInput} accessibilityLabel="Buscar órdenes demostrativas" autoCorrect={false} />{query.length > 0 && <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpiar búsqueda"><Ionicons name="close-circle" size={20} color="#8194AD" /></TouchableOpacity>}</View>

          <View style={styles.metricGrid}>
            <Metric label="Órdenes activas" value="18" icon="construct-outline" color="#0875F5" background="#E4F0FF" onPress={() => go('ordenes')} />
            <Metric label="Vehículos en taller" value="14" icon="car-sport-outline" color="#8950E8" background="#F1E9FF" onPress={() => go('clientes')} />
            <Metric label="Informes pendientes" value="6" icon="clipboard-outline" color="#0875F5" background="#E4F0FF" onPress={() => go('informes')} />
            <Metric label="Cotizaciones pendientes" value="5" icon="document-text-outline" color="#8950E8" background="#F1E9FF" onPress={() => go('informes')} />
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeading}><Text style={styles.panelTitle}>Estado de órdenes</Text><Text style={styles.smallDemo}>Simulado</Text></View>
            <View style={styles.progressStrip}>{STATUSES.map(item => <View key={item.key} style={[styles.progressPart, { backgroundColor: item.color, flex: item.count }]} />)}</View>
            <View style={styles.statusGrid}>{STATUSES.map(item => (
              <TouchableOpacity key={item.key} style={[styles.statusTile, { backgroundColor: item.light }]} onPress={() => setStatusFilter(statusFilter === item.key ? 'todas' : item.key)} accessibilityRole="button">
                <Ionicons name={item.icon} size={24} color={item.color} />
                <Text style={styles.statusTileLabel}>{item.label}</Text>
                <Text style={styles.statusTileCount}>{item.count}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={styles.panelHint}>Toca un estado para filtrar las órdenes de ejemplo.</Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeading}><Text style={styles.panelTitle}>Órdenes recientes</Text><TouchableOpacity onPress={() => go('ordenes')} accessibilityRole="button" style={styles.linkWithIcon}><Text style={styles.linkText}>Ver todas</Text><Ionicons name="chevron-forward" size={16} color={COLORS.blue}/></TouchableOpacity></View>
            {statusFilter !== 'todas' && <TouchableOpacity onPress={() => setStatusFilter('todas')} style={styles.filterChip}><Text style={styles.filterChipText}>Quitar filtro de estados ✕</Text></TouchableOpacity>}
            {filteredOrders.length === 0 && <View style={styles.emptySearch}><Ionicons name="search-outline" size={24} color="#7890AA" /><Text style={styles.emptySearchText}>Sin resultados de muestra.</Text><TouchableOpacity onPress={() => {setQuery('');setStatusFilter('todas')}}><Text style={styles.linkText}>Limpiar filtros</Text></TouchableOpacity></View>}
            {filteredOrders.map(order => (
              <TouchableOpacity accessibilityRole="button" key={order.id} style={styles.orderLine} activeOpacity={0.75} onPress={() => go('ordenes')}>
                <View style={styles.orderIcon}><Ionicons name="car-sport-outline" size={25} color="#47739F" /></View>
                <View style={styles.orderCopy}><Text style={styles.orderId}>{order.id}</Text><Text style={styles.orderVehicle} numberOfLines={1}>{order.vehicle}</Text><Text style={styles.orderService} numberOfLines={1}>{order.service}</Text></View>
                <View style={styles.orderRight}><LabelBadge status={order.status} /><Ionicons name="chevron-forward" size={16} color="#748AA4" /></View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeading}><Text style={styles.panelTitle}>Actividad reciente</Text><Text style={styles.smallDemo}>De ejemplo</Text></View>
            {ACTIVITY.map(item => (
              <View style={styles.activityLine} key={item.id}>
                <IconCircle name={item.icon} color={item.color} background={item.light} size={20} />
                <View style={styles.activityCopy}><Text style={styles.activityTitle}>{item.title}</Text><Text style={styles.activityDetail}>{item.detail}</Text></View>
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeading}><Text style={styles.panelTitle}>Accesos rápidos</Text></View>
            <View style={styles.shortcuts}>
              <TouchableOpacity style={[styles.shortcut,styles.shortcutPrimary]} accessibilityRole="button" onPress={() => go('ordenes')}><Ionicons name="add-outline" size={31} color="white"/><Text style={styles.shortcutPrimaryText}>Nueva orden</Text></TouchableOpacity>
              <TouchableOpacity style={styles.shortcut} accessibilityRole="button" onPress={() => go('clientes')}><Ionicons name="person-add-outline" size={27} color={COLORS.blue}/><Text style={styles.shortcutText}>Nuevo cliente</Text></TouchableOpacity>
              <TouchableOpacity style={styles.shortcut} accessibilityRole="button" onPress={() => go('informes')}><Ionicons name="document-text-outline" size={27} color={COLORS.blue}/><Text style={styles.shortcutText}>Nuevo informe</Text></TouchableOpacity>
            </View>
          </View>
        </> : module && <>
          <View style={styles.moduleHero}><View style={styles.moduleIcon}><Ionicons name={module.icon} size={34} color={COLORS.blue}/></View><Text style={styles.kicker}>PRÓXIMA ETAPA</Text><Text style={styles.moduleHeading}>{module.title}</Text><Text style={styles.moduleDescription}>{module.description}</Text></View>
          <View style={styles.panel}><Text style={styles.panelTitle}>Funciones planificadas</Text>{module.items.map(item=><View key={item} style={styles.plannedRow}><Ionicons name="checkmark-circle-outline" size={21} color={COLORS.blue}/><Text style={styles.plannedText}>{item}</Text></View>)}<TouchableOpacity style={styles.moduleButton} onPress={notReady}><Text style={styles.moduleButtonText}>Próximamente</Text><Ionicons name="arrow-forward" size={17} color="white"/></TouchableOpacity></View>
        </>}
      </ScrollView>

      <View style={styles.bottomNav}>{NAV_ITEMS.map(item => (
        <TouchableOpacity accessibilityRole="tab" accessibilityState={{selected: section === item.key}} key={item.key} onPress={() => go(item.key)}
          style={styles.bottomItem}>
          <Ionicons name={section === item.key && item.key === 'inicio' ? 'home' : item.icon} size={23} color={section === item.key ? COLORS.blue : '#506581'} />
          <Text style={[styles.bottomLabel, section === item.key && styles.bottomLabelActive]} numberOfLines={1}>{item.label}</Text>
        </TouchableOpacity>
      ))}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { height: 65, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navy, paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#274365' },
  topAction: { width: 38, height: 43, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notificationDot: { position: 'absolute', backgroundColor: '#F33D59', height: 9, width: 9, borderRadius: 5, right: 7, top: 7, borderWidth: 1, borderColor: COLORS.navy },
  topBrand: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  topBrandMark: { backgroundColor: COLORS.blue, borderRadius: 10, height: 32, width: 32, justifyContent: 'center', alignItems: 'center' },
  topBrandText: { color: 'white', fontSize: 21, fontWeight: '900', letterSpacing: -0.9 },
  topBrandAccent: { color: '#35A8FF' },
  topAvatar: { width: 33, height: 33, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#33517B', marginLeft: 3 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 13, paddingBottom: 30 },
  demoNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E6', borderColor: '#EBDDA8', borderWidth: 1, borderRadius: 10, padding: 9, marginBottom: 14, gap: 8 },
  demoNoticeText: { color: '#7F6638', fontSize: 11, lineHeight: 16, flex: 1 },
  demoNoticeBold: { fontWeight: '800' },
  welcome: { paddingHorizontal: 1, marginBottom: 12 },
  welcomeHeading: { marginBottom: 11 },
  kicker: { color: '#4C7AB7', fontSize: 10, letterSpacing: 1.1, fontWeight: '800', marginBottom: 4 },
  greeting: { fontSize: 27, fontWeight: '900', letterSpacing: -0.8, color: '#111D37' },
  welcomeSubtitle: { color: '#526886', fontSize: 13, marginTop: 3 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'white', borderRadius: 8, borderColor: '#C8D7EC', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8, gap: 8 },
  dateText: { fontSize: 12, fontWeight: '700', color: '#1B3A65', textTransform: 'capitalize' },
  searchBar: { flexDirection: 'row', alignItems: 'center', minHeight: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C5D9F4', borderRadius: 11, paddingHorizontal: 11, gap: 8, marginBottom: 13 },
  searchInput: { flex: 1, paddingVertical: 7, fontSize: 12, color: '#183456' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 2 },
  metric: { width: '48.6%', backgroundColor: 'white', borderColor: '#DBE6F5', borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 123, marginBottom: 8, elevation: 1 },
  iconCircle: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { marginTop: 7, fontWeight: '700', fontSize: 12, color: '#192841' },
  metricValue: { marginTop: 3, fontSize: 28, fontWeight: '900', color: '#11192B' },
  metricDemo: { fontSize: 10, color: '#8090A6', marginTop: 2 },
  panel: { backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE8F5', borderRadius: 15, padding: 14, marginBottom: 12, elevation: 1 },
  panelHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 11 },
  panelTitle: { fontWeight: '900', fontSize: 17, color: '#131E32', letterSpacing: -0.3 },
  smallDemo: { color: '#6F89A4', backgroundColor: '#EFF5FD', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10 },
  progressStrip: { height: 8, flexDirection: 'row', borderRadius: 7, overflow: 'hidden', marginTop: 3, marginBottom: 12 },
  progressPart: { height: 8 },
  statusGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  statusTile: { width: '24%', minHeight: 105, paddingHorizontal: 2, paddingVertical: 10, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statusTileLabel: { fontSize: 10, lineHeight: 12, textAlign: 'center', color: '#182A43', marginTop: 6, minHeight: 27 },
  statusTileCount: { fontSize: 19, fontWeight: '900', color: '#13213A' },
  panelHint: { color: '#8797AC', fontSize: 10, marginTop: 10 },
  linkWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  linkText: { color: COLORS.blue, fontSize: 11, fontWeight: '800' },
  filterChip: { alignSelf: 'flex-start', borderRadius: 6, backgroundColor: '#E4F0FF', padding: 6 },
  filterChipText: { fontSize: 11, color: '#2267AC' },
  emptySearch: { alignItems: 'center', padding: 17, gap: 8 },
  emptySearchText: { fontSize: 12, color: '#6D8299' },
  orderLine: { flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingVertical: 10, borderTopColor: '#E8EFF7', borderTopWidth: 1, gap: 9 },
  orderIcon: { backgroundColor: '#F0F5FB', width: 44, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  orderCopy: { flex: 1 },
  orderId: { color: COLORS.blue, fontSize: 12, fontWeight: '800' },
  orderVehicle: { color: '#1D2E49', fontWeight: '700', fontSize: 12, marginTop: 2 },
  orderService: { color: '#6D7F95', fontSize: 10, marginTop: 3 },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  labelBadge: { paddingHorizontal: 7, paddingVertical: 6, borderRadius: 7, maxWidth: 95 },
  labelBadgeText: { textAlign: 'center', fontWeight: '700', fontSize: 9 },
  activityLine: { borderTopWidth: 1, borderTopColor: '#E8EFF7', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  activityCopy: { flex: 1 },
  activityTitle: { color: '#192A44', fontSize: 12, fontWeight: '700' },
  activityDetail: { color: '#74869B', fontSize: 11, marginTop: 3 },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  shortcut: { flex: 1, minHeight: 99, borderRadius: 11, borderWidth: 1, borderColor: '#D7E4F5', backgroundColor: '#F4F8FF', alignItems: 'center', justifyContent: 'center', padding: 7, gap: 8 },
  shortcutPrimary: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  shortcutText: { fontSize: 11, color: '#263D61', fontWeight: '700', textAlign: 'center' },
  shortcutPrimaryText: { fontSize: 11, color: 'white', fontWeight: '800', textAlign: 'center' },
  bottomNav: { height: 67, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E1EAF5', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 3, paddingTop: 7 },
  bottomItem: { alignItems: 'center', justifyContent: 'center', width: '19%', gap: 4 },
  bottomLabel: { fontSize: 9, color: '#4A5F7E' },
  bottomLabelActive: { color: COLORS.blue, fontWeight: '800' },
  menuLayer: { backgroundColor: '#FFFFFF', borderBottomColor: '#D5E4F5', borderBottomWidth: 1, paddingHorizontal: 18, paddingBottom: 14, elevation: 5 },
  menuHeading: { paddingVertical: 15 },
  menuTitle: { fontSize: 18, fontWeight: '900', color: COLORS.ink },
  menuSubtitle: { fontSize: 11, color: '#7589A2', marginTop: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 42, paddingHorizontal: 10, borderRadius: 8 },
  menuRowActive: { backgroundColor: '#EAF3FF' },
  menuRowText: { color: COLORS.ink, fontSize: 13, fontWeight: '600' },
  menuRowTextActive: { color: COLORS.blue, fontWeight: '800' },
  menuFoot: { paddingTop: 10, paddingLeft: 10, color: '#8495A9', fontSize: 10 },
  moduleHero: { marginTop: 20, marginBottom: 21, alignItems: 'center', paddingHorizontal: 15 },
  moduleIcon: { borderRadius: 20, width: 78, height: 78, backgroundColor: '#E5F0FF', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  moduleHeading: { color: COLORS.ink, fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  moduleDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  plannedRow: { borderTopWidth: 1, borderTopColor: '#E9F0F9', paddingVertical: 15, flexDirection: 'row', gap: 11, alignItems: 'center' },
  plannedText: { color: '#334F70', fontSize: 12, flex: 1 },
  moduleButton: { backgroundColor: COLORS.blue, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18, alignSelf: 'flex-start', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 12 },
  moduleButtonText: { color: 'white', fontSize: 12, fontWeight: '800' },
})
