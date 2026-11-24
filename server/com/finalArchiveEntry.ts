/** Offline packaging entry only. Not registered in the hosted project or repo Supabase config. */
import {createClient} from '@supabase/supabase-js'
import {finalArchiveHandler} from './finalArchiveHandler'
declare const Deno:{env:{get:(name:string)=>string|undefined};readFile:(url:URL)=>Promise<Uint8Array>;serve:(handler:(r:Request)=>Promise<Response>)=>void}
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error('SERVER_NOT_CONFIGURED');return value}
async function asset(name:string,expected:string){const b=await Deno.readFile(new URL('./assets/'+name,import.meta.url));const h=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b.slice().buffer)),x=>x.toString(16).padStart(2,'0')).join('');if(h!==expected)throw Error('ASSET_INTEGRITY');return b}
Deno.serve(finalArchiveHandler({read:Deno.env.get('BT_FINAL_ARCHIVE_READ_ENABLED')==='true',write:Deno.env.get('BT_FINAL_ARCHIVE_WRITE_ENABLED')==='true',origin:Deno.env.get('BT_FINAL_ARCHIVE_ALLOWED_ORIGIN')||'https://bytetorque.cl'},{
 userClient:authorization=>createClient(required('SUPABASE_URL'),required('BT_CP05_PUBLISHABLE_KEY'),{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),
 trustedClient:()=>createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),
 assets:async()=>({font:await asset('DejaVuSans.ttf','57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e'),logo:await asset('icon-192.png','1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67')})
}))
