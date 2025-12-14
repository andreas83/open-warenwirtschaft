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
    // Get active modules for the project
    const modules = await prisma.projektModule.findMany({
      where: {
        ProjektID: id,
        IstAktiviert: true,
      },
      include: {
        ModulDefinition: true,
      },
      orderBy: [
        { ModulDefinition: { Kategorie: 'asc' } },
        { ModulDefinition: { SortOrder: 'asc' } },
      ],
    });

    // Transform to a more useful format for the frontend
    return modules.map((m) => ({
      modulId: m.ModulID,
      modulName: m.ModulDefinition.ModulName,
      displayName: m.ModulDefinition.DisplayName,
      icon: m.ModulDefinition.Icon,
      route: m.ModulDefinition.Route,
      kategorie: m.ModulDefinition.Kategorie,
      sortOrder: m.ModulDefinition.SortOrder,
    }));
  } catch (error) {
    console.error(`Error fetching modules for project ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project modules',
    });
  }
});
