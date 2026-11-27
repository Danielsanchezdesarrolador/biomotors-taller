/** Real installed SQL + incremental seat candidate, isolated PostgreSQL 17 only. */
import {spawn,spawnSync} from 'node:child_process'
import {readFile,writeFile} from 'node:fs/promises'
import {randomUUID,createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const lab=process.env.BT_COMMERCIAL_PLANS_LAB||'',out=process.env.BT_COMMERCIAL_PLANS_EVIDENCE||'/tmp/bt-plans-evidence';assert.match(lab,/^bt-commercial-plans-\d+$/)
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),owner=id(2),creator=id(1),results:{name:string;status:string}[]=[]
const lit=(v:unknown)=>v==null?'NULL':"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'"
const args=['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U','postgres','-d','bytetorque']
const input=(q:string,role='authenticated',u=owner,aal='aal1')=>`SET ROLE ${role};SELECT set_config('request.jwt.claim.sub',${lit(u)},false);SELECT set_config('request.jwt.claims',${lit({session_id:u,aal})},false);\n${q}`
function sql(q:string,role='postgres',u=owner,aal='aal1'):any {const r=spawnSync('docker',args,{input:input(q,role,u,aal),encoding:'utf8'});if(r.status)throw Error(r.stderr);const row=r.stdout.trim().split('\n').at(-1)||'null';try{return JSON.parse(row)}catch{return row}}
const invoke=(f:string,a:unknown[],u=owner,aal='aal1')=>sql(`SELECT public.${f}(${a.map(lit).join(',')});`,'authenticated',u,aal)
const pass=(name:string)=>{results.push({name,status:'PASS'});console.log('PASS',name)}
const reject=(f:()=>unknown,match:RegExp)=>assert.throws(f,match)
for(let n=1;n<=20;n++)sql(`INSERT INTO auth.users(id,email) VALUES('${id(n)}','plans-${n}@invalid.test');INSERT INTO auth.sessions(id,user_id) VALUES('${id(n)}','${id(n)}');`)
sql(`INSERT INTO bt_platform_private.creators(user_id) VALUES('${creator}');`)
const grant=(plan:string)=>invoke('bt_creator04_manage_account',[owner,plan,'lifetime',null,'Synthetic plan B test',randomUUID()],creator,'aal2')
grant('full');const wid=invoke('bt_plan04_create_workshop',['Synthetic plan B workshop',randomUUID()]).workshopId
const team=()=>invoke('bt_plan04_team',[wid]),manage=(action:string,email:string|null=null,target:string|null=null)=>invoke('bt_plan04_manage_mechanic',[wid,action,email,target,randomUUID()])
const plan=(p:string)=>sql(`UPDATE bt_platform_private.subscriptions SET plan='${p}',state='active',is_lifetime=true,expires_at=NULL WHERE workshop_id='${wid}';`)
const m=(n:number,status='active')=>sql(`INSERT INTO public.workshop_memberships(workshop_id,user_id,role,status) VALUES('${wid}','${id(n)}','mechanic','${status}') RETURNING id;`)
if(process.env.BT_COMMERCIAL_PLANS_FOCUS==='isolation'){
 invoke('bt_creator04_manage_account',[id(12),'full','lifetime',null,'Synthetic other workshop',randomUUID()],creator,'aal2')
 const other=invoke('bt_plan04_create_workshop',['Synthetic other workshop',randomUUID()],id(12)).workshopId
 assert.notEqual(other,wid);assert.equal(invoke('bt_plan04_team',[other],id(12)).capacity,4)
 reject(()=>invoke('bt_plan04_team',[wid],id(12)),/Workshop manager required/)
 reject(()=>invoke('bt_plan04_manage_mechanic',[wid,'invite','plans-13@invalid.test',null,randomUUID()],id(12)),/Workshop manager required/)
 reject(()=>invoke('bt_plan04_team',[other]),/Workshop manager required/)
 assert.equal(team().active,0);assert.equal(team().pending,0)
 pass('Two independently authorized workshops cannot read or reserve each other team seats')
 await writeFile(out+'/plans-isolation-results.json',JSON.stringify({status:'PASS',count:1,cases:results,scope:'Two real SQL-created synthetic workshops, active Full licenses, manager isolation in both directions'},null,2)+'\n');process.exit(0)
}
for(const [p,n] of [['basic',0],['plus',2],['full',4]] as const){plan(p);assert.equal(team().capacity,n);assert.equal(team().active,0);pass(p+' authoritative included seats '+n+'; owner excluded')}
plan('basic');reject(()=>manage('invite','plans-3@invalid.test'),/No confirmed seat available/);pass('Basic rejects new invitations on server')
plan('plus');const first=manage('invite','plans-3@invalid.test');assert.equal(team().pending,1);invoke('bt_plan04_accept_mechanic',[first.token],id(3));assert.equal(team().active,1);assert.equal(team().pending,0);pass('Confirmed acceptance converts a pending reserved seat without double counting')
const pending=manage('invite','plans-4@invalid.test');assert.equal(team().pending,1);reject(()=>manage('invite','plans-5@invalid.test'),/No confirmed seat available/);pass('Plus two seats includes pending invitations and rejects third')
plan('basic');const before=team();assert.equal(before.active,1);assert.equal(before.pending,1);assert.equal(before.overCapacity,true);reject(()=>invoke('bt_plan04_accept_mechanic',[pending.token],id(4)),/Seat no longer available/);reject(()=>manage('rotate',null,pending.id),/No confirmed seat available/);pass('Downgrade preserves members and old invitations but blocks acceptance/rotation while over capacity')
plan('plus');invoke('bt_plan04_accept_mechanic',[pending.token],id(4));assert.equal(team().active,2);pass('Restoring capacity allows original pending invitation, identity preserved')
const disabled=m(5,'disabled');reject(()=>manage('reactivate',null,disabled),/No confirmed seat available/);plan('full');manage('reactivate',null,disabled);assert.equal(team().active,3);pass('Reactivation enforces current plan capacity, preserves identity and emits audit')
assert.equal(sql(`SELECT count(*) FROM bt_platform_private.team_events WHERE workshop_id='${wid}' AND payload->>0='reactivate';`),1)
m(6);assert.equal(team().active,4);reject(()=>manage('invite','plans-7@invalid.test'),/No confirmed seat available/);pass('Full four blocks a fifth seat')
plan('plus');assert.equal(team().active,4);assert.equal(team().overCapacity,true);const member=team().members.find((v:{status:string})=>v.status==='active');manage('disable',null,member.id);assert.equal(team().active,3);assert.equal(team().members.length,4);pass('Over-limit team loses no data; voluntary disable still authorized')
reject(()=>invoke('bt_plan04_team',[wid],id(12)),/Workshop manager required/);reject(()=>invoke('bt_plan04_manage_mechanic',[wid,'invite','plans-9@invalid.test',null,randomUUID()],id(3)),/Workshop manager required/);pass('Other workshop/user and mechanic cannot manage this team')
reject(()=>sql(`SELECT bt_platform_private.seats('${wid}');`,'authenticated'),/permission denied/);reject(()=>sql(`UPDATE bt_platform_private.subscriptions SET plan='full' WHERE workshop_id='${wid}';`,'authenticated'),/permission denied/);pass('Client cannot set subscription or invoke private seat authority')
// Existing extras/expiry semantics remain; no purchase endpoint is activated.
plan('plus');sql(`INSERT INTO bt_platform_private.mechanic_extras VALUES('${wid}',1,now()+interval '1 hour','synthetic-existing-extra');`);assert.equal(team().capacity,3);plan('basic');assert.equal(team().capacity,0);plan('full');sql(`UPDATE bt_platform_private.mechanic_extras SET expires_at=now()-interval '1 second';`);assert.equal(team().capacity,4);sql(`UPDATE bt_platform_private.subscriptions SET is_lifetime=false,expires_at=now()-interval '1 second' WHERE workshop_id='${wid}';`);assert.equal(team().capacity,0);pass('Extras require paid valid plan, expired grants yield zero, no purchase activation')
plan('full');sql(`UPDATE bt_platform_private.subscriptions SET is_lifetime=true WHERE workshop_id='${wid}';`)
// True separate PostgreSQL transactions race for the final remaining seat (3 active).
function concurrent(email:string){return new Promise<{code:number|null;err:string}>(resolve=>{const p=spawn('docker',args);let err='';p.stderr.on('data',b=>err+=b);p.stdin.end(input(`SELECT public.bt_plan04_manage_mechanic('${wid}','invite',${lit(email)},NULL,'${randomUUID()}');`));p.stdout.resume();p.on('close',code=>resolve({code,err}))})}
const race=await Promise.all([concurrent('plans-8@invalid.test'),concurrent('plans-9@invalid.test')]);assert.equal(race.filter(r=>r.code===0).length,1);assert.match(race.find(r=>r.code!==0)!.err,/No confirmed seat available/);assert.equal(team().active+team().pending,4);pass('Two separate concurrent transactions race for last Full seat: exactly one succeeds')
// Existing commercial authorization and consumption contract after the seats-only SQL.
const commercial=()=>invoke('bt_commercial_status',[wid]);assert.equal(commercial().inspectionEnabled,true);plan('basic');assert.equal(commercial().inspectionEnabled,false);assert.equal(commercial().usage.multipunto.limit,0);plan('plus');assert.equal(commercial().usage.multipunto.limit,10);assert.equal(commercial().inspectionEnabled,true);pass('Downgrade/recovery of document capabilities unchanged by seats migration')
const allBefore=sql(`SELECT json_build_object('members',(SELECT count(*) FROM public.workshop_memberships),'invites',(SELECT count(*) FROM bt_platform_private.mechanic_invites));`)
sql(await readFile('docs/sql/BT_COMMERCIAL_PLANS_01_ROLLBACK.sql','utf8'));assert.equal(team().capacity,4);sql(await readFile('docs/sql/BT_COMMERCIAL_PLANS_01_CANDIDATE.sql','utf8'));assert.equal(team().capacity,2);assert.deepEqual(sql(`SELECT json_build_object('members',(SELECT count(*) FROM public.workshop_memberships),'invites',(SELECT count(*) FROM bt_platform_private.mechanic_invites));`),allBefore);pass('Guarded rollback and reapplication preserve all members/invitations and restore exact authority')
const hashes:Record<string,string>={};for(const f of ['docs/sql/BT_COMMERCIAL_PLANS_01_CANDIDATE.sql','docs/sql/BT_COMMERCIAL_PLANS_01_ROLLBACK.sql'])hashes[f]=createHash('sha256').update(await readFile(f)).digest('hex')
await writeFile(out+'/plans-sql-results.json',JSON.stringify({status:'PASS',count:results.length,cases:results,hashes,scope:'Real SQL with existing full schema fixtures; isolated PostgreSQL17; true last-seat concurrent transactions; no hosted JWT or production tests'},null,2)+'\n');console.log('PLANS_SQL_PASS',results.length)
