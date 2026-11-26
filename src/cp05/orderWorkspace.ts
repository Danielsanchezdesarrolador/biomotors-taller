import {QuoteFailure, type Bundle, type Quote, type Draft} from './contracts'
import type {Cp05Port} from './repository'

/** Restricts every read/write to a single OT. Disposing this wrapper leaves the
 * shared repository alive, while rejecting late results from this workspace. */
export function orderWorkspace(port:Cp05Port, orderId:string, beforeWrite:()=>Promise<void>) {
  let disposed=false
  const active=()=>{if(disposed)throw new QuoteFailure('denied')}
  const checkQuote=(quote:Quote)=>{active();if(quote.order_id!==orderId)throw new QuoteFailure('denied')}
  const checkBundle=(bundle:Bundle)=>{checkQuote(bundle.quote);if(bundle.source.order.id!==orderId)throw new QuoteFailure('denied');return bundle}
  const load=async(id:string)=>{active();return checkBundle(await port.load(id))}
  const write=async(quote:Quote,action:()=>Promise<Bundle>)=>{
    checkQuote(quote)
    await beforeWrite()
    active()
    return checkBundle(await action())
  }
  return {
    ...port,
    list:async(vehicleId?:string)=>{active();const rows=await port.list(vehicleId);active();return rows.filter(q=>q.order_id===orderId)},
    orders:async()=>{active();const rows=await port.orders();active();return rows.filter(row=>row.order.id===orderId)},
    forOrder:async(id:string)=>{active();if(id!==orderId)throw new QuoteFailure('denied');const row=await port.forOrder(id);active();if(row)checkQuote(row);return row},
    load,
    open:async(id:string,requestId:string)=>{
      active();if(id!==orderId)throw new QuoteFailure('denied')
      await beforeWrite();active();return checkBundle(await port.open(id,requestId))
    },
    save:(q:Quote,draft:Draft,requestId:string)=>write(q,()=>port.save(q,draft,requestId)),
    revise:(q:Quote,reason:string,requestId:string)=>write(q,()=>port.revise(q,reason,requestId)),
    void:(q:Quote,reason:string,requestId:string)=>write(q,()=>port.void(q,reason,requestId)),
    documents:{...port.documents,
      issue:async(...args:Parameters<Cp05Port['documents']['issue']>)=>{checkQuote(args[0]);await beforeWrite();active();const result=await port.documents.issue(...args);active();return result},
      cancel:async(...args:Parameters<Cp05Port['documents']['cancel']>)=>{checkQuote(args[0]);await beforeWrite();active();const result=await port.documents.cancel(...args);active();return result},
      // External delivery is outside the order continuity workspace.
      emailEnabled:false,
      send:async()=>{throw new QuoteFailure('denied')}
    },
    dispose(){disposed=true}
  } satisfies Cp05Port
}
