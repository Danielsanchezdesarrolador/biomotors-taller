import type {AuthController} from '../auth/controller'
import {workshopRpc} from './client'
export function validLogoHeader(type:string,size:number,bytes:Uint8Array) {
 if(size<8||size>2097152)return false
 return type==='image/png'? [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)
  :type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255
}
export async function uploadWorkshopLogo(controller:AuthController,file:File) {
 const context=controller.getSnapshot().context,client=await controller.directoryClient()
 if(!context||!client||!['owner','admin'].includes(context.role))throw Error('MANAGER_REQUIRED')
 const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer())
 if(!validLogoHeader(file.type,file.size,bytes))throw Error('PNG_JPEG_MAX_2MB')
 const image=await createImageBitmap(file)
 let blob:Blob
 try{if(image.width>4096||image.height>4096||image.width<1||image.height<1)throw Error('IMAGE_DIMENSIONS')
  const canvas=document.createElement('canvas'),scale=Math.min(1,1024/Math.max(image.width,image.height))
  canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale))
  const painter=canvas.getContext('2d');if(!painter)throw Error('IMAGE_DECODER')
  painter.drawImage(image,0,0,canvas.width,canvas.height)
  blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('IMAGE_DECODER')),'image/png'))
 }finally{image.close()}
 if(blob.size>2097152||controller.getSnapshot().context!==context)throw Error('SESSION_CHANGED')
 const path=context.workshop.id+'/'+crypto.randomUUID()+'.png'
 const result=await client.storage.from('bt-workshop-branding').upload(path,blob,{contentType:'image/png',upsert:false})
 if(result.error||controller.getSnapshot().context!==context)throw Error('LOGO_NOT_SAVED')
 await workshopRpc(controller,'bt_plan04_set_logo',{p_workshop_id:context.workshop.id,p_path:path})
}
