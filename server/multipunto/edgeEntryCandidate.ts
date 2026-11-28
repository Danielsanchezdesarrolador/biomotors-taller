// Offline review entry. Neither this file nor its package deploys anything.
// @ts-expect-error pinned Deno npm import resolved by native Edge runtime
import {createClient} from 'npm:@supabase/supabase-js@2.119.0'
import {multipuntoHandler} from './handler'
declare const Deno:{env:{get:(name:string)=>string|undefined};readFile:(url:URL)=>Promise<Uint8Array>;serve:(handler:(req:Request)=>Promise<Response>)=>void}
const env=(name:string)=>{const v=Deno.env.get(name);if(!v)throw Error('MP_CONFIGURATION_REQUIRED');return v}
const read=Deno.env.get('BT_MP_READ_ENABLED')==='true',write=Deno.env.get('BT_MP_WRITE_ENABLED')==='true'
if(!read)Deno.serve(async()=>new Response(null,{status:503,headers:{'Cache-Control':'no-store'}}))
else{
 const api=env('SUPABASE_URL'),key=env('BT_MP_PUBLISHABLE_KEY'),origin=env('BT_MP_ALLOWED_ORIGIN')
 if(!/^https:\/\//.test(origin)||!/^sb_publishable_/.test(key))throw Error('MP_CONFIGURATION_REQUIRED')
 const asset=(name:string)=>Deno.readFile(new URL('./assets/'+name,import.meta.url))
 Deno.serve(multipuntoHandler({origin,readEnabled:read,writeEnabled:write,user:authorization=>createClient(api,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}}),trusted:()=>createClient(api,env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}}),assets:async()=>({font:await asset('DejaVuSans.ttf'),light:await asset('logo-light.png'),dark:await asset('logo-dark.png')})}))
}
