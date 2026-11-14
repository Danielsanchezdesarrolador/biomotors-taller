// Private loopback entry only. Playwright MUST intercept every Supabase request.
// Uses the real SDK with synthetic HTTP responses; never a real Auth account/RLS test.
import App from '../../src/App'
import { AuthController } from '../../src/auth/controller'
import { createGateway } from '../../src/auth/supabaseGateway'
const controller = new AuthController(
  createGateway({
    enabled: true,
    url: 'https://suxcqqnmcjoezfxltoms.supabase.co',
    key: 'sb_publishable_private_browser_stub'
  })
)
export function RealAuthQaHarness() {
  return <App authController={controller} />
}
