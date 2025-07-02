-- AlterTable
ALTER TABLE `Benutzer` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Bestand` MODIFY `Eingangsdatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Bestellungen` MODIFY `Bestelldatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Gutschriften` MODIFY `Gutschriftsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Kunden` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `KundenRabattAnwendung` MODIFY `GueltigAb` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Kundengruppen` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Kundenkarten` MODIFY `Aktivierungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Lagerbewegungen` MODIFY `Bewegungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Lieferanten` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Preise` MODIFY `GueltigAb` TIMESTAMP(0) NOT NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `ProduktBilder` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Produkte` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Produktkategorien` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Rabatte` MODIFY `GueltigAb` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Rechnungen` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `RechnungsRabatte` MODIFY `Anwendungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Retouren` MODIFY `Retourendatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Standorte` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Umsatzsteuersaetze` MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- AlterTable
ALTER TABLE `Zahlungen` MODIFY `Zahlungsdatum` TIMESTAMP(0) NULL DEFAULT (now()),
    MODIFY `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now());

-- CreateTable
CREATE TABLE `KategorieBilder` (
    `BildID` INTEGER NOT NULL AUTO_INCREMENT,
    `KategorieID` INTEGER NOT NULL,
    `BildPfad` VARCHAR(255) NOT NULL,
    `IstHauptbild` BOOLEAN NOT NULL DEFAULT false,
    `Erstelldatum` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `idx_kategoriebilder_kategorieid`(`KategorieID`),
    PRIMARY KEY (`BildID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KategorieBilder` ADD CONSTRAINT `KategorieBilder_ibfk_1` FOREIGN KEY (`KategorieID`) REFERENCES `Produktkategorien`(`KategorieID`) ON DELETE CASCADE ON UPDATE NO ACTION;
