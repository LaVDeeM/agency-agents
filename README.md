# Lokale Sichtbarkeit als Service – Projekt-Übersicht

Alle Dateien für Jos "Lokale Sichtbarkeit Münster" Business.

## Struktur

```
lokale-sichtbarkeit/
├── demos/                        # Branchen-Demo-Webseiten (Verkaufstools)
│   ├── shk-demo.html             → Müller Haustechnik (SHK/Heizung)
│   ├── gastro-demo.html          → Trattoria da Marco (Restaurant)
│   ├── arztpraxis-demo.html      → Dr. Schneider (Hausarztpraxis)
│   ├── friseur-demo.html         → Salon Mia (Friseur)
│   └── autowerkstatt-demo.html   → Weber Kfz-Meisterbetrieb (Autowerkstatt)
├── landingpage/
│   └── index.html                → Eigene Dienstleister-Landingpage
├── tools/
│   ├── qr-generator.html         → Bewertungs-QR-Code Generator
│   ├── sichtbarkeits-check.html  → Interaktiver Sichtbarkeits-Check
│   └── pipeline.html             → CRM/Pipeline-Tracker (Kanban, CSV-Export)
├── templates/
│   ├── angebot.html              → Druckbares Angebotsformular
│   ├── reporting.html            → Monatlicher Kundenbericht (KPIs)
│   └── vertrag.html              → Dienstleistungsvertrag (ausfüllbar)
├── impressum.html                → §5 TMG Impressum
└── datenschutz.html              → DSGVO Datenschutzerklärung
```

## Nutzung

### Demo-Webseiten
Im Kundengespräch öffnen und live zeigen. Jede Demo ist für eine Branche optimiert
und enthält echte Bewertungen, Preise und Kontaktformulare.

### Sichtbarkeits-Check
Vor Ort beim Kunden aufrufen → Checkboxen gemeinsam durchgehen → Score berechnen
→ automatische Paket-Empfehlung → ausdrucken als PDF.

### QR-Generator
Google My Business Bewertungslink eingeben → QR-Code generieren → herunterladen
oder drucken → beim Kunden an der Kasse / auf Rechnung anbringen.

### Angebotsvorlage
Kundenname, Betrieb, Datum eingeben → "Aktualisieren" → drucken als PDF
→ beim Kunden unterschreiben lassen.

### Reporting-Template
Monatlich: KPIs aus Google My Business eintragen → drucken als PDF → per E-Mail
an Kunden schicken als Nachweis für geleistete Arbeit.

### Vertrag
Kundendaten ausfüllen → Paket auswählen → drucken → unterschreiben lassen.
Enthält Leistungsbeschreibung, Preis, Laufzeit und Kündigungsfristen.

### Pipeline-Tracker
Leads in Kanban-Spalten verwalten (Prospekt → Kontaktiert → Demo → Angebot
→ Gewonnen/Verloren). Daten im Browser gespeichert (localStorage), CSV-Export möglich.

## Deployment

Die Seiten sind über GitHub Pages erreichbar:
`https://lavdeem.github.io/agency-agents/`

Deployment erfolgt automatisch via GitHub Actions bei jedem Push auf den Branch.
