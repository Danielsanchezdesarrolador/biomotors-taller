import type {Quote} from './contracts'
export const quoteStateLabel:Record<Quote['status'],string>={draft:'Borrador',issued:'Emitida',voided:'Anulada'}
/** The selected, server-confirmed bundle is the same authority for header and list.
 * Independent list refreshes must not visually roll it back to an older revision. */
export function workspaceQuotes(list:readonly Quote[],selected:Quote|null):Quote[]{
 if(!selected)return [...list]
 return [selected,...list.filter(q=>q.id!==selected.id)]
}
