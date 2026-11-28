// RI-02: focused regression on real product layout, without historical suites.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp04Page,businessWrites}=require('../tests/harness/cp04BrowserFixture.cjs')
const {selectOrder}=require('../tests/harness/ordersNavigation.cjs')
const {assertMainScrollCoverage,hitControl,exposeControl,layoutFrame}=require('../tests/harness/ordersCoverage.cjs')
const out=process.env.OUTPUT_DIR||'/tmp/bt-orders-coverage',engine=process.env.BT_ORDERS_BROWSER||'chromium'
assert.ok(['chromium','webkit'].includes(engine));fs.mkdirSync(out,{recursive:true})
const viewports={'1440x1000':[1440,1000,'sticky'],'1366x650':[1366,650,'static'],'390x950':[390,950,'static']}
const selected=(process.env.BT_ORDERS_COVERAGE_CASES||'1440x1000,1366x650').split(',')
assert.ok(selected.length>0&&selected.every(name=>viewports[name]),'Unsupported coverage viewport')
;(async()=>{const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']}),results=[]
 try{for(const [width,height,position] of selected.map(name=>viewports[name])){
  const f=await cp04Page(browser,width),{p,state,requests,errors}=f;p.setDefaultTimeout(12000);await p.setViewportSize({width,height});await selectOrder(p,p.locator('.cp04-order').first());await p.getByRole('tab',{name:'Inspección multipunto',exact:true}).click()
  // Confirm synthetic notes at the start and end of the actual34-component form.
  for(const index of [0,33]){const row=p.locator('.cp04-detail .mp-row').nth(index);await row.getByRole('radio',{name:/ · Requiere atención$/}).check();await row.getByRole('textbox').fill('Nota sintética RI-02 del componente '+index);await row.getByText('Guardado',{exact:true}).waitFor()}
  const before=businessWrites(requests).length,confirmed=JSON.stringify(state.findings)
  const observations=await assertMainScrollCoverage(p,{out,prefix:width+'x'+height})
  assert.ok(observations.every(item=>item.header.position===position),'Expected actual header mode for this viewport')
  assert.ok(observations.filter(item=>item.label.startsWith('component-')).every(item=>item.scrollY>0),'Components exercised after real document scroll')
  if(position==='sticky')assert.ok(observations.some(item=>item.header.top===0),'Sticky header actually reached its sticking boundary')
  assert.equal(businessWrites(requests).length,before,'Geometry/focus checks must never save or duplicate a diagnosis');assert.equal(JSON.stringify(state.findings),confirmed)
  // Negative control: a header below the historical650px threshold can still cover
  // a control. The new hit test must reject it; restore all styles immediately.
  const target=p.locator('.cp04-detail .mp-row').nth(17).locator('.mp-cell').first();await exposeControl(p,target,'negative-control-before')
  const dock=p.locator('.cp04-workspace-toolbar'),original=await dock.getAttribute('style')
  let detected=false
  try{await dock.evaluate(e=>{e.style.position='fixed';e.style.top='0';e.style.left='0';e.style.width='100vw';e.style.height='600px';e.style.zIndex='2147483646'});await layoutFrame(p);assert.ok((await dock.boundingBox()).height<650,'Old height-only assertion would pass');try{await hitControl(target,'deliberately-covered-control')}catch(error){assert.match(error.message,/hit testing|overlaps|inside viewport/);detected=true}}finally{await dock.evaluate((e,style)=>{if(style===null)e.removeAttribute('style');else e.setAttribute('style',style)},original)}
  assert.ok(detected,'Coverage assertion must detect a real obstructing header');assert.deepEqual(errors,[])
  results.push({width,height,headerMode:position,status:'PASS',observations,obstructionMutationDetected:true,geometryWrites:0,diagnosesUnchanged:true});fs.writeFileSync(out+'/results.json',JSON.stringify({engine,status:'RUNNING',results},null,2));console.log('ORDERS_COVERAGE_PASS',width,height,observations.length);await p.close()
 }fs.writeFileSync(out+'/results.json',JSON.stringify({engine,status:'PASS',results,scope:'Synthetic real React/SDK layout, not hosted authorization or physical devices'},null,2))}finally{await browser.close()}})().catch(e=>{fs.writeFileSync(out+'/failure.txt',e.stack);console.error(e);process.exitCode=1})
