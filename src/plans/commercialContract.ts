/** Presentation/pricing only. SQL seats/status remain the authorization authority. */
export const commercialPlans = Object.freeze({
 basic: {name:'Básico',monthlyUSD:0,mechanics:0,customers:5,quote:'1 cada 48 horas',multipunto:'No incluido',email:'No incluido'},
 plus: {name:'Plus',monthlyUSD:5,mechanics:2,customers:null,quote:'10 semanales',multipunto:'10 descargas semanales',email:'10 semanales'},
 full: {name:'Full',monthlyUSD:15,mechanics:4,customers:null,quote:'Sin límite comercial',multipunto:'Sin límite comercial',email:'Sin límite comercial'}
} as const)
export type CommercialPlan=keyof typeof commercialPlans
export const extraMechanicMonthlyUSD=2
