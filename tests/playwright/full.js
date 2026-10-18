async page => {
  // Where screenshots are written. playwright-cli resolves this against its own working directory.
  const OUT = 'test-results/screenshots/';
  const vw = await page.evaluate(() => innerWidth);
  const tag = vw < 600 ? 'mobile' : vw < 1000 ? 'tablet' : 'desktop';
  const shot = n => page.screenshot({ path: OUT + tag + '-' + n + '.png' });
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const failedReq = [], external = [];
  page.on('requestfailed', r => failedReq.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) failedReq.push(r.status() + ' ' + r.url()); });
  page.on('request', r => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(u.hostname)) external.push(r.url()); });
  await page.goto('http://localhost:3100/'); await page.waitForTimeout(2500);
  const title = await page.title();
  ok(title === 'AGENT FROG · Product demo', 'title ' + title);
  ok((await page.locator('h1').innerText()) === 'AGENT FROG', 'h1');
  await shot('01-opening');

  // Opening: scrubbed by scroll, down then back up (reduced motion shows a still scene instead)
  if (await page.locator('.af-cut-stage').count() === 0) { ok(await page.locator('.af-still').count() === 1, 'still opening'); } else {
  const range = await page.evaluate(() => document.querySelector('.af-cut-stage').offsetHeight - innerHeight);
  const state = () => page.evaluate(() => ({ clip: getComputedStyle(document.querySelector('.af-cloth')).clipPath, half: document.querySelector('.af-half-left').style.transform || 'none', shears: +getComputedStyle(document.querySelector('.af-shears-track')).opacity }));
  const top = await state();
  const at = async (f, n) => { await page.evaluate(y => scrollTo(0, y), Math.round(range * f)); await page.waitForTimeout(700); if (n) await shot(n); return state(); };
  await at(0.3, '02-cut-30');
  const s45 = await at(0.45, '03-cut-mid');
  const s75 = await at(0.75, '04-cut-opening');
  await at(1, '05-cut-open');
  ok(s45.shears > 0.5, 'shears visible mid-cut');
  ok(s75.half !== 'none', 'halves part');
  await page.mouse.move(vw / 2, 300);
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, -Math.ceil(range / 25)); await page.waitForTimeout(30); }
  await page.waitForTimeout(700);
  const back = await state();
  ok(back.half === top.half && back.clip === top.clip, 'reverse restores closed cloth: ' + JSON.stringify(back));
  }

  const sec = id => page.locator('#' + id);
  const go = async id => { await page.evaluate(i => document.getElementById(i).scrollIntoView({ block: 'start' }), id); await page.waitForTimeout(1200); };

  // A
  await go('materials');
  const add = sec('materials').getByRole('button', { name: 'Add sample' });
  await add.first().click(); await page.waitForTimeout(300); await add.first().click(); await page.waitForTimeout(700);
  ok(await sec('materials').locator('.af-readlog li').count() === 2, 'A add both');
  await shot('A-materials');
  await sec('materials').getByRole('button', { name: 'Remove' }).first().click(); await page.waitForTimeout(500);
  ok(await sec('materials').locator('.af-readlog li').count() === 1, 'A remove reverses');

  // B
  await go('profile');
  await sec('profile').getByRole('button', { name: 'Confirm', exact: true }).first().click();
  ok((await sec('profile').locator('.af-count-num').innerText()) === '1', 'B confirm');
  await sec('profile').getByRole('tab', { name: 'Skills' }).click(); await page.keyboard.press('ArrowRight');
  ok((await sec('profile').locator('[role=tab][aria-selected=true]').innerText()) === 'What you want', 'B tabs arrow');
  await sec('profile').getByRole('button', { name: 'Start over' }).click();
  ok((await sec('profile').locator('.af-count-num').innerText()) === '0', 'B start over reverses');
  await shot('B-profile');

  // C
  await go('tailor');
  const first0 = await sec('tailor').locator('.af-tailored-line').first().innerText();
  await sec('tailor').locator('.af-job').nth(1).click(); await page.waitForTimeout(800);
  ok((await sec('tailor').locator('.af-tailored-line').first().innerText()) !== first0, 'C job reorders');
  await shot('C-tailor');
  await sec('tailor').locator('.af-job').nth(0).click(); await page.waitForTimeout(800);
  ok((await sec('tailor').locator('.af-tailored-line').first().innerText()) === first0, 'C switch back reverses');

  // D
  await go('review');
  await sec('review').getByRole('button', { name: 'Your original' }).nth(1).click(); await page.waitForTimeout(300);
  ok((await sec('review').locator('.af-review-text').nth(1).innerText()).startsWith('Assisted'), 'D original');
  await shot('D-compare');
  await sec('review').getByRole('button', { name: 'Tailored' }).nth(1).click(); await page.waitForTimeout(300);
  ok((await sec('review').locator('.af-review-text').nth(1).innerText()).startsWith('Reconciled'), 'D back to tailored');
  await sec('review').getByRole('button', { name: /It.s accurate/ }).click(); await page.waitForTimeout(200);
  ok((await sec('review').locator('.af-review-bar .af-status').nth(1).innerText()) === 'Confirmed by you', 'D confirm flagged');
  await sec('review').getByRole('button', { name: 'Remove' }).first().click(); await page.waitForTimeout(200);
  await sec('review').getByRole('button', { name: 'Restore' }).click(); await page.waitForTimeout(200);
  ok((await sec('review').locator('.af-review-bar .af-status').first().innerText()) === 'Backed by your evidence', 'D restore');
  await sec('review').getByRole('button', { name: 'Start over' }).click(); await page.waitForTimeout(300);
  ok((await sec('review').locator('.af-count-num').innerText()) === '0', 'D start over reverses');

  // E
  await go('letter');
  await sec('letter').getByRole('button', { name: /Why it/ }).click(); await page.waitForTimeout(700);
  ok(await sec('letter').locator('.af-letter-note').count() === 3, 'E notes');
  await shot('E-letter');
  await sec('letter').getByRole('button', { name: 'The draft' }).click(); await page.waitForTimeout(600);
  ok(await sec('letter').locator('.af-letter-note').count() === 0, 'E back to draft');

  // F
  await go('export');
  await sec('export').getByRole('button', { name: /screening/ }).click(); await page.waitForTimeout(400);
  ok(await sec('export').locator('.af-ats').count() === 1, 'F ats view');
  let dl = false; page.once('download', () => { dl = true; });
  await sec('export').getByRole('button', { name: 'Download PDF' }).click(); await page.waitForTimeout(600);
  ok(!dl && /preview/.test(await sec('export').locator('#export-said').innerText()), 'F no download, says preview');
  await shot('F-export');
  await sec('export').getByRole('button', { name: 'As printed' }).click(); await page.waitForTimeout(400);
  ok(await sec('export').locator('.af-final').count() === 1, 'F back to print');

  // G
  await go('prep');
  await sec('prep').getByRole('button', { name: 'Use a sample answer' }).click();
  await sec('prep').getByRole('button', { name: 'Check my answer' }).click(); await page.waitForTimeout(600);
  ok(await sec('prep').locator('.af-star-part').count() === 4, 'G feedback');
  await shot('G-prep');
  await sec('prep').locator('.af-question').nth(1).click(); await page.waitForTimeout(300);
  ok(await sec('prep').locator('.af-star-part').count() === 0, 'G new question clears');

  // H
  await go('applications');
  await sec('applications').locator('select').first().selectOption('Applied'); await page.waitForTimeout(400);
  ok(await sec('applications').locator('.af-followups li').count() === 1, 'H reminder');
  await shot('H-apps');
  await sec('applications').locator('select').first().selectOption('Ready to apply');
  ok((await sec('applications').locator('select').first().inputValue()) === 'Ready to apply', 'H status back');

  // I
  await go('sources');
  await sec('sources').locator('textarea').fill('Yes, the officers moved one event online after my March report.');
  await sec('sources').getByRole('button', { name: 'Save answer' }).click(); await page.waitForTimeout(400);
  ok(/Saved to the sample profile/.test(await sec('sources').locator('.af-review-said').innerText()), 'I save');
  await shot('I-sources');
  await sec('sources').getByRole('button', { name: 'Change' }).click(); await page.waitForTimeout(400);
  ok(await sec('sources').locator('textarea').count() === 1, 'I change reverses');

  // Page-wide checks
  const audit = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const imgs = [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
    const clipped = [...document.querySelectorAll('.af-walk p, .af-walk span, .af-walk button, .af-walk label, .af-walk h2, .af-walk dd, .af-walk td, .af-walk th, .af-walk li')]
      .filter(e => { const s = getComputedStyle(e); return (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1; })
      .map(e => e.className + ':' + e.textContent.slice(0, 30));
    const h2 = [...document.querySelectorAll('.af-h2')].map(h => Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)));
    const small = [...document.querySelectorAll('.af-walk button, .af-walk a, .af-walk select, .af-walk label.af-job, .af-walk label.af-question')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 24 || r.width < 24); })
      .map(e => e.textContent.trim().slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().height));
    return { overflow, imgs, clipped, h2, small };
  });
  ok(audit.overflow === 0, 'overflow ' + audit.overflow);
  ok(audit.imgs.length === 0, 'broken images ' + audit.imgs);
  ok(audit.clipped.length === 0, 'clipped ' + audit.clipped);
  ok(audit.h2.every(n => n <= 2), 'h2 lines ' + audit.h2);
  return { tag, fails, failedReq, external, small: audit.small, h2: audit.h2.join(',') };
}
