import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0');

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid template ID',
    });
  }

  try {
    const template = await prisma.audienceTemplate.findUnique({
      where: { TemplateID: id },
      include: {
        ModuleKonfigurationen: {
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

    if (!template) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found',
      });
    }

    return template;
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch template',
    });
  }
});
