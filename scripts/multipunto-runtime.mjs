import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
export const officialCI=()=>process.env.CI==='true'||process.env.GITHUB_ACTIONS==='true'
/** Local absence is explicit; CI absence is a mandatory failure, never a green skip. */
export async function missingRuntime(name,detail,out){
 const status=officialCI()?'FAILURE':'BLOCKED_ENVIRONMENT';await mkdir(out,{recursive:true})
 await writeFile(join(out,name.toLowerCase()+'.json'),JSON.stringify({status,requiredInCI:true,reason:detail,downloadAttempted:false},null,2)+'\n')
 if(officialCI())throw Error('REQUIRED_RUNTIME_MISSING: '+name+' — '+detail)
 return {status,reason:detail}
}
