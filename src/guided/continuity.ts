import type {Bundle, QuoteItem, Revision} from '../cp05/contracts'
import {currentFindings, type Finding, type FindingScope} from '../ordenes/cp04Contracts'
import {provisionalFinding} from '../ordenes/cp04Autosave'

export function inspectionEvidence(rows:readonly Finding[], scope:FindingScope) {
  const current=currentFindings(rows,scope)
  return {
    recorded:current.length>0 && !current.some(provisionalFinding),
    reviewed:current.filter(row=>row.result==='ok'||row.result==='attention').length,
    notChecked:current.filter(row=>row.result==='not_checked').length,
    resolved:current.filter(row=>row.result==='attention'&&row.resolution==='resolved').length
  }
}
function pricedItems(items:readonly QuoteItem[]) {
  return [...items].sort((a,b)=>a.position-b.position).map(item=>({
    id:item.id,position:item.position,type:item.type,description:item.description,
    quantity100:item.quantity100,unit_price:item.unit_price,line_net:item.line_net
  }))
}
export function budgetMatches(bundle:Bundle, revision:Revision):boolean {
  const quote=bundle.quote, issued=revision.payload
  return quote.status==='issued' && !quote.issue_pending &&
    revision.workshop_id===quote.workshop_id && revision.quote_id===quote.id &&
    revision.revision===quote.issued_revision && issued.order.id===quote.order_id &&
    issued.vehicle.id===quote.vehicle_id && issued.customer.id===quote.customer_id &&
    quote.terms===issued.quote.terms && quote.comments===issued.quote.comments &&
    quote.valid_days===issued.quote.valid_days &&
    JSON.stringify(pricedItems(bundle.items))===JSON.stringify(pricedItems(issued.items))
}
/** A session-only acknowledgement of explicit operator review. Never a backend approval.
 * Resolution/timestamps cannot erase a changed diagnosis or note from this evidence.
 * A note change invalidates the acknowledgement, not the customer's budget by itself.
 */
export function scopeEvidence(bundle:Bundle, revision:Revision, rows:readonly Finding[], scope:FindingScope):string {
  return JSON.stringify({
    workshop:scope.workshopId,order:scope.orderId,vehicle:scope.vehicleId,
    quote:bundle.quote.id,version:bundle.quote.version,revision:revision.id,
    issuedHash:revision.payload_sha256,items:pricedItems(bundle.items),
    terms:bundle.quote.terms,comments:bundle.quote.comments,
    findings:currentFindings(rows,scope).map(row=>({
      id:row.id,category:row.category,result:row.result,note:row.note
    })).sort((a,b)=>a.id.localeCompare(b.id))
  })
}
