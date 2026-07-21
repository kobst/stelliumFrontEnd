/* paper-chart.js — navy chart medallion for the paper aesthetic.
   Draws the wheel(s), wires tabs, planet menu, and highlight logic. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
  const pol = (c, r, deg) => [c + r * Math.cos((180 - deg) * Math.PI / 180), c - r * Math.sin((180 - deg) * Math.PI / 180)];
  const SIGNS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  const BODIES = [
    { id: 'asc',     glyph: 'Ac', name: 'Ascendant', deg: 230,   color: '#e2b95c' },
    { id: 'sun',     glyph: '☉',  name: 'Sun',       deg: 223,   color: '#e2b95c' },
    { id: 'moon',    glyph: '☽',  name: 'Moon',      deg: 84,    color: '#e8e4f0' },
    { id: 'mercury', glyph: '☿',  name: 'Mercury',   deg: 238,   color: '#6fbfb4' },
    { id: 'venus',   glyph: '♀',  name: 'Venus',     deg: 189,   color: '#d68a9d' },
    { id: 'mars',    glyph: '♂',  name: 'Mars',      deg: 137,   color: '#cf6b52' },
    { id: 'jupiter', glyph: '♃',  name: 'Jupiter',   deg: 153,   color: '#d9a45b' },
    { id: 'saturn',  glyph: '♄',  name: 'Saturn',    deg: 171,   color: '#b9a27e' },
    { id: 'uranus',  glyph: '♅',  name: 'Uranus',    deg: 229.4, color: '#7fc4d8' },
    { id: 'neptune', glyph: '♆',  name: 'Neptune',   deg: 257,   color: '#9d8fd4' },
    { id: 'pluto',   glyph: '♇',  name: 'Pluto',     deg: 199,   color: '#b07ba8' },
    { id: 'mc',      glyph: 'Mc', name: 'Midheaven', deg: 147,   color: '#d8cdb8' },
    { id: 'node',    glyph: '☊',  name: 'Node',      deg: 166,   color: '#a9b4a0' },
  ];
  const ASPECTS = [
    ['asc','uranus','hard'],['asc','saturn','soft'],['asc','mars','hard'],['asc','sun','conj'],
    ['sun','uranus','conj'],['sun','mars','hard'],['sun','moon','minor'],
    ['moon','neptune','hard'],['moon','pluto','soft'],
    ['mercury','saturn','soft'],['venus','mars','hard'],['venus','neptune','soft'],
    ['jupiter','saturn','conj'],['mars','mc','conj'],['pluto','mc','soft'],
  ];
  const ACOLOR = { hard: '#c0564a', soft: '#5a7fb5', conj: '#c8a04e', minor: '#8a8fa8' };

  function drawWheel(svg, size) {
    const C = size / 2, Ro = C - 4, Ri = Ro * 0.82, Rp = Ro * 0.62;
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ro, fill: '#1c2440' }));
    // starlight
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < Math.round(size / 5); i++) {
      const a = rnd() * 360, r = rnd() * Ri * 0.92;
      const [x, y] = pol(C, r, a);
      svg.appendChild(el('circle', { cx: x, cy: y, r: rnd() * 0.9 + 0.3, fill: `rgba(230,225,245,${(0.15 + rnd() * 0.4).toFixed(2)})` }));
    }
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ro, fill: 'none', stroke: '#c8a04e', 'stroke-width': 1.2 }));
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ri, fill: 'none', stroke: 'rgba(200,160,78,0.55)', 'stroke-width': 0.8 }));
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = pol(C, Ri, i * 30), [x2, y2] = pol(C, Ro, i * 30);
      svg.appendChild(el('line', { x1, y1, x2, y2, stroke: 'rgba(200,160,78,0.5)', 'stroke-width': 0.7 }));
      const [gx, gy] = pol(C, (Ro + Ri) / 2, i * 30 + 15);
      const t = el('text', { x: gx, y: gy, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#c8a04e', 'font-size': size * 0.042, 'font-family': '"Cormorant Garamond", Georgia, serif' });
      t.textContent = SIGNS[i] + '︎'; svg.appendChild(t);
    }
    // place badges, then resolve collisions: iterate, pushing overlapping
    // badges to alternating inner rings until no two are within 2.2×radius
    const br = size * 0.036;
    const place = {}; BODIES.forEach(b => { place[b.id] = { deg: b.deg, r: Rp, step: 0 }; });
    const minD = br * 2.3;
    for (let pass = 0; pass < 24; pass++) {
      let moved = false;
      for (let i = 0; i < BODIES.length; i++) for (let j = i + 1; j < BODIES.length; j++) {
        const A = place[BODIES[i].id], B = place[BODIES[j].id];
        const [ax, ay] = pol(C, A.r, A.deg), [bx, by] = pol(C, B.r, B.deg);
        if (Math.hypot(ax - bx, ay - by) < minD) {
          B.step++; B.r = Rp - B.step * (br * 2.05); B.deg += (B.step % 2 ? 3 : -2); moved = true;
        }
      }
      if (!moved) break;
    }
    const pos = {}; BODIES.forEach(b => { pos[b.id] = pol(C, place[b.id].r, place[b.id].deg); });
    ASPECTS.forEach(([a, b, k]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      svg.appendChild(el('line', { x1, y1, x2, y2, class: 'asp', 'data-pl': `${a},${b}`, stroke: ACOLOR[k],
        'stroke-width': 1.1, opacity: 0.75, 'stroke-dasharray': k === 'minor' ? '3 4' : 'none' }));
    });
    BODIES.forEach(b => {
      const [x, y] = pos[b.id], r = br;
      const g = el('g', { class: 'body', 'data-pl': b.id });
      g.appendChild(el('circle', { class: 'halo', cx: x, cy: y, r: r + 4.5, fill: 'none', stroke: '#e9c974', 'stroke-width': 1.4, opacity: 0 }));
      g.appendChild(el('circle', { cx: x, cy: y, r, fill: '#26304f', stroke: b.color, 'stroke-width': 1.1 }));
      const t = el('text', { x, y: y + 0.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: b.color, 'font-size': b.glyph.length > 1 ? r * 0.95 : r * 1.25, 'font-family': '"Cormorant Garamond", Georgia, serif' });
      t.textContent = b.glyph + (b.glyph.length > 1 ? '' : '︎'); g.appendChild(t);
      svg.appendChild(g);
    });
    return svg;
  }

  function highlight(svg, id) {
    svg.querySelectorAll('.body').forEach(g => {
      const on = g.dataset.pl === id;
      g.querySelector('.halo').setAttribute('opacity', on ? 1 : 0);
      g.setAttribute('opacity', !id || on || ASPECTS.some(([a, b]) => (a === id && b === g.dataset.pl) || (b === id && a === g.dataset.pl)) ? 1 : 0.35);
    });
    svg.querySelectorAll('.asp').forEach(l => {
      const hit = id && l.dataset.pl.split(',').includes(id);
      l.setAttribute('opacity', !id ? 0.75 : hit ? 1 : 0.12);
      l.setAttribute('stroke-width', hit ? 1.8 : 1.1);
    });
  }

  document.querySelectorAll('svg.wheel').forEach(s => drawWheel(s, +s.dataset.size || 520));

  /* tabs */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('on', x === t));
    panels.forEach(p => p.classList.toggle('show', p.id === 'panel-' + t.dataset.tab));
    window.scrollTo(0, 0);
  }));

  /* planet menu */
  const COPY = {
    asc: { title: 'Ascendant <i>in Scorpio 20°11′</i>', house: '1st House',
      paras: ['Your Ascendant shapes how you present yourself to the world and how others perceive you at first glance.',
        'With Scorpio rising, you come across as intense, perceptive, and deeply self-possessed. You have a natural ability to sense what lies beneath the surface and are often drawn to transformation — both in yourself and in the world around you.'],
      aspects: [['♅','Conjunction Uranus','0.7°','Applying'],['♄','Sextile Saturn','3.7°','Applying'],['♂','Square Mars','3.5°','Separating'],['☉','Conjunction Sun','6.6°','Applying']] },
    sun: { title: 'Sun <i>in Scorpio 13°42′</i>', house: '12th House',
      paras: ['Your Sun is the core of your identity — the person you are becoming.',
        'In Scorpio and the 12th house, your vitality runs deep and private. You process life beneath the surface, and your greatest strength is the ability to emerge from difficulty transformed.'],
      aspects: [['♅','Conjunction Uranus','5.9°','Separating'],['♂','Square Mars','2.1°','Applying'],['☽','Quincunx Moon','1.3°','Applying']] },
    moon: { title: 'Moon <i>in Gemini 24°05′</i>', house: '8th House',
      paras: ['Your Moon describes what you need before you can rest.',
        'In Gemini, you metabolize feeling through language — talking, writing, naming things. When emotions go unspoken they circle; once articulated, they settle.'],
      aspects: [['♆','Square Neptune','2.8°','Separating'],['♇','Trine Pluto','1.9°','Applying'],['☉','Quincunx Sun','1.3°','Applying']] },
    mercury: { title: 'Mercury <i>in Scorpio 28°33′</i>', house: '1st House',
      paras: ['Mercury in Scorpio gives you a probing, strategic mind. You ask the question under the question, and you rarely accept the first answer.'],
      aspects: [['♄','Sextile Saturn','1.4°','Applying']] },
    venus: { title: 'Venus <i>in Libra 9°17′</i>', house: '11th House',
      paras: ['Venus in Libra reaches for harmony, fairness, and beauty in relationship. You are at your best when connection feels mutual and considered.'],
      aspects: [['♂','Square Mars','2.6°','Separating'],['♆','Sextile Neptune','1.1°','Applying']] },
    mars: { title: 'Mars <i>in Leo 17°50′</i>', house: '10th House',
      paras: ['Mars in Leo acts from the heart, visibly. Your drive wants an audience and a cause worth being seen for.'],
      aspects: [['Mc','Conjunction Midheaven','2.3°','Applying'],['☉','Square Sun','2.1°','Applying']] },
    jupiter: { title: 'Jupiter <i>in Virgo 3°21′</i>', house: '10th House',
      paras: ['Jupiter in Virgo grows through craft: mastery accumulates in small, useful improvements rather than grand leaps.'],
      aspects: [['♄','Conjunction Saturn','4.5°','Separating']] },
    saturn: { title: 'Saturn <i>in Virgo 21°08′</i>', house: '11th House',
      paras: ['Saturn in Virgo asks for rigor. The work is discernment — building systems that hold, and forgiving imperfection along the way.'],
      aspects: [['Ac','Sextile Ascendant','3.7°','Applying'],['☿','Sextile Mercury','1.4°','Applying']] },
    uranus: { title: 'Uranus <i>in Scorpio 19°26′</i>', house: '1st House',
      paras: ['Uranus on your Ascendant adds voltage to your presence — original, unpredictable, allergic to being categorized.'],
      aspects: [['Ac','Conjunction Ascendant','0.7°','Applying'],['☉','Conjunction Sun','5.9°','Separating']] },
    neptune: { title: 'Neptune <i>in Sagittarius 17°44′</i>', house: '2nd House',
      paras: ['Neptune in Sagittarius dreams in meaning. Your imagination reaches for the far horizon — faith, travel, the big story.'],
      aspects: [['☽','Square Moon','2.8°','Separating'],['♀','Sextile Venus','1.1°','Applying']] },
    pluto: { title: 'Pluto <i>in Libra 19°02′</i>', house: '11th House',
      paras: ['Pluto in Libra transforms through relationship. Power dynamics in partnership are where your deepest renovations happen.'],
      aspects: [['☽','Trine Moon','1.9°','Applying'],['Mc','Sextile Midheaven','2.0°','Applying']] },
    mc: { title: 'Midheaven <i>in Leo 27°39′</i>', house: '10th House',
      paras: ['Your Midheaven is your public vocation. In Leo, you are meant to be seen leading with warmth — reputation grows when you take the stage rather than the wings.'],
      aspects: [['♂','Conjunction Mars','2.3°','Applying'],['♇','Sextile Pluto','2.0°','Applying']] },
    node: { title: 'North Node <i>in Virgo 16°55′</i>', house: '11th House',
      paras: ['Your North Node points the direction of growth: toward Virgo’s humility, service, and daily practice — and away from retreating into private dreaming.'],
      aspects: [] },
  };
  const menu = document.querySelectorAll('.pm-item');
  const wheelMain = document.getElementById('wheelPlanets');
  const cTitle = document.getElementById('cpTitle'), cHouse = document.getElementById('cpHouse'),
        cBody = document.getElementById('cpBody'), cAsp = document.getElementById('cpAspects');
  function selectBody(id) {
    menu.forEach(m => m.classList.toggle('on', m.dataset.pl === id));
    const d = COPY[id];
    cTitle.innerHTML = d.title;
    cHouse.textContent = d.house;
    cBody.innerHTML = d.paras.map(p => `<p>${p}</p>`).join('');
    cAsp.innerHTML = d.aspects.map(a =>
      `<div class="asp-row"><span class="g">${a[0]}</span><span class="lbl">${a[1]}</span><span class="orb">${a[2]}</span><span class="app">${a[3]}</span></div>`).join('')
      || '<div class="asp-row"><span class="lbl" style="color:var(--ink-faint)">No major aspects</span></div>';
    if (wheelMain) highlight(wheelMain, id);
  }
  menu.forEach(m => m.addEventListener('click', () => selectBody(m.dataset.pl)));
  if (menu.length) selectBody('asc');
})();
