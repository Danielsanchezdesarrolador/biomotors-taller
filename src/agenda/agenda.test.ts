import {describe,it,expect} from 'vitest'
import {dayInZone,shiftDay,timeInZone,weekStart,money,agendaMessage,AgendaFailure} from './contracts'
import {agendaRepository} from './repository'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
const wid='00000000-0000-4000-8000-000000000001',uid='00000000-0000-4000-8000-000000000002',oid='00000000-0000-4000-8000-000000000003'
const context:Context={userId:uid,workshop:{id:wid,name:'Ficticio',status:'active'},role:'owner'}
describe('Agenda candidate transport and Chilean calendar',()=>{
 it('uses workshop dates at midnight independent of browser zone',()=>{expect(dayInZone('2026-11-26T01:00:00Z','America/Santiago')).toBe('2026-11-25');expect(timeInZone('2026-11-26T01:00:00Z','America/Santiago')).toBe('22:00');expect(weekStart('2026-11-29')).toBe('2026-11-23');expect(shiftDay('2026-12-31',1)).toBe('2027-01-01');expect(shiftDay('2028-02-28',1)).toBe('2028-02-29')})
 it('uses CLP and sanitized errors without backend content',()=>{expect(money(83300)).toContain('83.300');expect(agendaMessage(new Error('SECRET customers'))).not.toContain('SECRET');expect(agendaMessage(new AgendaFailure('conflict'))).toContain('Actualiza')})
 it('retains the command id after uncertain responses and binds it to the payload',async()=>{
  const calls:Record<string,unknown>[]=[];let fail=true
  const client={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'2026-11-25'}}})},rpc:async(_name:string,args:Record<string,unknown>)=>{calls.push(args);return fail?{error:{code:'08006'}}:{data:{order_id:oid},error:null}}} as unknown as SupabaseClient
  const repo=agendaRepository(client,context)
  await expect(repo.command('receive',{id:oid,odometer:1})).rejects.toMatchObject({kind:'unavailable'})
  fail=false;await repo.command('receive',{odometer:1,id:oid});await repo.command('receive',{id:oid,odometer:2})
  expect(calls[0].p_request_id).toBe(calls[1].p_request_id);expect(calls[2].p_request_id).not.toBe(calls[1].p_request_id)
  repo.dispose();await expect(repo.command('prepare',{})).rejects.toMatchObject({kind:'denied'})
 })
 it('rejects identity change and response from another tenant',async()=>{
  let userId=uid
  const client={auth:{getUser:async()=>({data:{user:{id:userId,email_confirmed_at:'2026-11-25'}}})},rpc:async()=>({data:{entries:[{workshop_id:oid}],requests:[],upcoming:[]},error:null})} as unknown as SupabaseClient
  const repo=agendaRepository(client,context);await expect(repo.catalog('2026-11-23','2026-11-29')).rejects.toMatchObject({kind:'denied'});userId=oid;await expect(repo.command('prepare',{})).rejects.toMatchObject({kind:'denied'})
 })
})
