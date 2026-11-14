import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AppShell, type Screen } from './layout/AppShell'
import { OfficialPanel } from './official/OfficialPanels'
import { preparationNotice } from './official/officialWorkspace'
import './informes/informes.css'
import './official/official.css'
export default function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  return (
    <AppShell screen={screen} onNavigate={setScreen}>
      <div className="official-readiness" id="official-readiness" role="note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>Acceso seguro y guardado permanente en preparación</strong>
          <p>{preparationNotice}</p>
        </div>
      </div>
      <OfficialPanel screen={screen} onNavigate={setScreen} />
    </AppShell>
  )
}
