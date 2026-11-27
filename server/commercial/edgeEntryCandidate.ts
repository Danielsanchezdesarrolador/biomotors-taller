/** Offline packaging entry only: never registered or deployed by this source file. */
import {createClient} from '@supabase/supabase-js'
import {commercialDocumentHandler} from './documentHandler'
declare const Deno:{env:{get:(name:string)=>string|undefined};readFile:(url:URL)=>Promise<Uint8Array>;serve:(handler:(request:Request)=>Promise<Response>)=>void}
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error('SERVER_NOT_CONFIGURED');return value}
const hashes:Record<string,string>={"DejaVuSans.ttf": "57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e", "icon-192.png": "1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67", "logo-light.png": "d47484d31979089e12019893fd1632eda980dbc7bddc100a9f40f1d6da3395f4", "logo-dark.png": "fe66f89b0799864fecfbc4939e896f9e41da85e414d1dc6bd2656fe5c3123e8d"}
async function asset(name:string){const bytes=await Deno.readFile(new URL('./assets/'+name,import.meta.url));const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)),v=>v.toString(16).padStart(2,'0')).join('');if(digest!==hashes[name])throw Error('ASSET_INTEGRITY_ERROR');return bytes}
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}
Deno.serve(commercialDocumentHandler({
 user:authorization=>createClient(required('SUPABASE_URL'),required('BT_CP05_PUBLISHABLE_KEY'),{...options,global:{headers:{Authorization:authorization}}}),
 trusted:()=>createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),options),
 assets:async()=>({font:await asset('DejaVuSans.ttf'),logo:await asset('icon-192.png'),light:await asset('logo-light.png'),dark:await asset('logo-dark.png')})
},Deno.env.get('BT_CP05_ALLOWED_ORIGIN')||'https://bytetorque.cl'))
