const assert=require('node:assert/strict')
// Real layout, main-document scroll and hit testing. No force clicks, CSS fixes,
// DOM reparenting or business mutations are used to make a control reachable.
async function layoutFrame(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))}
async function hitControl(locator,label){
 const result=await locator.evaluate(element=>{
  const rect=element.getBoundingClientRect(),toolbar=document.querySelector('.cp04-workspace-toolbar'),head=toolbar.getBoundingClientRect()
  const points=[[.5,.5],[.2,.2],[.8,.2],[.2,.8],[.8,.8]].map(([fx,fy])=>{
   const x=rect.left+rect.width*fx,y=rect.top+rect.height*fy,hit=document.elementFromPoint(x,y)
   return {x,y,receives:!!hit&&(hit===element||element.contains(hit)),hit:hit?.tagName,hitClass:hit?.className}
  })
  const inToolbar=toolbar.contains(element)
  return {rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,bottom:rect.bottom,right:rect.right},header:{top:head.top,bottom:head.bottom,height:head.height,position:getComputedStyle(toolbar).position},scrollY,viewport:{width:innerWidth,height:innerHeight},inToolbar,points}
 })
 assert.ok(result.rect.width>0&&result.rect.height>0,label+': non-empty geometry')
 assert.ok(result.rect.x>=0&&result.rect.right<=result.viewport.width+1&&result.rect.y>=0&&result.rect.bottom<=result.viewport.height+1,label+': entire control lies inside viewport '+JSON.stringify(result))
 assert.ok(result.points.every(point=>point.receives),label+': actual hit testing rejected control '+JSON.stringify(result))
 if(!result.inToolbar&&result.header.position==='sticky'&&result.header.top<=1&&result.header.bottom>0)
  assert.ok(result.rect.y>=result.header.bottom,label+': sticky header overlaps diagnostic control')
 return {label,...result}
}
async function exposeControl(page,locator,label){
 await locator.waitFor({state:'visible'})
 await locator.evaluate(element=>element.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}))
 await layoutFrame(page)
 const geometry=await hitControl(locator,label)
 await locator.click({trial:true}) // Includes Playwright actionability without invoking a write.
 return geometry
}
async function assertMainScrollCoverage(page,{out,prefix='coverage'}={}){
 const observations=[],tab=name=>page.getByRole('tab',{name,exact:true})
 for(const summary of await page.locator('.cp04-action-group[open]>summary').all())await summary.click()
 await tab('Inspección multipunto').click()
 const panel=page.getByRole('tabpanel',{name:'Inspección multipunto',exact:true})
 assert.equal(await panel.evaluate(element=>getComputedStyle(element).overflowY),'visible','Inspection must use main document scroll')
 const rows=page.locator('.cp04-detail .mp-row'),count=await rows.count();assert.equal(count,34)
 for(const index of [0,Math.floor(count/2),count-1]){
  const row=rows.nth(index)
  observations.push(await exposeControl(page,row.locator('.mp-cell').first(),'component-'+index))
  const clear=row.getByRole('button',{name:/^Limpiar /})
  if(await clear.count())observations.push(await exposeControl(page,clear,'clear-'+index))
 }
 const notes=panel.getByRole('textbox')
 assert.ok(await notes.count()>0,'Coverage requires a real diagnostic note, not an empty form')
 for(const index of [...new Set([0,(await notes.count())-1])]){
  const note=notes.nth(index)
  observations.push(await exposeControl(page,note,'diagnostic-note-'+index))
  const before=await note.inputValue();await note.click();assert.ok(await note.evaluate(e=>e===document.activeElement));await page.keyboard.press('Tab')
  assert.equal(await note.inputValue(),before,'Focus navigation preserves the note')
 }
 if(out)await page.screenshot({path:out+'/'+prefix+'-diagnostic-scroll.png'})
 // Return to a middle document position using the real wheel, then reach every tab.
 await rows.nth(17).scrollIntoViewIfNeeded();await page.mouse.move( page.viewportSize().width-30,Math.floor(page.viewportSize().height*.75));await page.mouse.wheel(0,180);await layoutFrame(page)
 for(const name of ['Resumen','Inspección multipunto','Observaciones pendientes','Historial de diagnósticos'])
  observations.push(await exposeControl(page,tab(name),'tab-'+name))
 await tab('Resumen').click()
 const extra=page.locator('.cp04-additional-finding'),summary=extra.locator('summary')
 observations.push(await exposeControl(page,summary,'additional-diagnosis-disclosure'))
 if(!await extra.evaluate(e=>e.open))await summary.click()
 for(const [label,locator] of [['category',extra.getByLabel('Punto a revisar')],['result',extra.getByRole('combobox',{name:/^Resultado/})],['additional-note',extra.locator('textarea')],['save-diagnosis',extra.getByRole('button',{name:'Guardar punto de inspección',exact:true})]])
  observations.push(await exposeControl(page,locator,label))
 // Keyboard access after scrolling, with hit testing on the actually focused button.
 await extra.locator('textarea').click();await page.keyboard.press('Tab');const save=extra.getByRole('button',{name:'Guardar punto de inspección',exact:true})
 assert.ok(await save.evaluate(e=>e===document.activeElement),'Tab reaches the diagnostic save button')
 await layoutFrame(page);observations.push(await hitControl(save,'keyboard-save-diagnosis'))
 if(out)await page.screenshot({path:out+'/'+prefix+'-summary-controls.png'})
 await tab('Inspección multipunto').click()
 return observations
}
module.exports={assertMainScrollCoverage,hitControl,exposeControl,layoutFrame}
