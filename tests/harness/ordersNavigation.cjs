// Navigate real contextual controls; never bypass hidden/inert UI with force clicks.
async function selectOrder(page, order) {
    const list = page.locator('.cp04-order-list');
    if (!await list.isVisible())
        await page.getByRole('button', { name: 'Cambiar de orden', exact: true }).click();
    await order.click();
    await page.locator('.cp04-detail[aria-busy="false"]').waitFor();
}
async function openReception(page) { if (!await page.locator('.cp04-reception').isVisible())
    await page.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click(); }
async function openGroup(page, name) { const summary = page.locator('.cp04-action-group>summary').filter({ hasText: new RegExp('^' + name + '\\s*$') }); if (!await summary.evaluate(e => e.parentElement.open))
    await summary.click(); }
module.exports = { selectOrder, openReception, openDocuments: page => openGroup(page, 'Documentos'), openStatus: page => openGroup(page, 'Estado e historial') };
