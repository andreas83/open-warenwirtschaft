import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  const projektId = parseInt(getRouterParam(event, 'id') || '0');
  const modulId = parseInt(getRouterParam(event, 'modulId') || '0');

  if (!projektId || isNaN(projektId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid project ID',
    });
  }

  if (!modulId || isNaN(modulId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid module ID',
    });
  }

  try {
    const body = await readBody(event);
    const istAktiviert = body.istAktiviert;

    if (typeof istAktiviert !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'istAktiviert must be a boolean',
      });
    }

    // Check if the module assignment exists
    const existingModule = await prisma.projektModule.findFirst({
      where: {
        ProjektID: projektId,
        ModulID: modulId,
      },
    });

    if (!existingModule) {
      // Create new module assignment
      const newModule = await prisma.projektModule.create({
        data: {
          ProjektID: projektId,
          ModulID: modulId,
          IstAktiviert: istAktiviert,
        },
        include: {
          ModulDefinition: true,
        },
      });
      return {
        success: true,
        module: newModule,
      };
    }

    // Update existing module assignment
    const updatedModule = await prisma.projektModule.update({
      where: {
        ProjektModulID: existingModule.ProjektModulID,
      },
      data: {
        IstAktiviert: istAktiviert,
        LetzteAenderung: new Date(),
      },
      include: {
        ModulDefinition: true,
      },
    });

    return {
      success: true,
      module: updatedModule,
    };
  } catch (error) {
    console.error(`Error toggling module ${modulId} for project ${projektId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to toggle module',
    });
  }
});
