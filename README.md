# Quiz Show Live – Benutzerhandbuch (User Guide)

Willkommen bei **Quiz Show Live**, einer Echtzeit-Quiz-Anwendung für interaktive Quizabende mit Freunden, Familie oder im Stream (z. B. über TV oder Discord)[cite: 1]. Diese Dokumentation erklärt die Funktionen und die Bedienung der App[cite: 1].

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

Beim Start der App gibst du deinen **Namen** ein und kannst zwischen verschiedenen Modi wählen[cite: 1]:
* **Moderator:** Erstellt und steuert einen Quiz-Raum, wählt Kollektionen, schaltet Fragen frei und bewertet Antworten[cite: 1].
* **Spieler:** Tritt einem Raum über einen 5-stelligen Code bei, beantwortet Multiple-Choice-Fragen, gibt Freitext-Antworten ein oder nutzt den Schnell-Buzzer[cite: 1].
* **TV / Discord Ansicht:** Zeigt das Live-Geschehen (Fragen, Optionen, Live-Antworten der Spieler und das Leaderboard) optimiert für Bildschirme oder Streams[cite: 1].
* **Kollektions-Manager:** Ermöglicht das Erstellen und Speichern eigener Fragen-Kollektionen in der Datenbank[cite: 1].

---

## 2. Fragen-Kollektionen erstellen

Um Fragen vorzubereiten, klicke auf **"Neue Fragen-Kollektion erstellen"**[cite: 1]:
* **Kollektionsname:** Gib hier den Titel deiner Fragensammlung ein (z. B. *Allgemeinwissen 1*)[cite: 1].
* **Standard-Punkte:** Lege global fest, wie viele Punkte es für eine richtige Antwort gibt (Standard: `+5`) und welcher Abzug bei einer falschen Antwort erfolgt (Standard: `-1`)[cite: 1].
* **Fragetypen hinzufügen[cite: 1]:**
  * **Multiple Choice:** Erstelle Fragen mit bis zu 4 Antwortmöglichkeiten (A, B, C, D) und markiere die korrekte Option[cite: 1].
  * **Schnell-Buzzer:** Eine Frage, bei der Spieler um die Wette buddeln müssen[cite: 1].
  * **Freitext-Antwort:** Spieler tippen eine eigene Textantwort ein[cite: 1].
* Klicke am Ende auf **"Kollektion speichern"**, um sie in der Datenbank zu hinterlegen[cite: 1].

---

## 3. Als Moderator einen Raum leiten

1. Gib deinen Namen ein und wähle im Dropdown-Menü eine **Fragen-Kollektion** aus (oder starte einen leeren Raum)[cite: 1].
2. Klicke auf **"Raum mit gewählter Kollektion erstellen"**. Du erhältst einen **5-stelligen Raumcode** (z. B. `ABCDE`)[cite: 1].
3. Teile den Code mit deinen Mitspielern[cite: 1].
4. **Moderator-Vorschau[cite: 1]:**
   * Du siehst alle Fragen in einer Vorschau und kannst mit den Pfeiltasten navigieren[cite: 1].
   * Klicke auf **"Diese Frage jetzt für alle freigeben & live schalten"**, um die aktuelle Frage an alle Spieler und die TV-Ansicht zu übertragen[cite: 1].
5. **Auswertung & Punkte[cite: 1]:**
   * Bei **Multiple-Choice-Fragen** vergibt die App die Punkte automatisch, sobald du auf *Antwort auflösen* klickst[cite: 1].
   * Bei **Freitext-Antworten** kannst du die Antworten der Spieler einsehen, sie auf dem TV einblenden und mit einem Klick Punkte gutschreiben oder abziehen[cite: 1].
   * Bei **Buzzer-Fragen** siehst du, wer als Erstes gebuzzert hat, und kannst die Antwort direkt als *Richtig* (+ Pkt.) oder *Falsch* (- Abzug) bewerten[cite: 1].

---

## 4. Als Spieler teilnehmen

1. Gib deinen Namen ein[cite: 1].
2. Gib den **5-stelligen Raumcode** ein und klicke auf **"Raum betreten"**[cite: 1].
3. Sobald der Moderator eine Frage freigibt, erscheint sie auf deinem Bildschirm[cite: 1]:
   * **Multiple Choice:** Klicke auf deine gewählte Antwortoption (A, B, C oder D). Die Auswahl wird gesperrt. Falls erlaubt, kannst du eine Korrektur beim Moderator anfragen[cite: 1].
   * **Freitext:** Tippe deine Antwort in das Textfeld und klicke auf *Antwort absenden*[cite: 1].
   * **Buzzer:** Drücke den großen roten Buzzer-Button, um zu versuchen, als Erster dranzukommen[cite: 1].

---

## 5. TV- / Beamer- / Discord-Ansicht

* Perfekt, um das Spiel via Bildschirmübertragung oder Beamer für alle sichtbar zu machen[cite: 1].
* Gib den 5-stelligen Raumcode ein und klicke auf **"TV / Discord Ansicht"**[cite: 1].
* Der Bildschirm zeigt live die aktuelle Frage, eingereichte Spielerantworten (sofern vom Moderator freigegeben), den Buzzer-Status und das aktuelle **Leaderboard** (Punkte-Tabelle) am unteren Rand[cite: 1].

---

## 6. Punkte- und Standardlogik

* **Standardwerte:** Neue Räume und Kollektionen starten standardmäßig mit **+5 Punkten** für richtige Antworten und **-1 Punkt** Abzug für falsche Antworten[cite: 1].
* **Kollektions-Priorität:** Die Einstellungen (und Fragen) der ausgewählten Kollektion überschreiben beim Erstellen des Raumes die Standardwerte automatisch[cite: 1].
