import {DocumentOperationExpired,restartDocumentOperation} from './operation'
export function DocumentOperationNotice({error,onRestart}:{error:DocumentOperationExpired|null;onRestart:()=>void}){
 if(!error)return null
 return <div role="status"><p>{error.message}</p><button type="button" onClick={()=>{if(window.confirm('¿Iniciar una nueva operación documental? El servidor volverá a comprobar tu plan y puede consumir un cupo disponible.')){restartDocumentOperation(error);onRestart()}}}>Iniciar nueva operación documental</button></div>
}
