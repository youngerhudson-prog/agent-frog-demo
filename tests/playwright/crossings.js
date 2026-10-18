async page => {
  await page.goto('http://localhost:3100/'); await page.waitForTimeout(2500);
  // Sample the stitch path every 4px and report any point that lands on a text box
  return page.evaluate(() => {
    const path = document.querySelector('.af-thread-stitch');
    const walk = document.querySelector('.af-walk').getBoundingClientRect();
    const len = path.getTotalLength();
    const boxes = [...document.querySelectorAll('.af-walk p, .af-walk h2, .af-walk li, .af-walk button, .af-panel, .af-paper, .af-table')].map(e => ({ e, r: e.getBoundingClientRect() }));
    const hits = new Set();
    for (let l = 0; l < len; l += 4) {
      const p = path.getPointAtLength(l);
      const x = walk.left + p.x, y = walk.top + p.y;
      for (const { e, r } of boxes) if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hits.add((e.closest('section')?.id || 'walk') + ':' + e.className + ':' + e.textContent.trim().slice(0, 25));
    }
    return [...hits];
  });
}
