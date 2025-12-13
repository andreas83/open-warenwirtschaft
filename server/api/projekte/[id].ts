import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0');

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid project ID',
    });
  }

  try {
    const projekt = await prisma.projekt.findUnique({
      where: { ProjektID: id },
      include: {
        AudienceTemplate: true,
        ProjektModule: {
          include: {
            ModulDefinition: true,
          },
          orderBy: [
            { ModulDefinition: { Kategorie: 'asc' } },
            { ModulDefinition: { SortOrder: 'asc' } },
          ],
        },
      },
    });

    if (!projekt) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      });
    }

    return projekt;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project',
    });
  }
});
