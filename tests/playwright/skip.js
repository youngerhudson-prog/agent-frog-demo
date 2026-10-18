async page => {
  await page.goto('http://localhost:3100/'); await page.waitForTimeout(2000);
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return a.textContent + ' visible=' + (r.top >= 0 && r.bottom <= innerHeight); });
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const landed = await page.evaluate(() => Math.round(document.getElementById('materials').getBoundingClientRect().top));
  await page.keyboard.press('Tab');
  const next = await page.evaluate(() => (document.activeElement.closest('section')?.id || 'none') + ':' + document.activeElement.textContent.trim());
  return { first, landed, next };
}
