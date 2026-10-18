async page => {
  await page.goto('http://localhost:3100/');
  await page.evaluate(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await page.waitForTimeout(2000);
  const run = async (from, to, steps) => {
    await page.evaluate(y => scrollTo(0, y), from); await page.waitForTimeout(400);
    await page.evaluate(() => { window.__f = []; window.__go = true; let last = performance.now(); const tick = t => { window.__f.push(t - last); last = t; if (window.__go) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    await page.mouse.move(700, 450);
    const d = Math.ceil((to - from) / steps);
    for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, d); await page.waitForTimeout(16); }
    await page.waitForTimeout(400);
    return page.evaluate(() => { window.__go = false; const f = window.__f.slice(2).sort((a, b) => a - b); const p = q => +f[Math.floor(f.length * q)].toFixed(1); return { frames: f.length, median: p(0.5), p95: p(0.95), over33ms: f.filter(x => x > 33).length }; });
  };
  const stage = await page.evaluate(() => document.querySelector('.af-cut-stage').offsetHeight - innerHeight);
  const opening = await run(0, stage, 40);
  const walkTop = await page.evaluate(() => document.getElementById('materials').getBoundingClientRect().top + scrollY);
  const walkEnd = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const walkthrough = await run(walkTop, walkEnd, 120);
  // Layout shift while scrolling the walkthrough (reveals use transforms, so this should stay near 0)
  const cls = await page.evaluate(() => +window.__cls.toFixed(4));
  // Anything still animating once the page is idle at the bottom?
  const idle = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.effect?.target?.className || '') + ''));
  return { opening, walkthrough, cls, runningWhenIdle: idle };
}
