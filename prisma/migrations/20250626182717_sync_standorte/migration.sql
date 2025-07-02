-- CreateTable
CREATE TABLE `Benutzer` (
    `BenutzerID` INTEGER NOT NULL AUTO_INCREMENT,
    `Benutzername` VARCHAR(50) NOT NULL,
    `PasswortHash` VARCHAR(255) NOT NULL,
    `Vorname` VARCHAR(100) NULL,
    `Nachname` VARCHAR(100) NULL,
    `Rolle` VARCHAR(50) NOT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `IstAktiv` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `Benutzername`(`Benutzername`),
    PRIMARY KEY (`BenutzerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bestand` (
    `BestandID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProduktID` INTEGER NOT NULL,
    `StandortID` INTEGER NOT NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `Chargennummer` VARCHAR(100) NULL,
    `Ablaufdatum` DATE NULL,
    `Eingangsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Status` ENUM('Verfügbar', 'Reserviert', 'Beschädigt', 'Gesperrt') NULL DEFAULT 'Verfügbar',
    `Lagerplatz` VARCHAR(100) NULL,
    `Mindestbestand` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Meldebestand` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_bestand_produktid`(`ProduktID`),
    INDEX `idx_bestand_standortid`(`StandortID`),
    UNIQUE INDEX `uq_produkt_standort_charge`(`ProduktID`, `StandortID`, `Chargennummer`),
    PRIMARY KEY (`BestandID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bestellpositionen` (
    `BestellpositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `BestellID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `BestandID` INTEGER NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `GesamtpreisNettoPosition` DECIMAL(10, 2) NOT NULL,
    `MwSt_Satz` DECIMAL(5, 2) NULL,
    `MwSt_Betrag` DECIMAL(10, 2) NULL,
    `Beschreibung` VARCHAR(255) NULL,

    INDEX `BestandID`(`BestandID`),
    INDEX `idx_bestellpositionen_bestellid`(`BestellID`),
    INDEX `idx_bestellpositionen_produktid`(`ProduktID`),
    PRIMARY KEY (`BestellpositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bestellungen` (
    `BestellID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `StandortID` INTEGER NULL,
    `ErfasstVonBenutzerID` INTEGER NULL,
    `Bestellnummer` VARCHAR(50) NULL,
    `Bestelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Lieferdatum` DATE NULL,
    `Bestellstatus` ENUM('Offen', 'In Bearbeitung', 'Versendet', 'Abgeschlossen', 'Storniert') NULL DEFAULT 'Offen',
    `Lieferadresse` TEXT NULL,
    `Versandkosten` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GesamtsummeNetto` DECIMAL(10, 2) NULL,
    `GesamtsummeBrutto` DECIMAL(10, 2) NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kommentare` TEXT NULL,
    `StorniertAm` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Bestellnummer`(`Bestellnummer`),
    INDEX `ErfasstVonBenutzerID`(`ErfasstVonBenutzerID`),
    INDEX `StandortID`(`StandortID`),
    INDEX `idx_bestellungen_bestelldatum`(`Bestelldatum`),
    INDEX `idx_bestellungen_kundenid`(`KundenID`),
    PRIMARY KEY (`BestellID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Einheiten` (
    `EinheitID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL,
    `Symbol` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `Name`(`Name`),
    UNIQUE INDEX `Symbol`(`Symbol`),
    PRIMARY KEY (`EinheitID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gutschriften` (
    `GutschriftID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `RetourenID` INTEGER NULL,
    `RechnungsID` INTEGER NULL,
    `Gutschriftsnummer` VARCHAR(50) NOT NULL,
    `Gutschriftsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Faelligkeitsdatum` DATE NULL,
    `Betrag` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Status` ENUM('Ausgestellt', 'Teilverrechnet', 'Verrechnet', 'Abgelaufen') NULL DEFAULT 'Ausgestellt',
    `StorniertAm` TIMESTAMP(0) NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Gutschriftsnummer`(`Gutschriftsnummer`),
    INDEX `KundenID`(`KundenID`),
    INDEX `RechnungsID`(`RechnungsID`),
    INDEX `RetourenID`(`RetourenID`),
    PRIMARY KEY (`GutschriftID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kunden` (
    `KundenID` INTEGER NOT NULL AUTO_INCREMENT,
    `Kundennummer` VARCHAR(50) NULL,
    `KundengruppeID` INTEGER NULL,
    `Firmenname` VARCHAR(255) NULL,
    `Anrede` ENUM('Herr', 'Frau', 'Firma', 'Divers') NULL,
    `Vorname` VARCHAR(100) NULL,
    `Nachname` VARCHAR(100) NULL,
    `Adresse` VARCHAR(255) NOT NULL,
    `PLZ` VARCHAR(10) NOT NULL,
    `Ort` VARCHAR(100) NOT NULL,
    `Land` VARCHAR(100) NOT NULL,
    `Telefon` VARCHAR(50) NULL,
    `Email` VARCHAR(255) NULL,
    `UmsatzsteuerID` VARCHAR(20) NULL,
    `Kundenstatus` ENUM('Aktiv', 'Inaktiv', 'Gesperrt') NULL DEFAULT 'Aktiv',
    `Zahlungsbedingungen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Kundennummer`(`Kundennummer`),
    UNIQUE INDEX `Email`(`Email`),
    INDEX `idx_kunden_kundengruppeid`(`KundengruppeID`),
    INDEX `idx_kunden_name`(`Nachname`, `Vorname`),
    PRIMARY KEY (`KundenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KundenRabattAnwendung` (
    `KundenRabattAnwendungID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `RabattID` INTEGER NOT NULL,
    `GueltigAb` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `GueltigBis` TIMESTAMP(0) NULL,
    `Status` ENUM('Aktiv', 'Inaktiv') NULL DEFAULT 'Aktiv',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `KundenID`(`KundenID`),
    INDEX `RabattID`(`RabattID`),
    PRIMARY KEY (`KundenRabattAnwendungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kundengruppen` (
    `KundengruppeID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Name`(`Name`),
    PRIMARY KEY (`KundengruppeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kundenkarten` (
    `KundenkartenID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `Kartennummer` VARCHAR(50) NOT NULL,
    `Aktivierungsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Ablaufdatum` DATE NULL,
    `Status` ENUM('Aktiv', 'Inaktiv', 'Gesperrt') NULL DEFAULT 'Aktiv',
    `Bonuspunkte` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Kartennummer`(`Kartennummer`),
    INDEX `KundenID`(`KundenID`),
    PRIMARY KEY (`KundenkartenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lagerbewegungen` (
    `LagerbewegungID` INTEGER NOT NULL AUTO_INCREMENT,
    `BestandID` INTEGER NOT NULL,
    `BenutzerID` INTEGER NOT NULL,
    `Bewegungsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Bewegungstyp` ENUM('Wareneingang', 'Warenausgang', 'Umlagerung', 'Inventurkorrektur', 'Retoure', 'Schwund') NOT NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `QuelleStandortID` INTEGER NULL,
    `ZielStandortID` INTEGER NULL,
    `ReferenzDokumentID` INTEGER NULL,
    `ReferenzDokumentTyp` VARCHAR(50) NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `QuelleStandortID`(`QuelleStandortID`),
    INDEX `ZielStandortID`(`ZielStandortID`),
    INDEX `idx_lagerbewegungen_benutzerid`(`BenutzerID`),
    INDEX `idx_lagerbewegungen_bestandid`(`BestandID`),
    PRIMARY KEY (`LagerbewegungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lieferanten` (
    `LieferantenID` INTEGER NOT NULL AUTO_INCREMENT,
    `Firmenname` VARCHAR(255) NOT NULL,
    `Ansprechpartner` VARCHAR(255) NULL,
    `Adresse` VARCHAR(255) NULL,
    `PLZ` VARCHAR(10) NULL,
    `Ort` VARCHAR(100) NULL,
    `Land` VARCHAR(100) NULL,
    `Telefon` VARCHAR(20) NULL,
    `Email` VARCHAR(255) NULL,
    `UmsatzsteuerID` VARCHAR(20) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`LieferantenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preise` (
    `PreisID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProduktID` INTEGER NOT NULL,
    `Preis` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `GueltigAb` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `GueltigBis` TIMESTAMP(0) NULL,
    `StandortID` INTEGER NULL,
    `KundengruppeID` INTEGER NULL,
    `PreisTyp` ENUM('Standard', 'Aktion', 'Kundenpreis') NOT NULL DEFAULT 'Standard',

    INDEX `idx_preise_kundengruppeid`(`KundengruppeID`),
    INDEX `idx_preise_produktid`(`ProduktID`),
    INDEX `idx_preise_standortid`(`StandortID`),
    PRIMARY KEY (`PreisID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProduktLieferanten` (
    `ProduktID` INTEGER NOT NULL,
    `LieferantenID` INTEGER NOT NULL,
    `LieferantenArtikelnummer` VARCHAR(50) NULL,
    `Lieferzeit` INTEGER NULL,
    `Mindestbestellmenge` INTEGER NULL,
    `PreisBeimLieferanten` DECIMAL(10, 2) NULL,
    `WaehrungLieferant` VARCHAR(3) NULL,

    INDEX `LieferantenID`(`LieferantenID`),
    PRIMARY KEY (`ProduktID`, `LieferantenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProduktZuKategorie` (
    `ProduktID` INTEGER NOT NULL,
    `KategorieID` INTEGER NOT NULL,

    INDEX `KategorieID`(`KategorieID`),
    PRIMARY KEY (`ProduktID`, `KategorieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produkte` (
    `ProduktID` INTEGER NOT NULL AUTO_INCREMENT,
    `Produktname` VARCHAR(255) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Artikelnummer` VARCHAR(50) NOT NULL,
    `EAN_Code` VARCHAR(50) NULL,
    `EinheitID` INTEGER NOT NULL,
    `UmsatzsteuersatzID` INTEGER NOT NULL,
    `Hersteller` VARCHAR(255) NULL,
    `Gewicht` DECIMAL(10, 3) NULL,
    `Volumen` DECIMAL(10, 3) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Artikelnummer`(`Artikelnummer`),
    UNIQUE INDEX `EAN_Code`(`EAN_Code`),
    INDEX `idx_produkte_einheitid`(`EinheitID`),
    INDEX `idx_produkte_name`(`Produktname`),
    INDEX `idx_produkte_umsatzsteuersatzid`(`UmsatzsteuersatzID`),
    PRIMARY KEY (`ProduktID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProduktBilder` (
    `BildID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProduktID` INTEGER NOT NULL,
    `BildPfad` VARCHAR(255) NOT NULL,
    `IstHauptbild` BOOLEAN NOT NULL DEFAULT false,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_produktbilder_produktid`(`ProduktID`),
    PRIMARY KEY (`BildID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produktkategorien` (
    `KategorieID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Beschreibung` TEXT NULL,
    `UebergeordneteKategorieID` INTEGER NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Name`(`Name`),
    INDEX `UebergeordneteKategorieID`(`UebergeordneteKategorieID`),
    PRIMARY KEY (`KategorieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rabatte` (
    `RabattID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `Beschreibung` TEXT NULL,
    `RabattTyp` ENUM('Prozentual', 'Festbetrag', 'Mengenrabatt', 'Versandrabatt', 'Gutschein') NOT NULL,
    `Anwendungsebene` ENUM('Kopf', 'Zeile', 'Kunde') NOT NULL,
    `Wert` DECIMAL(10, 2) NOT NULL,
    `Mindestbestellwert` DECIMAL(10, 2) NULL,
    `Gutscheincode` VARCHAR(50) NULL,
    `GueltigAb` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `GueltigBis` TIMESTAMP(0) NULL,
    `MaxNutzungenGesamt` INTEGER NULL,
    `AktuelleNutzungenGesamt` INTEGER NULL DEFAULT 0,
    `MaxNutzungenProKunde` INTEGER NULL,
    `Status` ENUM('Aktiv', 'Inaktiv', 'Abgelaufen') NULL DEFAULT 'Aktiv',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Gutscheincode`(`Gutscheincode`),
    PRIMARY KEY (`RabattID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rabattstaffeln` (
    `RabattstaffelID` INTEGER NOT NULL AUTO_INCREMENT,
    `RabattID` INTEGER NOT NULL,
    `AbMenge` DECIMAL(10, 2) NOT NULL,
    `RabattWert` DECIMAL(10, 2) NOT NULL,
    `Typ` ENUM('Prozentual', 'Festpreis_pro_Einheit', 'Gratismenge') NOT NULL,

    INDEX `idx_rabattstaffeln_rabattid`(`RabattID`),
    PRIMARY KEY (`RabattstaffelID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rechnungen` (
    `RechnungsID` INTEGER NOT NULL AUTO_INCREMENT,
    `BestellID` INTEGER NULL,
    `KundenID` INTEGER NOT NULL,
    `ErstelltVonBenutzerID` INTEGER NULL,
    `Rechnungsnummer` VARCHAR(50) NOT NULL,
    `Rechnungsdatum` DATE NOT NULL,
    `Faelligkeitsdatum` DATE NOT NULL,
    `Rechnungsadresse` TEXT NULL,
    `Zahlungsstatus` ENUM('Offen', 'Teilbezahlt', 'Bezahlt', 'Überfällig', 'Storniert') NULL DEFAULT 'Offen',
    `GesamtbetragNetto` DECIMAL(10, 2) NOT NULL,
    `MwSt_Gesamt` DECIMAL(10, 2) NULL,
    `GesamtrabattBetrag` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GesamtbetragBrutto` DECIMAL(10, 2) NOT NULL,
    `Mahnstufe` INTEGER NULL DEFAULT 0,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kommentare` TEXT NULL,
    `StorniertAm` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Rechnungsnummer`(`Rechnungsnummer`),
    INDEX `BestellID`(`BestellID`),
    INDEX `ErstelltVonBenutzerID`(`ErstelltVonBenutzerID`),
    INDEX `idx_rechnungen_kundenid`(`KundenID`),
    INDEX `idx_rechnungen_rechnungsdatum`(`Rechnungsdatum`),
    PRIMARY KEY (`RechnungsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RechnungsRabatte` (
    `RechnungsRabattID` INTEGER NOT NULL AUTO_INCREMENT,
    `RechnungsID` INTEGER NOT NULL,
    `RabattID` INTEGER NOT NULL,
    `AngewendeterWert` DECIMAL(10, 2) NULL,
    `AngewendeterBetrag` DECIMAL(10, 2) NOT NULL,
    `Anwendungsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `RabattID`(`RabattID`),
    INDEX `RechnungsID`(`RechnungsID`),
    PRIMARY KEY (`RechnungsRabattID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rechnungspositionen` (
    `RechnungspositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `RechnungsID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `BestandID` INTEGER NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `RabattID` INTEGER NULL,
    `RabattProzentPosition` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `RabattBetragPosition` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GesamtpreisNettoPosition` DECIMAL(10, 2) NOT NULL,
    `MwSt_Satz` DECIMAL(5, 2) NOT NULL,
    `MwSt_Betrag` DECIMAL(10, 2) NOT NULL,
    `Beschreibung` VARCHAR(255) NULL,

    INDEX `BestandID`(`BestandID`),
    INDEX `RabattID`(`RabattID`),
    INDEX `idx_rechnungspositionen_produktid`(`ProduktID`),
    INDEX `idx_rechnungspositionen_rechnungsid`(`RechnungsID`),
    PRIMARY KEY (`RechnungspositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Retouren` (
    `RetourenID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `BestellID` INTEGER NULL,
    `RechnungsID` INTEGER NULL,
    `AngelegtVonBenutzerID` INTEGER NULL,
    `Retourennummer` VARCHAR(50) NOT NULL,
    `Retourendatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Status` ENUM('Offen', 'In Bearbeitung', 'Abgeschlossen', 'Storniert') NULL DEFAULT 'Offen',
    `Ruecksendegrund` TEXT NULL,
    `GesamtbetragGutschrift` DECIMAL(10, 2) NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `StorniertAm` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Retourennummer`(`Retourennummer`),
    INDEX `AngelegtVonBenutzerID`(`AngelegtVonBenutzerID`),
    INDEX `BestellID`(`BestellID`),
    INDEX `RechnungsID`(`RechnungsID`),
    INDEX `idx_retouren_kundenid`(`KundenID`),
    PRIMARY KEY (`RetourenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Retourenpositionen` (
    `RetourenpositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `RetourenID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `BestandID` INTEGER NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwSt_Satz` DECIMAL(5, 2) NOT NULL,
    `MwSt_Betrag` DECIMAL(10, 2) NOT NULL,
    `Beschreibung` VARCHAR(255) NULL,
    `Status` ENUM('Erwartet', 'Zurückgenommen', 'Neu eingelagert', 'Aussortiert') NULL DEFAULT 'Erwartet',

    INDEX `BestandID`(`BestandID`),
    INDEX `ProduktID`(`ProduktID`),
    INDEX `idx_retourenpositionen_retourenid`(`RetourenID`),
    PRIMARY KEY (`RetourenpositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Standorte` (
    `StandortID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `Adresse` VARCHAR(255) NULL,
    `PLZ` VARCHAR(10) NULL,
    `Ort` VARCHAR(100) NULL,
    `Land` VARCHAR(100) NULL,
    `Telefon` VARCHAR(50) NULL,
    `Email` VARCHAR(255) NULL,
    `Typ` ENUM('Filiale', 'Zentrallager', 'Verteilzentrum', 'Verwaltung') NOT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`StandortID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Umsatzsteuersaetze` (
    `UmsatzsteuersatzID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL,
    `Steuersatz` DECIMAL(5, 2) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Name`(`Name`),
    PRIMARY KEY (`UmsatzsteuersatzID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zahlungen` (
    `ZahlungsID` INTEGER NOT NULL AUTO_INCREMENT,
    `RechnungsID` INTEGER NOT NULL,
    `GebuchtVonBenutzerID` INTEGER NULL,
    `Zahlungsdatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
    `Betrag` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Zahlungsart` ENUM('Bar', 'Kreditkarte', 'Banküberweisung', 'PayPal', 'Gutschein', 'Verrechnung') NOT NULL,
    `Referenznummer` VARCHAR(100) NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `GebuchtVonBenutzerID`(`GebuchtVonBenutzerID`),
    INDEX `idx_zahlungen_rechnungsid`(`RechnungsID`),
    PRIMARY KEY (`ZahlungsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bestand` ADD CONSTRAINT `Bestand_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestand` ADD CONSTRAINT `Bestand_ibfk_2` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellpositionen` ADD CONSTRAINT `Bestellpositionen_ibfk_1` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellpositionen` ADD CONSTRAINT `Bestellpositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellpositionen` ADD CONSTRAINT `Bestellpositionen_ibfk_3` FOREIGN KEY (`BestandID`) REFERENCES `Bestand`(`BestandID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellungen` ADD CONSTRAINT `Bestellungen_ibfk_1` FOREIGN KEY (`ErfasstVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellungen` ADD CONSTRAINT `Bestellungen_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Bestellungen` ADD CONSTRAINT `Bestellungen_ibfk_3` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Gutschriften` ADD CONSTRAINT `Gutschriften_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Gutschriften` ADD CONSTRAINT `Gutschriften_ibfk_2` FOREIGN KEY (`RetourenID`) REFERENCES `Retouren`(`RetourenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Gutschriften` ADD CONSTRAINT `Gutschriften_ibfk_3` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kunden` ADD CONSTRAINT `Kunden_ibfk_1` FOREIGN KEY (`KundengruppeID`) REFERENCES `Kundengruppen`(`KundengruppeID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `KundenRabattAnwendung` ADD CONSTRAINT `KundenRabattAnwendung_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `KundenRabattAnwendung` ADD CONSTRAINT `KundenRabattAnwendung_ibfk_2` FOREIGN KEY (`RabattID`) REFERENCES `Rabatte`(`RabattID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kundenkarten` ADD CONSTRAINT `Kundenkarten_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION on UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lagerbewegungen` ADD CONSTRAINT `Lagerbewegungen_ibfk_1` FOREIGN KEY (`BenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lagerbewegungen` ADD CONSTRAINT `Lagerbewegungen_ibfk_2` FOREIGN KEY (`BestandID`) REFERENCES `Bestand`(`BestandID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lagerbewegungen` ADD CONSTRAINT `Lagerbewegungen_ibfk_3` FOREIGN KEY (`QuelleStandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lagerbewegungen` ADD CONSTRAINT `Lagerbewegungen_ibfk_4` FOREIGN KEY (`ZielStandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Preise` ADD CONSTRAINT `Preise_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Preise` ADD CONSTRAINT `Preise_ibfk_2` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Preise` ADD CONSTRAINT `Preise_ibfk_3` FOREIGN KEY (`KundengruppeID`) REFERENCES `Kundengruppen`(`KundengruppeID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProduktLieferanten` ADD CONSTRAINT `ProduktLieferanten_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProduktLieferanten` ADD CONSTRAINT `ProduktLieferanten_ibfk_2` FOREIGN KEY (`LieferantenID`) REFERENCES `Lieferanten`(`LieferantenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProduktZuKategorie` ADD CONSTRAINT `ProduktZuKategorie_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProduktZuKategorie` ADD CONSTRAINT `ProduktZuKategorie_ibfk_2` FOREIGN KEY (`KategorieID`) REFERENCES `Produktkategorien`(`KategorieID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Produkte` ADD CONSTRAINT `Produkte_ibfk_1` FOREIGN KEY (`UmsatzsteuersatzID`) REFERENCES `Umsatzsteuersaetze`(`UmsatzsteuersatzID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Produkte` ADD CONSTRAINT `Produkte_ibfk_2` FOREIGN KEY (`EinheitID`) REFERENCES `Einheiten`(`EinheitID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProduktBilder` ADD CONSTRAINT `ProduktBilder_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Produktkategorien` ADD CONSTRAINT `Produktkategorien_ibfk_1` FOREIGN KEY (`UebergeordneteKategorieID`) REFERENCES `Produktkategorien`(`KategorieID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rabattstaffeln` ADD CONSTRAINT `Rabattstaffeln_ibfk_1` FOREIGN KEY (`RabattID`) REFERENCES `Rabatte`(`RabattID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungen` ADD CONSTRAINT `Rechnungen_ibfk_1` FOREIGN KEY (`ErstelltVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungen` ADD CONSTRAINT `Rechnungen_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungen` ADD CONSTRAINT `Rechnungen_ibfk_3` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RechnungsRabatte` ADD CONSTRAINT `RechnungsRabatte_ibfk_1` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RechnungsRabatte` ADD CONSTRAINT `RechnungsRabatte_ibfk_2` FOREIGN KEY (`RabattID`) REFERENCES `Rabatte`(`RabattID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungspositionen` ADD CONSTRAINT `Rechnungspositionen_ibfk_1` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungspositionen` ADD CONSTRAINT `Rechnungspositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungspositionen` ADD CONSTRAINT `Rechnungspositionen_ibfk_3` FOREIGN KEY (`RabattID`) REFERENCES `Rabatte`(`RabattID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Rechnungspositionen` ADD CONSTRAINT `Rechnungspositionen_ibfk_4` FOREIGN KEY (`BestandID`) REFERENCES `Bestand`(`BestandID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retouren` ADD CONSTRAINT `Retouren_ibfk_1` FOREIGN KEY (`AngelegtVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retouren` ADD CONSTRAINT `Retouren_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retouren` ADD CONSTRAINT `Retouren_ibfk_3` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retouren` ADD CONSTRAINT `Retouren_ibfk_4` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retourenpositionen` ADD CONSTRAINT `Retourenpositionen_ibfk_1` FOREIGN KEY (`RetourenID`) REFERENCES `Retouren`(`RetourenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retourenpositionen` ADD CONSTRAINT `Retourenpositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Retourenpositionen` ADD CONSTRAINT `Retourenpositionen_ibfk_3` FOREIGN KEY (`BestandID`) REFERENCES `Bestand`(`BestandID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Zahlungen` ADD CONSTRAINT `Zahlungen_ibfk_1` FOREIGN KEY (`GebuchtVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Zahlungen` ADD CONSTRAINT `Zahlungen_ibfk_2` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
