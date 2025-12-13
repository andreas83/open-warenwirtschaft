import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const modules = await prisma.moduleDefinition.findMany({
      where: {
        IstAktiv: true,
      },
      orderBy: [
        { Kategorie: 'asc' },
        { SortOrder: 'asc' },
      ],
    });

    return modules;
  } catch (error) {
    console.error('Error fetching module definitions:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch module definitions',
    });
  }
});
