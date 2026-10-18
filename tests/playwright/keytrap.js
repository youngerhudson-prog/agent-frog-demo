async page => {
  await page.goto('http://localhost:3100/'); await page.waitForTimeout(2000);
  await page.evaluate(() => document.body.focus());
  const seen = [];
  let stuck = 0, last = '';
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return { id: 'BODY' };
      const t = a.type === 'radio' ? a.closest('label') : a;
      const s = getComputedStyle(t);
      const r = a.getBoundingClientRect();
      return {
        id: (a.closest('section')?.id || a.closest('nav,footer')?.className || 'other') + ':' + (a.getAttribute('aria-label') || a.textContent || a.value || a.name || '').trim().slice(0, 24),
        ring: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
        onScreen: r.bottom > 0 && r.top < innerHeight,
      };
    });
    if (d.id === 'BODY') { seen.push('BODY'); break; }
    if (d.id === last) stuck++;
    last = d.id;
    seen.push(d.id + (d.ring ? '' : ' [NO RING]') + (d.onScreen ? '' : ' [OFFSCREEN]'));
  }
  // Escape out of an edit field must not trap
  await page.evaluate(() => document.getElementById('profile').scrollIntoView());
  await page.locator('#profile').getByRole('button', { name: 'Edit' }).first().click();
  await page.keyboard.press('Escape');
  const backOnEdit = await page.evaluate(() => document.activeElement.textContent.trim());
  return { count: seen.length, stuck, sections: [...new Set(seen.map(s => s.split(':')[0]))], problems: seen.filter(s => /\[/.test(s)), tail: seen.slice(-4), backOnEdit };
}
