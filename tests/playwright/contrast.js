async page => {
  await page.goto('http://localhost:3100/'); await page.waitForTimeout(2000);
  // Open the states that only exist after interaction so their text is measured too
  await page.evaluate(async () => {
    for (const s of document.querySelectorAll('.af-section')) { s.scrollIntoView(); await new Promise(r => setTimeout(r, 700)); }
  });
  await page.locator('#materials').getByRole('button', { name: 'Add sample' }).first().click();
  await page.locator('#letter').getByRole('button', { name: /Why it/ }).click();
  await page.locator('#prep').getByRole('button', { name: 'Use a sample answer' }).click();
  await page.locator('#prep').getByRole('button', { name: 'Check my answer' }).click();
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
    const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
    const bgOf = el => {
      const layers = [];
      for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) { layers.push(c); if (c.a === 1) break; } }
      let bg = { r: 27, g: 21, b: 18, a: 1 };
      for (const c of layers.reverse()) bg = over(c, bg);
      return bg;
    };
    const out = new Map();
    for (const el of document.querySelectorAll('.af-walk *')) {
      if (el.closest('svg,.af-sr-only,[aria-hidden=true]')) continue;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || +s.opacity === 0 || el.closest('button:disabled')) continue;
      let fg = parse(s.color); const bg = bgOf(el); fg = over(fg, bg);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      if (ratio < need) out.set(el.className + ' "' + el.textContent.trim().slice(0, 28) + '"', ratio.toFixed(2) + ' < ' + need);
    }
    return Object.fromEntries(out);
  });
}
