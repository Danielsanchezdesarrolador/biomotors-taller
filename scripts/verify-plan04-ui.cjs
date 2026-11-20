// SDK HTTP stubs only: no request, user, invitation or data reaches Supabase.
const {chromium}=require('playwright')
const assert=require('node:assert/strict'),fs=require('node:fs')
const origin=process.env.PLAN04_BASE_URL||'http://127.0.0.1:5191'
const out=process.env.OUTPUT_DIR||'/tmp/bt-plan04-ui'
const api='https://suxcqqnmcjoezfxltoms.supabase.co'
const uid='00000000-0000-4000-8000-000000000002',wid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const user={id:uid,aud:'authenticated',role:'authenticated',email:'synthetic@invalid.test',email_confirmed_at:'2026-11-17T00:00:00Z',user_metadata:{full_name:'Titular sintético'}}
const jwt=()=>Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.synthetic'
;(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:940}}),errors=[],unexpected=[]
  let plan='basic',member=false,pending=0,role='owner'
  let profile={workshopId:wid,name:'Taller sintético',email:'',phone:'',address:'',logoPath:null}
  const team=()=>({workshopId:wid,active:0,pending,capacity:8,overCapacity:false,members:[],invites:pending?[{id:'00000000-0000-4000-8000-000000000099',email:'mechanic@invalid.test',expiresAt:'2035-01-01'}]:[]})
  page.on('pageerror',e=>errors.push(e.message))
  await page.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url())
   if(url.origin===origin)return route.continue()
   if(url.origin!==api){unexpected.push(url.origin);return route.abort()}
   const reply=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)})
   const args=request.postDataJSON?.()||{}
   switch(url.pathname){
    case '/auth/v1/token':return reply({access_token:jwt(),refresh_token:'synthetic',token_type:'bearer',expires_in:3600,user})
    case '/auth/v1/user':return reply(user)
    case '/auth/v1/logout':return reply({})
    case '/rest/v1/profiles':return reply({display_name:'Titular sintético'})
    case '/rest/v1/workshop_memberships':return reply(member?[{user_id:uid,workshop_id:wid,role,status:'active'}]:[])
    case '/rest/v1/workshops':return reply([{id:wid,name:profile.name,status:'active'}])
    case '/rest/v1/rpc/bt_creator_is_creator':return reply(false)
    case '/rest/v1/rpc/bt_plan04_my_status':return reply({scope:args.p_workshop_id?'workshop':'personal',effectivePlan:args.p_workshop_id?'full':plan,personalPlan:plan,isLifetime:args.p_workshop_id?true:plan==='full',expiresAt:null,workshopId:args.p_workshop_id||null})
    case '/rest/v1/rpc/bt_plan04_create_workshop':assert.equal(plan,'full');assert.equal(args.p_name,'Taller sintético');member=true;return reply({workshopId:wid})
    case '/rest/v1/rpc/bt_plan04_profile':return reply(profile)
    case '/rest/v1/rpc/bt_plan04_team':return reply(team())
    case '/rest/v1/rpc/bt_plan04_update_profile':assert.equal(args.p_workshop_id,wid);profile={...profile,name:args.p_name,email:args.p_email,phone:args.p_phone,address:args.p_address};return reply({saved:true})
    case '/rest/v1/rpc/bt_plan04_manage_mechanic':assert.equal(args.p_action,'invite');assert.equal(args.p_workshop_id,wid);pending=1;return reply({id:'00000000-0000-4000-8000-000000000099',token:'a'.repeat(64)})
    case '/rest/v1/rpc/bt_plan04_accept_mechanic':assert.equal(args.p_token,'b'.repeat(64));member=true;role='mechanic';return reply({workshopId:wid})
    case '/rest/v1/customers':case '/rest/v1/vehicles':case '/rest/v1/work_orders':case '/rest/v1/inspection_reports':return reply([])
    default:unexpected.push(url.pathname);return route.abort()
   }
  })
  await page.goto(origin+'/#/acceso')
  await page.getByLabel('Correo electrónico',{exact:true}).fill(user.email)
  await page.getByLabel('Contraseña',{exact:true}).fill('synthetic-not-a-real-password')
  await page.getByRole('button',{name:'Ingresar',exact:true}).click()
  await page.getByRole('heading',{name:'Mi cuenta ByteTorque'}).waitFor()
  await page.getByText('Plan Básico',{exact:true}).waitFor()
  assert.equal(await page.getByRole('button',{name:'Crear mi taller',exact:true}).count(),0)
  await page.screenshot({path:out+'/personal-basic-'+width+'.png',fullPage:true})
  plan='full';await page.getByRole('button',{name:'Actualizar mi plan y accesos'}).click()
  await page.getByLabel('Nombre de mi taller').waitFor({timeout:5000})
  await page.getByLabel('Nombre de mi taller').fill('Taller sintético')
  await page.getByRole('button',{name:'Crear mi taller',exact:true}).click()
  await page.locator('.dashboard-main').waitFor()
  const nav=page.locator(width>760?'.side-nav button':'.bottom-nav button')
  await nav.nth(4).click()
  await page.getByRole('heading',{name:'Identidad comercial'}).waitFor()
  await page.getByLabel('Correo del taller',{exact:true}).fill('workshop@invalid.test')
  await page.getByRole('button',{name:'Guardar datos comerciales'}).click()
  await page.getByText('Datos comerciales guardados en este taller.').waitFor()
  assert.equal(profile.email,'workshop@invalid.test')
  await page.getByLabel('Correo del mecánico',{exact:true}).fill('mechanic@invalid.test')
  await page.getByRole('button',{name:'Reservar invitación'}).click()
  await page.getByRole('button',{name:'Copiar enlace seguro'}).waitFor()
  assert.equal(await page.evaluate(()=>location.href.includes('a'.repeat(64))),false)
  assert.equal(await page.evaluate(()=>[...Object.values(localStorage),...Object.values(sessionStorage)].some(v=>v.includes('a'.repeat(64)))),false)
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow')
  await page.screenshot({path:out+'/settings-'+width+'.png',fullPage:true})
  await page.getByRole('button',{name:'Descartar enlace'}).click()
  assert.equal(await page.getByRole('button',{name:'Copiar enlace seguro'}).count(),0)
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click()
  await page.getByRole('button',{name:'Ingresar',exact:true}).waitFor()
  member=false;plan='basic'
  await page.goto(origin+'/#/auth/aceptar-invitacion?token='+'b'.repeat(64))
  await page.getByLabel('Correo electrónico',{exact:true}).waitFor({timeout:5000})
  await page.getByLabel('Correo electrónico',{exact:true}).fill(user.email)
  await page.getByLabel('Contraseña',{exact:true}).fill('synthetic-not-a-real-password')
  await page.getByRole('button',{name:'Ingresar',exact:true}).click()
  assert.equal(await page.evaluate(()=>location.href.includes('b'.repeat(64))),false)
  await page.getByRole('button',{name:'Aceptar con mi cuenta verificada'}).click()
  await page.getByRole('heading',{name:'Tu espacio de trabajo técnico'}).waitFor()
  await page.getByText('Full activo',{exact:true}).waitFor()
  assert.equal(await page.getByRole('heading',{name:'Identidad comercial'}).count(),0)
  await page.screenshot({path:out+'/mechanic-'+width+'.png',fullPage:true})
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[])
  await page.close()
 }
 console.log('PLAN04_UI_HTTP_MOCK_DESKTOP_MOBILE_PASS: Basic denial, Full create, tenant profile, invitation and token privacy; no real Auth/Storage/DB')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
