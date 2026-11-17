# Prototipo dashboard RankWit per destinazioni

Una pagina statica (`index.html`) che mostra come potrebbe essere la dashboard RankWit per una destinazione, sull'esempio di Pistoia e Montagna Pistoiese.

La pagina riprende struttura e stile della pagina «Report» di hotel.rankwit.ai (barra laterale, schede, pillole, carattere Figtree) e cambia i blocchi che per una destinazione non reggono:

- **Presenza per scala** al posto del Rank Score unico: Italia, Toscana, provincia e dintorni, più il sito citato quando il nome è nella domanda.
- **Fin dove arriva il tuo territorio**: tema per scala.
- **Mete con cui ti confrontano** al posto dei «competitor»: altre destinazioni, per scala e per tema.
- **Chi parla del tuo territorio**: i siti citati dagli assistenti, in tre gruppi. Non sono concorrenti.
- **I tuoi luoghi**: quali luoghi vengono nominati e quali mai.
- **Cosa cercano su Google**: le parole chiave con il tema, senza costo per clic.
- **Analisi prompt per prompt**: le domande raggruppate per scala.

Online: https://gherybeans-rankwit.github.io/prototipo-dashboard-destinazioni/

## Dati

Le domande sono vere. I risultati sono **numeri d'esempio, non rilevati**. Fanno eccezione «Chi parla del tuo territorio» e «Cosa cercano su Google», che riportano i valori del report di Visit Pistoia del 30 ottobre 2026 così come li mostra la piattaforma.

## Come si rigenera

```bash
npm install
```

```bash
node build.js
```

Legge `dati.js` e riscrive `index.html`. `npm install` serve una volta sola, per le icone.
