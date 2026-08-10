# Task: Ink horoscope home — implement design/ink/my-horoscope.html

Read design/briefs/_shared.md first and obey every constraint there.

Build src/pages/InkHoroscopePage.js + InkHoroscopePage.css implementing design/ink/my-horoscope.html with REAL data. This replaces the logged-in dashboard home (route /dashboard/:userId — do NOT wire the route). The mock references horoscope-paper.js which does not exist locally — all behavior comes from our real components instead.

Study first: src/pages/MainDashboard.js and the components its horoscope home uses (transit sky stage, timeline/scrubber, per-planet transit filter chips, horoscope reading fetch per period, Ask Stellium dock). Find the transit-frames hook (useTransitFrames or similar) and the horoscope APIs in src/Utilities/api.js. Reuse ALL of that logic — this task is a re-skin of the existing horoscope home into the mock's layout.

Page structure per the mock:
- InkNav variant="app" (activeSegment="home").
- Period tab bar under the nav: i. Today / ii. This Week / iii. This Month / ✳ Ask Stellium (client-side panels; roman-numeral styling like the other ink pages).
- Two-column grid (1.15fr / 0.85fr):
  LEFT — transit chart column:
  - Transit chips card: "TRANSITS" label, Reading/All mode toggle, 10 planet chips (Sun→Pluto) each with glyph + its mock --pc accent color, toggling that transiting body's lines (existing transitAspectBodies behavior).
  - Navy medallion with the REAL sky: ChartScene with natal + transitFrames + transitDate (see how the current home passes these), background="#1b2140", paused when the Ask panel is active.
  - Timeline pill: play/pause button, track with the highlighted period window, draggable/clickable cursor, date ticks across the loaded frame range, current-date label, "Now" button — reuse the existing playback/scrub state logic; restyle to the mock's pill.
  RIGHT — reading pane: card with h1 "Horoscopes <i>by Stellium</i>", uppercase date-range strip for the active period, the real horoscope paragraphs, footnote "The chart highlights only the transits discussed in this reading" (keep the existing reading-transits filtering behavior that phrase describes).
- Ask panel (replaces the grid when the Ask tab is active): h1 "Ask Stellium ✳", sub "She's read this sky. Ask her about it.", CONTEXT chips (selected transit context, removable), TRY ASKING suggestion buttons, and the REAL Ask experience via src/UI/gravityChat/GravityChatPanel.js (same inline-restyle approach as InkBirthChartPage's Ask tab; horoscope/transit context as the current home wires it), footer "✳ Included with Plus · fair use applies".

Interactions to preserve from the current home: clicking sky bodies/pills adds Ask context; hovering influence pills isolates lines; period switch refetches/retunes the window. Loading/error/empty states required. Do not modify MainDashboard or any shared file.
