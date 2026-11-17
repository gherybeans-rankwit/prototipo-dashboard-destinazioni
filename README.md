# Prototipo dashboard RankWit per destinazioni

Una pagina statica (`index.html`) che mostra come potrebbe essere la dashboard RankWit per una destinazione, sull'esempio di Pistoia e Montagna Pistoiese.

- **Panoramica**: quante risposte nominano il territorio su quattro scale (Italia, Toscana, provincia e dintorni, il territorio stesso) e tema per tema.
- **Mete a confronto**: le altre destinazioni nominate nelle stesse risposte, per scala e per tema.
- **Chi parla del tuo territorio**: i siti citati dagli assistenti, divisi in tre gruppi. Non sono concorrenti.
- **I tuoi luoghi**: quali luoghi del territorio vengono nominati e quali mai.
- **Domande AI**: tutte le domande, filtrabili per scala e per tema.

## Dati

Le domande sono vere. I risultati sono **numeri d'esempio, non rilevati**. Fa eccezione la sezione «Chi parla del tuo territorio», che riporta le quote del report di Visit Pistoia del 30 ottobre 2026 così come le mostra la piattaforma.

## Come si rigenera

```bash
node build.js
```

Legge `dati.js` e riscrive `index.html`. Non servono dipendenze.
