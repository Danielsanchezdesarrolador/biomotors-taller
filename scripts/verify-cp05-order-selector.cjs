// Focused kept-alive CP05 selector regression. All Supabase HTTP is synthetic.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp05Page}=require('../tests/harness/cp05BrowserFixture.cjs')
const {uuid}=require('../tests/harness/cp04BrowserFixture.cjs')
;(async()=>{
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const out=process.env.OUTPUT_DIR||'/tmp/bt-cp05-selector';fs.mkdirSync(out,{recursive:true});const results=[]
 try{for(const width of (process.env.CP05_WIDTHS||'390,1366').split(',').map(Number)){
  const {p,state,requests,errors,quotes,commands}=await cp05Page(browser,width)
  const nav=index=>p.locator(width>760?'.side-nav button':'.bottom-nav button').nth(index).click()
  const selector=p.locator('.cp05-list select')
  const quoteReads=()=>requests.filter(r=>r.method==='GET'&&r.path.startsWith('/rest/v1/quote')).length
  let fail=false,holdNext=false,release,intercepted=0
  const oldGate=()=>new Promise(resolve=>{release=resolve})
  await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/rest/v1/work_orders*',async route=>{
    const req=route.request(),url=new URL(req.url())
    if(req.method()!=='GET'||url.searchParams.has('id'))return route.fallback()
    if(fail)return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'SYNTHETIC_LIST_UNAVAILABLE'})})
    if(holdNext){holdNext=false;intercepted++;const stale=structuredClone(state.orders);await oldGate();return route.fulfill({contentType:'application/json',body:JSON.stringify(stale)})}
    return route.fallback()
  })
  try{
   // Visit general Quotes first, so it will remain mounted with its old list.
   await nav(3);await selector.waitFor();await p.waitForFunction(()=>!document.querySelector('.cp05-list select')?.disabled)
   await p.evaluate(()=>{window.__selectorDocument=crypto.randomUUID()})
   const documentId=await p.evaluate(()=>window.__selectorDocument)
   const originalNode=await selector.elementHandle()
   const newOrders=[]
   async function newOrder(number){
    await nav(1)
    const vehicle={...state.vehicles[0],id:uuid(1800+number),plate:'QS'+(8000+number),plate_key:'QS'+(8000+number)}
    state.vehicles.push(vehicle)
    await p.getByLabel('Buscar patente registrada').fill(vehicle.plate)
    await p.getByRole('button',{name:'Buscar vehículo',exact:true}).click();await p.locator('.cp04-found').waitFor()
    await p.getByLabel('Motivo de ingreso *').fill('Nueva OT sintética para selector '+number)
    await p.getByRole('button',{name:'Guardar orden',exact:true}).click()
    await p.getByText('Orden de trabajo guardada en el servidor.',{exact:true}).waitFor()
    const order=state.orders.at(-1);newOrders.push(order)
    return {order,vehicle}
   }
   const first=await newOrder(1)
   await nav(3);await p.waitForFunction(()=>!document.querySelector('.cp05-list select')?.disabled)
   assert.ok((await selector.locator('option').allTextContents()).some(s=>s.includes(first.vehicle.plate)))
   assert.equal(await originalNode.evaluate(el=>el.isConnected),true,'Same kept-alive selector is refreshed')
   await selector.selectOption(first.order.id)
   await p.getByRole('button',{name:'Crear cotización',exact:true}).click()
   await p.locator('.cp05-workspace-toolbar').waitFor()
   const jobs=p.getByRole('tabpanel',{name:'Trabajos y repuestos',exact:true})
   await jobs.getByRole('button',{name:'Agregar otro ítem'}).click()
   await p.getByLabel('Descripción del ítem').fill('Partida de primer vehículo')
   await p.getByLabel('Cantidad del ítem').fill('2');await p.getByLabel('Precio del ítem').fill('15000')
   await p.getByRole('button',{name:'Confirmar partida en el borrador'}).click()
   await p.getByRole('tab',{name:'Condiciones',exact:true}).click()
   await p.getByRole('tabpanel',{name:'Condiciones',exact:true}).getByLabel('Condiciones',{exact:true}).fill('Condiciones sin guardar conservadas')
   const conditions=await p.getByRole('tabpanel',{name:'Condiciones',exact:true}).locator('textarea').first().elementHandle()
   await p.getByRole('tab',{name:'Trabajos y repuestos',exact:true}).click()
   await jobs.getByRole('button',{name:'Agregar otro ítem'}).click()
   await p.getByLabel('Descripción del ítem').fill('Texto de partida sin confirmar')
   const itemInput=await p.getByLabel('Descripción del ítem').elementHandle()
   const selectedQuote=quotes[0].id,writes=commands.size,readCount=quoteReads()
   const second=await newOrder(2)
   await nav(3);await p.waitForFunction(()=>!document.querySelector('.cp05-list select')?.disabled)
   if(width<=760)await p.getByRole('button',{name:'Cambiar cotización u OT'}).click()
   const options=await selector.locator('option').allTextContents()
   for(const vehicle of [first.vehicle,second.vehicle])assert.ok(options.some(s=>s.includes(vehicle.plate)))
   assert.equal(await selector.inputValue(),first.order.id,'Refresh preserves the selected OT')
   assert.equal(await itemInput.evaluate(el=>el.isConnected&&el.value==='Texto de partida sin confirmar'),true)
   assert.equal(await conditions.evaluate(el=>el.isConnected&&el.value==='Condiciones sin guardar conservadas'),true)
   assert.match(await p.getByLabel('Total siempre visible').innerText(),/35.700/)
   assert.equal(quotes[0].id,selectedQuote);assert.equal(commands.size,writes)
   assert.equal(quoteReads(),readCount,'Entry refresh must not reload the quote or its draft')
   // An error blocks only the selector/create action, not unsaved quote editing.
   await nav(0);fail=true;await nav(3)
   await p.getByRole('button',{name:'Reintentar órdenes',exact:true}).waitFor()
   assert.equal(await selector.isDisabled(),true)
   assert.equal(await p.getByRole('button',{name:'Crear cotización',exact:true}).isDisabled(),true)
   assert.equal(await p.getByRole('button',{name:'Guardar borrador',exact:true}).isEnabled(),true)
   assert.equal(await itemInput.evaluate(el=>el.isConnected&&el.value==='Texto de partida sin confirmar'),true)
   fail=false;await p.getByRole('button',{name:'Reintentar órdenes',exact:true}).click()
   await p.waitForFunction(()=>!document.querySelector('.cp05-list select')?.disabled)
   // A slower response from the previous visit cannot replace the newer one.
   await nav(0);holdNext=true;await nav(3)
   await p.waitForFunction(()=>document.querySelector('.cp05-list select')?.disabled===true)
   for(let i=0;i<40&&!release;i++)await p.waitForTimeout(25)
   assert.equal(intercepted,1);assert.ok(release)
   await nav(0)
   const raceOrder={...second.order,id:uuid(1999),complaint:'OT nueva durante lectura suspendida'}
   state.orders.push(raceOrder)
   await nav(3);await p.waitForFunction(()=>!document.querySelector('.cp05-list select')?.disabled)
   assert.equal(await selector.locator(`option[value="${raceOrder.id}"]`).count(),1)
   release();await p.waitForTimeout(150)
   assert.equal(await selector.locator(`option[value="${raceOrder.id}"]`).count(),1,'Ignore previous activation response')
   assert.equal(await selector.inputValue(),first.order.id)
   assert.equal(await itemInput.evaluate(el=>el.isConnected&&el.value==='Texto de partida sin confirmar'),true)
   // The existing explicit save/load still persists and links the original source.
   await p.getByRole('button',{name:'Cancelar edición de partida',exact:true}).click()
   await p.getByRole('button',{name:'Guardar borrador',exact:true}).click()
   if(width===390){await p.getByRole('button',{name:'Recuperar operación confirmada',exact:true}).click();await p.getByText('Guardado confirmado y versión recuperada del servidor.',{exact:true}).waitFor()}
   else await p.getByText('Guardado correctamente.',{exact:true}).waitFor()
   assert.equal(quotes[0].order_id,first.order.id);assert.equal(quotes[0].vehicle_id,first.vehicle.id)
   await p.getByRole('button',{name:'Recargar versión guardada',exact:true}).click()
   await p.getByRole('tab',{name:'Condiciones',exact:true}).click()
   assert.equal(await p.getByRole('tabpanel',{name:'Condiciones',exact:true}).locator('textarea').first().inputValue(),'Condiciones sin guardar conservadas')
   assert.equal(await p.evaluate(()=>window.__selectorDocument),documentId,'No document reload')
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
   await p.screenshot({path:`${out}/selector-${width}.png`,fullPage:true})
   // New guarded reads after membership revocation cannot show/create from stale options.
   const beforeDenied=commands.size
   await nav(0);state.revoked=true;await nav(3)
   await p.getByText('No se pudo verificar el acceso a las órdenes. Vuelve a verificar tu sesión.',{exact:true}).waitFor()
   assert.equal(await p.locator('.cp05-workspace-toolbar').count(),0)
   assert.equal(await selector.locator('option').count(),1)
   assert.equal(await p.getByRole('button',{name:'Crear cotización',exact:true}).isDisabled(),true)
   assert.equal(commands.size,beforeDenied)
   assert.deepEqual(errors,[])
   results.push({width,status:'PASS',newVehicles:2,newOrders:2,selectorRefresh:true,sameNodes:true,draftPreserved:true,selectionPreserved:true,errorRetry:true,staleResponseIgnored:true,guardedRevocation:true,persistence:'synthetic HTTP only'})
   fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log('CP05_SELECTOR_PASS',width)
  }catch(e){await p.screenshot({path:`${out}/failure-${width}.png`,fullPage:true});console.log(await p.locator('[role=alert]').allTextContents());throw e}
  finally{await p.context().close()}
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
