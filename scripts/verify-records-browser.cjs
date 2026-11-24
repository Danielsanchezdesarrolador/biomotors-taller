// Browser + real candidate SQL through loopback-only bridge; synthetic lab only.
const {chromium}=require('playwright')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const out=process.env.BT_RECORDS_EVIDENCE_DIR||'/tmp/bt-records-evidence'
fs.mkdirSync(out,{recursive:true})
let browser
;(async()=>{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:1366,height:1000}})
 const uncertainRequests=[]
 await page.route('http://127.0.0.1:47115/rpc',async route=>{
  if(route.request().method()!=='POST'){await route.continue();return}
  const payload=route.request().postDataJSON()
  if(payload.name==='bt_records_execute'&&payload.args.p_id==='aaaaaaaa-aaaa-4aaa-8aaa-000000000002'){
   uncertainRequests.push(payload.args.p_request_id)
   if(uncertainRequests.length===1){const response=await route.fetch();await route.fulfill({response,json:{data:null,error:{code:'XX000'}}});return}
  }
  await route.continue()
 })
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://127.0.0.1:47114/records-qa')
 const list=page.getByRole('region',{name:'Clientes',exact:true})
 await list.getByText('Test customer A',{exact:true}).waitFor()
 const actions=label=>page.getByRole('button',{name:'Acciones de '+label,exact:true})
 const details=page.getByRole('region',{name:'Acciones y trazabilidad'})
 async function action(label,button,uncertain=false){
  await actions(label).click();await details.getByRole('button',{name:button,exact:true}).click()
  const modal=page.getByRole('dialog');await modal.waitFor()
  const confirm=modal.getByRole('button',{name:button,exact:true})
  assert.equal(await confirm.isEnabled(),false)
  await modal.getByRole('textbox',{name:'Motivo (sin datos sensibles)'}).fill('Validación sintética local')
  assert.equal(await confirm.isEnabled(),false)
  await modal.getByRole('checkbox').check();await confirm.click()
  if(uncertain){
   await modal.getByRole('button',{name:'Comprobar misma solicitud',exact:true}).waitFor()
   assert.equal(await modal.getByRole('button',{name:'Volver sin cambios'}).isDisabled(),true)
   assert.equal(await modal.getByRole('textbox').isDisabled(),true)
   await modal.getByRole('button',{name:'Comprobar misma solicitud',exact:true}).click()
  }
  await modal.waitFor({state:'hidden'})
  await page.getByText(button+': operación confirmada por el servidor.',{exact:true}).waitFor()
  await page.waitForFunction(()=>!document.querySelector('[aria-label="Administración de registros"]')?.textContent.includes('Consultando registros autorizados…'))
 }
 // No destructive command on merely opening or dismissing confirmation.
 await actions('Cliente ficticio sin dependencias').click()
 await details.getByRole('button',{name:'Eliminar definitivamente',exact:true}).click()
 await page.getByRole('dialog').getByRole('button',{name:'Volver sin cambios'}).click()
 await actions('Cliente ficticio sin dependencias').waitFor()
 await action('Cliente ficticio sin dependencias','Eliminar definitivamente',true)
 assert.equal(uncertainRequests.length,2);assert.equal(uncertainRequests[0],uncertainRequests[1])
 assert.equal(await actions('Cliente ficticio sin dependencias').count(),0)
 await page.getByRole('button',{name:'Ver registro de operaciones',exact:true}).click()
 await page.getByRole('region',{name:'Registro de operaciones',exact:true}).getByText('Registro: aaaaaaaa-aaaa-4aaa-8aaa-000000000002',{exact:true}).waitFor()
 await action('Test customer A','Archivar')
 await page.getByRole('button',{name:'Archivados y anulados',exact:true}).click()
 await actions('Test customer A').waitFor()
 await page.screenshot({path:out+'/archived-desktop.png',fullPage:true})
 await page.reload();await page.getByRole('button',{name:'Archivados y anulados',exact:true}).click()
 await action('Test customer A','Restaurar')
 // The same two vehicle records survive parent archive/restore.
 await page.getByRole('combobox',{name:'Tipo de registro'}).selectOption('vehicles')
 await page.getByRole('button',{name:'Registros activos',exact:true}).click()
 await actions('AA1234 · Kia · Rio').waitFor();await actions('CC1234 · Toyota · Ficticio').waitFor()
 await action('AA1234 · Kia · Rio','Archivar')
 await page.getByRole('button',{name:'Archivados y anulados',exact:true}).click()
 await action('AA1234 · Kia · Rio','Restaurar')
 await page.getByRole('combobox',{name:'Tipo de registro'}).selectOption('work_orders')
 await page.getByRole('button',{name:'Registros activos',exact:true}).click()
 await action('Ruido al frenar','Cancelar orden')
 await page.getByRole('button',{name:'Archivados y anulados',exact:true}).click()
 await actions('Ruido al frenar').click();await details.getByText('Cancelar orden ·',{exact:false}).waitFor()
 // Issued and draft quotes have different safe actions.
 await page.getByRole('combobox',{name:'Tipo de registro'}).selectOption('quotes')
 await page.getByRole('button',{name:'Registros activos',exact:true}).click()
 await action('Cotización 1','Anular cotización')
 await action('Cotización 2','Eliminar definitivamente')
 await page.getByRole('button',{name:'Archivados y anulados',exact:true}).click()
 await actions('Cotización 1').click()
 assert.equal(await details.getByRole('button',{name:'Eliminar definitivamente',exact:true}).count(),0)
 await details.getByText('Anular cotización ·',{exact:false}).waitFor()
 // Layout/keyboard checks use persisted history without repeating approved CP04/CP05 suites.
 for(const [name,width] of [['desktop',1366],['tablet',768],['mobile',390]]){
  await page.setViewportSize({width,height:920})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+' horizontal overflow')
  await page.screenshot({path:out+'/'+name+'.png',fullPage:true})
 }
 await page.getByRole('combobox',{name:'Tipo de registro'}).selectOption('customers')
 await page.getByRole('button',{name:'Registros activos',exact:true}).click()
 await actions('Test customer A').click();await details.getByRole('button',{name:'Archivar',exact:true}).click()
 const modal=page.getByRole('dialog')
 await modal.getByRole('textbox').focus();await page.keyboard.press('Shift+Tab')
 assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true,'modal traps focus')
 await page.screenshot({path:out+'/mobile-confirmation.png',fullPage:true})
 await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'})
 assert.equal(await details.getByRole('button',{name:'Archivar',exact:true}).evaluate(el=>el===document.activeElement),true,'focus restored')
 assert.deepEqual(errors,[])
 await browser.close();console.log('BT_RECORDS_BROWSER_PASS: real local RPC, explicit confirmation, history, reload, 1366/768/390, keyboard')
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()})
