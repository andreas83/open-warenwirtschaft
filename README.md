# Warenwirtschaftssystem (KI-generiert)

<div align="center">

**Ein experimentelles, vollständig KI-generiertes ERP-System**

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## Über dieses Projekt

Dieses Repository enthält ein **vollständiges Warenwirtschaftssystem (ERP)**, das komplett durch künstliche Intelligenz entwickelt wurde. Das Projekt demonstriert eindrucksvoll, wie weit KI-gestützte Softwareentwicklung heute bereits möglich ist.

Das System umfasst nicht nur grundlegende Funktionen, sondern ein umfassendes Modul-Ökosystem für verschiedene Geschäftsszenarien – von Einzelhandel über Großhandel bis zu Restaurant- und Hotelbetrieben.

## Hauptmodule

### Kernfunktionen

* **Produktverwaltung** - Komplette Produktkataloge mit Kategorien, Bildern, Einheiten und Lieferanten
* **Preisgestaltung** - Flexible Preise mit Umsatzsteuer, Rabatten und Staffelpreisen
* **Lagerverwaltung** - Multi-Standort-Bestandsführung mit Bewegungshistorie
* **Kundenverwaltung** - CRM mit Kundengruppen, Kundenkarten und individuellen Rabatten
* **Bestellwesen** - Kompletter Order-to-Cash-Prozess von Bestellung bis Rechnung
* **Lieferantenverwaltung** - Supplier-Management mit Produktzuordnungen
* **Rechnungssystem** - Rechnungserstellung, Gutschriften und Retouren
* **Zahlungsmanagement** - Zahlungsverfolgung und -abwicklung

### Spezialisierte Module

#### Restaurant-Modul
* Tischverwaltung mit Bereichen und visueller Positionierung
* Restaurantspezifische Bestellungen getrennt von regulären Aufträgen
* Reservierungssystem mit Kundenverlinkung
* Kitchen-Workflow mit Statusverfolgung

#### Großhandels-Modul
* **Preisverträge** - Kundenspezifische Vertragspreise
* **Vertreterverwaltung** - Außendienstmitarbeiter mit Provisionsabrechnung
* **Kreditmanagement** - Kreditlimits und Mahnwesen
* **Logistik** - Liefertouren und Liefernachweise
* **Angebotssystem** - Angebots- und Proposalverwaltung

#### Kassensystem (POS)
* Multi-Kassen-Verwaltung pro Standort
* Kassenbuchungen mit Rechnungsverknüpfung
* Dedizierte POS-Oberfläche für Retail-Operationen
* Tastaturkürzel für schnelle Bedienung

#### Hotel-Modul
* Zimmerverwaltung mit Kategorien
* Gästebuchungen mit Check-in/Check-out
* Zusatzleistungen-Tracking

#### Shop-Modul
* E-Commerce-Produktkatalog
* Warenkorb- und Bestellverwaltung
* Kundenbewertungen

### Projektmanagement-System
* Dynamische Modulaktivierung pro Projekt
* Audience Templates für verschiedene Geschäftstypen
* Flexible Modulkonfiguration

## Technologie-Stack

* **Framework:** Nuxt 3 (Vue.js)
* **Datenbank:** MySQL mit Prisma ORM
* **Styling:** UnoCSS mit Wind-Preset (Tailwind-kompatibel)
* **Authentifizierung:** nuxt-auth-utils
* **Internationalisierung:** @nuxtjs/i18n (Deutsch/Englisch)
* **Icons:** UnoCSS Icons (Iconify)
* **Testing:** Vitest mit happy-dom
* **Package Manager:** Yarn 1.22.22
* **KI-Tools:** Claude Code & Cline

## Installation & Setup

### Voraussetzungen

- Node.js 18+
- Yarn 1.22+
- MySQL 8.0+

### Schritt 1: Repository klonen

```bash
git clone https://github.com/andreas83/open-warenwirtschaft.git
cd open-warenwirtschaft
```

### Schritt 2: Abhängigkeiten installieren

```bash
yarn install
```

### Schritt 3: Datenbank konfigurieren

Erstellen Sie eine `.env` Datei im Root-Verzeichnis:

```env
DATABASE_URL="mysql://username:password@localhost:3306/warenwirtschaft"
```

### Schritt 4: Datenbank initialisieren

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Migrationen ausführen
npx prisma migrate deploy

# Testdaten einfügen (optional)
yarn seed
```

### Schritt 5: Entwicklungsserver starten

```bash
yarn dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## Verfügbare Befehle

```bash
# Entwicklung
yarn dev              # Entwicklungsserver starten
yarn build            # Produktions-Build erstellen
yarn preview          # Produktions-Build Vorschau

# Datenbank
npx prisma studio     # Datenbank-GUI öffnen
npx prisma migrate dev --name <name>  # Neue Migration erstellen
npx prisma migrate reset              # Datenbank zurücksetzen
yarn seed             # Testdaten generieren

# Tests
yarn test             # Tests im Watch-Modus
yarn test:run         # Tests einmalig ausführen
yarn test:ui          # Test-UI öffnen
yarn test:coverage    # Coverage-Report erstellen
```

## Architektur-Highlights

### Modulare Datenbankstruktur

Das System verwendet eine **modulare Architektur** mit Kern- und Erweiterungsmodulen, die über das Projektmanagement-System dynamisch aktiviert werden können.

### Conflict Resolution

Eingebautes Konfliktmanagement mit optimistischem Locking über `LetzteAenderung`-Timestamp-Felder zur Behandlung gleichzeitiger Datenänderungen.

### Soft Deletes

Verwendung von Status-Feldern (z.B. `IstAktiv`, `Kundenstatus`) statt harter Löschungen.

### Multi-Currency Support

Mehrwährungsunterstützung in allen finanziellen Entitäten (Standard: EUR).

### Audit Trail

Standard-Felder auf den meisten Tabellen:
- `Erstelldatum` - Erstellungszeitpunkt
- `LetzteAenderung` - Letzte Änderung
- `ErstelltVonBenutzerID` - Benutzer-Tracking

### Internationalisierung

Zweisprachige Benutzeroberfläche (Deutsch/Englisch) mit vollständiger i18n-Unterstützung.

## Projektstruktur

```
/pages              # File-based Routing (Nuxt Convention)
/server/api         # API Endpoints
/components         # Vue Komponenten
/composables        # Vue Composables
/lib               # Shared Utilities
/layouts           # Page Layouts
/i18n/locales      # Übersetzungsdateien
/prisma            # Datenbank Schema & Migrationen
/tests             # Vitest Tests
```

## Entwicklungs-Dokumentation

Ausführliche Entwicklungs-Richtlinien und Architektur-Details finden Sie in der [CLAUDE.md](CLAUDE.md) Datei.

## Wichtiger Hinweis

**⚠️ Dieses System ist nicht für den Produktiveinsatz vorgesehen!**

Das Hauptziel dieses Projekts war es, die Grenzen der KI-gestützten Softwareentwicklung auszuloten. Es dient als:

- **Proof-of-Concept** für KI-generierte Enterprise-Software
- **Demonstrations-Projekt** für moderne Web-Technologien
- **Lernressource** für Nuxt 3, Prisma und Vue.js
- **Template** für eigene Projekte

Sie sind herzlich eingeladen, diesen Code als Vorlage zu verwenden und an Ihre spezifischen Anforderungen anzupassen.



![screencapture-localhost-3000-rechnungen-dashboard-2025-07-06-15_15_49](https://github.com/user-attachments/assets/531fee4a-7cf1-4cbb-a229-f9fcf739781f)

![screencapture-localhost-3000-rechnungen-details-1-2025-07-06-15_15_19](https://github.com/user-attachments/assets/d7dbca94-0693-47a8-9064-a6be65c7e7ce)

![screencapture-localhost-3000-produkte-edit-1-2025-07-06-15_16_18](https://github.com/user-attachments/assets/895f8c1d-f804-4c9b-a852-cba6e8f93efd)

![screencapture-localhost-3000-produkte-edit-1-2025-07-06-15_12_43](https://github.com/user-attachments/assets/4132e817-6bcb-4f72-8980-8433c75a5502)

![screencapture-localhost-3000-produkte-edit-1-2025-07-06-15_11_58](https://github.com/user-attachments/assets/bf4f2ce3-4256-41dc-b67e-05bf9e9c45d2)

![screencapture-localhost-3000-produkte-2025-07-06-15_11_39](https://github.com/user-attachments/assets/e37b7563-a287-429c-aa3e-e55010e499b4)




