const {chromium}=require('playwright')
const assert=require('node:assert/strict')
const fs=require('node:fs')
process.env.CP04_BASE_URL=process.env.BT_FIX_ID_BASE_URL||'http://127.0.0.1:47131'
const {cp04Page,uuid}=require('../tests/harness/cp04BrowserFixture.cjs')
const out=process.env.OUTPUT_DIR||'/tmp/flow-next-fix-id/evidencias'
const api='https://suxcqqnmcjoezfxltoms.supabase.co'
;(async()=>{
 fs.mkdirSync(out,{recursive:true})
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
 try{
  const workshopId='c943ad51-6d90-447b-8aa7-68866f69a4bc'
  const {p,state,requests,errors}=await cp04Page(browser,1440,{workshopId,customers:[{id:uuid(50),workshop_id:workshopId,full_name:'Cliente sintético FIX-ID',archived_at:null}]})
  p.on('dialog',dialog=>dialog.accept())
  await p.route(api+'/rest/v1/quotes**',route=>route.fulfill({contentType:'application/json',body:'[]'}))
  state.orders.forEach(row=>{row.cancelled_at=null})
  const writeOrders=[]
  await p.route(api+'/rest/v1/inspection_findings**',async route=>{
   const request=route.request()
   if(request.method()==='POST'){
    const orderId=request.postDataJSON().order_id
    writeOrders.push(orderId)
    assert.equal(orderId,state.orders[0].id,'even failed write attempts must stay on A')
   }
   return route.fallback()
  })
  const workspace=p.locator('.flow-next-workspace')
  const selectExternal=async index=>{
   await p.locator('.cp04-order').nth(index).click()
   await p.locator('.cp04-private').getByRole('button',{name:'Continuar recorrido guiado',exact:true}).click()
   await workspace.locator('.guided-header>button:not([disabled])').waitFor()
  }
  const plate=async expected=>{
   await p.waitForFunction(value=>Array.from(document.querySelectorAll('.flow-next-overview>p')).some(node=>node.textContent.includes(value)),expected)
   assert.match(await workspace.locator('.flow-next-overview>p').first().innerText(),new RegExp(expected))
  }
  const nav=index=>p.locator('.side-nav button').nth(index).click()
  await selectExternal(0)
  await plate('QA1234')
  await workspace.evaluate(node=>{window.fixOriginalWorkspace=node})
  await workspace.getByRole('button',{name:/QA1235.*Continuar$/}).click()
  await plate('QA1235')
  assert(await workspace.evaluate(node=>node===window.fixOriginalWorkspace),'internal selection must keep mounted workspace')
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await selectExternal(0)
  await plate('QA1234')
  assert(await workspace.evaluate(node=>node!==window.fixOriginalWorkspace),'external A must replace the clean B context')
  assert.equal(requests.filter(r=>r.path.startsWith('/rest/')&&r.method!=='GET').length,0)
  console.log('PASS 1 A -> internal B -> close -> external A restores A, with zero data writes')

  await workspace.getByRole('button',{name:'Continuar atención',exact:true}).click()
  await workspace.getByRole('heading',{name:'3. Inspección multipunto',exact:true}).waitFor()
  state.failFindings=true
  await workspace.locator('.mp-row').first().getByRole('radio',{name:/ · Requiere atención$/}).check()
  const draft='Borrador de A conservado al retomar y protegido frente a B.'
  const field=workspace.getByLabel(/Observación técnica de/).first()
  await field.fill(draft)
  await workspace.evaluate(node=>{window.fixDraftWorkspace=node})
  await field.evaluate(node=>{window.fixDraftInput=node})
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await p.getByRole('button',{name:'Retomar atención activa',exact:true}).click()
  assert.equal(await field.inputValue(),draft)
  assert(await workspace.evaluate(node=>node===window.fixDraftWorkspace))
  assert(await field.evaluate(node=>node===window.fixDraftInput))
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await selectExternal(0)
  assert.equal(await field.inputValue(),draft)
  assert(await workspace.evaluate(node=>node===window.fixDraftWorkspace))
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await selectExternal(1)
  assert.equal(await field.inputValue(),draft)
  assert(await workspace.evaluate(node=>node===window.fixDraftWorkspace))
  console.log('PASS 3 resume and explicit same-A request preserve input/node identity; pending A blocks B')
  state.failFindings=false
  await workspace.getByRole('button',{name:'Reintentar guardados',exact:true}).waitFor()
  await workspace.getByRole('button',{name:'Reintentar guardados',exact:true}).click()
  await workspace.locator('footer button:last-child:not([disabled])').waitFor()
  assert(state.findings.length>0)
  assert(state.findings.every(row=>row.order_id===state.orders[0].id),'all confirmed writes belong to A')
  console.log('PASS 4 confirmed inspection writes belong only to A, never B')

  await workspace.getByRole('button',{name:'Ver avance de atención',exact:true}).click()
  let hold=true,release,started
  const gate=new Promise(resolve=>{release=resolve}),entered=new Promise(resolve=>{started=resolve})
  await p.route(api+'/rest/v1/work_orders**',async route=>{
   if(hold&&new URL(route.request().url()).searchParams.get('id')==='eq.'+state.orders[1].id){started();await gate}
   return route.fallback()
  })
  await workspace.getByRole('button',{name:/QA1235.*Continuar$/}).click()
  await entered
  await nav(0)
  hold=false;release()
  await p.getByRole('button',{name:'Retomar atención activa',exact:true}).click()
  await workspace.locator('.guided-header>button:not([disabled])').waitFor()
  await plate('QA1234')
  console.log('PASS stale internal B response after navigation cannot replace confirmed A identity')

  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await nav(0)
  const intake=p.getByRole('button',{name:'Nuevo ingreso de vehículo',exact:true})
  await intake.click()
  await workspace.getByRole('heading',{name:'Iniciar o continuar atención',exact:true}).waitFor()
  await workspace.getByRole('button',{name:/QA1235.*Continuar$/}).click()
  await plate('QA1235')
  await workspace.evaluate(node=>{window.fixEmptyEntryWorkspace=node})
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await intake.click()
  await workspace.getByRole('heading',{name:'Iniciar o continuar atención',exact:true}).waitFor()
  assert(await workspace.evaluate(node=>node!==window.fixEmptyEntryWorkspace))
  await workspace.evaluate(node=>{window.fixEmptyEntryWorkspace=node})
  await workspace.getByRole('button',{name:'Cerrar recorrido',exact:true}).click()
  await intake.click()
  await workspace.getByRole('heading',{name:'Iniciar o continuar atención',exact:true}).waitFor()
  assert(await workspace.evaluate(node=>node!==window.fixEmptyEntryWorkspace))
  assert(state.findings.every(row=>row.order_id===state.orders[0].id))
  assert.equal(state.orders.length,5,'new-entry navigation must not create orders by itself')
  console.log('PASS 2 empty entry -> B -> close -> new entry starts independently; repeated clean empty entry is fresh')
  assert.deepEqual(errors,[])
  assert(writeOrders.length>0)
  assert(writeOrders.every(id=>id===state.orders[0].id))
  fs.writeFileSync(out+'/resultado.json',JSON.stringify({externalAAfterInternalB:true,newIntakeIndependent:true,draftNodePreserved:true,pendingDraftBlocksOtherVisit:true,staleResponseDiscarded:true,writeAttemptsOnlyOnA:true,confirmedWritesOnlyOnA:true,ordersCreated:state.orders.length-5,pageErrors:errors},null,2)+'\n')
  console.log('FIX_ID_PASS')
  await p.close()
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
