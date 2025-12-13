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
      { TemplateID: restaurant.TemplateID, ModulID: getModuleId('gutschriften'), Prioritaet: 'Optional', IstAktiviert: false }
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
      { TemplateID: hotel.TemplateID, ModulID: getModuleId('einheiten'), Prioritaet: 'Optional', IstAktiviert: false }
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
      { TemplateID: onlineShop.TemplateID, ModulID: getModuleId('kassen'), Prioritaet: 'Optional', IstAktiviert: false }
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
