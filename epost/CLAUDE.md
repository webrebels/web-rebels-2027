# epost/ — arkiv over utsendte nyhetsbrev

Arkiv over eposter sendt til Web Rebels-lista via Mailchimp (2016–2020). Lista bor nå i Mailgun (se `netlify/functions/`); nye utsendelser føres også opp her.

## Struktur

- `emails.json` — én oppføring per utsendelse, sortert på `sentAt` stigende. Metadata er et øyeblikksbilde fra Mailchimp tatt 2026-07-11.
- Én markdown-fil per epost med selve innholdet, navngitt `YYYY-MM-DD-slug.md` (datoen er sendedatoen). `file`-feltet i emails.json peker på fila.
- Eposter som ble sendt to ganger med minutters mellomrom gikk til to segmenter (nyhetsbrevlista + tidligere deltakere) med identisk innhold — de har to oppføringer i emails.json og to filer med suffiks `1`/`2` fra Mailchimp-eksporten. Hvilket segment som fikk 1 vs. 2 er ukjent, men innholdet er likt, så det spiller ingen rolle.
- Utkast til nye eposter heter `draft-<slug>.md` og har en oppføring med `status: "draft"` i emails.json. Ved utsendelse: gi fila datoprefiks, sett `sentAt`/`recipients`, og oppdater `file`-feltet.

## Feltnotater

- `sentAt` er lokal tid Europe/Oslo, fra Mailchimps «Sent»-tidsstempel.
- `audience`: `newsletter` eller `previous-ticket-holders`. Der tittelen ikke sier det eksplisitt er verdien utledet fra mottakertall (~900–1050 ≈ tidligere deltakere, ~60–400 ≈ nyhetsbrevlista); `null` betyr ukjent/kombinert.
- `opensPct` er `null` for rene tekst-eposter (Mailchimp sporer ikke åpning uten HTML).
- `clicksPct` og `opensPct` er prosent (0–100).
