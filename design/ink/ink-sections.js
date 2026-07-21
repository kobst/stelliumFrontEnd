// Patterns + 360 Analysis sub-section data & wiring for Birth Chart (ink)
(function () {
  const bars = (rows) => '<div class="pat-viz">' + rows.map(r =>
    `<div class="bar${r.hot ? ' hot' : ''}" style="height:${r.h}%"><b>${r.hot ? r.v : ''}</b><em>${r.l}</em></div>`).join('') + '</div>';

  const PATTERNS = {
    shapes: { title: 'Shapes', tag: 'How several placements combine into larger geometric patterns.',
      viz: '<div class="shape-note">a bundle — everything gathered in one third of the sky ↓</div><svg viewBox="0 0 200 200" style="width:100%;height:auto;margin-top:18px" aria-hidden="true"><circle cx="100" cy="100" r="86" fill="none" stroke="rgba(35,40,64,0.3)"/><circle cx="100" cy="100" r="60" fill="none" stroke="rgba(35,40,64,0.14)"/><g fill="#3437a8"><circle cx="52" cy="52" r="4"/><circle cx="40" cy="78" r="4"/><circle cx="38" cy="108" r="4"/><circle cx="48" cy="136" r="4"/><circle cx="70" cy="155" r="4"/><circle cx="96" cy="163" r="4"/></g><path d="M52 52 L40 78 L38 108 L48 136 L70 155 L96 163" fill="none" stroke="rgba(52,55,168,0.45)" stroke-dasharray="3 4"/></svg>',
      paras: ['A <b>bundle</b> chart: nearly every planet gathered within one trine of the zodiac. Your energy is concentrated and specialist rather than scattered — when you commit to something, everything you have arrives at once.', 'The gift is depth and self-sufficiency; the growth edge is remembering that the empty two-thirds of your chart is where other people live. Partnerships pull you into territory no planet of yours occupies — which is exactly why they change you.'] },
    elements: { title: 'Elements', tag: "What you're made of.",
      viz: bars([{ l: 'Fire', h: 30 }, { l: 'Earth', h: 42 }, { l: 'Air', h: 55 }, { l: 'Water', h: 100, hot: true, v: '41%' }]),
      paras: ['Water leads, air follows: you feel first and articulate second, which makes your insight both deep and communicable.', 'The relative scarcity of fire means momentum comes from meaning, not adrenaline — you move when something matters, and stall when it doesn\u2019t.'] },
    modalities: { title: 'Modalities', tag: 'How you move.',
      viz: bars([{ l: 'Cardinal', h: 34 }, { l: 'Fixed', h: 26 }, { l: 'Mutable', h: 100, hot: true, v: '55%' }]),
      paras: ['Mutable energy dominates your chart. You adapt brilliantly, read the room instantly, and can hold several possible futures in mind at once.', 'The growth edge is committing to one path when several feel equally alive — decisiveness is a practiced skill for you, not a native one.'] },
    quadrants: { title: 'Quadrants', tag: 'Where your weight sits.',
      viz: bars([{ l: 'Q1 · Self', h: 100, hot: true, v: '46%' }, { l: 'Q2 · Ground', h: 50 }, { l: 'Q3 · Others', h: 36 }, { l: 'Q4 · World', h: 28 }]),
      paras: ['A first-quadrant emphasis: identity work happens on your own terms first, then radiates outward into relationship and career.', 'The sparsely populated northwest quadrant suggests public, long-horizon building is your stretch zone — private transformation comes naturally; visible structures take deliberate effort.'] },
    strength: { title: 'Planetary Influence', tag: 'Who leads the orchestra.',
      viz: bars([{ l: 'Pluto', h: 100, hot: true, v: '1st' }, { l: 'Sun', h: 82 }, { l: 'Uranus', h: 66 }, { l: 'Moon', h: 52 }, { l: 'Mercury', h: 44 }]),
      paras: ['Pluto rules your Ascendant and anchors the chart: transformation is not a phase for you, it\u2019s the engine.', 'The Sun close behind means the transformations serve a coherent self — you shed skins, but the spine underneath stays recognizably yours.'] }
  };

  const ANALYSIS = {
    identity: { title: 'Identity', chips: ['Sun quincunx Moon', 'Mercury conjunction Venus'], secs: [
      { h: null, p: 'Your birth chart reveals a steady journey towards self-discovery and self-expression, characterized by a balanced mix of challenges and harmonies that shape your unique identity. Key themes such as core identity & authentic self, self-expression & personal style, and identity development & growth emerge, offering insight into how you present yourself to the world and evolve over time.' },
      { h: 'Core Identity & Authentic Self', chips: ['Moon', 'Sun', 'Ascendant'], p: 'Your Ascendant in Scorpio and Sun in Scorpio in the 12th house underscore a deep, intense core identity that is both private and powerful. Scorpio\u2019s influence suggests you experience the world through a lens of depth, transformation, and intensity. The quincunx between your Sun and Moon introduces a subtle yet persistent tension between your inner emotional world and your external self-expression, indicating a need for ongoing adjustment and integration.' },
      { h: 'Self-Expression & Personal Style', chips: ['Mercury', 'Venus'], p: 'Mercury conjunct Venus in Sagittarius gives your self-expression warmth and candor that softens Scorpio\u2019s intensity. When you finally speak, it is both honest and graceful \u2014 people rarely forget how you phrase things.' }
    ]},
    emotional: { title: 'Emotional Foundations', chips: ['Moon in Gemini', '8th house'], secs: [
      { h: null, p: 'Your Gemini Moon in the 8th house makes feeling and naming inseparable: emotions settle only once they are articulated. Journaling, long conversations, and writing are not luxuries for you — they are emotional digestion.' },
      { h: 'Security & Home', chips: ['Moon', 'IC'], p: 'Security comes from mental companionship — someone to think aloud with. Physical place matters less than the quality of conversation inside it.' }
    ]},
    partnerships: { title: 'Partnerships', chips: ['Venus in Sagittarius', '7th house ruler'], secs: [
      { h: null, p: 'In love you pair Scorpio depth with Sagittarian candor: you want a bond that is total, but a partner who keeps the windows open. Merging and freedom are not opposites in your chart — they are the two requirements.' },
      { h: 'What You Attract', chips: ['Venus', 'South Node'], p: 'Venus near your South Node draws familiar souls — relationships that feel instantly known. The invitation is to notice when familiarity is history rather than fit.' }
    ]},
    career: { title: 'Career', chips: ['Mars in Leo', 'Midheaven'], secs: [
      { h: null, p: 'Mars conjunct your Leo Midheaven wants visible, creative work with your name on it. You lead by warmth and standard-setting, not by administration.' },
      { h: 'The Saturn Question', chips: ['Saturn in Virgo', '10th house'], p: 'Saturn in the 10th builds slowly and permanently: your reputation compounds. The platform being assembled during this Saturn cycle is the one you will stand on for two decades.' }
    ]},
    communication: { title: 'Communication', chips: ['Mercury in Sagittarius', '1st house'], secs: [
      { h: null, p: 'Mercury rising in Sagittarius: you speak rarely, then land heavily. Your words carry conviction because they arrive pre-digested — thought through in private before they are said in public.' },
      { h: 'The Growth Edge', chips: ['Mercury square Saturn'], p: 'The square from Saturn can make you over-edit — holding insights back until they are perfect. Most rooms would rather have your 80% draft now than your 100% version never.' }
    ]},
    community: { title: 'Community', chips: ['11th house', 'Uranus conjunct Ascendant'], secs: [
      { h: null, p: 'Uranus on the Ascendant marks you as the friend who arrives from outside the group\u2019s assumptions. Your role in any community is the honest mirror — the one who says what the group senses but hasn\u2019t worded.' },
      { h: 'Chosen Family', chips: ['11th house ruler'], p: 'Your communities work best small and deep — a handful of people who know the real version, rather than a wide circle that knows the summary.' }
    ]}
  };

  function wire(menuId, countId, data, key, render) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const items = menu.querySelectorAll('.pm-item');
    items.forEach((m, i) => m.addEventListener('click', () => {
      items.forEach(x => x.classList.toggle('on', x === m));
      document.getElementById(countId).textContent = (i + 1) + ' of ' + items.length;
      render(data[m.dataset[key]]);
    }));
    render(data[items[0].dataset[key]]);
  }

  wire('patMenu', 'patCount', PATTERNS, 'pat', d => {
    document.getElementById('patViz').innerHTML = d.viz;
    document.getElementById('patTitle').textContent = d.title;
    document.getElementById('patTag').innerHTML = d.tag;
    document.getElementById('patBody').innerHTML = d.paras.map(p => `<p>${p}</p>`).join('');
  });

  wire('anMenu', 'anCount', ANALYSIS, 'an', d => {
    document.getElementById('anTitle').textContent = d.title;
    document.getElementById('anChips').innerHTML = d.chips.map(c => `<span class="chip">${c}</span>`).join('');
    document.getElementById('anBody').innerHTML = d.secs.map(s =>
      (s.h ? `<div class="sec"><h3>${s.h}</h3>` : '<div>') +
      (s.chips ? `<div class="chips">${s.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : '') +
      `<p>${s.p}</p></div>`).join('');
  });
})();
