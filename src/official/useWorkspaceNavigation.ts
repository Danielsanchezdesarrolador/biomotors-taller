import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import type {Screen} from '../layout/AppShell'
import {readPrivateScreen,rememberPrivateScreen} from './privateScreen'
const screens:Screen[]=['inicio','agenda','ordenes','clientes','informes','mitaller','configuracion']
/** At most six mounted views with Agenda enabled. Only a section hint enters history; records stay in React. */
export function useWorkspaceNavigation(privateSession:boolean,scope?:string) {
 const [screen,setScreen]=useState<Screen>(()=>privateSession?readPrivateScreen(undefined,scope):'inicio')
 const [visited,setVisited]=useState<Screen[]>([screen])
 const current=useRef(screen),positions=useRef<Partial<Record<Screen,number>>>({}),instance=useRef(''),initial=useRef(true)
 const root=useRef<HTMLDivElement>(null)
 const fields=useRef<Partial<Record<Screen,{node:HTMLInputElement|HTMLTextAreaElement;start:number|null;end:number|null}>>>({})
 const visit=(next:Screen)=>{current.current=next;setVisited(old=>old.includes(next)?old:[...old,next]);setScreen(next);if(privateSession)rememberPrivateScreen(next,undefined,scope)}
 const capture=()=>{
  positions.current[current.current]=window.scrollY
  const node=document.activeElement
  if((node instanceof HTMLInputElement||node instanceof HTMLTextAreaElement)&&root.current?.contains(node))
   fields.current[current.current]={node,start:node.selectionStart,end:node.selectionEnd}
 }
 const navigate=(next:Screen)=>{
  if(next===current.current)return
  if(privateSession){capture();window.history.pushState({...window.history.state,btWorkspace:{instance:instance.current,screen:next}},'',window.location.href)}
  visit(next)
 }
 useEffect(()=>{
  if(!privateSession)return
  instance.current=crypto.randomUUID()
  const previousRestoration=window.history.scrollRestoration
  window.history.scrollRestoration='manual'
  window.history.replaceState({...window.history.state,btWorkspace:{instance:instance.current,screen:current.current}},'',window.location.href)
  const pop=()=>{const entry=window.history.state?.btWorkspace
   if(entry?.instance===instance.current&&screens.includes(entry.screen)){capture();visit(entry.screen)}}
  const scroll=()=>{positions.current[current.current]=window.scrollY}
  const blur=(event:FocusEvent)=>{
   const node=event.target
   if((node instanceof HTMLInputElement||node instanceof HTMLTextAreaElement)&&root.current?.contains(node))
    fields.current[current.current]={node,start:node.selectionStart,end:node.selectionEnd}
  }
  window.addEventListener('popstate',pop);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('blur',capture)
  const element=root.current;element?.addEventListener('focusout',blur)
  return()=>{window.removeEventListener('popstate',pop);window.removeEventListener('scroll',scroll);window.removeEventListener('blur',capture);element?.removeEventListener('focusout',blur);window.history.scrollRestoration=previousRestoration}
 },[privateSession])
 useLayoutEffect(()=>{
  if(!privateSession)return
  if(initial.current){initial.current=false;return}
  window.scrollTo({top:positions.current[screen]??0,behavior:'instant'})
  const field=fields.current[screen]
  if(field?.node.isConnected&&!field.node.closest('[hidden]')){
   field.node.focus({preventScroll:true})
   if(field.start!==null&&field.end!==null)field.node.setSelectionRange(field.start,field.end)
  }
 },[screen,privateSession])
 return {screen,navigate,root,rendered:privateSession?visited:[screen]}
}
