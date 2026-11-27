/** STORE ZIP codec, adapted from closingZip's audited layout; only immutable authorized originals. */
import {ArchiveFailure,archiveId,validateDocumentSet,verifyArchivedBytes,type ArchiveDocumentSet} from './contracts'
export const MAX_ARCHIVE_BYTES=12_000_000
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true})
const labels=['COTIZACION','INFORME_EJECUCION','CONSTANCIA_ENTREGA']
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);return n>>>0})
function crc32(bytes:Uint8Array){let crc=0xffffffff;for(const b of bytes)crc=(crc>>>8)^crcTable[(crc^b)&255];return (crc^0xffffffff)>>>0}
export function archiveZipManifest(set:ArchiveDocumentSet){
 if(!set)throw new ArchiveFailure('invalid');archiveId(set.workshopId);archiveId(set.revisionId)
 validateDocumentSet(set,set.workshopId,set.revisionId)
 if(!set.complete||set.documents.length!==3)throw new ArchiveFailure('missing')
 if(new Set(set.documents.map(d=>d.sha256)).size!==3||new Set(set.documents.map(d=>d.path)).size!==3)throw new ArchiveFailure('integrity')
 if(set.documents.reduce((n,d)=>n+d.byteLength,0)>MAX_ARCHIVE_BYTES)throw new ArchiveFailure('too_large')
 return set.documents.map((doc,i)=>({doc,name:labels[i]+'_R'+set.revision+'_'+set.revisionId+'.pdf'}))
}
export function archiveZipName(set:ArchiveDocumentSet){archiveZipManifest(set);return 'EXPEDIENTE_R'+set.revision+'_'+set.revisionId+'.zip'}
export async function originalArchiveZip(set:ArchiveDocumentSet,files:readonly Uint8Array[]){
 const manifest=archiveZipManifest(set);if(files.length!==3)throw new ArchiveFailure('integrity')
 const entries=[]
 for(let i=0;i<3;i++){await verifyArchivedBytes(files[i],manifest[i].doc);entries.push({name:encoder.encode(manifest[i].name),data:files[i],crc:crc32(files[i])})}
 const locals=entries.reduce((n,e)=>n+30+e.name.length+e.data.length,0),central=entries.reduce((n,e)=>n+46+e.name.length,0)
 const bytes=new Uint8Array(locals+central+22),v=new DataView(bytes.buffer),u16=(p:number,n:number)=>v.setUint16(p,n,true),u32=(p:number,n:number)=>v.setUint32(p,n,true),offsets:number[]=[];let p=0
 for(const e of entries){offsets.push(p);u32(p,0x04034b50);u16(p+4,20);u16(p+6,0x0800);u16(p+8,0);u16(p+12,0x21);u32(p+14,e.crc);u32(p+18,e.data.length);u32(p+22,e.data.length);u16(p+26,e.name.length);p+=30;bytes.set(e.name,p);p+=e.name.length;bytes.set(e.data,p);p+=e.data.length}
 const start=p
 entries.forEach((e,i)=>{u32(p,0x02014b50);u16(p+4,20);u16(p+6,20);u16(p+8,0x0800);u16(p+14,0x21);u32(p+16,e.crc);u32(p+20,e.data.length);u32(p+24,e.data.length);u16(p+28,e.name.length);u32(p+42,offsets[i]);p+=46;bytes.set(e.name,p);p+=e.name.length})
 u32(p,0x06054b50);u16(p+8,3);u16(p+10,3);u32(p+12,p-start);u32(p+16,start)
 return {bytes,fileName:archiveZipName(set)}
}
/** Strict parser for our deterministic STORE envelope, then per-original SHA256. No archive extraction to disk. */
export async function verifyOriginalArchiveZip(bytes:Uint8Array,set:ArchiveDocumentSet){
 const manifest=archiveZipManifest(set);if(bytes.length>MAX_ARCHIVE_BYTES+2048||bytes.length<22)throw new ArchiveFailure('integrity')
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),u16=(p:number)=>v.getUint16(p,true),u32=(p:number)=>v.getUint32(p,true);let p=0
 try{
  const offsets:number[]=[],crcs:number[]=[]
  for(const e of manifest){offsets.push(p);if(u32(p)!==0x04034b50||u16(p+4)!==20||u16(p+6)!==0x0800||u16(p+8)!==0||u16(p+28)!==0||u32(p+18)!==e.doc.byteLength||u32(p+22)!==e.doc.byteLength)throw Error('HEADER')
   const n=u16(p+26);if(decoder.decode(bytes.subarray(p+30,p+30+n))!==e.name)throw Error('NAME');const expectedCRC=u32(p+14);crcs.push(expectedCRC);p+=30+n;const pdf=bytes.subarray(p,p+e.doc.byteLength);if(crc32(pdf)!==expectedCRC)throw Error('CRC');await verifyArchivedBytes(pdf,e.doc);p+=pdf.length
  }
  const start=p
  for(let i=0;i<3;i++){const e=manifest[i],n=u16(p+28);if(u32(p)!==0x02014b50||u16(p+8)!==0x0800||u16(p+10)!==0||u32(p+16)!==crcs[i]||u32(p+20)!==e.doc.byteLength||u32(p+24)!==e.doc.byteLength||u16(p+30)!==0||u16(p+32)!==0||u16(p+34)!==0||u32(p+42)!==offsets[i]||decoder.decode(bytes.subarray(p+46,p+46+n))!==e.name)throw Error('CENTRAL');p+=46+n}
  if(p+22!==bytes.length||u32(p)!==0x06054b50||u16(p+4)!==0||u16(p+6)!==0||u16(p+8)!==3||u16(p+10)!==3||u32(p+12)!==p-start||u32(p+16)!==start||u16(p+20)!==0)throw Error('END')
 }catch{throw new ArchiveFailure('integrity')}
 return bytes
}
