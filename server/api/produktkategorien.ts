import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const query = getQuery(event);
  const id = query.id ? parseInt(query.id as string) : null;

  try {
    if (method === 'GET') {
      if (id) {
        const kategorie = await prisma.produktkategorien.findUnique({
          where: { KategorieID: id },
          include: { KategorieBilder: true }
        });
        if (!kategorie) {
          return { status: 404, message: 'Kategorie nicht gefunden' };
        }
        return kategorie;
      } else {
        const kategorien = await prisma.produktkategorien.findMany({
          orderBy: {
            Name: 'asc'
          },
          include: { KategorieBilder: true }
        });
        return kategorien;
      }
    } else if (method === 'POST') {
      const body = await readBody(event);
      const newKategorie = await prisma.produktkategorien.create({
        data: {
          Name: body.Name,
          Beschreibung: body.Beschreibung || null,
          UebergeordneteKategorieID: body.UebergeordneteKategorieID ? parseInt(body.UebergeordneteKategorieID) : null
        }
      });
      return { status: 201, data: newKategorie };
    } else if (method === 'PUT' && id) {
      const body = await readBody(event);
      const updatedKategorie = await prisma.produktkategorien.update({
        where: { KategorieID: id },
        data: {
          Name: body.Name,
          Beschreibung: body.Beschreibung || null,
          UebergeordneteKategorieID: body.UebergeordneteKategorieID ? parseInt(body.UebergeordneteKategorieID) : null
        }
      });
      return { status: 200, data: updatedKategorie };
    } else if (method === 'DELETE' && id) {
      await prisma.produktkategorien.delete({
        where: { KategorieID: id }
      });
      return { status: 204, message: 'Kategorie gelöscht' };
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' };
    }
  } catch (error: any) {
    console.error(error);
    return { status: 500, message: 'Interner Serverfehler', error: error.message };
  }
});
