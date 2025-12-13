import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const templates = await prisma.audienceTemplate.findMany({
      where: {
        IstAktiv: true,
      },
      include: {
        ModuleKonfigurationen: {
          include: {
            ModulDefinition: true,
          },
        },
      },
      orderBy: {
        SortOrder: 'asc',
      },
    });

    return templates;
  } catch (error) {
    console.error('Error fetching audience templates:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch audience templates',
    });
  }
});
