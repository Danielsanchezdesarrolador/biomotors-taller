// Test infrastructure only. No credentials, external network or hosted database.
// The caller passes the name of the newly-created --network none lab container.
import http from 'node:http'
import {spawn} from 'node:child_process'
const lab=process.argv[2]
if(!/^bt-records-(?:verify-[0-9]+|local)$/.test(lab||''))throw new Error('Disposable records lab required')
const calls={
 bt_records_list:['p_workshop_id','p_resource','p_archived','p_query','p_after_id'],
 bt_records_inspect:['p_workshop_id','p_resource','p_id'],
 bt_records_execute:['p_workshop_id','p_resource','p_id','p_action','p_token','p_request_id','p_reason'],
 bt_records_audit:['p_workshop_id','p_resource','p_id']
}
const literal=value=>value===null?'NULL':typeof value==='boolean'?String(value):"'"+String(value).replaceAll("'","''")+"'"
const server=http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:47114')
 res.setHeader('Access-Control-Allow-Headers','Content-Type')
 res.setHeader('Content-Type','application/json')
 if(req.method==='OPTIONS'){res.end();return}
 if(req.method!=='POST'||req.url!=='/rpc'){res.writeHead(404).end();return}
 let body=''
 for await(const chunk of req){body+=chunk;if(body.length>8192){res.writeHead(413).end();return}}
 try{
  const {name,args}=JSON.parse(body), parameters=calls[name]
  if(!parameters || !args || parameters.some(key=>!(key in args)))throw new Error('Invalid local RPC')
  const sql=`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false); SELECT public.${name}(${parameters.map(key=>literal(args[key])).join(',')});`
  const child=spawn('docker',['exec','-i',lab,'psql','-X','-q','-A','-t','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque'])
  let output='',errors='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>errors+=chunk)
  child.stdin.end(sql)
  child.on('close',code=>{
   if(code){res.end(JSON.stringify({data:null,error:{code:/ERROR:\s+([0-9A-Z]{5}):/.exec(errors)?.[1]??'XX000'}}));return}
   try{res.end(JSON.stringify({data:JSON.parse(output.trim().split('\n').at(-1)),error:null}))}
   catch{res.end(JSON.stringify({data:null,error:{code:'XX000'}}))}
  })
 }catch{res.writeHead(400).end(JSON.stringify({data:null,error:{code:'22023'}}))}
})
server.listen(47115,'127.0.0.1',()=>process.stdout.write('RECORDS_LOOPBACK_BRIDGE_READY\n'))
