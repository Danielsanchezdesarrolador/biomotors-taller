export function parseKilometres(raw:string):number|null {
 const value=raw.trim()
 if(!value)return null
 if(!/^(?:\d+|[1-9]\d{0,2}(?:\.\d{3})+)$/.test(value))throw Error('Kilometraje inválido: usa 120000 o 120.000, sin decimales (máximo 3.000.000).')
 const number=Number(value.replaceAll('.',''))
 if(!Number.isSafeInteger(number)||number<0||number>3000000)throw Error('Kilometraje fuera de rango: de 0 a 3.000.000 km.')
 return number
}
