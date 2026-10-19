/* 案件だけの動き：合同会社アステップ（骨格の swipe.js は直さない）
 * 1. 施設紹介（p7）：タブ・矢印で施設を切り替え、表示中の施設の写真を 3.2秒ごとに切り替える（そのページにいるときだけ）
 * 2. 募集要項：職種のタブ（①児童指導員／②保育士）で「職種」の行を切り替える（シート F12「職種別にタブ分け」）
 * 3. 英字の大見出し（飾り）を1文字ずつに分け、弾んで順に出す（参考の見出しの出方）
 * 4. キャラクターの列（.parade__track）：中身を複製して継ぎ目なく流す。秒数は「半分の長さ ÷ 30px/秒」
 * 5. 端のイラスト・小物（.cut・.bd）が見切れないように、ページの中（ヘッダーの下〜画面の下・左右）に収める（りょうさん 10/19）
 *    揺れる量（--float-y）より広く余白をとる。昇る気球（.bd--rise）と流れる列は動きそのものなので対象外
 */
(() => {
  const place = document.querySelector('.place');
  if (place) {
    const items = [...place.querySelectorAll('.facility')];
    const tabs = [...place.querySelectorAll('.place__tab')];
    let now = 0, timer = 0;
    const show = (i) => {
      now = (i + items.length) % items.length;
      items.forEach((el, k) => el.classList.toggle('is-on', k === now));
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === now); t.setAttribute('aria-selected', String(k === now)); });
    };
    const step = () => {
      const imgs = [...items[now].querySelectorAll('.facility__img')];
      const k = imgs.findIndex((im) => im.classList.contains('is-on'));
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === (k + 1) % imgs.length));
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
    place.querySelector('.place__ar--prev').addEventListener('click', () => show(now - 1));
    place.querySelector('.place__ar:not(.place__ar--prev)').addEventListener('click', () => show(now + 1));
    const page = place.closest('.page');
    document.addEventListener('pagechange', (e) => {
      clearInterval(timer);
      if (e.detail.page === page) timer = setInterval(step, 3200);
    });
  }

  const req = document.querySelector('.req[data-job]');
  document.querySelectorAll('.jobtabs__btn').forEach((b, k, all) => b.addEventListener('click', () => {
    if (req) req.dataset.job = b.dataset.job;
    all.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', String(x === b)); });
  }));

  document.querySelectorAll('.bigen__en').forEach((el) => {
    const t = el.textContent;
    el.textContent = '';
    [...t].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c === ' ' ? '\u00a0' : c;
      el.appendChild(s);
    });
  });

  document.querySelectorAll('.parade__track').forEach((track) => {
    [...track.children].forEach((c) => track.appendChild(c.cloneNode(true)));
    const fit = () => { const half = track.scrollWidth / 2; if (half > 50) track.style.setProperty('--parade-t', `${(half / 30).toFixed(1)}s`); };
    Promise.all([...track.querySelectorAll('img')].map((im) => (im.decode ? im.decode().catch(() => {}) : null))).then(fit);
    window.addEventListener('resize', fit);
  });

  const header = document.querySelector('.site-header');
  const fitDeco = () => {
    const top0 = (header ? header.offsetHeight : 56) + 12;
    document.querySelectorAll('.bgd .cut, .bgd .bd:not(.bd--rise)').forEach((el) => {
      const page = el.closest('.page');
      const pw = page.clientWidth, ph = page.clientHeight;
      const cs = getComputedStyle(el);
      const x = parseFloat(cs.getPropertyValue('--x')) / 100 * pw;
      const y = parseFloat(cs.getPropertyValue('--y')) / 100 * ph;
      const w = el.offsetWidth, h = el.offsetHeight, m = 12;
      el.style.left = `${Math.round(Math.min(Math.max(x, m), pw - w - m))}px`;
      el.style.top = `${Math.round(Math.min(Math.max(y, top0), ph - h - m))}px`;
    });
  };
  Promise.all([...document.querySelectorAll('.bgd img')].map((im) => (im.decode ? im.decode().catch(() => {}) : null))).then(fitDeco);
  let ft = 0;
  window.addEventListener('resize', () => { clearTimeout(ft); ft = setTimeout(fitDeco, 200); });
})();
