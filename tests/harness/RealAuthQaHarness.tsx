// Private loopback entry only. Playwright MUST intercept every Supabase request.
// Uses the real SDK with synthetic HTTP responses; never a real Auth account/RLS test.
import App from '../../src/App'
import {useEffect} from 'react'
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
  useEffect(()=>{
    // Test-only commands. This entire entry is excluded from every public build.
    const scope=window as Window & {btUxQa?:unknown}
    scope.btUxQa={phase:()=>controller.getSnapshot().phase,verify:()=>controller.validate(),choose:(id:string)=>controller.choose(id),
      refresh:async()=>{const client=await controller.directoryClient();return client?.auth.refreshSession()}}
    return()=>{delete scope.btUxQa}
  },[])
  return <App authController={controller} />
}
