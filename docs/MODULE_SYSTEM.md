# Module System mit Audience Templates

## Übersicht

Das Module System ermöglicht es Benutzern, beim Einrichten eines neuen Projekts eine Zielgruppe (Audience) auszuwählen. Basierend auf dieser Auswahl werden automatisch die relevanten Module aktiviert und konfiguriert.

## Architektur

### Datenbank-Schema

Das Module System besteht aus folgenden Haupttabellen:

#### 1. **AudienceTemplate**
Definiert die verschiedenen Zielgruppen-Templates mit ihren Eigenschaften.

**Felder:**
- `TemplateID` - Eindeutige ID
- `Name` - Technischer Name (z.B. 'wholesale', 'restaurant')
- `DisplayName` - Anzeigename (z.B. 'Großhandel / Wholesale')
- `Beschreibung` - Beschreibung der Zielgruppe
- `Icon` - CSS-Klasse für das Icon (UnoCSS/Heroicons)
- `Farbe` - Farbschema für die UI
- `SortOrder` - Sortierreihenfolge in der Auswahl
- `IstAktiv` - Ob das Template aktiv ist

**Verfügbare Templates:**
1. **Wholesale (Großhandel)** - B2B-Verkauf mit Lagerverwaltung
2. **Restaurant** - POS-System mit Speisekarte
3. **Hotel** - Gästeverwaltung und Reservierungen
4. **Airbnb (Ferienvermietung)** - Buchungsverwaltung für Kurzzeitvermietung
5. **Online Shop** - E-Commerce mit Produktkatalog
6. **Retail (Einzelhandel)** - Kassensystem mit Lagerverwaltung

#### 2. **ModuleDefinition**
Definiert alle verfügbaren Module im System.

**Felder:**
- `ModulID` - Eindeutige ID
- `ModulName` - Technischer Name des Moduls (z.B. 'kunden', 'produkte')
- `DisplayName` - Anzeigename
- `Beschreibung` - Beschreibung des Moduls
- `Icon` - CSS-Klasse für das Icon
- `Kategorie` - Kategorie (Core, Inventory, Sales, CRM, Finance, etc.)
- `Route` - URL-Pfad zum Modul
- `SortOrder` - Sortierreihenfolge
- `IstSystem` - Ob es ein System-Modul ist (kann nicht deaktiviert werden)
- `IstAktiv` - Ob das Modul aktiv ist

**Module-Kategorien:**
- **Core** - Kernmodule (Kunden, Produkte, Rechnungen)
- **Inventory** - Lagerverwaltung (Bestand, Lagerbewegungen, Standorte)
- **Sales** - Vertrieb (Bestellungen, Kassen, Preise)
- **CRM** - Kundenbeziehungen (Kundengruppen, Kundenkarten, Rabatte)
- **Finance** - Finanzen (Zahlungen, Gutschriften)
- **Procurement** - Beschaffung (Lieferanten)
- **Settings** - Einstellungen (Einheiten, Umsatzsteuersätze)

#### 3. **ModuleKonfiguration**
Verbindet AudienceTemplates mit Modulen und definiert deren Priorität.

**Felder:**
- `KonfigID` - Eindeutige ID
- `TemplateID` - Referenz zum AudienceTemplate
- `ModulID` - Referenz zum ModuleDefinition
- `Prioritaet` - Prioritätsstufe des Moduls
  - **Erforderlich** - Muss aktiviert sein
  - **Wichtig** - Empfohlen für diese Zielgruppe
  - **Optional** - Kann aktiviert werden
  - **Versteckt** - Wird nicht angezeigt
- `IstAktiviert` - Standardmäßig aktiviert
- `Beschreibung` - Zusätzliche Beschreibung

#### 4. **Projekt**
Repräsentiert ein Projekt/Workspace mit einer ausgewählten Zielgruppe.

**Felder:**
- `ProjektID` - Eindeutige ID
- `ProjektName` - Name des Projekts
- `Beschreibung` - Beschreibung
- `AudienceTemplateID` - Referenz zum ausgewählten Template
- `Firmenname` - Firmenname (optional)
- `Branche` - Branche (optional)
- `Status` - Status (Aktiv, Inaktiv, Archiviert)

#### 5. **ProjektModule**
Verknüpft Projekte mit den aktivierten Modulen.

**Felder:**
- `ProjektModulID` - Eindeutige ID
- `ProjektID` - Referenz zum Projekt
- `ModulID` - Referenz zum Modul
- `IstAktiviert` - Ob das Modul für dieses Projekt aktiviert ist

## API Endpoints

### Audience Templates

#### `GET /api/audience-templates`
Gibt alle aktiven Audience Templates zurück.

**Response:**
```json
[
  {
    "TemplateID": 1,
    "Name": "wholesale",
    "DisplayName": "Großhandel / Wholesale",
    "Beschreibung": "Optimiert für Großhandelsunternehmen...",
    "Icon": "i-heroicons-building-storefront",
    "Farbe": "blue",
    "ModuleKonfigurationen": [...]
  }
]
```

#### `GET /api/audience-templates/[id]`
Gibt ein spezifisches Template mit allen Modulkonfigurationen zurück.

### Module Definitions

#### `GET /api/module-definitions`
Gibt alle verfügbaren Module zurück.

### Projekte

#### `GET /api/projekte`
Gibt alle Projekte zurück.

#### `GET /api/projekte/[id]`
Gibt ein spezifisches Projekt mit allen Details zurück.

#### `POST /api/projekte`
Erstellt ein neues Projekt.

**Request Body:**
```json
{
  "ProjektName": "Mein Großhandel",
  "Beschreibung": "Großhandelsgeschäft für Lebensmittel",
  "AudienceTemplateID": 1,
  "Firmenname": "Beispiel GmbH",
  "Branche": "Großhandel"
}
```

**Funktionsweise:**
1. Projekt wird erstellt
2. Modulkonfigurationen des Templates werden kopiert
3. ProjektModule-Einträge werden basierend auf der Template-Konfiguration erstellt

## UI-Komponenten

### Projekt Setup Wizard (`/projekt-setup`)

Ein dreistufiger Wizard für die Projekterstellung:

**Schritt 1: Zielgruppen-Auswahl**
- Zeigt alle verfügbaren Audience Templates als Karten
- Benutzer wählt eine Zielgruppe aus
- Zeigt Anzahl der aktiven Module für jedes Template

**Schritt 2: Projektdetails**
- Eingabe des Projektnamens (erforderlich)
- Optionale Felder: Firmenname, Branche, Beschreibung
- Zusammenfassung der ausgewählten Vorlage

**Schritt 3: Bestätigung**
- Übersicht aller eingegebenen Daten
- Anzeige aller Module, die aktiviert werden
- Visualisierung der Prioritäten (Erforderlich, Wichtig, Optional)

### Projekt-Liste (`/projekte`)

- Übersicht aller Projekte
- Filtermöglichkeiten
- Erstellung neuer Projekte über "Neues Projekt" Button
- Schnellzugriff auf Projektdetails

### Projekt-Details (`/projekte/[id]`)

- Detailansicht eines Projekts
- Zusammenfassung: Erstelldatum, Anzahl aktiver Module, Template
- Modulkonfiguration nach Kategorien gruppiert
- Toggle-Funktionalität zum Aktivieren/Deaktivieren von Modulen

## Verwendung

### Neues Projekt erstellen

1. Navigate zu `/projekt-setup` oder klicke auf "Neues Projekt" in `/projekte`
2. Wähle eine Zielgruppe aus (z.B. "Großhandel")
3. Gib die Projektdetails ein
4. Überprüfe die Konfiguration
5. Klicke auf "Projekt erstellen"

Das System erstellt automatisch:
- Ein neues Projekt mit den eingegebenen Details
- Alle Module basierend auf der Template-Konfiguration
- Die Verknüpfung zwischen Projekt und Modulen

### Module verwalten

1. Öffne das Projekt unter `/projekte/[id]`
2. Scrolle zur Modulkonfiguration
3. Klicke auf das Icon neben einem Modul, um es zu aktivieren/deaktivieren
4. Module mit grünem Rahmen sind aktiv
5. Module sind nach Kategorien gruppiert

### Templates anpassen

Neue Templates oder Module können direkt in der Datenbank hinzugefügt werden:

1. Füge ein neues `AudienceTemplate` hinzu
2. Füge `ModuleKonfiguration`-Einträge hinzu für jedes Modul
3. Definiere die Priorität für jedes Modul
4. Das Template erscheint automatisch im Setup-Wizard

## Erweiterungen

### Neue Module hinzufügen

1. Füge ein `ModuleDefinition`-Eintrag hinzu:
```sql
INSERT INTO ModuleDefinition (ModulName, DisplayName, Beschreibung, Icon, Kategorie, Route, SortOrder)
VALUES ('neues_modul', 'Neues Modul', 'Beschreibung', 'i-heroicons-icon', 'Core', '/neues-modul', 20);
```

2. Füge `ModuleKonfiguration`-Einträge für relevante Templates hinzu:
```sql
INSERT INTO ModuleKonfiguration (TemplateID, ModulID, Prioritaet, IstAktiviert)
VALUES (1, <ModulID>, 'Wichtig', true);
```

### Neue Audience Templates hinzufügen

1. Füge ein `AudienceTemplate`-Eintrag hinzu
2. Konfiguriere alle relevanten Module in `ModuleKonfiguration`
3. Das Template ist sofort verfügbar

## Best Practices

1. **Modulpriorität richtig setzen:**
   - **Erforderlich**: Kernfunktionalität, ohne die das System nicht funktioniert
   - **Wichtig**: Empfohlen für die meisten Anwendungsfälle
   - **Optional**: Zusätzliche Features
   - **Versteckt**: Nicht relevant für diese Zielgruppe

2. **Template-Design:**
   - Fokussiere auf die wichtigsten Module für die Zielgruppe
   - Halte die Konfiguration einfach und verständlich
   - Nutze aussagekräftige Beschreibungen

3. **Module-Organisation:**
   - Gruppiere Module logisch nach Kategorien
   - Verwende konsistente Icons und Farben
   - Halte die Anzahl der Erforderlichen Module gering

## Technische Details

### Transaktionale Projekterstellung

Die Projekterstellung verwendet Prisma Transactions, um Konsistenz zu gewährleisten:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Projekt erstellen
  const projekt = await tx.projekt.create({ ... });

  // 2. Module kopieren
  const templateModules = await tx.moduleKonfiguration.findMany({ ... });

  // 3. ProjektModule erstellen
  await tx.projektModule.createMany({ ... });

  return projekt;
});
```

### Performance-Optimierungen

- Module werden mit `include` geladen, um N+1-Queries zu vermeiden
- Templates werden nach `SortOrder` sortiert
- Indizes auf häufig abgefragte Felder

## Zukünftige Erweiterungen

- **Benutzer-Rollen**: Integration mit einem Rollensystem
- **Permissions**: Fein-granulare Berechtigungen pro Modul
- **Template-Klonen**: Kopieren existierender Templates
- **Import/Export**: Templates als JSON exportieren/importieren
- **Wizard-Anpassung**: Template-spezifische Setup-Schritte
- **Dashboard-Konfiguration**: Template-basierte Dashboard-Layouts
- **Multi-Tenant**: Mehrere Projekte pro Benutzer/Organisation

## Fehlerbehebung

### Prisma Migration Fehler

Wenn Prisma Migrations fehlschlagen:

```bash
# Prisma Client neu generieren
npx prisma generate

# Migration erstellen
npx prisma migrate dev --name add_module_system

# Datenbank seeden
npm run seed
```

### Module erscheinen nicht

1. Überprüfe, ob `ModuleDefinition.IstAktiv = true`
2. Überprüfe, ob `ModuleKonfiguration` Einträge existieren
3. Überprüfe die API-Responses in den Browser DevTools

### Template-Änderungen werden nicht angezeigt

Templates werden beim Projekterstellung kopiert, nicht referenziert. Änderungen am Template beeinflussen existierende Projekte nicht.

## Support

Bei Fragen oder Problemen:
- Prüfe die API-Logs im Server
- Überprüfe die Datenbank-Constraints
- Kontaktiere das Entwicklerteam
