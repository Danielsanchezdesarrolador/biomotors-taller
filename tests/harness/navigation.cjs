const assert=require('node:assert/strict')
async function navigateSection(page,id){
 assert.ok(['inicio','agenda','ordenes','clientes','informes','mitaller','configuracion'].includes(id))
 if((page.viewportSize()?.width??1440)<=760){
  const bottom=page.locator('.bottom-nav [data-screen="'+id+'"]')
  if(await bottom.count()){await bottom.click();return}
  if(!await page.locator('.sidebar-open').count())await page.getByRole('button',{name:'Más secciones',exact:true}).click()
  await page.locator('.sidebar-open [data-screen="'+id+'"]').click();await page.waitForFunction(()=>{const sidebar=document.querySelector('.sidebar');return !sidebar||sidebar.getBoundingClientRect().right<=0.5});return
 }
 await page.locator('.side-nav [data-screen="'+id+'"]').click()
}
module.exports={navigateSection}
