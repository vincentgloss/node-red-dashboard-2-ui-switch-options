# Switch Options – Optionsumschalter für FlowFuse Dashboard

Ein Widget für [FlowFuse Dashboard 2.0](https://dashboard.flowfuse.com/), das Dashboard für Node-RED, das mit den Buttons **zurück** und **weiter** durch eine Liste von Optionen schaltet. Bei jedem Umschalten wird der Wert der gewählten Option in den Flow gesendet.

[English](README.md) | **Deutsch**

![Eine Dashboard-Gruppe mit drei Optionsumschaltern: „Heating mode“ zeigt „Off“, „Temperature“ mit Minus- und Plus-Button zeigt „22 °C“, „Color“ mit transparenten Buttons zeigt „Blue“](https://raw.githubusercontent.com/vincentgloss/node-red-dashboard-2-ui-switch-options/main/docs/dashboard-example.png)

## Voraussetzungen

| Software | Version |
|---|---|
| Node-RED | 3.0 oder neuer |
| FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) | 1.23 oder neuer |

## Installation

**Im Node-RED-Editor (empfohlen):** Menü öffnen, **Palette verwalten** wählen, zum Reiter **Installieren** wechseln, nach `@vincentgloss/node-red-dashboard-2-ui-switch-options` suchen und **Installieren** klicken.

**Über die Kommandozeile:** im Node-RED-Benutzerverzeichnis (meist `~/.node-red`) ausführen und Node-RED danach neu starten:

```sh
npm install @vincentgloss/node-red-dashboard-2-ui-switch-options
```

## Schnellstart

1. **switch option** aus dem Bereich *Dashboard 2* der Palette in den Flow ziehen.
2. Eine **Gruppe** wählen, ein paar **Optionen** (Beschriftung und Wert) anlegen und deployen.
3. Einen Debug-Node an den Ausgang hängen und im Dashboard umschalten.

Eine fertige Demo ist dabei: **Importieren → Beispiele → @vincentgloss/node-red-dashboard-2-ui-switch-options → switch-options-demo**. Sie öffnet sich unter `/switch-options-demo` und hat für jede Eingabe einen Inject-Node.

## Einstellungen

Oben im Editor zeigt eine **Vorschau** das Widget mit den aktuellen Einstellungen und den Farben aus dem Theme der Gruppe. Mit ihren Buttons blätterst du durch die Optionen. An der rechten unteren Ecke lässt sie sich schmaler ziehen, um zu sehen, wie sich langer Text in einem schmalen Widget verhält. Die Einstellungen sind auf die Tabs *Optionen* und *Darstellung* verteilt.

| Feld | Beschreibung |
|---|---|
| **Gruppe**, **Größe** | Wo das Widget erscheint und wie viel Platz es einnimmt. |
| **Beschriftung** | Optionaler Text über dem Widget. HTML ist erlaubt. |
| **Optionen** | Die Liste zum Durchschalten. Jede Option hat eine Beschriftung (angezeigt, HTML erlaubt) und einen Wert (gesendet). Der Wert kann Text, eine Zahl, ein Boolean oder JSON sein. Ohne Beschriftung wird der Wert angezeigt. |
| **Nach der letzten Option wieder bei der ersten beginnen** | Standardmäßig an. Ohne Haken bleiben die Buttons bei der ersten und der letzten Option stehen. |
| **Nachricht senden, wenn eine Eingabe-Nachricht eine Option wählt** | Bei neuen Nodes aus. Aus lassen, wenn das Widget nur einen Zustand anzeigt, damit keine Nachricht im Kreis läuft. |
| **Layout** | *Zentriert*: Der Text ist so breit wie die längste Option, die Buttons stehen direkt daneben. *Buttons am Rand*: Die Buttons stehen links und rechts am Rand, der Text nutzt den Platz dazwischen. In beiden Fällen bleiben die Buttons beim Umschalten an ihrer Stelle. |
| **Langer Text** | *Umbrechen*: höchstens 2 Zeilen, dann „…“. *Verkleinern*: Die Schrift wird für alle Optionen gleich so weit kleiner, dass sie in eine Zeile passen (höchstens bis 14 px), danach wie *Umbrechen*. *Eine Zeile*: sofort „…“. Gekürzter Text erscheint vollständig als Tooltip. |
| **Icon zurück**, **Icon weiter** | Auswahl mit passenden Vorschlägen und Suche über alle [Material Design Icons](https://pictogrammers.com/library/mdi/) des installierten Dashboards. Standard: `chevron-double-left` und `chevron-double-right`. |
| **Icon-Größe** | **S** (18 px, Standard), **M** (24 px) oder **L** (32 px), oder eine eigene Größe in Pixeln. |
| **Icon-Farbe**, **Button-Farbe** | Eine Farbe aus der Palette, eine eigene über die Pipette, oder im Textfeld ein Wert wie `#AEEA00` oder ein [Farbname](https://vuetifyjs.com/en/styles/colors/) wie `teal`. *Standard* nutzt das Theme. Die Button-Farbe kann auch *Transparent* sein (kein Hintergrund, kein Schatten). Ohne eigene Icon-Farbe ist das Icon auf transparenten Buttons in der Theme-Farbe und auf hellen Buttons dunkel. |
| **Ecken** | Rundung der Buttons: *Eckig* (0 px), *Standard* (4 px), *Abgerundet* (12 px), *Rund* (24 px) oder ein eigener Radius in Pixeln. |

## Steuern aus dem Flow

Zuerst werden `msg.options` und `msg.ui_update` angewendet, danach wird eine Option gewählt: über `msg.index`, sonst über `msg.step`, sonst über `msg.payload`.

| Eigenschaft | Wirkung |
|---|---|
| `msg.payload` | Wählt die Option mit diesem Wert. Text und Zahlen passen zueinander (`1` wählt `"1"`, `"true"` wählt `true`), Objekte passen zu Optionen mit gleichem JSON. Passt nichts, zeigt der Node eine Warnung und nichts ändert sich. |
| `msg.index` | Wählt die Option an dieser Position, beginnend bei 0. |
| `msg.step` | Geht um so viele Optionen weiter: `1` ist weiter, `-1` zurück. Bleibt an den Enden stehen, wenn *wieder bei der ersten beginnen* aus ist. |
| `msg.options` | Ersetzt die Optionen. Einfache Werte wie `["Aus","An"]` oder `[18,20,22]`, oder Objekte wie `[{"label":"Aus","value":"off"}]`. Die aktuelle Option bleibt gewählt, wenn sie noch in der Liste ist, sonst die erste. |
| `msg.ui_update` | Ändert `label`, `prevIcon`, `nextIcon`, `iconColor`, `iconSize`, `buttonColor` oder `buttonRadius`, z. B. `{"label":"Modus","buttonColor":"red"}`. `null` stellt die Einstellung aus dem Editor wieder her. `class` fügt CSS-Klassen hinzu. |
| `msg.enabled` | `false` sperrt die Buttons, `true` gibt sie wieder frei. |
| `msg.visible` | `false` blendet das Widget aus, `true` wieder ein. |
| `msg.class` | Fügt dem Widget CSS-Klassen hinzu. |

Alle offenen Dashboards zeigen immer dieselbe Option und dasselbe Aussehen, auch nach einem Neuladen. Nach einem Deploy startet das Widget wieder mit den Optionen und dem Aussehen aus dem Editor und behält die gewählte Option, wenn sie dort noch vorkommt.

## Ausgabe

Eine Nachricht wird gesendet, wenn jemand im Dashboard umschaltet, und wenn eine Eingabe-Nachricht eine Option wählt, sofern *Nachricht senden, wenn eine Eingabe-Nachricht eine Option wählt* angehakt ist:

```json
{ "payload": "comfort", "label": "Comfort", "index": 2 }
```

| Eigenschaft | Inhalt |
|---|---|
| `payload` | Der Wert der gewählten Option, mit seinem Typ (Text, Zahl, Boolean oder JSON). |
| `label` | Die Beschriftung der gewählten Option. |
| `index` | Die Position der gewählten Option, beginnend bei 0. |
| `topic` | Aus der Eingabe-Nachricht übernommen, falls sie eins hatte. |
| `_client` | Welcher Dashboard-Client umgeschaltet hat, wenn *Include client data* in den Dashboard-Einstellungen aktiv ist. |

## Umstieg von 1.0

Bestehende Nodes verhalten sich wie bisher: Sie senden weiterhin eine Nachricht, wenn eine Eingabe-Nachricht eine Option wählt, und beginnen nach der letzten Option wieder bei der ersten. Im Editor sind beide Einstellungen angehakt. Werte aus 1.0 bleiben Text.

- Die Ausgabe nach einer Eingabe-Nachricht hat jetzt dieselbe Form wie nach einem Umschalten im Dashboard: `payload`, `label` und `index`. `currentIndex`, `options` und das feste Topic `ui-switch-options-update` entfallen.
- Ein unbekannter `msg.payload` erzeugt jetzt eine Node-Warnung, statt `"Option not found in options array"` mit Topic `error` zu senden.

## Entwicklung

```sh
npm install
npm run build      # baut resources/ui-switch-options.umd.js
npm run dev        # baut bei jeder Änderung neu, mit Source Map
npm run lint
```

Um eine lokale Änderung auszuprobieren, im Node-RED-Benutzerverzeichnis `npm install /pfad/zu/node-red-dashboard-2-ui-switch-options` ausführen und Node-RED neu starten.

## Lizenz

[Apache-2.0](LICENSE)
