-- CreateTable
CREATE TABLE `Kassen` (
    `KassenID` INTEGER NOT NULL AUTO_INCREMENT,
    `Kassenbezeichnung` VARCHAR(100) NOT NULL,
    `StandortID` INTEGER NULL,
    `Kassennummer` VARCHAR(50) NOT NULL,
    `Anfangsbestand` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `AktuellerBestand` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Status` ENUM('Aktiv', 'Inaktiv', 'Geschlossen') NULL DEFAULT 'Aktiv',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Kassennummer`(`Kassennummer`),
    INDEX `idx_kassen_standortid`(`StandortID`),
    PRIMARY KEY (`KassenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kassenbuchungen` (
    `BuchungsID` INTEGER NOT NULL AUTO_INCREMENT,
    `KassenID` INTEGER NOT NULL,
    `BenutzerID` INTEGER NULL,
    `RechnungsID` INTEGER NULL,
    `Buchungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `Buchungstyp` ENUM('Einnahme', 'Ausgabe', 'Entnahme', 'Einlage', 'Kassenabschluss') NOT NULL,
    `Betrag` DECIMAL(10, 2) NOT NULL,
    `Zahlungsart` ENUM('Bar', 'Kreditkarte', 'EC-Karte', 'Gutschein', 'Sonstige') NOT NULL,
    `Beschreibung` TEXT NULL,
    `Belegnummer` VARCHAR(100) NULL,
    `KundenID` INTEGER NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_kassenbuchungen_kassenid`(`KassenID`),
    INDEX `idx_kassenbuchungen_benutzerid`(`BenutzerID`),
    INDEX `idx_kassenbuchungen_rechnungsid`(`RechnungsID`),
    INDEX `idx_kassenbuchungen_kundenid`(`KundenID`),
    INDEX `idx_kassenbuchungen_buchungsdatum`(`Buchungsdatum`),
    PRIMARY KEY (`BuchungsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Projekt` (
    `ProjektID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProjektName` VARCHAR(255) NOT NULL,
    `Beschreibung` TEXT NULL,
    `AudienceTemplateID` INTEGER NULL,
    `Firmenname` VARCHAR(255) NULL,
    `Branche` VARCHAR(100) NULL,
    `Status` ENUM('Aktiv', 'Inaktiv', 'Archiviert') NULL DEFAULT 'Aktiv',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projekt_audiencetemplateid`(`AudienceTemplateID`),
    PRIMARY KEY (`ProjektID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudienceTemplate` (
    `TemplateID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `DisplayName` VARCHAR(150) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Icon` VARCHAR(100) NULL,
    `Farbe` VARCHAR(50) NULL,
    `SortOrder` INTEGER NULL DEFAULT 0,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Name`(`Name`),
    PRIMARY KEY (`TemplateID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleDefinition` (
    `ModulID` INTEGER NOT NULL AUTO_INCREMENT,
    `ModulName` VARCHAR(100) NOT NULL,
    `DisplayName` VARCHAR(150) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Icon` VARCHAR(100) NULL,
    `Kategorie` VARCHAR(100) NULL,
    `Route` VARCHAR(255) NULL,
    `SortOrder` INTEGER NULL DEFAULT 0,
    `IstSystem` BOOLEAN NULL DEFAULT false,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ModulName`(`ModulName`),
    PRIMARY KEY (`ModulID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleKonfiguration` (
    `KonfigID` INTEGER NOT NULL AUTO_INCREMENT,
    `TemplateID` INTEGER NOT NULL,
    `ModulID` INTEGER NOT NULL,
    `Prioritaet` ENUM('Erforderlich', 'Wichtig', 'Optional', 'Versteckt') NOT NULL DEFAULT 'Optional',
    `IstAktiviert` BOOLEAN NULL DEFAULT true,
    `Beschreibung` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_modulekonfiguration_templateid`(`TemplateID`),
    INDEX `idx_modulekonfiguration_modulid`(`ModulID`),
    UNIQUE INDEX `uq_template_modul`(`TemplateID`, `ModulID`),
    PRIMARY KEY (`KonfigID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjektModule` (
    `ProjektModulID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProjektID` INTEGER NOT NULL,
    `ModulID` INTEGER NOT NULL,
    `IstAktiviert` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projektmodule_projektid`(`ProjektID`),
    INDEX `idx_projektmodule_modulid`(`ModulID`),
    UNIQUE INDEX `uq_projekt_modul`(`ProjektID`, `ModulID`),
    PRIMARY KEY (`ProjektModulID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tischbereiche` (
    `BereichID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Beschreibung` TEXT NULL,
    `StandortID` INTEGER NULL,
    `Farbe` VARCHAR(50) NULL,
    `SortOrder` INTEGER NULL DEFAULT 0,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tischbereiche_standortid`(`StandortID`),
    PRIMARY KEY (`BereichID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantTische` (
    `TischID` INTEGER NOT NULL AUTO_INCREMENT,
    `Tischnummer` VARCHAR(50) NOT NULL,
    `BereichID` INTEGER NULL,
    `Kapazitaet` INTEGER NOT NULL DEFAULT 4,
    `Status` ENUM('Verfuegbar', 'Besetzt', 'Reserviert', 'Gesperrt') NULL DEFAULT 'Verfuegbar',
    `PositionX` DECIMAL(10, 2) NULL,
    `PositionY` DECIMAL(10, 2) NULL,
    `Form` VARCHAR(50) NULL,
    `Beschreibung` TEXT NULL,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_restauranttische_bereichid`(`BereichID`),
    INDEX `idx_restauranttische_status`(`Status`),
    PRIMARY KEY (`TischID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservierungen` (
    `ReservierungsID` INTEGER NOT NULL AUTO_INCREMENT,
    `TischID` INTEGER NOT NULL,
    `KundenID` INTEGER NULL,
    `Gastname` VARCHAR(255) NOT NULL,
    `Telefon` VARCHAR(50) NULL,
    `Email` VARCHAR(255) NULL,
    `PersonenAnzahl` INTEGER NOT NULL,
    `Reservierungsdatum` DATETIME NOT NULL,
    `Dauer` INTEGER NULL DEFAULT 120,
    `Status` ENUM('Bestaetigt', 'Eingecheckt', 'Abgeschlossen', 'Storniert', 'Nicht Erschienen') NULL DEFAULT 'Bestaetigt',
    `Notizen` TEXT NULL,
    `ErfasstVonBenutzerID` INTEGER NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_reservierungen_tischid`(`TischID`),
    INDEX `idx_reservierungen_kundenid`(`KundenID`),
    INDEX `idx_reservierungen_datum`(`Reservierungsdatum`),
    INDEX `idx_reservierungen_status`(`Status`),
    INDEX `idx_reservierungen_benutzerid`(`ErfasstVonBenutzerID`),
    PRIMARY KEY (`ReservierungsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantBestellungen` (
    `RestaurantBestellID` INTEGER NOT NULL AUTO_INCREMENT,
    `TischID` INTEGER NOT NULL,
    `KundenID` INTEGER NULL,
    `BenutzerID` INTEGER NULL,
    `Bestellnummer` VARCHAR(50) NULL,
    `Bestelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `PersonenAnzahl` INTEGER NULL DEFAULT 1,
    `Status` ENUM('Offen', 'In Bearbeitung', 'Serviert', 'Abgeschlossen', 'Storniert') NULL DEFAULT 'Offen',
    `GesamtbetragNetto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GesamtbetragBrutto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `MwStGesamt` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Trinkgeld` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Zahlungsart` ENUM('Bar', 'Kreditkarte', 'EC-Karte', 'Rechnung', 'Gutschein') NULL,
    `RechnungsID` INTEGER NULL,
    `Notizen` TEXT NULL,
    `AbgeschlossenAm` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Bestellnummer_Restaurant`(`Bestellnummer`),
    INDEX `idx_restaurantbestellungen_tischid`(`TischID`),
    INDEX `idx_restaurantbestellungen_kundenid`(`KundenID`),
    INDEX `idx_restaurantbestellungen_benutzerid`(`BenutzerID`),
    INDEX `idx_restaurantbestellungen_rechnungsid`(`RechnungsID`),
    INDEX `idx_restaurantbestellungen_status`(`Status`),
    INDEX `idx_restaurantbestellungen_datum`(`Bestelldatum`),
    PRIMARY KEY (`RestaurantBestellID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantBestellpositionen` (
    `PositionID` INTEGER NOT NULL AUTO_INCREMENT,
    `RestaurantBestellID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwStSatz` DECIMAL(5, 2) NOT NULL,
    `MwStBetrag` DECIMAL(10, 2) NOT NULL,
    `Status` ENUM('Bestellt', 'In Zubereitung', 'Bereit', 'Serviert', 'Storniert') NULL DEFAULT 'Bestellt',
    `Notizen` TEXT NULL,
    `KuecheNotizen` TEXT NULL,
    `BestelltUm` TIMESTAMP(0) NULL DEFAULT (now()),
    `ZubereitetUm` TIMESTAMP(0) NULL,
    `ServiertUm` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_restaurantbestellpositionen_bestellid`(`RestaurantBestellID`),
    INDEX `idx_restaurantbestellpositionen_produktid`(`ProduktID`),
    INDEX `idx_restaurantbestellpositionen_status`(`Status`),
    PRIMARY KEY (`PositionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preisvertraege` (
    `VertragsID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `Vertragsnummer` VARCHAR(50) NOT NULL,
    `Vertragsbezeichnung` VARCHAR(255) NOT NULL,
    `Beschreibung` TEXT NULL,
    `GueltigAb` DATE NOT NULL,
    `GueltigBis` DATE NULL,
    `Status` ENUM('Entwurf', 'Aktiv', 'Abgelaufen', 'Gekuendigt') NULL DEFAULT 'Aktiv',
    `Zahlungsbedingungen` TEXT NULL,
    `Mindestabnahme` DECIMAL(10, 2) NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Vertragsnummer`(`Vertragsnummer`),
    INDEX `idx_preisvertraege_kundenid`(`KundenID`),
    INDEX `idx_preisvertraege_gueltigkeit`(`GueltigAb`, `GueltigBis`),
    PRIMARY KEY (`VertragsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vertragspositionen` (
    `VertragspositionID` INTEGER NOT NULL AUTO_INCREMENT,
    `VertragsID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `MengeAb` DECIMAL(10, 2) NOT NULL,
    `MengeBis` DECIMAL(10, 2) NULL,
    `Vertragspreis` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_vertragspositionen_vertragsid`(`VertragsID`),
    INDEX `idx_vertragspositionen_produktid`(`ProduktID`),
    PRIMARY KEY (`VertragspositionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vertreter` (
    `VertreterID` INTEGER NOT NULL AUTO_INCREMENT,
    `Vertreternummer` VARCHAR(50) NOT NULL,
    `Vorname` VARCHAR(100) NOT NULL,
    `Nachname` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Telefon` VARCHAR(50) NULL,
    `Gebiet` VARCHAR(255) NULL,
    `Provisionssatz` DECIMAL(5, 2) NULL,
    `Status` ENUM('Aktiv', 'Inaktiv', 'Beurlaubt') NULL DEFAULT 'Aktiv',
    `Einstellungsdatum` DATE NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Vertreternummer`(`Vertreternummer`),
    UNIQUE INDEX `VertreterEmail`(`Email`),
    INDEX `idx_vertreter_vertreternummer`(`Vertreternummer`),
    PRIMARY KEY (`VertreterID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KundenVertreter` (
    `KundenVertreterID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `VertreterID` INTEGER NOT NULL,
    `GueltigAb` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `GueltigBis` TIMESTAMP(0) NULL,
    `IstPrimaer` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_kundenvertreter_kundenid`(`KundenID`),
    INDEX `idx_kundenvertreter_vertreterid`(`VertreterID`),
    PRIMARY KEY (`KundenVertreterID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provisionen` (
    `ProvisionID` INTEGER NOT NULL AUTO_INCREMENT,
    `VertreterID` INTEGER NOT NULL,
    `RechnungsID` INTEGER NULL,
    `BestellID` INTEGER NULL,
    `Provisionsbetrag` DECIMAL(10, 2) NOT NULL,
    `Provisionssatz` DECIMAL(5, 2) NOT NULL,
    `Berechnungsbasis` DECIMAL(10, 2) NOT NULL,
    `Berechnungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `Auszahlungsdatum` DATE NULL,
    `Status` ENUM('Berechnet', 'Freigegeben', 'Ausgezahlt', 'Storniert') NULL DEFAULT 'Berechnet',
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_provisionen_vertreterid`(`VertreterID`),
    INDEX `idx_provisionen_rechnungsid`(`RechnungsID`),
    INDEX `idx_provisionen_bestellid`(`BestellID`),
    PRIMARY KEY (`ProvisionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kreditlimits` (
    `KreditlimitID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `Kreditlimit` DECIMAL(10, 2) NOT NULL,
    `AktuelleSchuld` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kreditsperre` BOOLEAN NULL DEFAULT false,
    `Sperrgrund` TEXT NULL,
    `LetztePruefung` TIMESTAMP(0) NULL,
    `Zahlungsziel` INTEGER NULL DEFAULT 30,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `unique_kunde_kreditlimit`(`KundenID`),
    INDEX `idx_kreditlimits_kundenid`(`KundenID`),
    PRIMARY KEY (`KreditlimitID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mahnungen` (
    `MahnungID` INTEGER NOT NULL AUTO_INCREMENT,
    `KreditlimitID` INTEGER NOT NULL,
    `RechnungsID` INTEGER NOT NULL,
    `Mahnstufe` INTEGER NOT NULL DEFAULT 1,
    `Mahnungsnummer` VARCHAR(50) NOT NULL,
    `Mahnungsdatum` DATE NOT NULL,
    `Mahnbetrag` DECIMAL(10, 2) NOT NULL,
    `Mahngebuehr` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Status` ENUM('Offen', 'Versendet', 'Bezahlt', 'Storniert') NULL DEFAULT 'Offen',
    `Faelligkeitsdatum` DATE NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    UNIQUE INDEX `Mahnungsnummer`(`Mahnungsnummer`),
    INDEX `idx_mahnungen_kreditlimitid`(`KreditlimitID`),
    INDEX `idx_mahnungen_rechnungsid`(`RechnungsID`),
    PRIMARY KEY (`MahnungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lieferungen` (
    `LieferungID` INTEGER NOT NULL AUTO_INCREMENT,
    `BestellID` INTEGER NOT NULL,
    `Liefernummer` VARCHAR(50) NOT NULL,
    `Lieferdatum` DATE NULL,
    `GeplantesLieferdatum` DATE NULL,
    `LieferadresseID` INTEGER NULL,
    `TourID` INTEGER NULL,
    `Status` ENUM('Geplant', 'In Vorbereitung', 'Unterwegs', 'Zugestellt', 'Fehlgeschlagen') NULL DEFAULT 'Geplant',
    `TrackingNummer` VARCHAR(100) NULL,
    `Lieferant` VARCHAR(255) NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Liefernummer`(`Liefernummer`),
    INDEX `idx_lieferungen_bestellid`(`BestellID`),
    INDEX `idx_lieferungen_tourid`(`TourID`),
    PRIMARY KEY (`LieferungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Touren` (
    `TourID` INTEGER NOT NULL AUTO_INCREMENT,
    `Tournummer` VARCHAR(50) NOT NULL,
    `Tourbezeichnung` VARCHAR(255) NOT NULL,
    `Tourdatum` DATE NOT NULL,
    `FahrerName` VARCHAR(255) NULL,
    `Fahrzeug` VARCHAR(100) NULL,
    `Status` ENUM('Geplant', 'In Durchführung', 'Abgeschlossen', 'Storniert') NULL DEFAULT 'Geplant',
    `Startzeit` TIMESTAMP(0) NULL,
    `Endzeit` TIMESTAMP(0) NULL,
    `GesamtKilometer` DECIMAL(10, 2) NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Tournummer`(`Tournummer`),
    INDEX `idx_touren_tourdatum`(`Tourdatum`),
    PRIMARY KEY (`TourID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Liefernachweise` (
    `LiefernachweisID` INTEGER NOT NULL AUTO_INCREMENT,
    `LieferungID` INTEGER NOT NULL,
    `EmpfaengerName` VARCHAR(255) NOT NULL,
    `Empfangsdatum` TIMESTAMP(0) NOT NULL,
    `UnterschriftPfad` VARCHAR(255) NULL,
    `FotoPfad` VARCHAR(255) NULL,
    `Anmerkungen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_liefernachweise_lieferungid`(`LieferungID`),
    PRIMARY KEY (`LiefernachweisID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Angebote` (
    `AngebotID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `ErstelltVonBenutzerID` INTEGER NULL,
    `Angebotsnummer` VARCHAR(50) NOT NULL,
    `Angebotstitel` VARCHAR(255) NOT NULL,
    `Angebotsdatum` DATE NOT NULL,
    `Gueltigkeitsdatum` DATE NOT NULL,
    `Status` ENUM('Entwurf', 'Versendet', 'Angenommen', 'Abgelehnt', 'Abgelaufen', 'Storniert') NULL DEFAULT 'Entwurf',
    `GesamtsummeNetto` DECIMAL(10, 2) NULL,
    `MwSt_Gesamt` DECIMAL(10, 2) NULL,
    `GesamtsummeBrutto` DECIMAL(10, 2) NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Zahlungsbedingungen` TEXT NULL,
    `Lieferbedingungen` TEXT NULL,
    `Kommentare` TEXT NULL,
    `BestellID` INTEGER NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Angebotsnummer`(`Angebotsnummer`),
    INDEX `idx_angebote_kundenid`(`KundenID`),
    INDEX `idx_angebote_benutzerid`(`ErstelltVonBenutzerID`),
    INDEX `idx_angebote_bestellid`(`BestellID`),
    PRIMARY KEY (`AngebotID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Angebotspositionen` (
    `AngebotspositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `AngebotID` INTEGER NOT NULL,
    `ProduktID` INTEGER NOT NULL,
    `Positionsnummer` INTEGER NOT NULL DEFAULT 1,
    `Menge` DECIMAL(10, 2) NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `RabattProzent` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `RabattBetrag` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwSt_Satz` DECIMAL(5, 2) NOT NULL,
    `MwSt_Betrag` DECIMAL(10, 2) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_angebotspositionen_angebotid`(`AngebotID`),
    INDEX `idx_angebotspositionen_produktid`(`ProduktID`),
    PRIMARY KEY (`AngebotspositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopKategorien` (
    `ShopKategorieID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Beschreibung` TEXT NULL,
    `UebergeordneteKategorieID` INTEGER NULL,
    `Slug` VARCHAR(150) NOT NULL,
    `BildPfad` VARCHAR(255) NULL,
    `SortOrder` INTEGER NULL DEFAULT 0,
    `IstSichtbar` BOOLEAN NULL DEFAULT true,
    `MetaTitel` VARCHAR(255) NULL,
    `MetaBeschreibung` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ShopKategorieSlug`(`Slug`),
    INDEX `idx_shopkategorien_uebergeordnet`(`UebergeordneteKategorieID`),
    INDEX `idx_shopkategorien_slug`(`Slug`),
    PRIMARY KEY (`ShopKategorieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopProdukte` (
    `ShopProduktID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProduktID` INTEGER NOT NULL,
    `ShopKategorieID` INTEGER NULL,
    `Titel` VARCHAR(255) NOT NULL,
    `Kurzbeschreibung` TEXT NULL,
    `Langbeschreibung` TEXT NULL,
    `Slug` VARCHAR(255) NOT NULL,
    `SKU` VARCHAR(100) NULL,
    `Preis` DECIMAL(10, 2) NOT NULL,
    `UVP` DECIMAL(10, 2) NULL,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `IstHervorgehoben` BOOLEAN NULL DEFAULT false,
    `Lagerbestand` INTEGER NULL DEFAULT 0,
    `MindestBestellmenge` INTEGER NULL DEFAULT 1,
    `MaximalBestellmenge` INTEGER NULL,
    `Gewicht` DECIMAL(10, 3) NULL,
    `Breite` DECIMAL(10, 2) NULL,
    `Hoehe` DECIMAL(10, 2) NULL,
    `Tiefe` DECIMAL(10, 2) NULL,
    `HauptbildPfad` VARCHAR(255) NULL,
    `BilderJSON` TEXT NULL,
    `AttributeJSON` TEXT NULL,
    `MetaTitel` VARCHAR(255) NULL,
    `MetaBeschreibung` TEXT NULL,
    `SortOrder` INTEGER NULL DEFAULT 0,
    `Aufrufe` INTEGER NULL DEFAULT 0,
    `Bewertung` DECIMAL(3, 2) NULL,
    `AnzahlBewertungen` INTEGER NULL DEFAULT 0,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ShopProduktSlug`(`Slug`),
    UNIQUE INDEX `ShopProduktSKU`(`SKU`),
    INDEX `idx_shopprodukte_produktid`(`ProduktID`),
    INDEX `idx_shopprodukte_kategorieid`(`ShopKategorieID`),
    INDEX `idx_shopprodukte_slug`(`Slug`),
    INDEX `idx_shopprodukte_aktiv`(`IstAktiv`),
    PRIMARY KEY (`ShopProduktID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopWarenkorb` (
    `WarenkorbID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NULL,
    `SessionID` VARCHAR(255) NULL,
    `Status` ENUM('Aktiv', 'Abgeschlossen', 'Abgebrochen') NULL DEFAULT 'Aktiv',
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shopwarenkorb_kundenid`(`KundenID`),
    INDEX `idx_shopwarenkorb_sessionid`(`SessionID`),
    PRIMARY KEY (`WarenkorbID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopWarenkorbpositionen` (
    `WarenkorbpositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `WarenkorbID` INTEGER NOT NULL,
    `ShopProduktID` INTEGER NOT NULL,
    `Menge` INTEGER NOT NULL DEFAULT 1,
    `Preis` DECIMAL(10, 2) NOT NULL,
    `AttributeJSON` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shopwarenkorbpositionen_warenkorbid`(`WarenkorbID`),
    INDEX `idx_shopwarenkorbpositionen_produktid`(`ShopProduktID`),
    PRIMARY KEY (`WarenkorbpositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopBestellungen` (
    `ShopBestellID` INTEGER NOT NULL AUTO_INCREMENT,
    `KundenID` INTEGER NOT NULL,
    `Bestellnummer` VARCHAR(50) NOT NULL,
    `Bestelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `Status` ENUM('Neu', 'In Bearbeitung', 'Versendet', 'Zugestellt', 'Abgeschlossen', 'Storniert', 'Rückgabe') NULL DEFAULT 'Neu',
    `Zahlungsstatus` ENUM('Ausstehend', 'Bezahlt', 'Teilbezahlt', 'Rückerstattet', 'Fehlgeschlagen') NULL DEFAULT 'Ausstehend',
    `Versandstatus` ENUM('Nicht Versendet', 'Vorbereitung', 'Versendet', 'Unterwegs', 'Zugestellt', 'Fehlgeschlagen') NULL DEFAULT 'Nicht Versendet',
    `Zahlungsart` ENUM('Vorkasse', 'Rechnung', 'Nachnahme', 'PayPal', 'Kreditkarte', 'Sofortüberweisung', 'Lastschrift') NULL,
    `Versandart` VARCHAR(100) NULL,
    `RechnungsVorname` VARCHAR(100) NOT NULL,
    `RechnungsNachname` VARCHAR(100) NOT NULL,
    `RechnungsFirma` VARCHAR(255) NULL,
    `RechnungsAdresse` VARCHAR(255) NOT NULL,
    `RechnungsPLZ` VARCHAR(10) NOT NULL,
    `RechnungsOrt` VARCHAR(100) NOT NULL,
    `RechnungsLand` VARCHAR(100) NOT NULL,
    `RechnungsTelefon` VARCHAR(50) NULL,
    `RechnungsEmail` VARCHAR(255) NOT NULL,
    `LieferungVorname` VARCHAR(100) NOT NULL,
    `LieferungNachname` VARCHAR(100) NOT NULL,
    `LieferungFirma` VARCHAR(255) NULL,
    `LieferungAdresse` VARCHAR(255) NOT NULL,
    `LieferungPLZ` VARCHAR(10) NOT NULL,
    `LieferungOrt` VARCHAR(100) NOT NULL,
    `LieferungLand` VARCHAR(100) NOT NULL,
    `LieferungTelefon` VARCHAR(50) NULL,
    `ZwischensummeNetto` DECIMAL(10, 2) NOT NULL,
    `Versandkosten` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `RabattBetrag` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `RabattCode` VARCHAR(50) NULL,
    `MwStGesamt` DECIMAL(10, 2) NOT NULL,
    `GesamtsummeBrutto` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `KundenNotizen` TEXT NULL,
    `InterneNotizen` TEXT NULL,
    `IPAdresse` VARCHAR(45) NULL,
    `UserAgent` VARCHAR(255) NULL,
    `TrackingNummer` VARCHAR(100) NULL,
    `VersandDatum` TIMESTAMP(0) NULL,
    `ZugesteltDatum` TIMESTAMP(0) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ShopBestellnummer`(`Bestellnummer`),
    INDEX `idx_shopbestellungen_kundenid`(`KundenID`),
    INDEX `idx_shopbestellungen_bestelldatum`(`Bestelldatum`),
    INDEX `idx_shopbestellungen_status`(`Status`),
    INDEX `idx_shopbestellungen_zahlungsstatus`(`Zahlungsstatus`),
    PRIMARY KEY (`ShopBestellID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopBestellpositionen` (
    `ShopBestellpositionsID` INTEGER NOT NULL AUTO_INCREMENT,
    `ShopBestellID` INTEGER NOT NULL,
    `ShopProduktID` INTEGER NOT NULL,
    `Produktname` VARCHAR(255) NOT NULL,
    `SKU` VARCHAR(100) NULL,
    `Menge` INTEGER NOT NULL,
    `EinzelpreisNetto` DECIMAL(10, 2) NOT NULL,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwStSatz` DECIMAL(5, 2) NOT NULL,
    `MwStBetrag` DECIMAL(10, 2) NOT NULL,
    `AttributeJSON` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_shopbestellpositionen_bestellid`(`ShopBestellID`),
    INDEX `idx_shopbestellpositionen_produktid`(`ShopProduktID`),
    PRIMARY KEY (`ShopBestellpositionsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopZahlungen` (
    `ShopZahlungID` INTEGER NOT NULL AUTO_INCREMENT,
    `ShopBestellID` INTEGER NOT NULL,
    `Betrag` DECIMAL(10, 2) NOT NULL,
    `Waehrung` VARCHAR(3) NULL DEFAULT 'EUR',
    `Zahlungsart` ENUM('Vorkasse', 'Rechnung', 'PayPal', 'Kreditkarte', 'Sofortüberweisung', 'Lastschrift', 'Sonstige') NOT NULL,
    `TransaktionsID` VARCHAR(255) NULL,
    `Status` ENUM('Ausstehend', 'Autorisiert', 'Erfasst', 'Fehlgeschlagen', 'Rückerstattet', 'Storniert') NULL DEFAULT 'Ausstehend',
    `ZahlungsdatumErhalten` TIMESTAMP(0) NULL,
    `PaymentProviderAntwort` TEXT NULL,
    `Kommentare` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_shopzahlungen_bestellid`(`ShopBestellID`),
    INDEX `idx_shopzahlungen_transaktionid`(`TransaktionsID`),
    PRIMARY KEY (`ShopZahlungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopBewertungen` (
    `BewertungID` INTEGER NOT NULL AUTO_INCREMENT,
    `ShopProduktID` INTEGER NOT NULL,
    `KundenID` INTEGER NULL,
    `Bewertername` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NULL,
    `Bewertung` INTEGER NOT NULL,
    `Titel` VARCHAR(255) NULL,
    `Kommentar` TEXT NULL,
    `Status` ENUM('Ausstehend', 'Genehmigt', 'Abgelehnt', 'Spam') NULL DEFAULT 'Ausstehend',
    `IstVerifizierterKauf` BOOLEAN NULL DEFAULT false,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shopbewertungen_produktid`(`ShopProduktID`),
    INDEX `idx_shopbewertungen_kundenid`(`KundenID`),
    INDEX `idx_shopbewertungen_status`(`Status`),
    PRIMARY KEY (`BewertungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopEinstellungen` (
    `EinstellungID` INTEGER NOT NULL AUTO_INCREMENT,
    `SchluesselName` VARCHAR(100) NOT NULL,
    `Wert` TEXT NULL,
    `Typ` VARCHAR(50) NULL,
    `Beschreibung` TEXT NULL,
    `Kategorie` VARCHAR(100) NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ShopEinstellungSchluessel`(`SchluesselName`),
    INDEX `idx_shopeinstellungen_kategorie`(`Kategorie`),
    PRIMARY KEY (`EinstellungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zimmerkategorien` (
    `ZimmerkategorieID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Grundpreis` DECIMAL(10, 2) NOT NULL,
    `MaxPersonen` INTEGER NOT NULL DEFAULT 2,
    `Ausstattung` TEXT NULL,
    `Groesse` DECIMAL(10, 2) NULL,
    `BildURL` VARCHAR(255) NULL,
    `SortierReihenfolge` INTEGER NULL DEFAULT 0,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_zimmerkategorien_aktiv`(`IstAktiv`),
    PRIMARY KEY (`ZimmerkategorieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zimmer` (
    `ZimmerID` INTEGER NOT NULL AUTO_INCREMENT,
    `Zimmernummer` VARCHAR(50) NOT NULL,
    `ZimmerkategorieID` INTEGER NOT NULL,
    `StandortID` INTEGER NULL,
    `Etage` INTEGER NULL,
    `Status` ENUM('Verfuegbar', 'Belegt', 'Reserviert', 'Reinigung', 'Wartung', 'Außer Betrieb') NULL DEFAULT 'Verfuegbar',
    `Beschreibung` TEXT NULL,
    `Ausstattung` TEXT NULL,
    `PreisProNacht` DECIMAL(10, 2) NOT NULL,
    `MaxPersonen` INTEGER NOT NULL DEFAULT 2,
    `IstRaucherZimmer` BOOLEAN NULL DEFAULT false,
    `IstBarrierfrei` BOOLEAN NULL DEFAULT false,
    `IstAktiv` BOOLEAN NULL DEFAULT true,
    `LetzteReinigung` TIMESTAMP(0) NULL,
    `Notizen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_zimmer_kategorien`(`ZimmerkategorieID`),
    INDEX `idx_zimmer_standort`(`StandortID`),
    INDEX `idx_zimmer_status`(`Status`),
    UNIQUE INDEX `unique_zimmernummer_standort`(`Zimmernummer`, `StandortID`),
    PRIMARY KEY (`ZimmerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelBuchungen` (
    `BuchungsID` INTEGER NOT NULL AUTO_INCREMENT,
    `Buchungsnummer` VARCHAR(50) NOT NULL,
    `KundenID` INTEGER NULL,
    `Gastname` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NULL,
    `Telefon` VARCHAR(50) NULL,
    `CheckInDatum` DATETIME NOT NULL,
    `CheckOutDatum` DATETIME NOT NULL,
    `AnzahlErwachsene` INTEGER NOT NULL DEFAULT 1,
    `AnzahlKinder` INTEGER NULL DEFAULT 0,
    `Status` ENUM('Angefragt', 'Bestaetigt', 'Eingecheckt', 'Ausgecheckt', 'Abgeschlossen', 'Storniert', 'Nicht Erschienen') NULL DEFAULT 'Bestaetigt',
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `GesamtpreisBrutto` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `MwStGesamt` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `Anzahlung` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `RechnungsID` INTEGER NULL,
    `Zahlungsart` ENUM('Bar', 'Kreditkarte', 'EC-Karte', 'Rechnung', 'Vorkasse', 'PayPal', 'Ueberweisung') NULL,
    `Zahlungsstatus` ENUM('Ausstehend', 'Angezahlt', 'Bezahlt', 'Teilbezahlt', 'Rückerstattet', 'Storniert') NULL DEFAULT 'Ausstehend',
    `BesondereWuensche` TEXT NULL,
    `InterneNotizen` TEXT NULL,
    `CheckInZeit` TIMESTAMP(0) NULL,
    `CheckOutZeit` TIMESTAMP(0) NULL,
    `ErfasstVonBenutzerID` INTEGER NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Buchungsnummer_Hotel`(`Buchungsnummer`),
    INDEX `idx_hotelbuchungen_kundenid`(`KundenID`),
    INDEX `idx_hotelbuchungen_rechnungsid`(`RechnungsID`),
    INDEX `idx_hotelbuchungen_benutzerid`(`ErfasstVonBenutzerID`),
    INDEX `idx_hotelbuchungen_status`(`Status`),
    INDEX `idx_hotelbuchungen_checkin`(`CheckInDatum`),
    INDEX `idx_hotelbuchungen_checkout`(`CheckOutDatum`),
    PRIMARY KEY (`BuchungsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelBuchungszimmer` (
    `BuchungszimmerID` INTEGER NOT NULL AUTO_INCREMENT,
    `BuchungsID` INTEGER NOT NULL,
    `ZimmerID` INTEGER NOT NULL,
    `CheckInDatum` DATETIME NOT NULL,
    `CheckOutDatum` DATETIME NOT NULL,
    `PreisProNacht` DECIMAL(10, 2) NOT NULL,
    `AnzahlNaechte` INTEGER NOT NULL,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwStSatz` DECIMAL(5, 2) NOT NULL,
    `MwStBetrag` DECIMAL(10, 2) NOT NULL,
    `Notizen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_hotelbuchungszimmer_buchungid`(`BuchungsID`),
    INDEX `idx_hotelbuchungszimmer_zimmerid`(`ZimmerID`),
    PRIMARY KEY (`BuchungszimmerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelGaeste` (
    `GastID` INTEGER NOT NULL AUTO_INCREMENT,
    `BuchungsID` INTEGER NOT NULL,
    `Vorname` VARCHAR(100) NOT NULL,
    `Nachname` VARCHAR(100) NOT NULL,
    `Geburtsdatum` DATE NULL,
    `Nationalitaet` VARCHAR(100) NULL,
    `AusweisnummerTyp` VARCHAR(50) NULL,
    `Ausweisnummer` VARCHAR(100) NULL,
    `Email` VARCHAR(255) NULL,
    `Telefon` VARCHAR(50) NULL,
    `Adresse` VARCHAR(255) NULL,
    `Stadt` VARCHAR(100) NULL,
    `PLZ` VARCHAR(20) NULL,
    `Land` VARCHAR(100) NULL,
    `IstHauptgast` BOOLEAN NULL DEFAULT false,
    `Notizen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    `LetzteAenderung` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_hotelgaeste_buchungid`(`BuchungsID`),
    INDEX `idx_hotelgaeste_nachname`(`Nachname`),
    PRIMARY KEY (`GastID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelZusatzleistungen` (
    `ZusatzleistungID` INTEGER NOT NULL AUTO_INCREMENT,
    `BuchungsID` INTEGER NOT NULL,
    `Bezeichnung` VARCHAR(255) NOT NULL,
    `Beschreibung` TEXT NULL,
    `Typ` ENUM('Frühstück', 'Roomservice', 'Minibar', 'Parkplatz', 'Wellness', 'Transfer', 'Reinigung', 'Sonstiges') NULL DEFAULT 'Sonstiges',
    `Preis` DECIMAL(10, 2) NOT NULL,
    `Menge` DECIMAL(10, 2) NOT NULL DEFAULT 1,
    `GesamtpreisNetto` DECIMAL(10, 2) NOT NULL,
    `MwStSatz` DECIMAL(5, 2) NOT NULL,
    `MwStBetrag` DECIMAL(10, 2) NOT NULL,
    `Datum` DATETIME NOT NULL,
    `ErfasstVonBenutzerID` INTEGER NULL,
    `Notizen` TEXT NULL,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_hotelzusatzleistungen_buchungid`(`BuchungsID`),
    INDEX `idx_hotelzusatzleistungen_benutzerid`(`ErfasstVonBenutzerID`),
    INDEX `idx_hotelzusatzleistungen_datum`(`Datum`),
    PRIMARY KEY (`ZusatzleistungID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kassen` ADD CONSTRAINT `Kassen_ibfk_1` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kassenbuchungen` ADD CONSTRAINT `Kassenbuchungen_ibfk_1` FOREIGN KEY (`KassenID`) REFERENCES `Kassen`(`KassenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kassenbuchungen` ADD CONSTRAINT `Kassenbuchungen_ibfk_2` FOREIGN KEY (`BenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kassenbuchungen` ADD CONSTRAINT `Kassenbuchungen_ibfk_3` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kassenbuchungen` ADD CONSTRAINT `Kassenbuchungen_ibfk_4` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Projekt` ADD CONSTRAINT `Projekt_ibfk_1` FOREIGN KEY (`AudienceTemplateID`) REFERENCES `AudienceTemplate`(`TemplateID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ModuleKonfiguration` ADD CONSTRAINT `ModuleKonfiguration_ibfk_1` FOREIGN KEY (`TemplateID`) REFERENCES `AudienceTemplate`(`TemplateID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ModuleKonfiguration` ADD CONSTRAINT `ModuleKonfiguration_ibfk_2` FOREIGN KEY (`ModulID`) REFERENCES `ModuleDefinition`(`ModulID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProjektModule` ADD CONSTRAINT `ProjektModule_ibfk_1` FOREIGN KEY (`ProjektID`) REFERENCES `Projekt`(`ProjektID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProjektModule` ADD CONSTRAINT `ProjektModule_ibfk_2` FOREIGN KEY (`ModulID`) REFERENCES `ModuleDefinition`(`ModulID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Tischbereiche` ADD CONSTRAINT `Tischbereiche_ibfk_1` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantTische` ADD CONSTRAINT `RestaurantTische_ibfk_1` FOREIGN KEY (`BereichID`) REFERENCES `Tischbereiche`(`BereichID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reservierungen` ADD CONSTRAINT `Reservierungen_ibfk_1` FOREIGN KEY (`TischID`) REFERENCES `RestaurantTische`(`TischID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reservierungen` ADD CONSTRAINT `Reservierungen_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reservierungen` ADD CONSTRAINT `Reservierungen_ibfk_3` FOREIGN KEY (`ErfasstVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellungen` ADD CONSTRAINT `RestaurantBestellungen_ibfk_1` FOREIGN KEY (`TischID`) REFERENCES `RestaurantTische`(`TischID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellungen` ADD CONSTRAINT `RestaurantBestellungen_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellungen` ADD CONSTRAINT `RestaurantBestellungen_ibfk_3` FOREIGN KEY (`BenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellungen` ADD CONSTRAINT `RestaurantBestellungen_ibfk_4` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellpositionen` ADD CONSTRAINT `RestaurantBestellpositionen_ibfk_1` FOREIGN KEY (`RestaurantBestellID`) REFERENCES `RestaurantBestellungen`(`RestaurantBestellID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RestaurantBestellpositionen` ADD CONSTRAINT `RestaurantBestellpositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Preisvertraege` ADD CONSTRAINT `Preisvertraege_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Vertragspositionen` ADD CONSTRAINT `Vertragspositionen_ibfk_1` FOREIGN KEY (`VertragsID`) REFERENCES `Preisvertraege`(`VertragsID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Vertragspositionen` ADD CONSTRAINT `Vertragspositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `KundenVertreter` ADD CONSTRAINT `KundenVertreter_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `KundenVertreter` ADD CONSTRAINT `KundenVertreter_ibfk_2` FOREIGN KEY (`VertreterID`) REFERENCES `Vertreter`(`VertreterID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Provisionen` ADD CONSTRAINT `Provisionen_ibfk_1` FOREIGN KEY (`VertreterID`) REFERENCES `Vertreter`(`VertreterID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Provisionen` ADD CONSTRAINT `Provisionen_ibfk_2` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Provisionen` ADD CONSTRAINT `Provisionen_ibfk_3` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Kreditlimits` ADD CONSTRAINT `Kreditlimits_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Mahnungen` ADD CONSTRAINT `Mahnungen_ibfk_1` FOREIGN KEY (`KreditlimitID`) REFERENCES `Kreditlimits`(`KreditlimitID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Mahnungen` ADD CONSTRAINT `Mahnungen_ibfk_2` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lieferungen` ADD CONSTRAINT `Lieferungen_ibfk_1` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Lieferungen` ADD CONSTRAINT `Lieferungen_ibfk_2` FOREIGN KEY (`TourID`) REFERENCES `Touren`(`TourID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Liefernachweise` ADD CONSTRAINT `Liefernachweise_ibfk_1` FOREIGN KEY (`LieferungID`) REFERENCES `Lieferungen`(`LieferungID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Angebote` ADD CONSTRAINT `Angebote_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Angebote` ADD CONSTRAINT `Angebote_ibfk_2` FOREIGN KEY (`ErstelltVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Angebote` ADD CONSTRAINT `Angebote_ibfk_3` FOREIGN KEY (`BestellID`) REFERENCES `Bestellungen`(`BestellID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Angebotspositionen` ADD CONSTRAINT `Angebotspositionen_ibfk_1` FOREIGN KEY (`AngebotID`) REFERENCES `Angebote`(`AngebotID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Angebotspositionen` ADD CONSTRAINT `Angebotspositionen_ibfk_2` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopKategorien` ADD CONSTRAINT `ShopKategorien_ibfk_1` FOREIGN KEY (`UebergeordneteKategorieID`) REFERENCES `ShopKategorien`(`ShopKategorieID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopProdukte` ADD CONSTRAINT `ShopProdukte_ibfk_1` FOREIGN KEY (`ProduktID`) REFERENCES `Produkte`(`ProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopProdukte` ADD CONSTRAINT `ShopProdukte_ibfk_2` FOREIGN KEY (`ShopKategorieID`) REFERENCES `ShopKategorien`(`ShopKategorieID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopWarenkorb` ADD CONSTRAINT `ShopWarenkorb_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopWarenkorbpositionen` ADD CONSTRAINT `ShopWarenkorbpositionen_ibfk_1` FOREIGN KEY (`WarenkorbID`) REFERENCES `ShopWarenkorb`(`WarenkorbID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopWarenkorbpositionen` ADD CONSTRAINT `ShopWarenkorbpositionen_ibfk_2` FOREIGN KEY (`ShopProduktID`) REFERENCES `ShopProdukte`(`ShopProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopBestellungen` ADD CONSTRAINT `ShopBestellungen_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopBestellpositionen` ADD CONSTRAINT `ShopBestellpositionen_ibfk_1` FOREIGN KEY (`ShopBestellID`) REFERENCES `ShopBestellungen`(`ShopBestellID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopBestellpositionen` ADD CONSTRAINT `ShopBestellpositionen_ibfk_2` FOREIGN KEY (`ShopProduktID`) REFERENCES `ShopProdukte`(`ShopProduktID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopZahlungen` ADD CONSTRAINT `ShopZahlungen_ibfk_1` FOREIGN KEY (`ShopBestellID`) REFERENCES `ShopBestellungen`(`ShopBestellID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopBewertungen` ADD CONSTRAINT `ShopBewertungen_ibfk_1` FOREIGN KEY (`ShopProduktID`) REFERENCES `ShopProdukte`(`ShopProduktID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ShopBewertungen` ADD CONSTRAINT `ShopBewertungen_ibfk_2` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Zimmer` ADD CONSTRAINT `Zimmer_ibfk_1` FOREIGN KEY (`ZimmerkategorieID`) REFERENCES `Zimmerkategorien`(`ZimmerkategorieID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Zimmer` ADD CONSTRAINT `Zimmer_ibfk_2` FOREIGN KEY (`StandortID`) REFERENCES `Standorte`(`StandortID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelBuchungen` ADD CONSTRAINT `HotelBuchungen_ibfk_1` FOREIGN KEY (`KundenID`) REFERENCES `Kunden`(`KundenID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelBuchungen` ADD CONSTRAINT `HotelBuchungen_ibfk_2` FOREIGN KEY (`RechnungsID`) REFERENCES `Rechnungen`(`RechnungsID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelBuchungen` ADD CONSTRAINT `HotelBuchungen_ibfk_3` FOREIGN KEY (`ErfasstVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelBuchungszimmer` ADD CONSTRAINT `HotelBuchungszimmer_ibfk_1` FOREIGN KEY (`BuchungsID`) REFERENCES `HotelBuchungen`(`BuchungsID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelBuchungszimmer` ADD CONSTRAINT `HotelBuchungszimmer_ibfk_2` FOREIGN KEY (`ZimmerID`) REFERENCES `Zimmer`(`ZimmerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelGaeste` ADD CONSTRAINT `HotelGaeste_ibfk_1` FOREIGN KEY (`BuchungsID`) REFERENCES `HotelBuchungen`(`BuchungsID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelZusatzleistungen` ADD CONSTRAINT `HotelZusatzleistungen_ibfk_1` FOREIGN KEY (`BuchungsID`) REFERENCES `HotelBuchungen`(`BuchungsID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `HotelZusatzleistungen` ADD CONSTRAINT `HotelZusatzleistungen_ibfk_2` FOREIGN KEY (`ErfasstVonBenutzerID`) REFERENCES `Benutzer`(`BenutzerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
