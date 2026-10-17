# Switch Options – Optionsumschalter für FlowFuse Dashboard

Ein Widget für [FlowFuse Dashboard 2.0](https://dashboard.flowfuse.com/), das Dashboard für Node-RED, das mit den Buttons **zurück** und **weiter** durch eine Liste von Optionen schaltet. Bei jedem Umschalten wird der Wert der gewählten Option in den Flow gesendet.

[English](README.md) | **Deutsch**

![Eine Dashboard-Gruppe mit zwei Optionsumschaltern: „Heating mode“ zeigt „Comfort“, „Color“ mit transparenten Buttons zeigt „Red“](https://raw.githubusercontent.com/vincentgloss/node-red-dashboard-2-ui-switch-options/main/docs/dashboard-example.png)

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

Eine fertige Demo ist dabei: **Importieren → Beispiele → @vincentgloss/node-red-dashboard-2-ui-switch-options → switch-options-demo**. Sie öffnet sich unter `/switch-options-demo`.

## Einstellungen

| Feld | Beschreibung |
|---|---|
| **Gruppe**, **Größe** | Wo das Widget erscheint und wie viel Platz es einnimmt. |
| **Beschriftung** | Optionaler Text über dem Widget. HTML ist erlaubt. |
| **Optionen** | Die Liste zum Durchschalten. Jede Option hat eine Beschriftung (angezeigt, HTML erlaubt) und einen Wert (gesendet). Ohne Beschriftung wird der Wert angezeigt. |
| **Icon zurück**, **Icon weiter** | Name eines [Material Design Icons](https://pictogrammers.com/library/mdi/) ohne das Präfix `mdi-`, z. B. `chevron-left`. Standard: `chevron-double-left` und `chevron-double-right`. |
| **Icon-Farbe**, **Button-Farbe** | Leer nutzt das Theme. Sonst ein [Farbname](https://vuetifyjs.com/en/styles/colors/) wie `red`, ein Wert wie `#AEEA00` oder `transparent` für einen Button ohne Hintergrund und Schatten. |
| **Icon-Größe** | Zum Beispiel `24` oder `24px`. Leer nutzt die Standardgröße. |

## Steuern aus dem Flow

| Eigenschaft | Wirkung |
|---|---|
| `msg.payload` | Wählt die Option mit diesem Wert. Eine Zahl findet auch eine Option mit dem gleichen Text als Wert, `1` wählt also `"1"`. Passt nichts, zeigt der Node eine Warnung und nichts ändert sich. |
| `msg.options` | Ersetzt die Optionen, z. B. `[{"label":"Aus","value":"off"},{"label":"An","value":"on"}]`. Die aktuelle Option bleibt gewählt, wenn sie noch in der Liste ist, sonst die erste. |
| `msg.enabled` | `false` sperrt die Buttons, `true` gibt sie wieder frei. |
| `msg.visible` | `false` blendet das Widget aus, `true` wieder ein. |
| `msg.class` | Fügt dem Widget CSS-Klassen hinzu. |

`msg.options` und `msg.payload` können zusammen gesendet werden. Alle offenen Dashboards zeigen immer dieselbe Option. Nach einem Deploy startet das Widget wieder mit den Optionen aus dem Editor und behält die gewählte Option, wenn sie dort noch vorkommt.

## Ausgabe

Eine Nachricht wird gesendet, wenn jemand im Dashboard umschaltet und wenn eine Eingabe-Nachricht eine Option wählt:

```json
{ "payload": "comfort", "label": "Comfort", "index": 2 }
```

| Eigenschaft | Inhalt |
|---|---|
| `payload` | Der Wert der gewählten Option. |
| `label` | Die Beschriftung der gewählten Option. |
| `index` | Die Position der gewählten Option, beginnend bei 0. |
| `topic` | Aus der Eingabe-Nachricht übernommen, falls sie eins hatte. |
| `_client` | Welcher Dashboard-Client umgeschaltet hat, wenn *Include client data* in den Dashboard-Einstellungen aktiv ist. |

## Umstieg von 1.0

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
