import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const projekte = await prisma.projekt.findMany({
      include: {
        AudienceTemplate: true,
        ProjektModule: {
          include: {
            ModulDefinition: true,
          },
        },
      },
      orderBy: {
        Erstelldatum: 'desc',
      },
    });

    return projekte;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch projects',
    });
  }
});
