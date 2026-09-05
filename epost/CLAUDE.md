# epost/ — arkiv over utsendte nyhetsbrev

Arkiv over eposter sendt til Web Rebels-lista via Mailchimp (2016–2026). Lista bor nå i Mailgun (se `netlify/functions/`); nye utsendelser føres også opp her.

Siste utsendelse fra Mailchimp (kampanjenavn «New list») gikk 2026-09-03 til hele den gamle lista og ba folk melde seg på den nye lista. Nye påmeldinger i Mailgun dukker opp i Slack-kanalen `#mailg`.

Tall fra Mailchimp per 2026-09-05 (to dager etter utsendelse, kan fortsatt bevege seg litt):

- 1 667 mottakere, 292 bounces (17,5 %) → 1 375 levert. Den høye bounce-raten skyldes seks år gamle adresser, og Mailchimp varsler dessuten at domenet ikke er autentisert («Authenticate your domain to maintain email delivery») – sjekk SPF/DKIM for webrebels.org før eventuelle flere utsendelser fra Mailchimp.
- 347 åpnet (25,2 %), 86 klikket (6,3 %), 69 meldte seg av (5,0 %).
- Klikk på lenker: påmelding ny liste 91 (79,8 %), Sessionize-CFP 22 (19,3 %), webrebels.org 1.
- Åpninger etter land: USA 75 %, Sverige 7 %, Norge 3 % – USA-andelen er trolig proxy-/bot-åpninger (Apple Mail Privacy o.l.), ikke reelle lesere.

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
