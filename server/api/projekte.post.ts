import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { ProjektName, Beschreibung, AudienceTemplateID, Firmenname, Branche } = body;

    // Validate required fields
    if (!ProjektName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Projektname ist erforderlich',
      });
    }

    // Start a transaction to create project and copy module configurations
    const result = await prisma.$transaction(async (tx) => {
      // Create the project
      const projekt = await tx.projekt.create({
        data: {
          ProjektName,
          Beschreibung,
          AudienceTemplateID: AudienceTemplateID || null,
          Firmenname,
          Branche,
          Status: 'Aktiv',
        },
      });

      // If an audience template is selected, copy its module configurations
      if (AudienceTemplateID) {
        const templateModules = await tx.moduleKonfiguration.findMany({
          where: {
            TemplateID: AudienceTemplateID,
          },
        });

        // Create project module entries based on template configuration
        const projektModuleData = templateModules.map((config) => ({
          ProjektID: projekt.ProjektID,
          ModulID: config.ModulID,
          IstAktiviert: config.IstAktiviert,
        }));

        await tx.projektModule.createMany({
          data: projektModuleData,
        });
      }

      // Fetch the created project with all relations
      const createdProjekt = await tx.projekt.findUnique({
        where: { ProjektID: projekt.ProjektID },
        include: {
          AudienceTemplate: true,
          ProjektModule: {
            include: {
              ModulDefinition: true,
            },
          },
        },
      });

      return createdProjekt;
    });

    return result;
  } catch (error: any) {
    console.error('Error creating project:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Erstellen des Projekts',
    });
  }
});
