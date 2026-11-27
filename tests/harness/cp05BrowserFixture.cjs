// CP05 browser fixture: all hosted API/Edge requests are synthetic and intercepted.
const assert=require('node:assert/strict'),{createHash}=require('node:crypto')
const {PDFDocument}=require('pdf-lib')
const {cp04Page,uuid,tenant,userId,operationsStatusPath}=require('./cp04BrowserFixture.cjs')
async function cp05Page(browser,width){
 const {p,state,requests,errors}=await cp04Page(browser,width,{documentsEnabled:process.env.CP05_QA_DOCUMENTS==='true'})
      const quotes = [],
        items = [],
        commands = new Map(), revisions=[]
      let failQuoteRead=false,failQuoteList=false
      const archived=new Map(),issueCommands=new Map()
      let serial = 900
      const filter = (rows, url) =>
        rows.filter((row) =>
          [...url.searchParams].every(
            ([k, v]) => !v.startsWith('eq.') || String(row[k]) === v.slice(3)
          )
        )
      await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/rest/v1/**', async (route) => {
        const req = route.request(),
          url = new URL(req.url()),
          table = url.pathname.split('/').pop()
        const reply = (data) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(
              req.headers().accept?.includes('vnd.pgrst.object')
                ? Array.isArray(data)
                  ? data[0] || null
                  : data
                : data
            )
          })
        // The parent fixture validates this one read RPC, including scope and actor.
        if (url.pathname === operationsStatusPath) return route.fallback()
        if (url.pathname.includes('/rpc/bt_cp05_')) {
          requests.push({ path: url.pathname, method: req.method() })
          const d = req.postDataJSON()
          assert.equal(d.p_workshop_id, tenant)
          if (commands.has(d.p_request_id)) return reply(commands.get(d.p_request_id))
          let q
          if (table === 'bt_cp05_open_quote') {
            q = quotes.find((q) => q.order_id === d.p_order_id)
            if (!q) {
              const order = state.orders.find((o) => o.id === d.p_order_id)
              q = {
                workshop_id: tenant,
                id: uuid(++serial),
                order_id: order.id,
                vehicle_id: order.vehicle_id,
                customer_id: uuid(50),
                number: quotes.length + 1,
                version: 1,
                status: 'draft',
                price_basis: 'net',
                valid_days: 10,
                terms: '',
                comments: '',
                issued_revision: 0,
                issue_pending: false,
                created_at: '2026-11-16T12:00:00Z',
                updated_at: '2026-11-16T12:00:00Z'
              }
              quotes.push(q)
            }
          } else if (table === 'bt_cp05_save_quote') {
            q = quotes.find((q) => q.id === d.p_quote_id)
            assert.equal(d.p_expected_version, q.version)
            Object.assign(q, { ...d.p_data, items: undefined, version: q.version + 1 })
            if(width===390)failQuoteRead=true
            if(width===1366)failQuoteList=true
            items.splice(
              0,
              items.length,
              ...d.p_data.items.map((i, position) => ({
                ...i,
                position,
                workshop_id: tenant,
                quote_id: q.id,
                line_net: Math.floor((i.quantity100 * i.unit_price + 50) / 100)
              }))
            )
          } else if(table==='bt_cp05_revise_quote'){
            q=quotes.find(q=>q.id===d.p_quote_id)
            assert.equal(q.version,d.p_expected_version);assert.ok(d.p_reason.trim().length>=3)
            q.status='draft';q.version++;q.issue_pending=false
          } else throw Error('Unexpected RPC ' + table)
          const response = { id: q.id, version: q.version }
          commands.set(d.p_request_id, response)
          return reply(response)
        }
        if (
          [
            'quotes',
            'quote_items',
            'quote_revisions',
            'quote_events',
            'quote_delivery_events',
            'customers'
          ].includes(table)
        ) {
          if(table==='quotes'&&((failQuoteRead&&url.searchParams.has('id'))||(failQuoteList&&!url.searchParams.has('id')&&!url.searchParams.has('order_id')))){
            failQuoteRead=false;failQuoteList=false
            return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'SYNTHETIC_READ_ERROR'})})
          }
          assert.equal(req.method(), 'GET')
          requests.push({ path: url.pathname, method: 'GET' })
          assert.equal(url.searchParams.get('workshop_id'), 'eq.' + tenant)
          return reply(
            filter(
              table === 'quotes'
                ? quotes
                : table === 'quote_items'
                  ? items
                  : table === 'quote_revisions' ? revisions
                  : table === 'customers'
                    ? [
                        {
                          id: uuid(50),
                          workshop_id: tenant,
                          full_name: 'Cliente sintético QA',
                          email: 'synthetic@invalid.test',
                          mobile_e164: null
                        }
                      ]
                    : [],
              url
            )
          )
        }
        return route.fallback()
      })

 async function makeRevision(){
   const q=quotes[0],revision=q.issued_revision+1
   const subtotal=items.reduce((sum,i)=>sum+i.line_net,0),tax=Math.floor((subtotal*19+50)/100)
   const snapshot={workshop:{id:tenant,name:'Taller QA sintético'},customer:{id:uuid(50),full_name:'Cliente histórico congelado',email:'qa@invalid.test',mobile_e164:null},
     vehicle:state.vehicles.find(v=>v.id===q.vehicle_id),order:state.orders.find(o=>o.id===q.order_id),
     quote:{...structuredClone(q),status:'issued',revision},items:structuredClone(items),totals:{subtotal,tax,total:subtotal+tax},document_date:'2026-11-23T12:00:00Z',notice:'Cotización no tributaria. No acredita ejecución ni aceptación del cliente.'}
   // Simulate backend-archived bytes independently of the browser PDF renderer.
   // CI serves a built app via Vite preview, which cannot resolve dev-only /@fs/ imports.
   // Actual server draft rendering and watermarks are covered by commercial unit tests.
   const pdf=await PDFDocument.create()
   pdf.setTitle('ByteTorque CP05 - synthetic archival fixture')
   pdf.setAuthor('ByteTorque QA harness')
   pdf.addPage([595.28,841.89]).drawText('SYNTHETIC QA - revision '+revision,{x:40,y:790,size:12})
   const bytes=Buffer.from(await pdf.save({useObjectStreams:false}))
   assert.equal(bytes.subarray(0,5).toString(),'%PDF-')
   const r={workshop_id:tenant,id:uuid(980+revision),quote_id:q.id,revision,payload:snapshot,payload_sha256:'b'.repeat(64),
     pdf_sha256:createHash('sha256').update(bytes).digest('hex'),pdf_size:bytes.length,
     pdf_object_path:tenant+'/quotes/'+q.id+'/r'+revision+'/'+'b'.repeat(64)+'.pdf',issued_at:'2026-11-23T12:00:00Z',issued_by:userId}
   archived.set(r.id,bytes);revisions.unshift(r);q.status='issued';q.issued_revision=revision;q.version++
   return r
 }
 await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/functions/v1/bt-commercial-documents',async route=>{
   const req=route.request(),body=req.postDataJSON();assert.equal(req.method(),'POST');assert.equal(body.action,'draft');assert.equal(body.workshopId,tenant)
   assert.ok(quotes.some(q=>q.id===body.quoteId));assert.ok(Array.isArray(body.draft.items));assert.match(req.headers().authorization||'',/^Bearer /)
   requests.push({path:'/functions/v1/bt-commercial-documents',method:'POST',action:'draft'})
   const pdf=await PDFDocument.create(),page=pdf.addPage();for(const [i,text] of ['BORRADOR','NO VALIDO COMO COTIZACION','DOCUMENTO NO EMITIDO'].entries())page.drawText(text,{x:40,y:500-i*40,size:20})
   return route.fulfill({status:200,contentType:'application/pdf',body:Buffer.from(await pdf.save())})
 })
 await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/functions/v1/bt-cp05-documents',async route=>{
   const body=route.request().postDataJSON();requests.push({path:'/functions/v1/bt-cp05-documents',method:'POST',action:body.action})
   assert.equal(body.workshopId,tenant)
   if(body.action==='issue'){
     assert.equal(state.role,'owner');assert.equal(body.version,quotes[0].version)
     const r=issueCommands.get(body.requestId)||await makeRevision();issueCommands.set(body.requestId,r)
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({revision:r})})
   }
   if(body.action==='download'){
     assert.ok(archived.has(body.revisionId))
     return route.fulfill({status:200,contentType:'application/pdf',body:archived.get(body.revisionId)})
   }
   throw Error('Unapproved document action: '+body.action)
 })
 return {p,state,requests,errors,quotes,items,revisions,commands,archived,makeRevision}
}
module.exports={cp05Page}
