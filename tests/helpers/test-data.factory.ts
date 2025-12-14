/**
 * Test Data Factories
 * Provides factory functions to create test data for various entities
 */

export const createTestProdukt = (overrides = {}) => ({
  ProduktID: 1,
  Produktname: 'Test Produkt',
  Beschreibung: 'Test Beschreibung',
  SKU: 'TEST-001',
  Barcode: '1234567890123',
  KategorieID: 1,
  EinheitID: 1,
  MwStSatzID: 1,
  IstAktiv: true,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestKunde = (overrides = {}) => ({
  KundenID: 1,
  Firmenname: 'Test Firma GmbH',
  Ansprechpartner: 'Max Mustermann',
  Email: 'test@example.com',
  Telefon: '+49 123 456789',
  Adresse: 'Teststraße 1',
  PLZ: '12345',
  Stadt: 'Teststadt',
  Land: 'Deutschland',
  Kundenstatus: 'aktiv',
  KundengruppeID: null,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestRechnung = (overrides = {}) => ({
  RechnungsID: 1,
  Rechnungsnummer: 'RE-2024-001',
  KundenID: 1,
  Rechnungsdatum: new Date('2024-01-01'),
  Faelligkeitsdatum: new Date('2024-01-31'),
  Status: 'offen',
  GesamtbetragNetto: 100.00,
  GesamtbetragBrutto: 119.00,
  MwStBetrag: 19.00,
  Waehrung: 'EUR',
  Zahlungsbedingungen: '30 Tage netto',
  Notizen: null,
  StandortID: 1,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestRechnungsposition = (overrides = {}) => ({
  PositionID: 1,
  RechnungsID: 1,
  ProduktID: 1,
  Bezeichnung: 'Test Produkt',
  Menge: 1,
  Einheit: 'Stück',
  Einzelpreis: 100.00,
  MwStSatz: 19.00,
  MwStBetrag: 19.00,
  Gesamtpreis: 119.00,
  Rabatt: 0,
  ...overrides,
})

export const createTestLieferant = (overrides = {}) => ({
  LieferantenID: 1,
  Firmenname: 'Test Lieferant GmbH',
  Ansprechpartner: 'Erika Musterfrau',
  Email: 'lieferant@example.com',
  Telefon: '+49 987 654321',
  Adresse: 'Lieferantenstraße 10',
  PLZ: '54321',
  Stadt: 'Lieferstadt',
  Land: 'Deutschland',
  Zahlungsbedingungen: '14 Tage netto',
  IstAktiv: true,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestStandort = (overrides = {}) => ({
  StandortID: 1,
  Standortname: 'Hauptlager',
  Adresse: 'Lagerstraße 1',
  PLZ: '12345',
  Stadt: 'Lagerstadt',
  Land: 'Deutschland',
  IstHauptstandort: true,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestBestand = (overrides = {}) => ({
  BestandID: 1,
  ProduktID: 1,
  StandortID: 1,
  Menge: 100,
  Mindestbestand: 10,
  Maximalbestand: 500,
  LetzteInventur: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestUmsatzsteuersatz = (overrides = {}) => ({
  MwStSatzID: 1,
  Bezeichnung: 'Normalsteuersatz',
  Satz: 19.00,
  IstStandard: true,
  GueltigAb: new Date('2024-01-01'),
  GueltigBis: null,
  ...overrides,
})

export const createTestBenutzer = (overrides = {}) => ({
  BenutzerID: 1,
  Benutzername: 'testuser',
  Email: 'user@example.com',
  PasswortHash: '$2a$10$abcdefghijklmnopqrstuv',
  Vorname: 'Test',
  Nachname: 'User',
  Rolle: 'admin',
  IstAktiv: true,
  LetztesLogin: null,
  Erstelldatum: new Date('2024-01-01'),
  LetzteAenderung: new Date('2024-01-01'),
  ...overrides,
})

export const createTestEinheit = (overrides = {}) => ({
  EinheitID: 1,
  Bezeichnung: 'Stück',
  Kurzform: 'Stk',
  IstBasiseinheit: true,
  Umrechnungsfaktor: 1,
  ...overrides,
})

export const createTestKategorie = (overrides = {}) => ({
  KategorieID: 1,
  Kategoriename: 'Test Kategorie',
  Beschreibung: 'Test Kategorie Beschreibung',
  ParentKategorieID: null,
  Sortierung: 1,
  IstAktiv: true,
  ...overrides,
})
