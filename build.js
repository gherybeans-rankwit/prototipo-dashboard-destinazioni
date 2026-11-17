// Prototipo della dashboard RankWit per destinazioni: una pagina statica, index.html.
// Uso: node build.js   (legge dati.js, scrive index.html)
// Le domande sono vere, i risultati sono numeri d'esempio. La sezione "Chi parla del tuo territorio"
// usa invece le quote vere del report di Visit Pistoia del 30 ottobre 2026, così come le mostra la piattaforma.
const fs = require('fs');
const path = require('path');
const C = require('./dati');

// quote di menzioni e citazioni dal report del 30 ott 2026 (252 in tutto, 79 siti): valori letti in piattaforma, non ricalcolati
const FONTI = {
  data: '30 ottobre 2026', totale: 252, siti: 79,
  gruppi: [
    { k: 'tuo', nome: 'Tu e il tuo territorio', nota: 'Il tuo sito, il Comune, i musei, gli impianti, il festival, il cammino: parlano di te da dentro.', siti: [
      ['visitpistoia.eu', 23, 'Il tuo sito', true], ['comune.pistoia.it', 10, 'Comune'], ['doganaccia2000.it', 5, 'Impianti'], ['pistoiablues.com', 3, 'Festival'],
      ['pistoiamusei.it', 3, 'Musei'], ['multipassabetone.it', 2, 'Impianti'], ['ilcamminodisanjacopo.it', 2, 'Cammino'] ] },
    { k: 'enti', nome: 'Enti del turismo', nota: 'La Regione ti racconta a chi non ti conosce ancora: è un alleato da tenere allineato.', siti: [['visittuscany.com', 15, 'Regione Toscana']] },
    { k: 'altri', nome: 'Guide, enciclopedie e altri', nota: 'Tanti siti piccoli. Contano insieme, non uno per uno.', siti: [['wikipedia.org', 1, 'Enciclopedia'], ['tuscanyplanet.com', 1, 'Guida'], ['Altri 70 siti', 36, 'Guide, blog, recensioni']] },
  ],
};

const DATA = { ...C, FONTI };
const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Prototipo dashboard destinazioni | RankWit</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--f:"Plus Jakarta Sans",system-ui,sans-serif;--paper:#fff;--bg:#faf9f9;--surface:#f3f2f2;--ink:#201e1d;--muted:#636160;--line:#201e1d1f;--violet:#5b21d6;--violet-deep:#40119e;--violet-soft:#f3eefe;--violet-lilac:#c4b5fd;--pink:#ff458e;--pink-deep:#aa0b56;--pink-soft:#fff1f4;--mint:#b5f5e2;--grey:#b9b7b6}
*{box-sizing:border-box}body{margin:0;font:400 14px/1.5 "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink);background:var(--bg)}
button{font:inherit;color:inherit;cursor:pointer}
.app{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
aside{border-right:1px solid var(--line);background:var(--paper);padding:20px 14px;position:sticky;top:0;height:100vh;overflow:auto}
.site{background:var(--surface);border-radius:14px;padding:12px 14px;margin-bottom:18px}.site b{display:block}.site span{color:var(--muted);font-size:12.5px}
.nav button{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;border:0;background:none;border-radius:10px;padding:9px 12px;margin-bottom:2px}
.nav button:hover{background:var(--surface)}.nav button.on{background:var(--violet-soft);color:var(--violet-deep);font-weight:600}
.nav .new{font:600 9.5px/1 var(--f);letter-spacing:.6px;text-transform:uppercase;background:var(--violet);color:#fff;border-radius:999px;padding:3px 7px}
.side-note{margin-top:18px;font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:14px}
main{padding:28px 36px 60px;max-width:1180px;width:100%}
h1{font:700 26px/1.2 var(--f);letter-spacing:-.5px;margin:0}h2{font:700 19px/1.25 var(--f);letter-spacing:-.3px;margin:0 0 4px}
.sub{color:var(--muted);margin:4px 0 0;max-width:760px}
.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:22px}
.badge{display:inline-block;font:600 10px/1 var(--f);letter-spacing:.7px;text-transform:uppercase;border-radius:999px;padding:5px 10px;white-space:nowrap}
.badge.demo{background:var(--pink-soft);color:var(--pink-deep)}.badge.vero{background:var(--mint);color:#0b5a44}.badge.line{border:1px solid var(--line);color:var(--muted)}
.card{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:20px 22px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.kpi{font:700 40px/1 var(--f);letter-spacing:-1.2px;color:var(--violet)}.kpi.g{color:var(--ink)}
.cap{font-size:12.5px;color:var(--muted)}.eyebrow{font:600 10.5px/1.2 var(--f);letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
.track{height:10px;border-radius:999px;background:var(--surface);overflow:hidden}.track>i{display:block;height:100%;border-radius:999px;background:var(--violet)}
.track>i.g{background:var(--grey)}.track>i.p{background:var(--pink)}
section{display:none}section.on{display:block}
.stack{display:flex;flex-direction:column;gap:14px}
.chips{display:flex;gap:6px;flex-wrap:wrap}.chips button{border:1px solid var(--line);background:var(--paper);border-radius:999px;padding:6px 12px;font-size:13px}
.chips button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.hm{display:grid;grid-template-columns:170px repeat(4,1fr);gap:6px}.hm .c{border-radius:10px;padding:10px 12px;border:0;text-align:left}.hm .c b{display:block;font-size:19px;line-height:1.1}.hm .c span{font-size:11.5px;opacity:.85}
.row{display:grid;gap:12px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}
table{width:100%;border-collapse:collapse;font-size:13px}th{font:600 10.5px/1.2 var(--f);letter-spacing:.8px;text-transform:uppercase;color:var(--muted);text-align:left;padding:0 8px 8px}
td{padding:9px 8px;border-top:1px solid var(--line);vertical-align:middle}td.d,th.d{text-align:center;width:74px}
.dot{display:inline-block;width:11px;height:11px;border-radius:50%;border:1.5px solid #201e1d66}.dot.on{background:var(--violet);border-color:var(--violet)}
tr.never td:first-child{color:var(--pink-deep);font-weight:600}
td:first-child{min-width:330px}
.tag{display:inline-block;font:600 10px/1 var(--f);letter-spacing:.5px;text-transform:uppercase;background:var(--surface);color:var(--muted);border-radius:999px;padding:4px 8px;white-space:nowrap}
.mean{background:var(--violet-soft);border-radius:14px;padding:14px 18px;font-size:13.5px}.mean b{color:var(--violet-deep)}
.seg{display:flex;height:22px;border-radius:999px;overflow:hidden}.seg i{display:block;height:100%}
@media(max-width:900px){.app{grid-template-columns:1fr}aside{position:static;height:auto}.grid4,.grid2{grid-template-columns:1fr 1fr}main{padding:20px 16px}.hm{grid-template-columns:110px repeat(4,1fr)}}
</style></head><body>
<div class="app">
<aside>
  <div class="site"><b>Visit Pistoia</b><span>Pistoia e Montagna Pistoiese · destinazione</span></div>
  <div class="nav" id="nav"></div>
  <div class="side-note"><span class="badge demo">Prototipo</span><p>Le domande sono vere. I risultati sono numeri d'esempio, tranne la sezione «Chi parla del tuo territorio», che usa il report del 30 ottobre 2026.</p></div>
</aside>
<main id="main"></main>
</div>
<script>
const D = ${JSON.stringify(DATA)};
const ENG = D.assistenti, NE = ENG.length;
const LV = Object.fromEntries(D.livelli.map(l => [l.k, l])), TM = Object.fromEntries(D.temi.map(t => [t.k, t]));
const Q = D.domande.map((d, i) => { const hits = [...d.r].map(Number); return { ...d, n: i + 1, hits, sum: hits.reduce((a, b) => a + b, 0), others: d.l === 'terr' ? [] : d.o.split(',').map(s => { const [n, c] = s.split(':'); return [n, +c]; }) }; });
const stat = qs => { const a = qs.length * NE, yes = qs.reduce((s, q) => s + q.sum, 0); return { q: qs.length, a, yes, pct: a ? Math.round(yes / a * 100) : null, never: qs.filter(q => !q.sum).length }; };
const sel = (l, t) => Q.filter(q => (!l || q.l === l) && (!t || q.t === t));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const demo = '<span class="badge demo">Numeri d\\'esempio</span>';
const state = { view: 'panoramica', l: 'reg', t: '', ql: '', qt: '' };
const VIEWS = [['panoramica', 'Panoramica'], ['mete', 'Mete a confronto', 1], ['fonti', 'Chi parla del tuo territorio', 1], ['luoghi', 'I tuoi luoghi', 1], ['domande', 'Domande AI']];
const chips = (items, cur, key) => '<div class="chips">' + items.map(([k, n]) => '<button data-set="' + key + '" data-v="' + k + '" class="' + (cur === k ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
const head = (t, s, b) => '<div class="head"><div><h1>' + t + '</h1><p class="sub">' + s + '</p></div>' + (b || demo) + '</div>';
const hm = p => p === null ? ['transparent', 'var(--muted)'] : p === 0 ? ['var(--pink-soft)', 'var(--pink-deep)'] : p < 34 ? ['var(--violet-soft)', 'var(--violet-deep)'] : p < 67 ? ['var(--violet-lilac)', '#1b0b3a'] : ['var(--violet)', '#fff'];

function panoramica() {
  return head('Fin dove arriva il tuo territorio', 'Le stesse domande di un visitatore, dalla più larga alla più vicina. Nelle prime tre scale il nome della tua meta non è nella domanda.') +
  '<div class="stack"><div class="grid4">' + D.livelli.map(l => { const s = stat(sel(l.k)), terr = l.k === 'terr'; return '<div class="card"><div class="eyebrow">' + l.nome + '</div><div class="kpi' + (terr ? ' g' : '') + '" style="margin-top:10px">' + s.pct + '%</div><div class="cap" style="margin:6px 0 10px">' + s.yes + ' risposte su ' + s.a + (terr ? ' citano il tuo sito' : ' nominano un tuo luogo') + '</div><div class="track"><i class="' + (terr ? 'g' : '') + '" style="width:' + s.pct + '%"></i></div><div class="cap" style="margin-top:10px">' + s.q + ' domande · ' + l.regola.toLowerCase() + '</div></div>'; }).join('') + '</div>' +
  '<div class="card"><h2>Tema per scala</h2><p class="cap" style="margin:0 0 14px">Ogni riga si legge da destra a sinistra: fin dove arriva quel tema. Clicca una casella per vedere le mete nominate.</p><div class="hm"><div></div>' + D.livelli.map(l => '<div class="eyebrow" style="padding:0 12px 2px">' + l.nome + '</div>').join('') +
  D.temi.map(t => '<div style="display:flex;align-items:center;font-weight:600">' + t.nome + '</div>' + D.livelli.map(l => { const c = stat(sel(l.k, t.k)), [bg, fg] = hm(c.pct); return '<button class="c" ' + (l.k !== 'terr' ? 'data-go="mete" data-l="' + l.k + '" data-t="' + t.k + '"' : 'data-go="fonti"') + ' style="background:' + bg + ';color:' + fg + '"><b>' + c.pct + '%</b><span>' + c.yes + ' su ' + c.a + '</span></button>'; }).join('')).join('') + '</div></div>' +
  '<div class="mean"><b>In breve.</b> In zona ti trovano quasi sempre, in Toscana una volta su due e quasi solo per la montagna, in Italia per la neve e per il blues. Città d\\'arte, borghi e gusto si fermano prima: sono i temi da far salire di una scala.</div></div>';
}
function mete() {
  const l = state.l, rows = D.temi.filter(t => !state.t || t.k === state.t).map(t => { const qs = sel(l, t.k), c = stat(qs), m = {}; qs.forEach(q => q.others.forEach(([n, v]) => m[n] = (m[n] || 0) + v)); return { t, c, top: Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4) }; }).filter(r => r.c.q);
  return head('Mete con cui ti confrontano', 'Le altre destinazioni che gli assistenti nominano nelle stesse risposte. Sono mete, non siti: i siti che parlano di te stanno in un\\'altra sezione.') +
  '<div class="stack"><div class="card stack"><div><div class="eyebrow" style="margin-bottom:8px">Scala</div>' + chips(D.livelli.filter(x => x.k !== 'terr').map(x => [x.k, x.nome]), l, 'l') + '</div><div><div class="eyebrow" style="margin-bottom:8px">Tema</div>' + chips([['', 'Tutti'], ...D.temi.map(t => [t.k, t.nome])], state.t, 't') + '</div></div>' +
  rows.map(({ t, c, top }) => '<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><h2>' + t.nome + '</h2><span class="cap">' + c.q + (c.q === 1 ? ' domanda' : ' domande') + ' · ' + c.a + ' risposte</span></div>' +
    '<div class="row" style="grid-template-columns:220px 1fr 80px;border-top:0"><b style="color:var(--violet)">Pistoia e Montagna Pistoiese</b><div class="track"><i style="width:' + c.pct + '%"></i></div><b style="text-align:right;color:var(--violet)">' + c.yes + ' su ' + c.a + '</b></div>' +
    top.map(([n, v]) => '<div class="row" style="grid-template-columns:220px 1fr 80px"><span>' + esc(n) + '</span><div class="track"><i class="' + (v > c.yes ? 'p' : 'g') + '" style="width:' + Math.round(v / c.a * 100) + '%"></i></div><span style="text-align:right">' + v + ' su ' + c.a + '</span></div>').join('') + '</div>').join('') +
  '<p class="cap">Rosa: la meta è nominata più di te. Grigio: quanto te o meno. Le mete di confronto le confermi tu, scala per scala.</p></div>';
}
function fonti() {
  const F = D.FONTI, col = { tuo: 'var(--violet)', enti: 'var(--violet-lilac)', altri: 'var(--grey)' }, sum = g => g.siti.reduce((s, x) => s + x[1], 0);
  return head('Chi parla del tuo territorio', 'I siti che gli assistenti leggono e citano quando rispondono su Pistoia e la Montagna Pistoiese. Non sono concorrenti: sono le voci che ti raccontano.', '<span class="badge vero">Dati del report del ' + F.data + '</span>') +
  '<div class="stack"><div class="card"><div class="eyebrow" style="margin-bottom:10px">Su 100 tra menzioni e citazioni, da chi arrivano · ' + F.totale + ' in tutto, ' + F.siti + ' siti</div><div class="seg">' + F.gruppi.map(g => '<i style="width:' + sum(g) + '%;background:' + col[g.k] + '"></i>').join('') + '</div>' +
  '<div class="grid4" style="grid-template-columns:repeat(3,1fr);margin-top:14px">' + F.gruppi.map(g => '<div><div style="display:flex;gap:8px;align-items:center"><span style="width:12px;height:12px;border-radius:4px;background:' + col[g.k] + '"></span><b>' + g.nome + '</b></div><div class="kpi g" style="font-size:30px;margin:6px 0 4px">' + sum(g) + '%</div><div class="cap">' + g.nota + '</div></div>').join('') + '</div></div>' +
  F.gruppi.map(g => '<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><h2>' + g.nome + '</h2><span class="cap">somma dei siti elencati: ' + sum(g) + '%</span></div>' + g.siti.map(([n, v, tipo, me]) => '<div class="row" style="grid-template-columns:210px 190px 1fr 50px"><span style="' + (me ? 'color:var(--violet);font-weight:600' : '') + '">' + n + '</span><span class="tag" style="justify-self:start">' + tipo + '</span><div class="track"><i style="width:' + Math.round(v / 36 * 100) + '%;background:' + (me ? 'var(--violet)' : col[g.k]) + '"></i></div><b style="text-align:right">' + v + '%</b></div>').join('') + '</div>').join('') +
  '<div class="mean"><b>Come leggerla.</b> Quasi metà delle voci su di te viene dal tuo sito e da enti e operatori del territorio: Comune, musei, impianti, festival. Oggi la piattaforma li chiama «competitor». Qui la domanda è un\\'altra: dicono le stesse cose che dici tu, e rimandano al tuo sito?</div>' +
  '<div class="card"><h2>Cosa guardare per ogni voce</h2><div class="grid4" style="grid-template-columns:repeat(3,1fr);margin-top:10px"><div><b>È aggiornata?</b><div class="cap">Date, orari, prezzi di impianti ed eventi.</div></div><div><b>Nomina i luoghi giusti?</b><div class="cap">Non solo Pistoia città e Abetone.</div></div><div><b>Rimanda a te?</b><div class="cap">Un link al sito ufficiale nelle pagine più citate.</div></div></div><p class="cap" style="margin:12px 0 0">Queste tre verifiche oggi non sono in piattaforma: sono la parte da costruire.</p></div></div>';
}
function luoghi() {
  const max = Math.max(...D.luoghi.map(x => x[1])), tot = Q.length * NE;
  return head('I tuoi luoghi', 'In quante delle ' + tot + ' risposte compare ciascun luogo del territorio. Un luogo che non compare è una pagina che manca, o che nessuno cita.') +
  '<div class="card">' + D.luoghi.map(([n, v], i) => '<div class="row" style="grid-template-columns:220px 1fr 60px;' + (i ? '' : 'border-top:0') + '"><span style="' + (v ? '' : 'color:var(--pink-deep)') + '">' + n + '</span>' + (v ? '<div class="track"><i style="width:' + Math.round(v / max * 100) + '%"></i></div>' : '<span class="tag" style="justify-self:start;background:var(--pink-soft);color:var(--pink-deep)">mai nominato</span>') + '<b style="text-align:right">' + (v || '') + '</b></div>').join('') + '</div>';
}
function domande() {
  const qs = sel(state.ql, state.qt), s = stat(qs);
  return head('Domande AI', 'Tutte le domande, per scala e per tema. Pallino pieno: l\\'assistente nomina un tuo luogo. Nell\\'ultima scala: cita il tuo sito.') +
  '<div class="stack"><div class="card stack"><div><div class="eyebrow" style="margin-bottom:8px">Scala</div>' + chips([['', 'Tutte'], ...D.livelli.map(x => [x.k, x.nome])], state.ql, 'ql') + '</div><div><div class="eyebrow" style="margin-bottom:8px">Tema</div>' + chips([['', 'Tutti'], ...D.temi.map(t => [t.k, t.nome])], state.qt, 'qt') + '</div></div>' +
  '<div class="card"><p class="cap" style="margin:0 0 12px">' + s.q + ' domande · ' + s.yes + ' risposte su ' + s.a + ' · ' + s.never + ' senza di te in nessun assistente</p><table><thead><tr><th>Domanda</th><th>Scala</th><th>Tema</th>' + ENG.map(e => '<th class="d">' + e + '</th>').join('') + '<th>Chi nominano</th></tr></thead><tbody>' +
  qs.map(q => '<tr class="' + (q.sum ? '' : 'never') + '"><td>' + esc(q.q) + '</td><td><span class="tag">' + LV[q.l].nome + '</span></td><td><span class="tag">' + TM[q.t].nome + '</span></td>' + q.hits.map(h => '<td class="d"><span class="dot' + (h ? ' on' : '') + '"></span></td>').join('') + '<td class="cap">' + (q.l === 'terr' ? esc(q.o) : q.others.slice(0, 3).map(o => esc(o[0])).join(', ')) + '</td></tr>').join('') + '</tbody></table></div></div>';
}
const R = { panoramica, mete, fonti, luoghi, domande };
function render() {
  document.getElementById('nav').innerHTML = VIEWS.map(([k, n, nu]) => '<button data-go="' + k + '" class="' + (state.view === k ? 'on' : '') + '">' + n + (nu ? '<span class="new">nuovo</span>' : '') + '</button>').join('');
  document.getElementById('main').innerHTML = R[state.view]();
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.go) { state.view = b.dataset.go; if (b.dataset.l) { state.l = b.dataset.l; state.t = b.dataset.t; } window.scrollTo(0, 0); }
  else if (b.dataset.set) state[b.dataset.set] = b.dataset.v; else return;
  render();
});
render();
</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html scritto');
