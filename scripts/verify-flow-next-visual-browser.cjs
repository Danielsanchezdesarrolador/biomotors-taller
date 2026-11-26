const {chromium}=require('playwright')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const base=process.env.BT_VISUAL_BASE_URL||'http://127.0.0.1:47132'
const out=process.env.OUTPUT_DIR||'/tmp/flow-next-visual/screenshots'
const widths=[1440,390,375]
const scenes=[['avance',5],['inspeccion',4],['cotizacion',3],['aprobacion',4],['ejecucion',5],['entrega',6],['expediente',7]]
;(async()=>{
 fs.mkdirSync(out,{recursive:true})
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
 try{
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'})
   const errors=[]
   page.on('pageerror',error=>errors.push(error.message))
   page.on('dialog',dialog=>dialog.accept())
   for(const [name,stage] of scenes){
    await page.goto(base+'/guided-qa?shell&stage='+stage+'&notes=1')
    await page.getByRole('button',{name:/Continuar$/}).last().click()
    await page.getByRole('button',{name:'Continuar atención',exact:true}).waitFor()
    if(name!=='avance'){
     if(name==='inspeccion')await page.getByRole('button',{name:'Abrir inspección multipunto',exact:true}).click()
     else await page.getByRole('button',{name:'Continuar atención',exact:true}).click()
     await page.locator('.guided-dialog footer button:last-child:not([disabled])').waitFor()
     if(['aprobacion','ejecucion','entrega'].includes(name))await page.getByRole('button',{name:'Actualizar historial',exact:true}).waitFor()
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow '+name+' '+width)
    assert.equal(await page.locator('.guided-dialog [role="alert"]').count(),0)
    const dimensions=await page.locator('.guided-dialog input[type="checkbox"]:visible').evaluateAll(nodes=>nodes.map(node=>{
     const box=node.getBoundingClientRect(),label=node.closest('label')?.getBoundingClientRect()
     return {width:box.width,height:box.height,label:label?.height??0}
    }))
    for(const box of dimensions){assert(box.width>=18&&box.width<=24&&box.height>=18&&box.height<=24,JSON.stringify(box));assert(box.label>=44,JSON.stringify(box))}
    if(name!=='avance'){
     const footer=page.locator('.guided-dialog>footer')
     assert.equal(await footer.evaluate(node=>getComputedStyle(node).position),'static')
     const action=footer.locator('button').last()
     await action.scrollIntoViewIfNeeded()
     assert(await action.evaluate(node=>{const r=node.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return node===hit||node.contains(hit)}),'primary action covered by navigation')
    }
    await page.evaluate(()=>window.scrollTo(0,0))
    await page.screenshot({path:out+'/'+name+'-'+width+'.png',fullPage:true})
    if(name==='ejecucion'){
     assert.equal(await page.locator('.execution-guided>button:visible').count(),0)
     const scope=page.getByRole('checkbox',{name:/He cotejado el alcance técnico actual/})
     assert.equal(await scope.isChecked(),false)
     await scope.focus();await scope.press('Space');assert.equal(await scope.isChecked(),true)
     const confirmation=page.locator('.execution-guided .cp05-execution-confirm input')
     await confirmation.focus();await confirmation.press('Space');assert.equal(await confirmation.isChecked(),true)
     await confirmation.press('Space');await scope.focus();await scope.press('Space')
     assert.equal(await page.evaluate(()=>window.r1.writes),0)
     await page.getByRole('button',{name:'Finalizar trabajos y preparar entrega',exact:true}).click()
     await page.locator('.guided-dialog [role="alert"]').waitFor()
     assert.equal(await page.evaluate(()=>window.r1.writes),0)
     assert(await page.getByRole('heading',{name:'6. Ejecución de trabajos',exact:true}).isVisible())
    }
    console.log('PASS',width,name,'no overflow, controls accessible, actions in flow')
   }
   assert.deepEqual(errors,[])
   await page.close()
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
