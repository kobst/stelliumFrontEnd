/* rel-ink.js — wheels + wiring for Relationship (ink). Self-contained (do not load paper-chart.js). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
  const pol = (c, r, deg) => [c + r * Math.cos((180 - deg) * Math.PI / 180), c - r * Math.sin((180 - deg) * Math.PI / 180)];
  const SIGNS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const SERIF = '"Cormorant Garamond", Georgia, serif';

  const EVA = [
    { id: 'e-sun', glyph: '☉', deg: 223 }, { id: 'e-moon', glyph: '☽', deg: 84 },
    { id: 'e-mercury', glyph: '☿', deg: 238 }, { id: 'e-venus', glyph: '♀', deg: 189 },
    { id: 'e-mars', glyph: '♂', deg: 137 }, { id: 'e-jupiter', glyph: '♃', deg: 153 },
    { id: 'e-saturn', glyph: '♄', deg: 171 },
  ];
  const JORDAN = [
    { id: 'j-sun', glyph: '☉', deg: 341 }, { id: 'j-moon', glyph: '☽', deg: 218 },
    { id: 'j-mercury', glyph: '☿', deg: 356 }, { id: 'j-venus', glyph: '♀', deg: 22 },
    { id: 'j-mars', glyph: '♂', deg: 84 }, { id: 'j-jupiter', glyph: '♃', deg: 301 },
    { id: 'j-saturn', glyph: '♄', deg: 264 },
  ];
  const COMPOSITE = [
    { id: 'c-sun', glyph: '☉', deg: 282 }, { id: 'c-moon', glyph: '☽', deg: 151 },
    { id: 'c-mercury', glyph: '☿', deg: 297 }, { id: 'c-venus', glyph: '♀', deg: 285.5 },
    { id: 'c-mars', glyph: '♂', deg: 110 }, { id: 'c-jupiter', glyph: '♃', deg: 227 },
    { id: 'c-saturn', glyph: '♄', deg: 217 },
  ];
  const SYN_ASPECTS = [
    ['e-sun','j-moon','soft'],['e-moon','j-venus','soft'],['e-venus','j-sun','hard'],
    ['e-mars','j-mars','conj'],['e-sun','j-saturn','hard'],['e-moon','j-mars','conj'],
    ['e-mercury','j-mercury','minor'],
  ];
  const COMP_ASPECTS = [
    ['c-sun','c-venus','conj'],['c-moon','c-mars','hard'],['c-moon','c-jupiter','soft'],
    ['c-mercury','c-sun','conj'],['c-saturn','c-jupiter','minor'],
  ];
  const ACOLOR = { hard: '#c0564a', soft: '#5a7fb5', conj: '#c8a04e', minor: '#8a8fa8' };
  const RING = { e: '#e2b95c', j: '#8fb5d8', c: '#d68a9d' };

  function base(svg, size) {
    const C = size / 2, Ro = C - 4, Ri = Ro * 0.82;
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ro, fill: '#1c2440' }));
    let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < Math.round(size / 5); i++) {
      const a = rnd() * 360, r = rnd() * Ri * 0.92, [x, y] = pol(C, r, a);
      svg.appendChild(el('circle', { cx: x, cy: y, r: rnd() * 0.9 + 0.3, fill: `rgba(230,225,245,${(0.15 + rnd() * 0.4).toFixed(2)})` }));
    }
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ro, fill: 'none', stroke: '#c8a04e', 'stroke-width': 1.2 }));
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ri, fill: 'none', stroke: 'rgba(200,160,78,0.55)', 'stroke-width': 0.8 }));
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = pol(C, Ri, i * 30), [x2, y2] = pol(C, Ro, i * 30);
      svg.appendChild(el('line', { x1, y1, x2, y2, stroke: 'rgba(200,160,78,0.5)', 'stroke-width': 0.7 }));
      const [gx, gy] = pol(C, (Ro + Ri) / 2, i * 30 + 15);
      const t = el('text', { x: gx, y: gy, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#c8a04e', 'font-size': size * 0.042, 'font-family': SERIF });
      t.textContent = SIGNS[i] + '\uFE0E'; svg.appendChild(t);
    }
    return { C, Ro, Ri };
  }

  function ringBodies(svg, C, bodies, R, color, size, posOut) {
    const br = size * 0.034;
    bodies.forEach((b, i) => {
      // nudge collisions apart along the ring
      let deg = b.deg;
      for (let k = 0; k < i; k++) if (Math.abs(((bodies[k].deg - deg + 540) % 360) - 180) > 168) deg += 9;
      const [x, y] = pol(C, R, deg);
      posOut[b.id] = [x, y];
      const g = el('g', { class: 'body', 'data-pl': b.id });
      g.appendChild(el('circle', { class: 'halo', cx: x, cy: y, r: br + 4, fill: 'none', stroke: '#e9c974', 'stroke-width': 1.4, opacity: 0 }));
      g.appendChild(el('circle', { cx: x, cy: y, r: br, fill: '#26304f', stroke: color, 'stroke-width': 1.1 }));
      const t = el('text', { x, y: y + 0.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: color, 'font-size': br * 1.2, 'font-family': SERIF });
      t.textContent = b.glyph + '\uFE0E'; g.appendChild(t);
      svg.appendChild(g);
    });
  }

  function drawAspects(svg, pos, aspects) {
    aspects.forEach(([a, b, k]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      svg.insertBefore(el('line', { x1, y1, x2, y2, class: 'asp', 'data-pl': `${a},${b}`, stroke: ACOLOR[k],
        'stroke-width': 1.1, opacity: 0.75, 'stroke-dasharray': k === 'minor' ? '3 4' : 'none' }),
        svg.querySelector('.body'));
    });
  }

  function drawSynastry(svg, size) {
    const { C, Ri } = base(svg, size);
    svg.appendChild(el('circle', { cx: C, cy: C, r: Ri * 0.52, fill: 'none', stroke: 'rgba(143,181,216,0.4)', 'stroke-width': 0.8, 'stroke-dasharray': '2 4' }));
    const pos = {};
    ringBodies(svg, C, EVA, Ri * 0.72, RING.e, size, pos);
    ringBodies(svg, C, JORDAN, Ri * 0.42, RING.j, size, pos);
    drawAspects(svg, pos, SYN_ASPECTS);
  }
  function drawComposite(svg, size) {
    const { C, Ri } = base(svg, size);
    const pos = {};
    ringBodies(svg, C, COMPOSITE, Ri * 0.62, RING.c, size, pos);
    drawAspects(svg, pos, COMP_ASPECTS);
  }

  function highlight(svg, ids) {
    svg.querySelectorAll('.body').forEach(g => {
      const on = ids && ids.includes(g.dataset.pl);
      g.querySelector('.halo').setAttribute('opacity', on ? 1 : 0);
      g.setAttribute('opacity', !ids || on ? 1 : 0.35);
    });
    svg.querySelectorAll('.asp').forEach(l => {
      const parts = l.dataset.pl.split(',');
      const hit = ids && parts.every(p => ids.includes(p));
      l.setAttribute('opacity', !ids ? 0.75 : hit ? 1 : 0.12);
      l.setAttribute('stroke-width', hit ? 1.8 : 1.1);
    });
  }
  window.relHighlight = highlight;

  document.querySelectorAll('svg.synastry').forEach(s => drawSynastry(s, +s.dataset.size || 520));
  document.querySelectorAll('svg.composite').forEach(s => drawComposite(s, +s.dataset.size || 460));

  /* tabs */
  const tabs = document.querySelectorAll('.tab'), panels = document.querySelectorAll('.panel');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('on', x === t));
    panels.forEach(p => p.classList.toggle('show', p.id === 'panel-' + t.dataset.tab));
    window.scrollTo(0, 0);
  }));

  /* synastry aspect rows -> highlight bi-wheel */
  const synWheel = document.getElementById('wheelSynastry');
  document.querySelectorAll('.asp-row[data-pl]').forEach(r => {
    r.addEventListener('click', () => {
      const on = r.classList.contains('sel');
      document.querySelectorAll('.asp-row.sel').forEach(x => x.classList.remove('sel'));
      if (on) { highlight(synWheel, null); return; }
      r.classList.add('sel');
      highlight(synWheel, r.dataset.pl.split(','));
    });
  });

  /* 360 sub-menu */
  const CLUSTERS = {
    emotional: { title: 'Emotional Connection', score: 88, chips: ['Her Sun trine his Moon', 'Her Moon sextile his Venus'], secs: [
      { h: null, p: 'This is the deep water of your bond. Eva\u2019s Scorpio Sun trine Jordan\u2019s Pisces Moon creates an instinctive emotional shorthand: feelings are understood here before they are explained. Safety is not something you build so much as something you recognized in each other early.' },
      { h: 'Where It Deepens', chips: ['Moon', 'Venus'], p: 'Her Gemini Moon sextile his Venus adds play to the depth — the relationship can name hard things lightly, which keeps intensity from curdling into heaviness.' }
    ]},
    communication: { title: 'Communication', score: 74, chips: ['Mercury square Mercury'], secs: [
      { h: null, p: 'Your Mercuries square: Eva investigates, Jordan summarizes. The friction is real but productive — each conversation forces both of you to translate, and the translations are where the discoveries happen.' },
      { h: 'The Practice', chips: ['Mercury'], p: 'Agree on the mode before the conversation: is this a thinking-aloud talk or a decision talk? Most of your crossed wires are mode mismatches, not meaning mismatches.' }
    ]},
    passion: { title: 'Passion & Attraction', score: 91, chips: ['Mars conjunct Mars', 'Her Venus square his Sun'], secs: [
      { h: null, p: 'Mars conjunct Mars in Gemini: you move at the same speed, want at the same moments, and can turn an errand into an adventure. The square from her Venus to his Sun keeps a permanent low-grade spark — attraction with a trace of challenge in it.' }
    ]},
    stability: { title: 'Stability & Trust', score: 69, chips: ['Her Sun square his Saturn'], secs: [
      { h: null, p: 'Jordan\u2019s Saturn squares Eva\u2019s Sun: the relationship\u2019s load-bearing aspect. It can feel like being examined — or like being taken seriously. The difference is whether the standards are spoken.' },
      { h: 'The Long Game', chips: ['Saturn'], p: 'Saturn contacts are why this bond has weight. Couples without them drift; couples with them build. The invitation is to let the structure be a greenhouse, not a cage.' }
    ]},
    growth: { title: 'Growth & Purpose', score: 82, chips: ['His Jupiter trine her Venus'], secs: [
      { h: null, p: 'His Jupiter trine her Venus makes generosity the default: each of you instinctively enlarges the other\u2019s world — introductions, ideas, permission to want more.' }
    ]},
  };
  const anMenu = document.getElementById('anMenu');
  if (anMenu) {
    const items = anMenu.querySelectorAll('.pm-item');
    const render = (d, i) => {
      document.getElementById('anCount').textContent = (i + 1) + ' of ' + items.length;
      document.getElementById('anTitle').textContent = d.title;
      document.getElementById('anScore').textContent = d.score + '%';
      document.getElementById('anScoreBar').style.width = d.score + '%';
      document.getElementById('anChips').innerHTML = d.chips.map(c => `<span class="chip">${c}</span>`).join('');
      document.getElementById('anBody').innerHTML = d.secs.map(s =>
        (s.h ? `<div class="sec"><h3>${s.h}</h3>` : '<div>') +
        (s.chips ? `<div class="chips">${s.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : '') +
        `<p>${s.p}</p></div>`).join('');
    };
    items.forEach((m, i) => m.addEventListener('click', () => {
      items.forEach(x => x.classList.toggle('on', x === m));
      render(CLUSTERS[m.dataset.an], i);
    }));
    render(CLUSTERS[items[0].dataset.an], 0);
  }
})();
