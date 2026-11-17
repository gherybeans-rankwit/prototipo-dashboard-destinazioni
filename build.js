// Prototipo della dashboard RankWit per destinazioni: una pagina statica, index.html.
// Uso: npm install (una volta, per le icone) e poi node build.js   (legge dati.js, scrive index.html)
// La pagina riprende la struttura e lo stile della pagina "Report" di hotel.rankwit.ai (barra laterale, schede, pillole,
// carattere Figtree) e cambia solo quello che per una destinazione non regge.
// Numeri: le domande sono vere, gli esiti sono d'esempio. Sono VERI, dal report di Visit Pistoia del 30 ottobre 2026,
// i siti di "Chi parla del tuo territorio" e le ricerche su Google.
const fs = require('fs');
const path = require('path');
const React = require('react');
const RDS = require('react-dom/server');
const lu = require('react-icons/lu');
const C = require('./dati');
const ic = (n, s = 18) => { if (!lu[n]) throw new Error('icona ' + n); return RDS.renderToStaticMarkup(React.createElement(lu[n], { size: s, strokeWidth: 1.75 })); };

// dal report del 30 ott 2026, così come li mostra la piattaforma (252 tra menzioni e citazioni, 79 siti)
const FONTI = {
  data: '30 ottobre 2026', totale: 252, siti: 79,
  gruppi: [
    { k: 'tuo', nome: 'Tu e il tuo territorio', breve: 'da te e dal tuo territorio', siti: [
      ['visitpistoia.eu', 23, 'Il tuo sito', '59 citazioni · posizione media 5,4 tra le fonti', true], ['comune.pistoia.it', 10, 'Comune', '24 citazioni · posizione media 5,6 tra le fonti'],
      ['doganaccia2000.it', 5, 'Impianti', '12 citazioni · posizione media 13,8 tra le fonti'], ['pistoiablues.com', 3, 'Festival', '7 citazioni · posizione media 5,1 tra le fonti'],
      ['pistoiamusei.it', 3, 'Musei'], ['multipassabetone.it', 2, 'Impianti'], ['ilcamminodisanjacopo.it', 2, 'Cammino'] ] },
    { k: 'enti', nome: 'Enti del turismo', breve: 'dagli enti del turismo', siti: [['visittuscany.com', 15, 'Regione Toscana', '37 citazioni · posizione media 4,3 tra le fonti']] },
    { k: 'altri', nome: 'Guide, enciclopedie e altri', breve: 'da guide e altri siti', siti: [['wikipedia.org', 1, 'Enciclopedia'], ['tuscanyplanet.com', 1, 'Guida'], ['Altri 70 siti', 36, 'Guide, blog, recensioni']] },
  ],
};
// ricerche al mese di settembre 2026, dal blocco "Keyword" dello stesso report
const KW = [['cosa vedere a pistoia', 1300, 'arte'], ['cammino di san jacopo', 880, 'natura'], ['musei pistoia', 480, 'arte'], ['sciare abetone', 210, 'neve'], ['pistoia blues festival', 210, 'eventi'],
  ['giostra dell\'orso pistoia', 170, 'eventi'], ['piatti tipici pistoia', 90, 'gusto'], ['montagna pistoiese cosa vedere', 40, 'borghi'], ['abetone cosa fare in estate', 20, 'natura'], ['pistoia in un giorno', 10, 'arte']];
const NAV = [['LuBraces', 'Profilo del sito'], null, ['LuSparkles', 'Visibilità AI', 1], ['LuChartNoAxesCombined', 'Andamento'], ['LuSettings', 'Audit tecnico'], null, ['LuPenLine', 'Articoli'], ['LuChartScatter', 'Domande AI'], ['LuChartColumn', 'Analytics'], ['LuLink', 'Integrazioni del sito']];
const I = Object.fromEntries(['LuTarget', 'LuMapPinned', 'LuMegaphone', 'LuMapPin', 'LuSearch', 'LuMessageSquareText', 'LuLayers', 'LuChevronLeft', 'LuChevronDown', 'LuCircleHelp', 'LuPanelLeft', 'LuCheck', 'LuX'].map((n) => [n, ic(n)]));

const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Report destinazione (prototipo) | Rankwit</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--f:Figtree,system-ui,sans-serif;--ink:#1a1a1a;--muted:#6b6b6b;--line:#e5e5e5;--side:#fbfbfb;--soft:#f5f5f5;--ok:#059669;--ok-soft:#ecfdf5;--warn:#b45309;--bad:#e11d48;--bad-soft:#fff1f2}
*{box-sizing:border-box}body{margin:0;font:400 17px/1.5 var(--f);color:var(--ink);background:#fff}
button{font:inherit;color:inherit;cursor:pointer}svg{flex:none}
.app{display:grid;grid-template-columns:272px 1fr;min-height:100vh}
aside{background:var(--side);border-right:1px solid var(--line);position:sticky;top:0;height:100vh;overflow:auto;padding:14px 8px}
.back{display:flex;gap:8px;align-items:center;padding:4px 14px 16px}
.sitebox{display:flex;gap:12px;align-items:center;background:var(--soft);border-radius:14px;padding:10px 14px;margin-bottom:14px}
.logo{width:34px;height:34px;border-radius:9px;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700}
.sitebox b{display:block;font-size:16px;line-height:1.2}.sm{font-size:12.75px;color:var(--muted)}.md{font-size:14.875px}
.mk{padding:6px 14px 12px;border-bottom:1px solid var(--line);margin-bottom:14px}
.nav div{display:flex;gap:10px;align-items:center;padding:9px 14px;border-radius:10px}.nav div.on{background:var(--soft)}.nav i{display:block;height:22px}
.top{height:59px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:36px;padding:0 30px;position:sticky;top:0;background:#fff;z-index:5}
.top .org{display:flex;gap:8px;align-items:center;font-weight:500}.top .help{margin-left:auto;display:flex;gap:6px;align-items:center}
.wrap{max-width:928px;margin:0 auto;padding:26px 30px 80px}
.crumb{display:flex;justify-content:space-between;color:var(--muted);margin-bottom:60px}.crumb b{color:var(--ink);font-weight:400}
h1{font:700 31.875px/1.2 var(--f);letter-spacing:-.5px;margin:0}.lead{color:var(--muted);margin:8px 0 24px}
.card{border:1px solid var(--line);border-radius:20px;padding:24px 26px;margin-bottom:24px}
.h{display:flex;gap:9px;align-items:center;font-size:17px;font-weight:500}.h .n{color:var(--muted);font-weight:400;font-size:14.875px}
.hs{font-size:12.75px;color:var(--muted);margin:6px 0 16px}
.flag{margin-left:auto;font-size:11.5px;font-weight:400;border-radius:999px;padding:2px 9px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}.flag.v{border-color:#a7f3d0;background:var(--ok-soft);color:#047857}
.pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:center}.pills button{border:0;background:var(--soft);border-radius:8px;padding:4px 11px;font-size:14px;color:#444}.pills button.on{background:#262626;color:#fff}.pills .lab{font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);margin-right:4px;width:48px}
.cap{font-size:14.875px;color:var(--muted);letter-spacing:.3px;margin:14px 0 8px}
.rowc{border:1px solid var(--line);border-radius:10px;padding:13px 14px;margin-bottom:10px}.rowc.tu{background:var(--soft);border-color:#d4d4d4}
.rowc .l1{display:flex;gap:10px;align-items:baseline}.rowc .nm{font-weight:500}.rowc .big{margin-left:auto;font-weight:600;text-align:right;line-height:1.1}.rowc .big small{display:block;font-weight:400;font-size:11px;color:var(--muted)}
.chip{font-size:11.5px;border:1px solid #cfcfcf;border-radius:999px;padding:1px 9px;white-space:nowrap;color:#444;background:#fff}
.bar{height:4px;border-radius:999px;background:var(--soft);margin-top:10px;overflow:hidden}.bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#0f766e,#10b981 60%,#0ea5e9)}.bar i.g{background:#a3a3a3}.bar i.r{background:var(--bad)}
.two{display:grid;grid-template-columns:1fr 320px;gap:26px;align-items:start}
.donut{width:190px;height:190px;border-radius:50%;margin:14px auto 18px;position:relative}.donut:after{content:"";position:absolute;inset:30px;background:#fff;border-radius:50%}
.donut div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1;text-align:center}.donut b{font-size:29px;line-height:1.1}.donut span{font-size:11.5px;color:var(--muted);max-width:104px;line-height:1.25}
.leg{display:grid;grid-template-columns:14px 1fr auto;gap:5px 6px;align-items:center;font-size:14px}.leg i{width:10px;height:10px;border-radius:50%}.leg b{font-weight:600}.leg em{font-style:normal;color:var(--muted)}
.foot{border-top:1px solid var(--line);margin-top:14px;padding-top:12px;text-align:center;font-size:13px;color:var(--muted)}
.score{display:flex;gap:26px;justify-content:flex-end}.score div{text-align:right}.score b{display:block;font:700 44px/1 var(--f);letter-spacing:-1.5px}.score small{font-size:12.75px;color:var(--muted)}
.dotl{display:inline-flex;gap:6px;align-items:center;font-size:12px;margin-left:6px}.dotl i{width:8px;height:8px;border-radius:50%;display:inline-block}
ul.br{margin:10px 0 0;padding-left:22px}ul.br li{margin-bottom:5px}ul.br li::marker{color:#a3a3a3}
.hm{display:grid;grid-template-columns:150px repeat(4,1fr);gap:6px;font-size:14px}.hm .hd{font-size:12.75px;color:var(--muted);padding:0 10px 2px;align-self:end}.hm button{border:1px solid transparent;border-radius:10px;padding:8px 10px;text-align:left;line-height:1.2}.hm button b{display:block;font-size:17px}.hm button span{font-size:12px;opacity:.8}.hm button:hover{border-color:#a3a3a3}
table{width:100%;border-collapse:collapse}td,th{padding:11px 12px;border-top:1px solid var(--line);text-align:left;font-weight:400}th{font-size:12.75px;color:var(--muted);border-top:0}td.r,th.r{text-align:right}
.tbl{border:1px solid var(--line);border-radius:10px;overflow:hidden}
.q{border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:10px}.q h3{font:600 17px/1.3 var(--f);margin:0 0 8px}.q .chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.e{font-size:13.5px;border-radius:6px;padding:1px 8px;display:inline-flex;gap:5px;align-items:center;border:1px solid #a7f3d0;background:var(--ok-soft);color:#065f46}.e.no{border-color:#fecdd3;background:var(--bad-soft);color:#9f1239}.e svg{width:13px;height:13px}
.note{background:var(--soft);border-radius:12px;padding:12px 16px;font-size:14.875px;margin-top:14px}
.proto{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 16px;font-size:14px;margin-bottom:24px;color:#78350f}
.via{display:grid;grid-template-columns:150px 1fr 190px;gap:16px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}.via.hd{border-top:0;padding:0 0 6px}
.strada{display:grid;grid-template-columns:repeat(4,1fr);position:relative}.via.hd .strada span{font-size:12.75px;color:var(--muted);text-align:center}
.stop{border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;font-size:12px;color:var(--muted)}
.stop i{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #d4d4d4;position:relative;z-index:1}.stop.on i{background:var(--ok);border-color:var(--ok)}.stop.casa i{background:#262626;border-color:#262626}
.stop:before{content:"";position:absolute;top:8px;right:50%;width:100%;height:3px;background:#e5e5e5}.stop.on:before{background:var(--ok)}.stop.casa:before{display:none}
.stop small{font-size:12px}.stop.casa{padding-bottom:22px}button.stop:hover i{box-shadow:0 0 0 4px #0000000f}
.esito{font-size:14.875px;font-weight:600;text-align:right}
@media(max-width:1000px){.via{grid-template-columns:90px 1fr}.esito{grid-column:1/-1;text-align:left}}
@media(max-width:1000px){.app{grid-template-columns:1fr}aside{display:none}.two{grid-template-columns:1fr}.crumb{margin-bottom:24px}.score b{font-size:32px}.hm{grid-template-columns:96px repeat(4,1fr)}}
</style></head><body>
<div class="app">
<aside>
  <div class="back">${I.LuChevronLeft} I tuoi siti</div>
  <div class="sitebox"><div class="logo">P</div><div><b>Visit Pistoia</b><span class="sm">visitpistoia.eu</span></div></div>
  <div class="mk"><div class="sm" style="margin-bottom:6px">Stai guardando</div><div style="display:flex;align-items:center"><div><div style="line-height:1.2">Italia</div><div class="sm" style="font-size:11.5px">Italiano</div></div><span class="chip" style="margin-left:auto;border:0;background:var(--soft)">1 report</span></div></div>
  <div class="nav">${NAV.map((n) => n ? `<div class="${n[2] ? 'on' : ''}">${ic(n[0], 17)} ${n[1]}</div>` : '<i></i>').join('')}</div>
</aside>
<div>
  <div class="top">${I.LuPanelLeft}<div class="org">Rankwit Internal ${I.LuChevronDown}</div><div class="help">${I.LuCircleHelp} Aiuto</div></div>
  <div class="wrap" id="main"></div>
</div>
</div>
<script>
const D = ${JSON.stringify({ ...C, FONTI, KW })}, I = ${JSON.stringify(I)};
const ENG = D.assistenti, NE = ENG.length;
const LV = Object.fromEntries(D.livelli.map(l => [l.k, l])), TM = Object.fromEntries(D.temi.map(t => [t.k, t]));
const Q = D.domande.map((d, i) => { const hits = [...d.r].map(Number); return { ...d, hits, sum: hits.reduce((a, b) => a + b, 0), others: d.l === 'terr' ? [] : d.o.split(',').map(s => { const [n, c] = s.split(':'); return [n, +c]; }) }; });
const stat = qs => { const a = qs.length * NE, yes = qs.reduce((s, q) => s + q.sum, 0); return { q: qs.length, a, yes, pct: a ? Math.round(yes / a * 100) : null }; };
const sel = (l, t) => Q.filter(q => (!l || q.l === l) && (!t || q.t === t));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const PAL = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#84cc16', '#3b82f6', '#a855f7', '#f97316', '#94a3b8'];
const st = { l: 'reg', t: 'arte', ql: 'reg' };
const tone = p => p >= 67 ? 'var(--ok)' : p >= 34 ? 'var(--warn)' : 'var(--bad)';
const ex = '<span class="flag">Numeri d\\'esempio</span>', vero = '<span class="flag v">Dato vero · report del ' + D.FONTI.data + '</span>';
const pills = (lab, items, cur, key) => '<div class="pills"><span class="lab">' + lab + '</span>' + items.map(([k, n]) => '<button data-set="' + key + '" data-v="' + k + '" class="' + (cur === k ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
const donut = (parts, big, small) => { let a = 0; const g = parts.map(([v, c]) => c + ' ' + a + '% ' + (a += v) + '%').join(','); return '<div class="donut" style="background:conic-gradient(' + g + ')"><div><b>' + big + '</b><span>' + small + '</span></div></div>'; };

function intestazione() {
  const s = k => stat(sel(k)), fuori = stat(Q.filter(q => q.l !== 'terr'));
  return '<div class="crumb"><span>I tuoi siti / Visit Pistoia / <b>30 ottobre 2026</b></span><span>‹ Torna allo storico</span></div>' +
  '<h1>Report GEO Pistoia e Montagna Pistoiese, Toscana</h1><p class="lead">Quando la domanda non contiene il tuo nome, un luogo del tuo territorio compare in ' + fuori.yes + ' risposte AI su ' + fuori.a + '.</p>' +
  '<div class="proto"><b>Prototipo per le destinazioni.</b> È la pagina del report di oggi, con i blocchi cambiati dove per una destinazione non reggono. Le domande sono vere; gli esiti sono numeri d\\'esempio dove indicato.</div>' +
  '<div class="card"><div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap"><div class="logo" style="width:60px;height:60px;border-radius:14px;font-size:26px">P</div><div style="min-width:170px"><div style="font:600 21px/1.4 var(--f)">Visit Pistoia</div><div class="md" style="color:var(--muted)">visitpistoia.eu</div><div class="md" style="color:var(--muted);margin-top:4px">Toscana · destinazione</div></div>' +
  '<div style="flex:1;min-width:380px"><div class="md" style="font-weight:500;margin-bottom:6px;display:flex;justify-content:flex-end;gap:10px;align-items:center">Presenza per scala <span class="flag" style="margin-left:0">Numeri d\\'esempio</span></div><div class="score">' + ['it', 'reg', 'prov'].map(k => '<div><b style="color:' + tone(s(k).pct) + '">' + s(k).pct + '%</b><small>' + LV[k].nome + '</small></div>').join('') + '<div style="border-left:1px solid var(--line);padding-left:24px"><b style="color:#525252">' + s('terr').pct + '%</b><small>sito citato</small></div></div>' +
  '<div class="sm" style="text-align:right;margin-top:10px">Su 100 risposte, in quante compare un luogo del tuo territorio. Nelle prime tre scale la domanda non contiene il tuo nome. Basato su ' + Q.length + ' domande e ' + NE + ' assistenti AI.</div></div></div></div>';
}
function inBreve() {
  const d = (c, t) => '<span class="dotl" style="color:' + c + '"><i style="background:' + c + '"></i>' + t + '</span>';
  const ra = stat(sel('reg', 'arte')), lu = sel('reg', 'arte').reduce((s, q) => s + (q.others.find(o => o[0] === 'Lucca') || [0, 0])[1], 0);
  return '<div class="card"><div class="h" style="font-size:14.875px;font-weight:600">In breve ' + ex + '</div><ul class="br">' +
  '<li>In provincia e dintorni un tuo luogo compare nel <b>' + stat(sel('prov')).pct + '%</b> delle risposte' + d('var(--ok)', 'Bene') + '</li>' +
  '<li>In Toscana nel <b>' + stat(sel('reg')).pct + '%</b>: sempre per la neve, mai per il gusto</li>' +
  '<li>Sulle città d\\'arte in Toscana gli assistenti nominano <b>Lucca</b> in ' + lu + ' risposte su ' + ra.a + ', Pistoia in ' + ra.yes + d('var(--bad)', 'Critico') + '</li>' +
  '<li>Quando la domanda ha il tuo nome, <b>visitpistoia.eu</b> è citato nel ' + stat(sel('terr')).pct + '% delle risposte</li></ul></div>';
}
function scala() {
  // per ogni tema: si parte da casa e ci si allontana. Una tappa è "raggiunta" se ti nominano in almeno 1 risposta su 3
  const tappe = ['prov', 'reg', 'it'], nomi = { prov: 'Provincia e dintorni', reg: 'Toscana', it: 'Italia' };
  const righe = D.temi.map(t => { const c = tappe.map(k => stat(sel(k, t.k))); let fin = -1; c.forEach((x, i) => { if (x.pct >= 34 && fin === i - 1) fin = i; }); return { t, c, fin }; }).sort((x, y) => y.fin - x.fin);
  const esito = f => f === 2 ? ['Arriva in tutta Italia', 'var(--ok)'] : f === 1 ? ['Si ferma in Toscana', 'var(--warn)'] : f === 0 ? ['Si ferma in provincia', 'var(--bad)'] : ['Non esce dal territorio', 'var(--bad)'];
  return '<div class="card"><div class="h">' + I.LuLayers + ' Fin dove arriva il tuo territorio ' + ex + '</div><p class="hs">Parti da casa tua e allontanati. Per ogni tema, la linea verde arriva fin dove gli assistenti ti nominano ancora quando la domanda non contiene il tuo nome.</p>' +
  '<div class="via hd"><div></div><div class="strada"><span>Casa tua</span>' + tappe.map(k => '<span>' + nomi[k] + '</span>').join('') + '</div><div></div></div>' +
  righe.map(({ t, c, fin }) => { const [txt, col] = esito(fin); return '<div class="via"><div style="font-weight:500">' + t.nome + '</div><div class="strada"><span class="stop on casa"><i></i></span>' +
    c.map((x, i) => '<button class="stop' + (i <= fin ? ' on' : '') + '" data-jump="mete" data-l="' + tappe[i] + '" data-t="' + t.k + '"><i></i><small>' + x.yes + ' su ' + x.a + '</small></button>').join('') +
    '</div><div class="esito" style="color:' + col + '">' + txt + '</div></div>'; }).join('') +
  '<p class="sm" style="margin:14px 0 0">Una tappa è raggiunta quando ti nominano in almeno una risposta su tre. Sotto ogni tappa: in quante risposte compare un tuo luogo. Clicca una tappa per vedere chi nominano al posto tuo.</p></div>';
}
function mete() {
  const qs = sel(st.l, st.t), c = stat(qs), m = {}; qs.forEach(q => q.others.forEach(([n, v]) => m[n] = (m[n] || 0) + v));
  const top = Object.entries(m).sort((a, b) => b[1] - a[1]), tot = c.yes + top.slice(0, 6).reduce((s, x) => s + x[1], 0) || 1;
  const temi = D.temi.filter(t => sel(st.l, t.k).length).map(t => [t.k, t.nome]);
  const row = (n, v, me) => '<div class="rowc' + (me ? ' tu' : '') + '"><div class="l1"><span class="nm">' + esc(n) + '</span>' + (me ? '<span class="chip">La tua destinazione</span>' : '') + '<span class="big">' + v + '<small>risposte su ' + c.a + '</small></span></div><div class="bar"><i class="' + (me ? '' : v > c.yes ? 'r' : 'g') + '" style="width:' + Math.round(v / c.a * 100) + '%"></i></div></div>';
  return '<div class="card" id="mete"><div class="h">' + I.LuMapPinned + ' Mete con cui ti confrontano <span class="n">' + top.length + '</span>' + ex + '</div><p class="hs">Le altre destinazioni che gli assistenti nominano nelle stesse risposte. Qui ci sono solo luoghi: i siti stanno nel blocco sotto.</p>' +
  pills('Scala', D.livelli.filter(x => x.k !== 'terr').map(x => [x.k, x.nome]), st.l, 'l') + pills('Tema', temi, st.t, 't') +
  '<div class="two" style="margin-top:14px"><div><div class="cap" style="margin-top:0">TU</div>' + row('Pistoia e Montagna Pistoiese', c.yes, true) + '<div class="cap">ALTRE METE</div>' + top.slice(0, 5).map(([n, v]) => row(n, v)).join('') + '<div class="sm">Barra rossa: nominata più di te. Grigia: quanto te o meno.</div></div>' +
  '<div><div style="text-align:center;font-weight:500">Distribuzione</div>' + donut([[c.yes / tot * 100, PAL[0]], ...top.slice(0, 6).map(([n, v], i) => [v / tot * 100, PAL[i + 1]])], c.yes + ' su ' + c.a, 'risposte che ti nominano') +
  '<div class="leg"><i style="background:' + PAL[0] + '"></i><b>Pistoia e Montagna P.</b><b>' + c.yes + '</b>' + top.slice(0, 6).map(([n, v], i) => '<i style="background:' + PAL[i + 1] + '"></i><span>' + esc(n) + '</span><em>' + v + '</em>').join('') + '</div><div class="foot">' + c.q + (c.q === 1 ? ' domanda' : ' domande') + ' · ' + c.a + ' risposte · ' + LV[st.l].nome + '</div></div></div></div>';
}
function fonti() {
  const F = D.FONTI, GC = { tuo: '#10b981', enti: '#f59e0b', altri: '#94a3b8' }, sum = g => g.siti.reduce((s, x) => s + x[1], 0);
  const row = (g, [n, v, tipo, det, me]) => '<div class="rowc' + (me ? ' tu' : '') + '"><div class="l1"><span class="nm">' + n + '</span><span class="chip">' + tipo + '</span><span class="big">' + v + '%<small>delle menzioni e citazioni</small></span></div>' + (det ? '<div class="sm" style="margin-top:2px">' + det + ' (1 = prima fonte)</div>' : '') + '<div class="bar"><i style="width:' + Math.round(v / 36 * 100) + '%;background:' + GC[g.k] + '"></i></div></div>';
  return '<div class="card" id="fonti"><div class="h">' + I.LuMegaphone + ' Chi parla del tuo territorio <span class="n">' + F.totale + '</span>' + vero + '</div><p class="hs">I siti che gli assistenti leggono e citano quando rispondono su di te. Non sono concorrenti: sono le voci che ti raccontano.</p>' +
  '<div class="two"><div>' + F.gruppi.map((g, i) => '<div class="cap"' + (i ? '' : ' style="margin-top:0"') + '>' + g.nome.toUpperCase() + '</div>' + g.siti.map(s => row(g, s)).join('')).join('') + '</div>' +
  '<div><div style="text-align:center;font-weight:500">Distribuzione</div>' + donut(F.gruppi.map(g => [sum(g), GC[g.k]]), sum(F.gruppi[0]) + '%', F.gruppi[0].breve) +
  '<div class="leg">' + F.gruppi.map(g => '<i style="background:' + GC[g.k] + '"></i><b>' + g.nome + '</b><b>' + sum(g) + '%</b>' + g.siti.map(([n, v]) => '<i></i><span>' + n + '</span><em>' + v + '%</em>').join('')).join('') + '</div><div class="foot">' + F.siti + ' siti · ' + F.totale + ' tra menzioni e citazioni</div></div></div>' +
  '<div class="note"><b>Come leggerlo.</b> Quasi metà delle voci su di te viene dal tuo sito e da chi lavora sul territorio: Comune, musei, impianti, festival. Per ciascuna contano tre cose: se è aggiornata, se nomina i luoghi giusti, se rimanda a te. <span class="sm">Queste tre verifiche oggi non sono in piattaforma.</span></div></div>';
}
function luoghi() {
  const max = Math.max(...D.luoghi.map(x => x[1]));
  return '<div class="card"><div class="h">' + I.LuMapPin + ' I tuoi luoghi <span class="n">' + D.luoghi.length + '</span>' + ex + '</div><p class="hs">In quante delle ' + Q.length * NE + ' risposte compare ciascun luogo del territorio.</p><div class="tbl"><table>' +
  D.luoghi.map(([n, v]) => '<tr><td style="width:240px">' + n + '</td><td>' + (v ? '<div class="bar" style="margin:0;height:6px"><i style="width:' + Math.round(v / max * 100) + '%"></i></div>' : '<span class="e no">mai nominato</span>') + '</td><td class="r" style="width:70px;font-weight:600">' + (v || '') + '</td></tr>').join('') + '</table></div></div>';
}
function keyword() {
  return '<div class="card"><div class="h">' + I.LuSearch + ' Cosa cercano su Google <span class="n">' + D.KW.length + '</span>' + vero + '</div><p class="hs">Le ricerche al mese sulle parole che riguardano il tuo territorio, con il tema a cui appartengono. Senza costo per clic: una destinazione non compra annunci su queste parole.</p><div class="tbl"><table><tr><th>Keyword</th><th>Tema</th><th class="r">Ricerche set 2026</th></tr>' +
  D.KW.map(([k, v, t]) => '<tr><td>' + esc(k) + '</td><td><span class="chip">' + TM[t].nome + '</span></td><td class="r">' + v.toLocaleString('it-IT') + '</td></tr>').join('') + '</table></div></div>';
}
function domande() {
  const qs = sel(st.ql), terr = st.ql === 'terr';
  return '<div class="card" id="domande"><div class="h">' + I.LuMessageSquareText + ' Analisi prompt per prompt <span class="n">' + Q.length + '</span>' + ex + '</div><p class="hs">Come ogni assistente AI risponde, scala per scala: se nomina il tuo territorio e chi nomina insieme a te.</p>' +
  pills('Scala', D.livelli.map(x => [x.k, x.nome + ' · ' + sel(x.k).length]), st.ql, 'ql') +
  '<div style="margin-top:14px">' + qs.map(q => '<div class="q"><h3>' + esc(q.q) + '</h3><div class="chips"><span class="chip">' + (terr ? 'Con il nome della meta' : 'Senza il nome della meta') + '</span><span class="chip">' + TM[q.t].nome + '</span></div><div class="chips">' + q.hits.map((h, i) => '<span class="e' + (h ? '' : ' no') + '">' + ENG[i] + ' ' + (h ? I.LuCheck : I.LuX) + '</span>').join('') + '</div><div class="md" style="color:var(--muted)">' + q.sum + ' assistenti AI su ' + NE + (terr ? ' citano il tuo sito · fonte più citata: ' + esc(q.o) : ' ti nominano · nominano anche: ' + q.others.slice(0, 3).map(o => esc(o[0])).join(', ')) + '</div></div>').join('') + '</div></div>';
}
function render(keep) {
  const y = scrollY;
  document.getElementById('main').innerHTML = intestazione() + inBreve() + scala() + mete() + fonti() + luoghi() + keyword() + domande();
  if (keep) scrollTo(0, y);
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.set) { st[b.dataset.set] = b.dataset.v; if (b.dataset.set === 'l' && !sel(st.l, st.t).length) st.t = D.temi.find(t => sel(st.l, t.k).length).k; render(true); }
  else if (b.dataset.jump) { if (b.dataset.l) { st.l = b.dataset.l; st.t = b.dataset.t; } render(true); document.getElementById(b.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
render();
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html scritto');
