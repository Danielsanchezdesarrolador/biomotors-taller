import subprocess,json,uuid,os
lab=os.environ.get('BT_MPF_LAB','bt-mpf-development')
assert lab.startswith('bt-mpf-')
def q(s,role='postgres',u='00000000-0000-4000-8000-000000000002',aal='aal1'):
 claims=json.dumps({'session_id':u,'aal':aal,'exp':2000000000})
 cmd=f"SET ROLE {role};SELECT set_config('request.jwt.claim.sub','{u}',false);SELECT set_config('request.jwt.claims','{claims}',false);"+s
 r=subprocess.run(['docker','exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','bytetorque'],input=cmd,text=True,capture_output=True)
 if r.returncode:raise Exception(r.stderr)
 x=r.stdout.strip().split('\n')[-1]
 try:return json.loads(x)
 except:return x
id=lambda n:f'00000000-0000-4000-8000-{n:012d}'
for n in range(1,6):q(f"INSERT INTO auth.users(id,email) VALUES('{id(n)}','mp{n}@invalid.test');INSERT INTO auth.sessions(id,user_id) VALUES('{id(n)}','{id(n)}');")
q(f"INSERT INTO bt_platform_private.creators(user_id) VALUES('{id(1)}');")
q(f"SELECT public.bt_creator04_manage_account('{id(2)}','full','lifetime',null,'Synthetic MP lab','{uuid.uuid4()}');",'authenticated',id(1),'aal2')
w=q(f"SELECT public.bt_plan04_create_workshop('Synthetic MP laboratory','{uuid.uuid4()}');",'authenticated')['workshopId']
q(f"SELECT bt_platform_private.configure_pilot('{w}',true,'Synthetic isolated MP laboratory');")
c=q(f"INSERT INTO public.customers(workshop_id,full_name) VALUES('{w}','Synthetic MP customer') RETURNING id;",'authenticated')
v=q(f"INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model) VALUES('{w}','{c}','QA1234','Synthetic','Multipunto') RETURNING id;",'authenticated')
o=q(f"INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint) VALUES('{w}','{v}','Synthetic multipunto service') RETURNING id;",'authenticated')
q(f"UPDATE public.work_orders SET status='inspecting' WHERE workshop_id='{w}' AND id='{o}';INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution) VALUES('{w}','{o}','{v}','Multipunto · Luces bajas','ok','Synthetic inspection confirmed','not_applicable');",'authenticated')
json.dump({'wid':w,'oid':o,'vid':v,'cid':c,'owner':id(2),'creator':id(1)},open('/tmp/bt-mpf-fixture.json','w'))
print(w,o)
