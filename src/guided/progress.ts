/** Progress is a projection of confirmed records, never a stored step number. */
export type Evidence = {order:boolean;inspection:boolean;issued:boolean;approval:boolean;execution:boolean;handover:boolean;archive:boolean}
export function confirmedStage(e:Evidence):number {
 if(!e.order)return 1
 if(!e.inspection)return 2
 if(!e.issued)return 3
 if(!e.approval)return 4
 if(!e.execution)return 5
 if(!e.handover)return 6
 return 7
}
export function canOpen(context:{role:string;workshop:{id:string;status?:string}}){
 // Existing approved pilot scope only. Global build gates never authorize another tenant.
 return context.workshop.status==='active'&&['owner','admin'].includes(context.role)&&context.workshop.id==='c943ad51-6d90-447b-8aa7-68866f69a4bc'
}

/** Future adapter contract only: no public registration or automatic writes.
 * An authorized admin must first reconcile and persist existing directory IDs.
 * A future server-owned review record must verify workshop, actor and mapping;
 * a client-supplied reviewed flag is never sufficient. */
export type ReviewedExternalIntake = Readonly<{
 source:'admin-reviewed-external-request'; requestId:string; reviewId:string;
 workshopId:string; customerId:string; vehicleId:string
}>
