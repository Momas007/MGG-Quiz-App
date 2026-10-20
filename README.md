# Quiz Show Live – Benutzerhandbuch (User Guide)

Willkommen bei **Quiz Show Live**, einer Echtzeit-Quiz-Anwendung für interaktive Quizabende mit Freunden, Familie oder im Stream (z. B. über TV oder Discord). Diese Dokumentation erklärt die Funktionen und die Bedienung der App.

---

## 📋 Inhaltsverzeichnis
1. [Übersicht & Rollen](#1-übersicht--rollen)
2. [Fragen-Kollektionen erstellen](#2-fragen-kollektionen-erstellen)
3. [Als Moderator einen Raum leiten](#3-als-moderator-einen-raum-leiten)
4. [Als Spieler teilnehmen](#4-als-spieler-teilnehmen)
5. [TV- / Beamer- / Discord-Ansicht](#5-tv---beamer---discord-ansicht)
6. [Punkte- und Standardlogik](#6-punkte--und-standardlogik)

---

## 1. Übersicht & Rollen

Beim Start der App gibst du deinen **Namen** ein und kannst zwischen verschiedenen Modi wählen:
* **Moderator:** Erstellt und steuert einen Quiz-Raum, wählt Kollektionen, schaltet Fragen frei und bewertet Antworten.
* **Spieler:** Tritt einem Raum über einen 5-stelligen Code bei, beantwortet Multiple-Choice-Fragen, gibt Freitext-Antworten ein oder nutzt den Schnell-Buzzer.
* **TV / Discord Ansicht:** Zeigt das Live-Geschehen (Fragen, Optionen, Live-Antworten der Spieler und das Leaderboard) optimiert für Bildschirme oder Streams.
* **Kollektions-Manager:** Ermöglicht das Erstellen und Speichern eigener Fragen-Kollektionen in der Datenbank.

---

## 2. Fragen-Kollektionen erstellen

Um Fragen vorzubereiten, klicke auf **"Neue Fragen-Kollektion erstellen"**:
* **Kollektionsname:** Gib hier den Titel deiner Fragensammlung ein (z. B. *Allgemeinwissen 1*).
* **Standard-Punkte:** Lege global fest, wie viele Punkte es für eine richtige Antwort gibt (Standard: `+5`) und welcher Abzug bei einer falschen Antwort erfolgt (Standard: `-1`).
* **Fragetypen hinzufügen:**
  * **Multiple Choice:** Erstelle Fragen mit bis zu 4 Antwortmöglichkeiten (A, B, C, D) und markiere die korrekte Option.
  * **Schnell-Buzzer:** Eine Frage, bei der Spieler um die Wette buddeln müssen.
  * **Freitext-Antwort:** Spieler tippen eine eigene Textantwort ein.
* Klicke am Ende auf **"Kollektion speichern"**, um sie in der Datenbank zu hinterlegen.

---

## 3. Als Moderator einen Raum leiten

1. Gib deinen Namen ein und wähle im Dropdown-Menü eine **Fragen-Kollektion** aus (oder starte einen leeren Raum).
2. Klicke auf **"Raum mit gewählter Kollektion erstellen"**. Du erhältst einen **5-stelligen Raumcode** (z. B. `ABCDE`).
3. Teile den Code mit deinen Mitspielern.
4. **Moderator-Vorschau:**
   * Du siehst alle Fragen in einer Vorschau und kannst mit den Pfeiltasten navigieren.
   * Klicke auf **"Diese Frage jetzt für alle freigeben & live schalten"**, um die aktuelle Frage an alle Spieler und die TV-Ansicht zu übertragen.
5. **Auswertung & Punkte:**
   * Bei **Multiple-Choice-Fragen** vergibt die App die Punkte automatisch, sobald du auf *Antwort auflösen* klickst.
   * Bei **Freitext-Antworten** kannst du die Antworten der Spieler einsehen, sie auf dem TV einblenden und mit einem Klick Punkte gutschreiben oder abziehen.
   * Bei **Buzzer-Fragen** siehst du, wer als Erstes gebuzzert hat, und kannst die Antwort direkt als *Richtig* (+ Pkt.) oder *Falsch* (- Abzug) bewerten.

---

## 4. Als Spieler teilnehmen

1. Gib deinen Namen ein.
2. Gib den **5-stelligen Raumcode** ein und klicke auf **"Raum betreten"**.
3. Sobald der Moderator eine Frage freigibt, erscheint sie auf deinem Bildschirm:
   * **Multiple Choice:** Klicke auf deine gewählte Antwortoption (A, B, C oder D). Die Auswahl wird gesperrt. Falls erlaubt, kannst du eine Korrektur beim Moderator anfragen.
   * **Freitext:** Tippe deine Antwort in das Textfeld und klicke auf *Antwort absenden*.
   * **Buzzer:** Drücke den großen roten Buzzer-Button, um zu versuchen, als Erster dranzukommen.

---

## 5. TV- / Beamer- / Discord-Ansicht

* Perfekt, um das Spiel via Bildschirmübertragung oder Beamer für alle sichtbar zu machen.
* Gib den 5-stelligen Raumcode ein und klicke auf **"TV / Discord Ansicht"**.
* Der Bildschirm zeigt live die aktuelle Frage, eingereichte Spielerantworten (sofern vom Moderator freigegeben), den Buzzer-Status und das aktuelle **Leaderboard** (Punkte-Tabelle) am unteren Rand.

---

## 6. Punkte- und Standardlogik

* **Standardwerte:** Neue Räume und Kollektionen starten standardmäßig mit **+5 Punkten** für richtige Antworten und **-1 Punkt** Abzug für falsche Antworten.
* **Kollektions-Priorität:** Die Einstellungen (und Fragen) der ausgewählten Kollektion überschreiben beim Erstellen des Raumes die Standardwerte automatisch.
