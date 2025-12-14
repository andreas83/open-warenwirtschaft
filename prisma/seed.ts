import { PrismaClient } from '@prisma/client';
import { Faker, de, en } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const faker = new Faker({ locale: [de, en] });

async function main() {
  // Seed Einheiten (Units)
  const einheiten = await prisma.einheiten.createMany({
    data: [
      { Name: 'Stück', Symbol: 'Stk' },
      { Name: 'Kilogramm', Symbol: 'kg' },
      { Name: 'Liter', Symbol: 'L' },
      { Name: 'Meter', Symbol: 'm' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${einheiten.count} Einheiten`);

  // Seed Umsatzsteuersaetze (VAT Rates)
  const umsatzsteuersaetze = await prisma.umsatzsteuersaetze.createMany({
    data: [
      { Name: 'Standard 20%', Steuersatz: 20.0, Beschreibung: 'Standard VAT rate' },
      { Name: 'Reduced 10%', Steuersatz: 10.0, Beschreibung: 'Reduced VAT rate for certain goods' },
      { Name: 'Zero 0%', Steuersatz: 0.0, Beschreibung: 'Zero VAT rate' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${umsatzsteuersaetze.count} Umsatzsteuersaetze`);

  // Seed Standorte (Locations)
  const standorte = await prisma.standorte.createMany({
    data: [
      { Name: 'Zentrallager Wien', Adresse: 'Industriestraße 10', PLZ: '1100', Ort: 'Wien', Land: 'Österreich', Typ: 'Zentrallager' },
      { Name: 'Filiale Graz', Adresse: 'Hauptstraße 5', PLZ: '8010', Ort: 'Graz', Land: 'Österreich', Typ: 'Filiale' },
      { Name: 'Filiale Linz', Adresse: 'Bahnhofstraße 3', PLZ: '4020', Ort: 'Linz', Land: 'Österreich', Typ: 'Filiale' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${standorte.count} Standorte`);

  // Fetch created Einheiten for reference
  const einheitStk = await prisma.einheiten.findFirst({ where: { Name: 'Stück' } });
  if (!einheitStk) throw new Error('Einheit Stück not found');
  const einheitKg = await prisma.einheiten.findFirst({ where: { Name: 'Kilogramm' } });
  if (!einheitKg) throw new Error('Einheit Kilogramm not found');
  const einheitL = await prisma.einheiten.findFirst({ where: { Name: 'Liter' } });
  if (!einheitL) throw new Error('Einheit Liter not found');

  // Fetch created Umsatzsteuersaetze for reference
  const vat20 = await prisma.umsatzsteuersaetze.findFirst({ where: { Name: 'Standard 20%' } });
  if (!vat20) throw new Error('VAT 20% not found');
  const vat10 = await prisma.umsatzsteuersaetze.findFirst({ where: { Name: 'Reduced 10%' } });
  if (!vat10) throw new Error('VAT 10% not found');

  // Seed Produkte (Products) with Faker
  // Generate initial set of products
  const produkte = await prisma.produkte.createMany({
    data: [
      { Produktname: 'Apfel', Beschreibung: 'Frischer roter Apfel', Artikelnummer: 'A001', EAN_Code: '1234567890123', EinheitID: einheitStk.EinheitID, UmsatzsteuersatzID: vat10.UmsatzsteuersatzID, Gewicht: 0.2 },
      { Produktname: 'Brot', Beschreibung: 'Vollkornbrot 500g', Artikelnummer: 'B001', EAN_Code: '1234567890124', EinheitID: einheitStk.EinheitID, UmsatzsteuersatzID: vat10.UmsatzsteuersatzID, Gewicht: 0.5 },
      { Produktname: 'Milch', Beschreibung: 'Vollmilch 1L', Artikelnummer: 'M001', EAN_Code: '1234567890125', EinheitID: einheitL.EinheitID, UmsatzsteuersatzID: vat10.UmsatzsteuersatzID, Volumen: 1.0 },
      { Produktname: 'Zucker', Beschreibung: 'Kristallzucker 1kg', Artikelnummer: 'Z001', EAN_Code: '1234567890126', EinheitID: einheitKg.EinheitID, UmsatzsteuersatzID: vat20.UmsatzsteuersatzID, Gewicht: 1.0 },
      { Produktname: 'Laptop', Beschreibung: 'High-End Laptop', Artikelnummer: 'L001', EAN_Code: '1234567890127', EinheitID: einheitStk.EinheitID, UmsatzsteuersatzID: vat20.UmsatzsteuersatzID, Gewicht: 2.0 },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${produkte.count} initial Produkte`);

  // Generate additional products using Faker (total of 200 products)
  const einheitIds = [einheitStk.EinheitID, einheitKg.EinheitID, einheitL.EinheitID];
  const vats = [vat10.UmsatzsteuersatzID, vat20.UmsatzsteuersatzID];
  const additionalProducts = [];
  for (let i = 0; i < 195; i++) {
    const produktname = faker.commerce.productName();
    const artikelnummer = `P${String(i + 1).padStart(3, '0')}`;
    const ean = faker.string.numeric(13);
    const einheitId = einheitIds[Math.floor(Math.random() * einheitIds.length)];
    const vatId = vats[Math.floor(Math.random() * vats.length)];
    const gewicht = einheitId === einheitKg.EinheitID ? faker.number.float({ min: 0.1, max: 5, fractionDigits: 1 }) : faker.number.float({ min: 0, max: 3, fractionDigits: 1 });
    const volumen = einheitId === einheitL.EinheitID ? faker.number.float({ min: 0.1, max: 5, fractionDigits: 1 }) : 0;

    additionalProducts.push({
      Produktname: produktname,
      Beschreibung: faker.commerce.productDescription(),
      Artikelnummer: artikelnummer,
      EAN_Code: ean,
      EinheitID: einheitId,
      UmsatzsteuersatzID: vatId,
      Gewicht: gewicht,
      Volumen: volumen,
    });
  }

  const additionalProdukte = await prisma.produkte.createMany({
    data: additionalProducts,
    skipDuplicates: true,
  });
  console.log(`Created ${additionalProdukte.count} additional Produkte with Faker`);

  // Fetch created Standorte for reference
  const wien = await prisma.standorte.findFirst({ where: { Name: 'Zentrallager Wien' } });
  if (!wien) throw new Error('Standort Zentrallager Wien not found');
  const graz = await prisma.standorte.findFirst({ where: { Name: 'Filiale Graz' } });
  if (!graz) throw new Error('Standort Filiale Graz not found');

  // Fetch created Produkte for reference
  const apfel = await prisma.produkte.findUnique({ where: { Artikelnummer: 'A001' } });
  if (!apfel) throw new Error('Produkt Apfel not found');
  const brot = await prisma.produkte.findUnique({ where: { Artikelnummer: 'B001' } });
  if (!brot) throw new Error('Produkt Brot not found');
  const milch = await prisma.produkte.findUnique({ where: { Artikelnummer: 'M001' } });
  if (!milch) throw new Error('Produkt Milch not found');
  const zucker = await prisma.produkte.findUnique({ where: { Artikelnummer: 'Z001' } });
  if (!zucker) throw new Error('Produkt Zucker not found');

  // Seed Bestand (Inventory)
  const bestand = await prisma.bestand.createMany({
    data: [
      { ProduktID: apfel.ProduktID, StandortID: wien.StandortID, Menge: 100.0, Chargennummer: 'CH001', Ablaufdatum: new Date('2025-12-31'), Status: 'Verf_gbar', Lagerplatz: 'A1-01' },
      { ProduktID: brot.ProduktID, StandortID: wien.StandortID, Menge: 50.0, Chargennummer: 'CH002', Ablaufdatum: new Date('2025-07-01'), Status: 'Verf_gbar', Lagerplatz: 'A1-02' },
      { ProduktID: milch.ProduktID, StandortID: wien.StandortID, Menge: 200.0, Chargennummer: 'CH003', Ablaufdatum: new Date('2025-06-15'), Status: 'Verf_gbar', Lagerplatz: 'A1-03' },
      { ProduktID: zucker.ProduktID, StandortID: graz.StandortID, Menge: 75.0, Chargennummer: 'CH004', Status: 'Verf_gbar', Lagerplatz: 'B2-01' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${bestand.count} Bestand entries`);

  // Seed Benutzer (Users)
  const hashedPassword = await bcrypt.hash('admin', 10);
  const benutzerData = [
    { Benutzername: 'admin', PasswortHash: hashedPassword, Vorname: 'Admin', Nachname: 'User', Rolle: 'Administrator', IstAktiv: true },
    { Benutzername: 'lagerist', PasswortHash: hashedPassword, Vorname: 'Lager', Nachname: 'Ist', Rolle: 'Lagerist', IstAktiv: true },
    { Benutzername: 'verkauf', PasswortHash: hashedPassword, Vorname: 'Verkauf', Nachname: 'Mitarbeiter', Rolle: 'Verkauf', IstAktiv: true },
  ];

  let benutzerCreated = 0;
  for (const user of benutzerData) {
    const existingUser = await prisma.benutzer.findUnique({
      where: { Benutzername: user.Benutzername }
    });
    if (existingUser) {
      await prisma.benutzer.update({
        where: { Benutzername: user.Benutzername },
        data: { PasswortHash: user.PasswortHash }
      });
    } else {
      await prisma.benutzer.create({
        data: user
      });
      benutzerCreated++;
    }
  }
  console.log(`Created or updated ${benutzerData.length} Benutzer, ${benutzerCreated} new records created`);

  // Seed Kundengruppen (Customer Groups)
  const kundengruppen = await prisma.kundengruppen.createMany({
    data: [
      { Name: 'Einzelhandel', Beschreibung: 'Einzelhandelskunden' },
      { Name: 'Großhandel', Beschreibung: 'Großhandelskunden mit Rabatten' },
      { Name: 'VIP', Beschreibung: 'VIP Kunden mit besonderen Konditionen' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${kundengruppen.count} Kundengruppen`);

  // Fetch created Kundengruppen for reference
  const einzelhandel = await prisma.kundengruppen.findFirst({ where: { Name: 'Einzelhandel' } });
  if (!einzelhandel) throw new Error('Kundengruppe Einzelhandel not found');
  const grosshandel = await prisma.kundengruppen.findFirst({ where: { Name: 'Großhandel' } });
  if (!grosshandel) throw new Error('Kundengruppe Großhandel not found');

  // Seed Kunden (Customers)
  const kunden = await prisma.kunden.createMany({
    data: [
      { Kundennummer: 'K001', KundengruppeID: einzelhandel.KundengruppeID, Anrede: 'Herr', Vorname: 'Hans', Nachname: 'Muster', Adresse: 'Musterstraße 1', PLZ: '1010', Ort: 'Wien', Land: 'Österreich', Telefon: '+43123456789', Email: 'hans.muster@example.com', Kundenstatus: 'Aktiv' },
      { Kundennummer: 'K002', KundengruppeID: grosshandel.KundengruppeID, Firmenname: 'Großhandel GmbH', Anrede: 'Firma', Adresse: 'Handelsstraße 10', PLZ: '1020', Ort: 'Wien', Land: 'Österreich', Telefon: '+43987654321', Email: 'info@grosshandel.at', UmsatzsteuerID: 'ATU12345678', Kundenstatus: 'Aktiv' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${kunden.count} Kunden`);

  // Fetch created Kunden for reference
  const kunde1 = await prisma.kunden.findFirst({ where: { Kundennummer: 'K001' } });
  if (!kunde1) throw new Error('Kunde K001 not found');
  const kunde2 = await prisma.kunden.findFirst({ where: { Kundennummer: 'K002' } });
  if (!kunde2) throw new Error('Kunde K002 not found');

  // Seed Kundenkarten (Customer Cards)
  const kundenkarten = await prisma.kundenkarten.createMany({
    data: [
      { KundenID: kunde1.KundenID, Kartennummer: 'KK001', Aktivierungsdatum: new Date('2023-01-15'), Ablaufdatum: new Date('2026-01-15'), Status: 'Aktiv' },
      { KundenID: kunde2.KundenID, Kartennummer: 'KK002', Aktivierungsdatum: new Date('2023-02-20'), Ablaufdatum: new Date('2026-02-20'), Status: 'Aktiv' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${kundenkarten.count} Kundenkarten`);

  // Seed Lieferanten (Suppliers)
  const lieferanten = await prisma.lieferanten.createMany({
    data: [
      { Firmenname: 'BioBauernhof GmbH', Ansprechpartner: 'Maria Bauer', Adresse: 'Bauernweg 1', PLZ: '2000', Ort: 'Stockerau', Land: 'Österreich', Telefon: '+43226612345', Email: 'info@biobauernhof.at', UmsatzsteuerID: 'ATU87654321' },
      { Firmenname: 'Getränke Großhandel AG', Ansprechpartner: 'Peter Müller', Adresse: 'Getränkestraße 5', PLZ: '5020', Ort: 'Salzburg', Land: 'Österreich', Telefon: '+43662123456', Email: 'kontakt@getraenke-ag.at', UmsatzsteuerID: 'ATU98765432' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${lieferanten.count} Lieferanten`);

  // Seed Preise (Prices) for Products
  const allProdukte = await prisma.produkte.findMany();
  const currentDate = new Date();
  const pastDate = new Date(currentDate);
  pastDate.setFullYear(currentDate.getFullYear() - 1);

  const preiseData = [];
  for (const produkt of allProdukte) {
    // Current price
    const currentPrice = faker.number.float({ min: 1, max: 100, fractionDigits: 2 });
    preiseData.push({
      ProduktID: produkt.ProduktID,
      Preis: currentPrice,
      GueltigAb: currentDate,
      PreisTyp: "Standard" as any, // Temporary cast to bypass type error
    });

    // Historical price for some products
    if (Math.random() > 0.7) {
      const historicalPrice = faker.number.float({ min: 0.8 * currentPrice, max: 1.2 * currentPrice, fractionDigits: 2 });
      preiseData.push({
        ProduktID: produkt.ProduktID,
        Preis: historicalPrice,
        GueltigAb: pastDate,
        GueltigBis: currentDate,
        PreisTyp: "Standard" as any, // Temporary cast to bypass type error
      });
    }
  }

  const preise = await prisma.preise.createMany({
    data: preiseData,
    skipDuplicates: true,
  });
  console.log(`Created ${preise.count} Preise`);

  // Seed Rechnungen (Invoices)
  const adminUser = await prisma.benutzer.findFirst({ where: { Benutzername: 'admin' } });
  if (!adminUser) throw new Error('Admin user not found');

  const rechnungenData = [
    {
      KundenID: kunde1.KundenID,
      ErstelltVonBenutzerID: adminUser.BenutzerID,
      Rechnungsnummer: 'R001',
      Rechnungsdatum: new Date('2025-01-15'),
      Faelligkeitsdatum: new Date('2025-02-15'),
      Rechnungsadresse: kunde1.Adresse + ', ' + kunde1.PLZ + ' ' + kunde1.Ort + ', ' + kunde1.Land,
      GesamtbetragNetto: 45.00,
      MwSt_Gesamt: 4.50,
      GesamtbetragBrutto: 49.50,
    },
    {
      KundenID: kunde2.KundenID,
      ErstelltVonBenutzerID: adminUser.BenutzerID,
      Rechnungsnummer: 'R002',
      Rechnungsdatum: new Date('2025-02-20'),
      Faelligkeitsdatum: new Date('2025-03-20'),
      Rechnungsadresse: kunde2.Adresse + ', ' + kunde2.PLZ + ' ' + kunde2.Ort + ', ' + kunde2.Land,
      GesamtbetragNetto: 800.00,
      MwSt_Gesamt: 160.00,
      GesamtbetragBrutto: 960.00,
    },
    {
      KundenID: kunde1.KundenID,
      ErstelltVonBenutzerID: adminUser.BenutzerID,
      Rechnungsnummer: 'R003',
      Rechnungsdatum: new Date('2025-03-10'),
      Faelligkeitsdatum: new Date('2025-04-10'),
      Rechnungsadresse: kunde1.Adresse + ', ' + kunde1.PLZ + ' ' + kunde1.Ort + ', ' + kunde1.Land,
      GesamtbetragNetto: 120.00,
      MwSt_Gesamt: 12.00,
      GesamtbetragBrutto: 132.00,
    },
    {
      KundenID: kunde2.KundenID,
      ErstelltVonBenutzerID: adminUser.BenutzerID,
      Rechnungsnummer: 'R004',
      Rechnungsdatum: new Date('2025-04-05'),
      Faelligkeitsdatum: new Date('2025-05-05'),
      Rechnungsadresse: kunde2.Adresse + ', ' + kunde2.PLZ + ' ' + kunde2.Ort + ', ' + kunde2.Land,
      GesamtbetragNetto: 250.00,
      MwSt_Gesamt: 50.00,
      GesamtbetragBrutto: 300.00,
    },
    {
      KundenID: kunde1.KundenID,
      ErstelltVonBenutzerID: adminUser.BenutzerID,
      Rechnungsnummer: 'R005',
      Rechnungsdatum: new Date('2025-05-15'),
      Faelligkeitsdatum: new Date('2025-06-15'),
      Rechnungsadresse: kunde1.Adresse + ', ' + kunde1.PLZ + ' ' + kunde1.Ort + ', ' + kunde1.Land,
      GesamtbetragNetto: 75.00,
      MwSt_Gesamt: 7.50,
      GesamtbetragBrutto: 82.50,
    },
  ];

  const rechnungen = await prisma.rechnungen.createMany({
    data: rechnungenData,
    skipDuplicates: true,
  });
  console.log(`Created ${rechnungen.count} Rechnungen`);

  // Fetch created Rechnungen for reference
  const rechnung1 = await prisma.rechnungen.findFirst({ where: { Rechnungsnummer: 'R001' } });
  if (!rechnung1) throw new Error('Rechnung R001 not found');
  const rechnung2 = await prisma.rechnungen.findFirst({ where: { Rechnungsnummer: 'R002' } });
  if (!rechnung2) throw new Error('Rechnung R002 not found');
  const rechnung3 = await prisma.rechnungen.findFirst({ where: { Rechnungsnummer: 'R003' } });
  if (!rechnung3) throw new Error('Rechnung R003 not found');
  const rechnung4 = await prisma.rechnungen.findFirst({ where: { Rechnungsnummer: 'R004' } });
  if (!rechnung4) throw new Error('Rechnung R004 not found');
  const rechnung5 = await prisma.rechnungen.findFirst({ where: { Rechnungsnummer: 'R005' } });
  if (!rechnung5) throw new Error('Rechnung R005 not found');

  // Fetch laptop product before using it
  const laptop = await prisma.produkte.findUnique({ where: { Artikelnummer: 'L001' } });
  if (!laptop) throw new Error('Produkt Laptop not found');

  // Seed Rechnungspositionen (Invoice Positions)
  const rechnungspositionenData = [
    // Positions for Rechnung R001
    {
      RechnungsID: rechnung1.RechnungsID,
      ProduktID: apfel.ProduktID,
      Menge: 50.0,
      EinzelpreisNetto: 0.50,
      GesamtpreisNettoPosition: 25.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 2.50,
      Beschreibung: 'Frischer roter Apfel',
    },
    {
      RechnungsID: rechnung1.RechnungsID,
      ProduktID: brot.ProduktID,
      Menge: 10.0,
      EinzelpreisNetto: 2.00,
      GesamtpreisNettoPosition: 20.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 2.00,
      Beschreibung: 'Vollkornbrot 500g',
    },
    // Positions for Rechnung R002
    {
      RechnungsID: rechnung2.RechnungsID,
      ProduktID: laptop.ProduktID,
      Menge: 1.0,
      EinzelpreisNetto: 800.00,
      GesamtpreisNettoPosition: 800.00,
      MwSt_Satz: 20.0,
      MwSt_Betrag: 160.00,
      Beschreibung: 'High-End Laptop',
    },
    // Positions for Rechnung R003
    {
      RechnungsID: rechnung3.RechnungsID,
      ProduktID: milch.ProduktID,
      Menge: 100.0,
      EinzelpreisNetto: 1.00,
      GesamtpreisNettoPosition: 100.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 10.00,
      Beschreibung: 'Vollmilch 1L',
    },
    {
      RechnungsID: rechnung3.RechnungsID,
      ProduktID: zucker.ProduktID,
      Menge: 10.0,
      EinzelpreisNetto: 2.00,
      GesamtpreisNettoPosition: 20.00,
      MwSt_Satz: 20.0,
      MwSt_Betrag: 4.00,
      Beschreibung: 'Kristallzucker 1kg',
    },
    // Positions for Rechnung R004
    {
      RechnungsID: rechnung4.RechnungsID,
      ProduktID: apfel.ProduktID,
      Menge: 200.0,
      EinzelpreisNetto: 0.50,
      GesamtpreisNettoPosition: 100.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 10.00,
      Beschreibung: 'Frischer roter Apfel',
    },
    {
      RechnungsID: rechnung4.RechnungsID,
      ProduktID: brot.ProduktID,
      Menge: 75.0,
      EinzelpreisNetto: 2.00,
      GesamtpreisNettoPosition: 150.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 15.00,
      Beschreibung: 'Vollkornbrot 500g',
    },
    // Positions for Rechnung R005
    {
      RechnungsID: rechnung5.RechnungsID,
      ProduktID: zucker.ProduktID,
      Menge: 25.0,
      EinzelpreisNetto: 2.00,
      GesamtpreisNettoPosition: 50.00,
      MwSt_Satz: 20.0,
      MwSt_Betrag: 10.00,
      Beschreibung: 'Kristallzucker 1kg',
    },
    {
      RechnungsID: rechnung5.RechnungsID,
      ProduktID: milch.ProduktID,
      Menge: 25.0,
      EinzelpreisNetto: 1.00,
      GesamtpreisNettoPosition: 25.00,
      MwSt_Satz: 10.0,
      MwSt_Betrag: 2.50,
      Beschreibung: 'Vollmilch 1L',
    },
  ];

  const rechnungspositionen = await prisma.rechnungspositionen.createMany({
    data: rechnungspositionenData,
    skipDuplicates: true,
  });
  console.log(`Created ${rechnungspositionen.count} Rechnungspositionen`);

  // ========================================
  // MODULE SYSTEM - AUDIENCE TEMPLATES SEED
  // ========================================

  // Seed ModuleDefinition (All available modules in the system)
  const moduleDefinitions = await prisma.moduleDefinition.createMany({
    data: [
      // Core Modules
      { ModulName: 'kunden', DisplayName: 'Kunden', Beschreibung: 'Kundenverwaltung', Icon: 'i-heroicons-users', Kategorie: 'Core', Route: '/kunden', SortOrder: 1, IstSystem: true },
      { ModulName: 'produkte', DisplayName: 'Produkte', Beschreibung: 'Produktverwaltung', Icon: 'i-heroicons-cube', Kategorie: 'Core', Route: '/produkte', SortOrder: 2, IstSystem: true },
      { ModulName: 'kategorien', DisplayName: 'Kategorien', Beschreibung: 'Produktkategorien', Icon: 'i-heroicons-folder', Kategorie: 'Core', Route: '/kategorien', SortOrder: 3, IstSystem: false },
      { ModulName: 'bestand', DisplayName: 'Bestand', Beschreibung: 'Lagerverwaltung', Icon: 'i-heroicons-archive-box', Kategorie: 'Inventory', Route: '/bestand', SortOrder: 4, IstSystem: false },
      { ModulName: 'rechnungen', DisplayName: 'Rechnungen', Beschreibung: 'Rechnungsverwaltung', Icon: 'i-heroicons-document-text', Kategorie: 'Finance', Route: '/rechnungen', SortOrder: 5, IstSystem: true },

      // Inventory Modules
      { ModulName: 'lagerbewegungen', DisplayName: 'Lagerbewegungen', Beschreibung: 'Warenbewegungen', Icon: 'i-heroicons-arrow-path', Kategorie: 'Inventory', Route: '/lagerbewegungen', SortOrder: 6, IstSystem: false },
      { ModulName: 'standorte', DisplayName: 'Standorte', Beschreibung: 'Standortverwaltung', Icon: 'i-heroicons-map-pin', Kategorie: 'Inventory', Route: '/standorte', SortOrder: 7, IstSystem: false },

      // Sales Modules
      { ModulName: 'bestellungen', DisplayName: 'Bestellungen', Beschreibung: 'Bestellverwaltung', Icon: 'i-heroicons-shopping-cart', Kategorie: 'Sales', Route: '/bestellungen', SortOrder: 8, IstSystem: false },
      { ModulName: 'kassen', DisplayName: 'Kassen', Beschreibung: 'Kassenverwaltung', Icon: 'i-heroicons-banknotes', Kategorie: 'Sales', Route: '/kassen', SortOrder: 9, IstSystem: false },
      { ModulName: 'preise', DisplayName: 'Preise', Beschreibung: 'Preisverwaltung', Icon: 'i-heroicons-tag', Kategorie: 'Sales', Route: '/preise', SortOrder: 10, IstSystem: false },

      // Customer Relations
      { ModulName: 'kundengruppen', DisplayName: 'Kundengruppen', Beschreibung: 'Kundensegmentierung', Icon: 'i-heroicons-user-group', Kategorie: 'CRM', Route: '/kundengruppen', SortOrder: 11, IstSystem: false },
      { ModulName: 'kundenkarten', DisplayName: 'Kundenkarten', Beschreibung: 'Treuekarten', Icon: 'i-heroicons-credit-card', Kategorie: 'CRM', Route: '/kundenkarten', SortOrder: 12, IstSystem: false },
      { ModulName: 'rabatte', DisplayName: 'Rabatte', Beschreibung: 'Rabattverwaltung', Icon: 'i-heroicons-receipt-percent', Kategorie: 'CRM', Route: '/rabatte', SortOrder: 13, IstSystem: false },

      // Finance Modules
      { ModulName: 'zahlungen', DisplayName: 'Zahlungen', Beschreibung: 'Zahlungsverwaltung', Icon: 'i-heroicons-currency-euro', Kategorie: 'Finance', Route: '/zahlungen', SortOrder: 14, IstSystem: false },
      { ModulName: 'gutschriften', DisplayName: 'Gutschriften', Beschreibung: 'Gutschriftenverwaltung', Icon: 'i-heroicons-document-minus', Kategorie: 'Finance', Route: '/gutschriften', SortOrder: 15, IstSystem: false },

      // Supplier Management
      { ModulName: 'lieferanten', DisplayName: 'Lieferanten', Beschreibung: 'Lieferantenverwaltung', Icon: 'i-heroicons-truck', Kategorie: 'Procurement', Route: '/lieferanten', SortOrder: 16, IstSystem: false },

      // Returns
      { ModulName: 'retouren', DisplayName: 'Retouren', Beschreibung: 'Retourenverwaltung', Icon: 'i-heroicons-arrow-uturn-left', Kategorie: 'Sales', Route: '/retouren', SortOrder: 17, IstSystem: false },

      // Configuration
      { ModulName: 'einheiten', DisplayName: 'Einheiten', Beschreibung: 'Maßeinheiten', Icon: 'i-heroicons-calculator', Kategorie: 'Settings', Route: '/einheiten', SortOrder: 18, IstSystem: false },
      { ModulName: 'umsatzsteuersaetze', DisplayName: 'Umsatzsteuersätze', Beschreibung: 'Steuersätze', Icon: 'i-heroicons-percent-badge', Kategorie: 'Settings', Route: '/umsatzsteuersaetze', SortOrder: 19, IstSystem: false },

      // Wholesale-specific modules
      { ModulName: 'preisvertraege', DisplayName: 'Preisverträge', Beschreibung: 'Kundenspezifische Preisverträge', Icon: 'i-heroicons-document-check', Kategorie: 'Procurement', Route: '/preisvertraege', SortOrder: 20, IstSystem: false },
      { ModulName: 'vertreter', DisplayName: 'Vertriebsvertreter', Beschreibung: 'Vertreterverwaltung und Provisionen', Icon: 'i-heroicons-user-circle', Kategorie: 'CRM', Route: '/vertreter', SortOrder: 21, IstSystem: false },
      { ModulName: 'kreditmanagement', DisplayName: 'Kreditmanagement', Beschreibung: 'Kreditlimits und Mahnwesen', Icon: 'i-heroicons-exclamation-triangle', Kategorie: 'Finance', Route: '/kreditmanagement', SortOrder: 22, IstSystem: false },
      { ModulName: 'lieferungen', DisplayName: 'Lieferungen & Logistik', Beschreibung: 'Lieferplanung und Tourenmanagement', Icon: 'i-heroicons-truck', Kategorie: 'Procurement', Route: '/lieferungen', SortOrder: 23, IstSystem: false },
      { ModulName: 'angebote', DisplayName: 'Angebote', Beschreibung: 'Angebotsverwaltung und Quote-to-Order', Icon: 'i-heroicons-document-duplicate', Kategorie: 'Sales', Route: '/angebote', SortOrder: 24, IstSystem: false },

      // Restaurant-specific modules
      { ModulName: 'restaurant', DisplayName: 'Restaurant', Beschreibung: 'Restaurant-Modul mit Tischen und Reservierungen', Icon: 'i-mdi-silverware-fork-knife', Kategorie: 'Restaurant', Route: '/restaurant', SortOrder: 25, IstSystem: false },
      { ModulName: 'restaurant_tische', DisplayName: 'Tische', Beschreibung: 'Tischverwaltung und Tischbereiche', Icon: 'i-mdi-table-furniture', Kategorie: 'Restaurant', Route: '/restaurant/tische', SortOrder: 26, IstSystem: false },
      { ModulName: 'restaurant_reservierungen', DisplayName: 'Reservierungen', Beschreibung: 'Tischreservierungen verwalten', Icon: 'i-mdi-calendar-check', Kategorie: 'Restaurant', Route: '/restaurant/reservierungen', SortOrder: 27, IstSystem: false },
      { ModulName: 'restaurant_bestellungen', DisplayName: 'Restaurant Bestellungen', Beschreibung: 'Speisebestellungen am Tisch', Icon: 'i-mdi-clipboard-list', Kategorie: 'Restaurant', Route: '/restaurant/bestellungen', SortOrder: 28, IstSystem: false },

      // Hotel-specific modules
      { ModulName: 'hotel', DisplayName: 'Hotel', Beschreibung: 'Hotelverwaltung mit Zimmern und Buchungen', Icon: 'i-mdi-hotel', Kategorie: 'Hotel', Route: '/hotel', SortOrder: 30, IstSystem: false },
      { ModulName: 'hotel_zimmer', DisplayName: 'Zimmer', Beschreibung: 'Zimmerverwaltung', Icon: 'i-mdi-bed', Kategorie: 'Hotel', Route: '/hotel/zimmer', SortOrder: 31, IstSystem: false },
      { ModulName: 'hotel_zimmerkategorien', DisplayName: 'Zimmerkategorien', Beschreibung: 'Zimmertypen und Kategorien', Icon: 'i-mdi-tag-multiple', Kategorie: 'Hotel', Route: '/hotel/zimmerkategorien', SortOrder: 32, IstSystem: false },
      { ModulName: 'hotel_buchungen', DisplayName: 'Buchungen', Beschreibung: 'Hotelbuchungen und Reservierungen', Icon: 'i-mdi-calendar-clock', Kategorie: 'Hotel', Route: '/hotel/buchungen', SortOrder: 33, IstSystem: false },

      // Online Shop modules
      { ModulName: 'shop', DisplayName: 'Online Shop', Beschreibung: 'E-Commerce und Online-Verkauf', Icon: 'i-mdi-shopping', Kategorie: 'Shop', Route: '/shop', SortOrder: 35, IstSystem: false },
      { ModulName: 'shop_bestellungen', DisplayName: 'Shop Bestellungen', Beschreibung: 'Online-Bestellungen verwalten', Icon: 'i-mdi-cart', Kategorie: 'Shop', Route: '/shop/bestellungen', SortOrder: 36, IstSystem: false },
      { ModulName: 'shop_kategorien', DisplayName: 'Shop Kategorien', Beschreibung: 'Produktkategorien für den Shop', Icon: 'i-mdi-folder-outline', Kategorie: 'Shop', Route: '/shop/kategorien', SortOrder: 37, IstSystem: false },

      // Reports module
      { ModulName: 'berichte', DisplayName: 'Berichte', Beschreibung: 'Berichte und Statistiken', Icon: 'i-mdi-chart-bar', Kategorie: 'Reports', Route: '/berichte', SortOrder: 40, IstSystem: false },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${moduleDefinitions.count} ModuleDefinitions`);

  // Seed AudienceTemplate
  const audienceTemplates = await prisma.audienceTemplate.createMany({
    data: [
      {
        Name: 'wholesale',
        DisplayName: 'Großhandel / Wholesale',
        Beschreibung: 'Optimiert für Großhandelsunternehmen mit Fokus auf B2B-Verkauf, Lieferantenverwaltung und Lagerhaltung',
        Icon: 'i-heroicons-building-storefront',
        Farbe: 'blue',
        SortOrder: 1,
        IstAktiv: true,
      },
      {
        Name: 'restaurant',
        DisplayName: 'Restaurant',
        Beschreibung: 'Speziell für Restaurants mit Kassensystem, Speisekartenverwaltung und Tischreservierungen',
        Icon: 'i-heroicons-building-office-2',
        Farbe: 'red',
        SortOrder: 2,
        IstAktiv: true,
      },
      {
        Name: 'hotel',
        DisplayName: 'Hotel',
        Beschreibung: 'Für Hotels mit Zimmerverwaltung, Reservierungen und Gästeverwaltung',
        Icon: 'i-heroicons-building-library',
        Farbe: 'purple',
        SortOrder: 3,
        IstAktiv: true,
      },
      {
        Name: 'airbnb',
        DisplayName: 'Ferienvermietung / Airbnb',
        Beschreibung: 'Für Ferienwohnungen und Kurzzeitvermietungen mit Buchungsverwaltung',
        Icon: 'i-heroicons-home',
        Farbe: 'pink',
        SortOrder: 4,
        IstAktiv: true,
      },
      {
        Name: 'online_shop',
        DisplayName: 'Online Shop / E-Commerce',
        Beschreibung: 'Vollständiges E-Commerce-System mit Produktkatalog, Warenkorb und Zahlungsabwicklung',
        Icon: 'i-heroicons-shopping-bag',
        Farbe: 'green',
        SortOrder: 5,
        IstAktiv: true,
      },
      {
        Name: 'retail',
        DisplayName: 'Einzelhandel / Retail',
        Beschreibung: 'Für Einzelhandelsgeschäfte mit Kassensystem und Lagerverwaltung',
        Icon: 'i-heroicons-building-storefront',
        Farbe: 'orange',
        SortOrder: 6,
        IstAktiv: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${audienceTemplates.count} AudienceTemplates`);

  // Fetch created templates and modules for configuration mapping
  const wholesale = await prisma.audienceTemplate.findFirst({ where: { Name: 'wholesale' } });
  const restaurant = await prisma.audienceTemplate.findFirst({ where: { Name: 'restaurant' } });
  const hotel = await prisma.audienceTemplate.findFirst({ where: { Name: 'hotel' } });
  const airbnb = await prisma.audienceTemplate.findFirst({ where: { Name: 'airbnb' } });
  const onlineShop = await prisma.audienceTemplate.findFirst({ where: { Name: 'online_shop' } });
  const retail = await prisma.audienceTemplate.findFirst({ where: { Name: 'retail' } });

  // Fetch all module definitions
  const allModules = await prisma.moduleDefinition.findMany();
  const moduleMap = new Map(allModules.map(m => [m.ModulName, m]));

  // Helper function to get module ID by name
  const getModuleId = (name: string) => {
    const module = moduleMap.get(name);
    if (!module) throw new Error(`Module ${name} not found`);
    return module.ModulID;
  };

  // Seed ModuleKonfiguration for each audience template
  const moduleConfigData = [];

  // Wholesale configuration
  if (wholesale) {
    moduleConfigData.push(
      // Core modules (10 Required)
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'B2B-Kundenverwaltung essentiell' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Großhandelsprodukte' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Lagerverwaltung kritisch' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Erforderlich', IstAktiviert: true },

      // Important modules (11 Important)
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('preisvertraege'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Kundenspezifische Preisvereinbarungen' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('vertreter'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Vertriebsvertreter und Provisionen' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kreditmanagement'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Kreditlimits und Mahnwesen' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('lieferungen'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Lieferplanung und Logistik' },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('angebote'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Angebote und Quotes' },

      // Optional modules (2 Optional)
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Optional', IstAktiviert: false },

      // Hidden modules (1 Hidden)
      { TemplateID: wholesale.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Versteckt', IstAktiviert: false }
    );
  }

  // Restaurant configuration
  if (restaurant) {
    moduleConfigData.push(
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Speisekarte / Menüpunkte' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Speisekategorien' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Zutaten und Vorräte' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'POS-System essentiell' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: false },
      // Restaurant-specific modules
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('restaurant'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Hauptmodul Restaurant' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('restaurant_tische'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Tischverwaltung' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('restaurant_reservierungen'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Reservierungssystem' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('restaurant_bestellungen'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Tischbestellungen' },
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('berichte'), Prioritaet: 'Wichtig', IstAktiviert: true }
    );
  }

  // Hotel configuration
  if (hotel) {
    moduleConfigData.push(
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Gästeverwaltung' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Optional', IstAktiviert: true, Beschreibung: 'Zusatzleistungen' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Optional', IstAktiviert: true, Beschreibung: 'Treueprogramm' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Optional', IstAktiviert: false },
      // Hotel-specific modules
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('hotel'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Hauptmodul Hotel' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('hotel_zimmer'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Zimmerverwaltung' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('hotel_zimmerkategorien'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Zimmertypen' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('hotel_buchungen'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Buchungssystem' },
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('berichte'), Prioritaet: 'Wichtig', IstAktiviert: true }
    );
  }

  // Airbnb/Vacation Rental configuration
  if (airbnb) {
    moduleConfigData.push(
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Gästeverwaltung' },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Saisonale Preisgestaltung' },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Optional', IstAktiviert: true, Beschreibung: 'Zusatzleistungen' },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Optional', IstAktiviert: true, Beschreibung: 'Mehrere Unterkünfte' },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Versteckt', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: false },
      { TemplateID: airbnb.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Versteckt', IstAktiviert: false }
    );
  }

  // Online Shop configuration
  if (onlineShop) {
    moduleConfigData.push(
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Wichtig', IstAktiviert: true, Beschreibung: 'Treueprogramm' },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: true },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Optional', IstAktiviert: false },
      // Shop-specific modules
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('shop'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Hauptmodul Shop' },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('shop_bestellungen'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Online-Bestellungen' },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('shop_kategorien'), Prioritaet: 'Erforderlich', IstAktiviert: true, Beschreibung: 'Shop-Kategorien' },
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('berichte'), Prioritaet: 'Wichtig', IstAktiviert: true }
    );
  }

  // Retail configuration
  if (retail) {
    moduleConfigData.push(
      { TemplateID: retail.TemplateID, ModulID: getModuleId('kunden'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('produkte'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('kategorien'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('bestand'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('rechnungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('preise'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('zahlungen'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('kundengruppen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('kundenkarten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('rabatte'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('standorte'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('lagerbewegungen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('lieferanten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('bestellungen'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('retouren'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('umsatzsteuersaetze'), Prioritaet: 'Erforderlich', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Wichtig', IstAktiviert: true },
      { TemplateID: retail.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: true }
    );
  }

  const moduleConfigs = await prisma.moduleKonfiguration.createMany({
    data: moduleConfigData,
    skipDuplicates: true,
  });
  console.log(`Created ${moduleConfigs.count} ModuleKonfigurationen`);

  // ========================================
  // RABATTE (DISCOUNTS) SEED
  // ========================================

  const rabatte = await prisma.rabatte.createMany({
    data: [
      {
        Name: '10% Neukunden',
        Beschreibung: 'Rabatt für Neukunden',
        RabattTyp: 'Prozentual',
        Anwendungsebene: 'Kopf',
        Wert: 10.00,
        Mindestbestellwert: 50.00,
        GueltigAb: new Date(),
        Status: 'Aktiv'
      },
      {
        Name: '5€ Newsletter',
        Beschreibung: 'Rabatt für Newsletter-Anmeldung',
        RabattTyp: 'Festbetrag',
        Anwendungsebene: 'Kopf',
        Wert: 5.00,
        Mindestbestellwert: 30.00,
        Gutscheincode: 'NEWSLETTER5',
        GueltigAb: new Date(),
        Status: 'Aktiv'
      },
      {
        Name: '15% VIP',
        Beschreibung: 'Exklusiver VIP-Rabatt',
        RabattTyp: 'Prozentual',
        Anwendungsebene: 'Kunde',
        Wert: 15.00,
        GueltigAb: new Date(),
        Status: 'Aktiv'
      },
      {
        Name: 'Mengenrabatt 10+',
        Beschreibung: 'Rabatt ab 10 Stück',
        RabattTyp: 'Mengenrabatt',
        Anwendungsebene: 'Zeile',
        Wert: 5.00,
        GueltigAb: new Date(),
        Status: 'Aktiv'
      }
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${rabatte.count} Rabatte`);

  // ========================================
  // HOTEL MODULE SEED
  // ========================================

  // Seed Zimmerkategorien (Room Categories)
  const zimmerkategorien = await prisma.zimmerkategorien.createMany({
    data: [
      {
        Name: 'Einzelzimmer Standard',
        Beschreibung: 'Gemütliches Einzelzimmer mit allen Annehmlichkeiten',
        Grundpreis: 79.00,
        MaxPersonen: 1,
        Ausstattung: JSON.stringify(['WLAN', 'TV', 'Minibar', 'Dusche']),
        Groesse: 18.00,
        SortierReihenfolge: 1,
        IstAktiv: true
      },
      {
        Name: 'Doppelzimmer Standard',
        Beschreibung: 'Komfortables Doppelzimmer für 2 Personen',
        Grundpreis: 119.00,
        MaxPersonen: 2,
        Ausstattung: JSON.stringify(['WLAN', 'TV', 'Minibar', 'Badewanne', 'Klimaanlage']),
        Groesse: 25.00,
        SortierReihenfolge: 2,
        IstAktiv: true
      },
      {
        Name: 'Doppelzimmer Superior',
        Beschreibung: 'Geräumiges Doppelzimmer mit Balkon',
        Grundpreis: 149.00,
        MaxPersonen: 2,
        Ausstattung: JSON.stringify(['WLAN', 'TV', 'Minibar', 'Badewanne', 'Klimaanlage', 'Balkon', 'Nespresso-Maschine']),
        Groesse: 32.00,
        SortierReihenfolge: 3,
        IstAktiv: true
      },
      {
        Name: 'Junior Suite',
        Beschreibung: 'Elegante Suite mit separatem Wohnbereich',
        Grundpreis: 199.00,
        MaxPersonen: 3,
        Ausstattung: JSON.stringify(['WLAN', 'Smart-TV', 'Minibar', 'Whirlpool', 'Klimaanlage', 'Balkon', 'Nespresso-Maschine', 'Bademantel']),
        Groesse: 45.00,
        SortierReihenfolge: 4,
        IstAktiv: true
      },
      {
        Name: 'Familienzimmer',
        Beschreibung: 'Großes Zimmer für Familien mit bis zu 4 Personen',
        Grundpreis: 179.00,
        MaxPersonen: 4,
        Ausstattung: JSON.stringify(['WLAN', 'TV', 'Minibar', 'Dusche', 'Klimaanlage', 'Kinderbett möglich']),
        Groesse: 38.00,
        SortierReihenfolge: 5,
        IstAktiv: true
      }
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${zimmerkategorien.count} Zimmerkategorien`);

  // Fetch Zimmerkategorien for reference
  const einzelzimmer = await prisma.zimmerkategorien.findFirst({ where: { Name: 'Einzelzimmer Standard' } });
  const doppelzimmerStd = await prisma.zimmerkategorien.findFirst({ where: { Name: 'Doppelzimmer Standard' } });
  const doppelzimmerSup = await prisma.zimmerkategorien.findFirst({ where: { Name: 'Doppelzimmer Superior' } });
  const juniorSuite = await prisma.zimmerkategorien.findFirst({ where: { Name: 'Junior Suite' } });
  const familienzimmer = await prisma.zimmerkategorien.findFirst({ where: { Name: 'Familienzimmer' } });

  if (einzelzimmer && doppelzimmerStd && doppelzimmerSup && juniorSuite && familienzimmer) {
    // Seed Zimmer (Rooms)
    const zimmer = await prisma.zimmer.createMany({
      data: [
        { Zimmernummer: '101', ZimmerkategorieID: einzelzimmer.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 1, PreisProNacht: 79.00, MaxPersonen: 1, Status: 'Verfuegbar' },
        { Zimmernummer: '102', ZimmerkategorieID: einzelzimmer.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 1, PreisProNacht: 79.00, MaxPersonen: 1, Status: 'Verfuegbar' },
        { Zimmernummer: '103', ZimmerkategorieID: doppelzimmerStd.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 1, PreisProNacht: 119.00, MaxPersonen: 2, Status: 'Verfuegbar' },
        { Zimmernummer: '104', ZimmerkategorieID: doppelzimmerStd.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 1, PreisProNacht: 119.00, MaxPersonen: 2, Status: 'Verfuegbar' },
        { Zimmernummer: '201', ZimmerkategorieID: doppelzimmerSup.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 2, PreisProNacht: 149.00, MaxPersonen: 2, Status: 'Verfuegbar' },
        { Zimmernummer: '202', ZimmerkategorieID: doppelzimmerSup.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 2, PreisProNacht: 149.00, MaxPersonen: 2, Status: 'Verfuegbar' },
        { Zimmernummer: '203', ZimmerkategorieID: familienzimmer.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 2, PreisProNacht: 179.00, MaxPersonen: 4, Status: 'Verfuegbar' },
        { Zimmernummer: '301', ZimmerkategorieID: juniorSuite.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 3, PreisProNacht: 199.00, MaxPersonen: 3, Status: 'Verfuegbar' },
        { Zimmernummer: '302', ZimmerkategorieID: juniorSuite.ZimmerkategorieID, StandortID: wien.StandortID, Etage: 3, PreisProNacht: 219.00, MaxPersonen: 3, Status: 'Verfuegbar', IstBarrierfrei: true },
      ],
      skipDuplicates: true,
    });
    console.log(`Created ${zimmer.count} Zimmer`);

    // Fetch rooms for bookings
    const room101 = await prisma.zimmer.findFirst({ where: { Zimmernummer: '101' } });
    const room201 = await prisma.zimmer.findFirst({ where: { Zimmernummer: '201' } });
    const room301 = await prisma.zimmer.findFirst({ where: { Zimmernummer: '301' } });

    if (room101 && room201 && room301) {
      // Seed Hotel Buchungen (Bookings)
      const checkIn1 = new Date();
      checkIn1.setDate(checkIn1.getDate() + 7);
      const checkOut1 = new Date(checkIn1);
      checkOut1.setDate(checkOut1.getDate() + 3);

      const checkIn2 = new Date();
      checkIn2.setDate(checkIn2.getDate() + 14);
      const checkOut2 = new Date(checkIn2);
      checkOut2.setDate(checkOut2.getDate() + 5);

      const checkIn3 = new Date();
      checkIn3.setDate(checkIn3.getDate() + 1);
      const checkOut3 = new Date(checkIn3);
      checkOut3.setDate(checkOut3.getDate() + 2);

      const booking1 = await prisma.hotelBuchungen.create({
        data: {
          Buchungsnummer: 'HB-000001',
          KundenID: kunde1.KundenID,
          Gastname: 'Hans Muster',
          Email: 'hans.muster@example.com',
          Telefon: '+43123456789',
          CheckInDatum: checkIn1,
          CheckOutDatum: checkOut1,
          AnzahlErwachsene: 2,
          AnzahlKinder: 0,
          Status: 'Bestaetigt',
          GesamtpreisNetto: 417.76,
          GesamtpreisBrutto: 447.00,
          MwStGesamt: 29.24,
          Zahlungsstatus: 'Ausstehend',
          ErfasstVonBenutzerID: adminUser.BenutzerID,
          HotelBuchungszimmer: {
            create: {
              ZimmerID: room201.ZimmerID,
              CheckInDatum: checkIn1,
              CheckOutDatum: checkOut1,
              PreisProNacht: 149.00,
              AnzahlNaechte: 3,
              GesamtpreisNetto: 417.76,
              MwStSatz: 7.00,
              MwStBetrag: 29.24
            }
          },
          HotelGaeste: {
            create: [
              {
                Vorname: 'Hans',
                Nachname: 'Muster',
                Geburtsdatum: new Date('1985-03-15'),
                Nationalitaet: 'Österreich',
                AusweisnummerTyp: 'Personalausweis',
                Ausweisnummer: 'PA12345678',
                Email: 'hans.muster@example.com',
                Telefon: '+43123456789',
                Adresse: 'Musterstraße 1',
                Stadt: 'Wien',
                PLZ: '1010',
                Land: 'Österreich',
                IstHauptgast: true
              },
              {
                Vorname: 'Maria',
                Nachname: 'Muster',
                Geburtsdatum: new Date('1987-06-22'),
                Nationalitaet: 'Österreich',
                AusweisnummerTyp: 'Personalausweis',
                Ausweisnummer: 'PA87654321',
                IstHauptgast: false
              }
            ]
          }
        }
      });

      const booking2 = await prisma.hotelBuchungen.create({
        data: {
          Buchungsnummer: 'HB-000002',
          KundenID: kunde2.KundenID,
          Gastname: 'Großhandel GmbH - Herr Schmidt',
          Email: 'info@grosshandel.at',
          Telefon: '+43987654321',
          CheckInDatum: checkIn2,
          CheckOutDatum: checkOut2,
          AnzahlErwachsene: 1,
          AnzahlKinder: 0,
          Status: 'Bestaetigt',
          GesamtpreisNetto: 929.44,
          GesamtpreisBrutto: 995.00,
          MwStGesamt: 65.56,
          Zahlungsstatus: 'Angezahlt',
          Anzahlung: 200.00,
          ErfasstVonBenutzerID: adminUser.BenutzerID,
          HotelBuchungszimmer: {
            create: {
              ZimmerID: room301.ZimmerID,
              CheckInDatum: checkIn2,
              CheckOutDatum: checkOut2,
              PreisProNacht: 199.00,
              AnzahlNaechte: 5,
              GesamtpreisNetto: 929.44,
              MwStSatz: 7.00,
              MwStBetrag: 65.56
            }
          },
          HotelGaeste: {
            create: {
              Vorname: 'Thomas',
              Nachname: 'Schmidt',
              Geburtsdatum: new Date('1978-11-05'),
              Nationalitaet: 'Deutschland',
              AusweisnummerTyp: 'Reisepass',
              Ausweisnummer: 'C01X23456',
              Email: 't.schmidt@grosshandel.at',
              Telefon: '+4917612345678',
              Adresse: 'Handelsstraße 10',
              Stadt: 'Wien',
              PLZ: '1020',
              Land: 'Österreich',
              IstHauptgast: true
            }
          }
        }
      });

      const booking3 = await prisma.hotelBuchungen.create({
        data: {
          Buchungsnummer: 'HB-000003',
          Gastname: 'Anna Berger',
          Email: 'anna.berger@email.at',
          Telefon: '+43664123456',
          CheckInDatum: checkIn3,
          CheckOutDatum: checkOut3,
          AnzahlErwachsene: 1,
          Status: 'Bestaetigt',
          GesamtpreisNetto: 147.66,
          GesamtpreisBrutto: 158.00,
          MwStGesamt: 10.34,
          Zahlungsstatus: 'Ausstehend',
          ErfasstVonBenutzerID: adminUser.BenutzerID,
          HotelBuchungszimmer: {
            create: {
              ZimmerID: room101.ZimmerID,
              CheckInDatum: checkIn3,
              CheckOutDatum: checkOut3,
              PreisProNacht: 79.00,
              AnzahlNaechte: 2,
              GesamtpreisNetto: 147.66,
              MwStSatz: 7.00,
              MwStBetrag: 10.34
            }
          },
          HotelGaeste: {
            create: {
              Vorname: 'Anna',
              Nachname: 'Berger',
              Geburtsdatum: new Date('1992-08-18'),
              Nationalitaet: 'Österreich',
              AusweisnummerTyp: 'Führerschein',
              Ausweisnummer: 'FS98765432',
              Email: 'anna.berger@email.at',
              Telefon: '+43664123456',
              IstHauptgast: true
            }
          }
        }
      });

      console.log(`Created 3 Hotel Buchungen with guests`);
    }
  }

  // ========================================
  // RESTAURANT MODULE SEED
  // ========================================

  // Seed Tischbereiche (Table Areas)
  const tischbereiche = await prisma.tischbereiche.createMany({
    data: [
      { Name: 'Innenbereich', Beschreibung: 'Gemütlicher Innenbereich', StandortID: wien.StandortID, Farbe: 'blue', SortOrder: 1, IstAktiv: true },
      { Name: 'Terrasse', Beschreibung: 'Sonnige Außenterrasse', StandortID: wien.StandortID, Farbe: 'green', SortOrder: 2, IstAktiv: true },
      { Name: 'VIP-Bereich', Beschreibung: 'Exklusiver Bereich für besondere Anlässe', StandortID: wien.StandortID, Farbe: 'purple', SortOrder: 3, IstAktiv: true },
      { Name: 'Bar', Beschreibung: 'Barhocker an der Theke', StandortID: wien.StandortID, Farbe: 'orange', SortOrder: 4, IstAktiv: true }
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${tischbereiche.count} Tischbereiche`);

  // Fetch areas for reference
  const innenbereich = await prisma.tischbereiche.findFirst({ where: { Name: 'Innenbereich' } });
  const terrasse = await prisma.tischbereiche.findFirst({ where: { Name: 'Terrasse' } });
  const vipBereich = await prisma.tischbereiche.findFirst({ where: { Name: 'VIP-Bereich' } });
  const barBereich = await prisma.tischbereiche.findFirst({ where: { Name: 'Bar' } });

  if (innenbereich && terrasse && vipBereich && barBereich) {
    // Seed RestaurantTische (Tables)
    const tische = await prisma.restaurantTische.createMany({
      data: [
        // Innenbereich
        { Tischnummer: '1', BereichID: innenbereich.BereichID, Kapazitaet: 4, Status: 'Verfuegbar', PositionX: 100, PositionY: 100, Form: 'rund' },
        { Tischnummer: '2', BereichID: innenbereich.BereichID, Kapazitaet: 4, Status: 'Verfuegbar', PositionX: 200, PositionY: 100, Form: 'rund' },
        { Tischnummer: '3', BereichID: innenbereich.BereichID, Kapazitaet: 6, Status: 'Verfuegbar', PositionX: 100, PositionY: 200, Form: 'rechteckig' },
        { Tischnummer: '4', BereichID: innenbereich.BereichID, Kapazitaet: 6, Status: 'Verfuegbar', PositionX: 200, PositionY: 200, Form: 'rechteckig' },
        { Tischnummer: '5', BereichID: innenbereich.BereichID, Kapazitaet: 2, Status: 'Verfuegbar', PositionX: 300, PositionY: 100, Form: 'rund' },
        // Terrasse
        { Tischnummer: 'T1', BereichID: terrasse.BereichID, Kapazitaet: 4, Status: 'Verfuegbar', PositionX: 100, PositionY: 100, Form: 'rund' },
        { Tischnummer: 'T2', BereichID: terrasse.BereichID, Kapazitaet: 4, Status: 'Verfuegbar', PositionX: 200, PositionY: 100, Form: 'rund' },
        { Tischnummer: 'T3', BereichID: terrasse.BereichID, Kapazitaet: 8, Status: 'Verfuegbar', PositionX: 150, PositionY: 200, Form: 'rechteckig', Beschreibung: 'Großer Gruppentisch' },
        // VIP
        { Tischnummer: 'VIP1', BereichID: vipBereich.BereichID, Kapazitaet: 8, Status: 'Verfuegbar', PositionX: 100, PositionY: 100, Form: 'oval', Beschreibung: 'Separée für besondere Anlässe' },
        { Tischnummer: 'VIP2', BereichID: vipBereich.BereichID, Kapazitaet: 6, Status: 'Verfuegbar', PositionX: 200, PositionY: 100, Form: 'rund' },
        // Bar
        { Tischnummer: 'B1', BereichID: barBereich.BereichID, Kapazitaet: 2, Status: 'Verfuegbar', PositionX: 100, PositionY: 50, Form: 'rechteckig' },
        { Tischnummer: 'B2', BereichID: barBereich.BereichID, Kapazitaet: 2, Status: 'Verfuegbar', PositionX: 150, PositionY: 50, Form: 'rechteckig' },
        { Tischnummer: 'B3', BereichID: barBereich.BereichID, Kapazitaet: 2, Status: 'Verfuegbar', PositionX: 200, PositionY: 50, Form: 'rechteckig' }
      ],
      skipDuplicates: true,
    });
    console.log(`Created ${tische.count} Restaurant Tische`);

    // Fetch tables for reservations
    const tisch1 = await prisma.restaurantTische.findFirst({ where: { Tischnummer: '1' } });
    const tischT1 = await prisma.restaurantTische.findFirst({ where: { Tischnummer: 'T1' } });
    const tischVIP1 = await prisma.restaurantTische.findFirst({ where: { Tischnummer: 'VIP1' } });

    if (tisch1 && tischT1 && tischVIP1) {
      // Seed Reservierungen (Reservations)
      const reservierungsDatum1 = new Date();
      reservierungsDatum1.setDate(reservierungsDatum1.getDate() + 1);
      reservierungsDatum1.setHours(19, 0, 0, 0);

      const reservierungsDatum2 = new Date();
      reservierungsDatum2.setDate(reservierungsDatum2.getDate() + 2);
      reservierungsDatum2.setHours(12, 30, 0, 0);

      const reservierungsDatum3 = new Date();
      reservierungsDatum3.setDate(reservierungsDatum3.getDate() + 3);
      reservierungsDatum3.setHours(20, 0, 0, 0);

      const reservierungen = await prisma.reservierungen.createMany({
        data: [
          {
            TischID: tisch1.TischID,
            KundenID: kunde1.KundenID,
            Gastname: 'Hans Muster',
            Telefon: '+43123456789',
            Email: 'hans.muster@example.com',
            PersonenAnzahl: 4,
            Reservierungsdatum: reservierungsDatum1,
            Dauer: 120,
            Status: 'Bestaetigt',
            Notizen: 'Geburtstag - bitte Kerzen bereitstellen',
            ErfasstVonBenutzerID: adminUser.BenutzerID
          },
          {
            TischID: tischT1.TischID,
            Gastname: 'Familie Huber',
            Telefon: '+43664987654',
            PersonenAnzahl: 4,
            Reservierungsdatum: reservierungsDatum2,
            Dauer: 90,
            Status: 'Bestaetigt',
            Notizen: 'Kinderhochstuhl benötigt',
            ErfasstVonBenutzerID: adminUser.BenutzerID
          },
          {
            TischID: tischVIP1.TischID,
            KundenID: kunde2.KundenID,
            Gastname: 'Großhandel GmbH',
            Telefon: '+43987654321',
            Email: 'info@grosshandel.at',
            PersonenAnzahl: 8,
            Reservierungsdatum: reservierungsDatum3,
            Dauer: 180,
            Status: 'Bestaetigt',
            Notizen: 'Geschäftsessen - Menüvorbestellung erwünscht',
            ErfasstVonBenutzerID: adminUser.BenutzerID
          }
        ],
        skipDuplicates: true,
      });
      console.log(`Created ${reservierungen.count} Reservierungen`);
    }
  }

  // ========================================
  // KASSEN (POS) MODULE SEED
  // ========================================

  // Seed Kassen (Cash Registers)
  const kassen = await prisma.kassen.createMany({
    data: [
      {
        Kassenbezeichnung: 'Hauptkasse Wien',
        StandortID: wien.StandortID,
        Kassennummer: 'K-WIEN-01',
        Anfangsbestand: 500.00,
        AktuellerBestand: 1250.75,
        Status: 'Aktiv'
      },
      {
        Kassenbezeichnung: 'Nebenkasse Wien',
        StandortID: wien.StandortID,
        Kassennummer: 'K-WIEN-02',
        Anfangsbestand: 300.00,
        AktuellerBestand: 485.50,
        Status: 'Aktiv'
      },
      {
        Kassenbezeichnung: 'Kasse Graz',
        StandortID: graz.StandortID,
        Kassennummer: 'K-GRAZ-01',
        Anfangsbestand: 400.00,
        AktuellerBestand: 892.30,
        Status: 'Aktiv'
      }
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${kassen.count} Kassen`);

  // Fetch Kassen for transactions
  const kasseWien1 = await prisma.kassen.findFirst({ where: { Kassennummer: 'K-WIEN-01' } });
  const kasseGraz = await prisma.kassen.findFirst({ where: { Kassennummer: 'K-GRAZ-01' } });

  if (kasseWien1 && kasseGraz) {
    // Seed Kassenbuchungen (Cash Register Transactions)
    const kassenbuchungen = await prisma.kassenbuchungen.createMany({
      data: [
        {
          KassenID: kasseWien1.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Einlage',
          Betrag: 500.00,
          Zahlungsart: 'Bar',
          Beschreibung: 'Anfangsbestand',
          Belegnummer: 'KB-001'
        },
        {
          KassenID: kasseWien1.KassenID,
          BenutzerID: adminUser.BenutzerID,
          RechnungsID: rechnung1.RechnungsID,
          KundenID: kunde1.KundenID,
          Buchungstyp: 'Einnahme',
          Betrag: 49.50,
          Zahlungsart: 'Bar',
          Beschreibung: 'Rechnung R001 - Barzahlung',
          Belegnummer: 'KB-002'
        },
        {
          KassenID: kasseWien1.KassenID,
          BenutzerID: adminUser.BenutzerID,
          RechnungsID: rechnung3.RechnungsID,
          KundenID: kunde1.KundenID,
          Buchungstyp: 'Einnahme',
          Betrag: 132.00,
          Zahlungsart: 'EC_Karte',
          Beschreibung: 'Rechnung R003 - EC-Kartenzahlung',
          Belegnummer: 'KB-003'
        },
        {
          KassenID: kasseWien1.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Einnahme',
          Betrag: 85.25,
          Zahlungsart: 'Bar',
          Beschreibung: 'Barverkauf - diverse Artikel',
          Belegnummer: 'KB-004'
        },
        {
          KassenID: kasseWien1.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Ausgabe',
          Betrag: -16.00,
          Zahlungsart: 'Bar',
          Beschreibung: 'Kleinausgabe - Büromaterial',
          Belegnummer: 'KB-005'
        },
        {
          KassenID: kasseGraz.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Einlage',
          Betrag: 400.00,
          Zahlungsart: 'Bar',
          Beschreibung: 'Anfangsbestand',
          Belegnummer: 'KB-G001'
        },
        {
          KassenID: kasseGraz.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Einnahme',
          Betrag: 245.80,
          Zahlungsart: 'Kreditkarte',
          Beschreibung: 'Verkauf diverse Artikel',
          Belegnummer: 'KB-G002'
        },
        {
          KassenID: kasseGraz.KassenID,
          BenutzerID: adminUser.BenutzerID,
          Buchungstyp: 'Einnahme',
          Betrag: 246.50,
          Zahlungsart: 'Bar',
          Beschreibung: 'Tagesverkäufe',
          Belegnummer: 'KB-G003'
        }
      ],
      skipDuplicates: true,
    });
    console.log(`Created ${kassenbuchungen.count} Kassenbuchungen`);
  }

  // ========================================
  // SHOP MODULE SEED
  // ========================================

  // Seed ShopKategorien (Shop Categories)
  const shopKategorien = await prisma.shopKategorien.createMany({
    data: [
      {
        Name: 'Lebensmittel',
        Beschreibung: 'Frische Lebensmittel und Grundnahrungsmittel',
        Slug: 'lebensmittel',
        SortOrder: 1,
        IstSichtbar: true,
        MetaTitel: 'Lebensmittel online kaufen',
        MetaBeschreibung: 'Frische Lebensmittel und Grundnahrungsmittel direkt zu Ihnen nach Hause.'
      },
      {
        Name: 'Obst & Gemüse',
        Beschreibung: 'Frisches Obst und Gemüse',
        Slug: 'obst-gemuese',
        SortOrder: 2,
        IstSichtbar: true
      },
      {
        Name: 'Milchprodukte',
        Beschreibung: 'Milch, Käse, Joghurt und mehr',
        Slug: 'milchprodukte',
        SortOrder: 3,
        IstSichtbar: true
      },
      {
        Name: 'Getränke',
        Beschreibung: 'Erfrischungsgetränke, Säfte und mehr',
        Slug: 'getraenke',
        SortOrder: 4,
        IstSichtbar: true
      },
      {
        Name: 'Elektronik',
        Beschreibung: 'Computer, Laptops und Zubehör',
        Slug: 'elektronik',
        SortOrder: 5,
        IstSichtbar: true
      },
      {
        Name: 'Haushalt',
        Beschreibung: 'Haushaltsprodukte und Reinigungsmittel',
        Slug: 'haushalt',
        SortOrder: 6,
        IstSichtbar: true
      }
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${shopKategorien.count} ShopKategorien`);

  // Fetch shop categories for products
  const katLebensmittel = await prisma.shopKategorien.findFirst({ where: { Slug: 'lebensmittel' } });
  const katObst = await prisma.shopKategorien.findFirst({ where: { Slug: 'obst-gemuese' } });
  const katMilch = await prisma.shopKategorien.findFirst({ where: { Slug: 'milchprodukte' } });
  const katElektronik = await prisma.shopKategorien.findFirst({ where: { Slug: 'elektronik' } });

  if (katLebensmittel && katObst && katMilch && katElektronik) {
    // Update parent categories
    await prisma.shopKategorien.update({
      where: { ShopKategorieID: katObst.ShopKategorieID },
      data: { UebergeordneteKategorieID: katLebensmittel.ShopKategorieID }
    });
    await prisma.shopKategorien.update({
      where: { ShopKategorieID: katMilch.ShopKategorieID },
      data: { UebergeordneteKategorieID: katLebensmittel.ShopKategorieID }
    });

    // Seed ShopProdukte (Shop Products)
    const shopProdukte = await prisma.shopProdukte.createMany({
      data: [
        {
          ProduktID: apfel.ProduktID,
          ShopKategorieID: katObst.ShopKategorieID,
          Titel: 'Frischer roter Apfel',
          Kurzbeschreibung: 'Knackig frische Äpfel aus der Region',
          Langbeschreibung: 'Unsere frischen roten Äpfel stammen aus regionalem Anbau und werden täglich frisch geliefert. Perfekt für den täglichen Vitaminbedarf.',
          Slug: 'frischer-roter-apfel',
          SKU: 'SHOP-A001',
          Preis: 0.50,
          IstAktiv: true,
          IstHervorgehoben: true,
          Lagerbestand: 100,
          MindestBestellmenge: 5,
          Gewicht: 0.2,
          MetaTitel: 'Frische Äpfel kaufen',
          MetaBeschreibung: 'Regionale frische Äpfel direkt zu Ihnen nach Hause geliefert.'
        },
        {
          ProduktID: brot.ProduktID,
          ShopKategorieID: katLebensmittel.ShopKategorieID,
          Titel: 'Vollkornbrot 500g',
          Kurzbeschreibung: 'Gesundes Vollkornbrot aus der Bäckerei',
          Langbeschreibung: 'Unser Vollkornbrot wird nach traditionellem Rezept gebacken und ist reich an Ballaststoffen.',
          Slug: 'vollkornbrot-500g',
          SKU: 'SHOP-B001',
          Preis: 2.50,
          IstAktiv: true,
          Lagerbestand: 50,
          MindestBestellmenge: 1,
          Gewicht: 0.5
        },
        {
          ProduktID: milch.ProduktID,
          ShopKategorieID: katMilch.ShopKategorieID,
          Titel: 'Frische Vollmilch 1L',
          Kurzbeschreibung: 'Pasteurisierte Vollmilch',
          Langbeschreibung: 'Unsere Vollmilch stammt von lokalen Bauernhöfen und wird täglich frisch geliefert. 3,5% Fettgehalt.',
          Slug: 'vollmilch-1l',
          SKU: 'SHOP-M001',
          Preis: 1.29,
          IstAktiv: true,
          Lagerbestand: 200,
          MindestBestellmenge: 1,
          Gewicht: 1.0
        },
        {
          ProduktID: zucker.ProduktID,
          ShopKategorieID: katLebensmittel.ShopKategorieID,
          Titel: 'Kristallzucker 1kg',
          Kurzbeschreibung: 'Feiner weißer Kristallzucker',
          Langbeschreibung: 'Hochwertiger Kristallzucker für alle Backzwecke.',
          Slug: 'kristallzucker-1kg',
          SKU: 'SHOP-Z001',
          Preis: 1.99,
          IstAktiv: true,
          Lagerbestand: 75,
          MindestBestellmenge: 1,
          Gewicht: 1.0
        },
        {
          ProduktID: laptop.ProduktID,
          ShopKategorieID: katElektronik.ShopKategorieID,
          Titel: 'High-End Laptop',
          Kurzbeschreibung: 'Leistungsstarker Laptop für Profis',
          Langbeschreibung: 'Ein moderner High-End Laptop mit den neuesten Spezifikationen für anspruchsvolle Anwendungen.',
          Slug: 'high-end-laptop',
          SKU: 'SHOP-L001',
          Preis: 999.00,
          UVP: 1199.00,
          IstAktiv: true,
          IstHervorgehoben: true,
          Lagerbestand: 10,
          MindestBestellmenge: 1,
          Gewicht: 2.0,
          MetaTitel: 'High-End Laptop kaufen',
          MetaBeschreibung: 'Professioneller Laptop mit bester Ausstattung zu einem fairen Preis.'
        }
      ],
      skipDuplicates: true,
    });
    console.log(`Created ${shopProdukte.count} ShopProdukte`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
