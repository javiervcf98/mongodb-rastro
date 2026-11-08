// Práctica MongoDB — Rastro
// Ejecutar antes en mongosh: use rastro

// Ejercicio B1 — Carga de datos
// Los datos están en datos.js y se cargan con load("/tmp/datos.js")
db.usuarios.countDocuments()      // 5
db.anuncios.countDocuments()      // 8
db.ofertas.countDocuments()       // 5
db.valoraciones.countDocuments()  // 1

// Ejercicio B2 — Dos anuncios nuevos
db.anuncios.insertOne({
  titulo: "Bicicleta de montaña Orbea",
  descripcion: "Revisada en taller.",
  precio: 300,
  categoria: "Deporte",
  estado: "DISPONIBLE",
  ciudad: "Castellón",
  fechaPublicacion: new Date("2026-10-27"),
  visitas: 0,
  vendedor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" },
  fotos: [ { url: "https://img.rastro.es/bici-1.jpg", orden: 1 } ],
  atributos: { talla: "L", tipo: "montaña", pulgadasRueda: 29 }
})

db.anuncios.insertOne({
  titulo: "Google Pixel 7",
  descripcion: "Libre, con caja.",
  precio: 260,
  categoria: "Móviles",
  estado: "DISPONIBLE",
  ciudad: "Valencia",
  fechaPublicacion: new Date("2026-10-28"),
  visitas: 0,
  vendedor: { id: ObjectId("660000000000000000000005"), nombre: "Sara López" },
  fotos: [
    { url: "https://img.rastro.es/pixel-1.jpg", orden: 1 },
    { url: "https://img.rastro.es/pixel-2.jpg", orden: 2 }
  ],
  atributos: { marca: "Google", modelo: "Pixel 7", almacenamientoGB: 128, bateriaPct: 92 }
})

db.anuncios.countDocuments()      // 10
// Ejercicio B3 — Índices
db.usuarios.createIndex({ email: 1 }, { unique: true })
db.valoraciones.createIndex({ "autor.id": 1, anuncioId: 1 }, { unique: true })
db.anuncios.createIndex({ categoria: 1, precio: 1 })

db.usuarios.getIndexes()
db.valoraciones.getIndexes()
db.anuncios.getIndexes()

db.anuncios.find({ categoria: "Coches" }).sort({ precio: 1 }).explain()
// winningPlan: IXSCAN con el índice categoria_1_precio_1 (y FETCH encima).
// No hay etapa SORT: el índice ya devuelve los coches ordenados por precio.

// Ejercicio B4 — Rompe la base de datos a propósito

// B4.1 Un usuario con el email de Ana
db.usuarios.insertOne({ nombre: "Ana Copia", email: "ana@rastro.es", ciudad: "Valencia", fechaAlta: new Date(), favoritos: [], valoracionMedia: 0, numValoraciones: 0 })
// Error E11000: lo impide el índice único email_1

// B4.2 Hugo valora otra vez a Marta por el mismo anuncio
db.valoraciones.insertOne({ anuncioId: ObjectId("670000000000000000000004"), autor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" }, valoradoId: ObjectId("660000000000000000000003"), estrellas: 1, comentario: "Cambio de opinión", fecha: new Date() })
// Error E11000: lo impide el índice único autor.id_1_anuncioId_1

// B4.3 Un anuncio de un vendedor que no existe
db.anuncios.insertOne({ titulo: "Prueba fantasma", precio: 10, categoria: "Libros", estado: "DISPONIBLE", ciudad: "Valencia", fechaPublicacion: new Date(), visitas: 0, vendedor: { id: ObjectId("660000000000000000000099"), nombre: "Nadie" }, fotos: [], atributos: {} })
// Se guarda sin error: MongoDB no comprueba que el vendedor exista

// B4.4 Un anuncio con el precio escrito como texto
db.anuncios.insertOne({ titulo: "Prueba lámpara", precio: "75", categoria: "Muebles", estado: "DISPONIBLE", ciudad: "Valencia", fechaPublicacion: new Date(), visitas: 0, vendedor: { id: ObjectId("660000000000000000000001"), nombre: "Ana García" }, fotos: [], atributos: { material: "metal" } })
db.anuncios.find({ precio: { $lt: 100 } }, { titulo: 1, precio: 1, _id: 0 })
// Se guarda sin error, pero la lámpara no sale en la búsqueda: "75" es texto

// B4.5 Cambiar el precio del Xiaomi sin operador
db.anuncios.updateOne({ _id: ObjectId("670000000000000000000005") }, { precio: 80 })
// Error: Update document requires atomic operators (falta $set)

// B4.6 Buscar el iPhone por su id escrito como texto
db.anuncios.findOne({ _id: "670000000000000000000003" })
// Devuelve null: el texto no es igual a un ObjectId
db.anuncios.findOne({ _id: ObjectId("670000000000000000000003") })
// Con ObjectId sí lo encuentra

// Borrar los anuncios de prueba
db.anuncios.deleteMany({ titulo: /^Prueba/ })
db.anuncios.countDocuments()      // 10


// Ejercicio B5 — Consultas

// B5.1 Anuncios DISPONIBLE de Valencia, del más barato al más caro
db.anuncios.find({ estado: "DISPONIBLE", ciudad: "Valencia" }, { titulo: 1, precio: 1, _id: 0 }).sort({ precio: 1 })

// B5.2 Coches con menos de 100.000 km
db.anuncios.find({ categoria: "Coches", "atributos.km": { $lt: 100000 } })

// B5.3 Móviles con 128 GB o más
db.anuncios.find({ categoria: "Móviles", "atributos.almacenamientoGB": { $gte: 128 } })

// B5.4 Anuncios entre 50 y 400 € (ambos incluidos)
db.anuncios.find({ precio: { $gte: 50, $lte: 400 } }, { titulo: 1, precio: 1, _id: 0 })

// B5.5 Título que contiene «nike», sin importar mayúsculas
db.anuncios.find({ titulo: /nike/i }, { titulo: 1, _id: 0 })

// B5.6 Anuncios de Luis Martín, buscando por su id
db.anuncios.find({ "vendedor.id": ObjectId("660000000000000000000002") }, { titulo: 1, _id: 0 })

// B5.7 Anuncios sin ninguna foto
db.anuncios.find({ fotos: { $size: 0 } }, { titulo: 1, _id: 0 })

// B5.8 Ofertas PENDIENTE del Seat Ibiza
db.ofertas.find({ "anuncio.id": ObjectId("670000000000000000000001"), estado: "PENDIENTE" })

// B5.9 Usuarios que tienen la mesa de roble en favoritos
db.usuarios.find({ favoritos: ObjectId("670000000000000000000008") }, { nombre: 1, _id: 0 })
// B5.10 ¿Cuántos anuncios están VENDIDO?
db.anuncios.countDocuments({ estado: "VENDIDO" })      // 1

// B5.11 Los 3 anuncios más vistos
db.anuncios.find({}, { titulo: 1, visitas: 1, _id: 0 }).sort({ visitas: -1 }).limit(3)
// B5.12 Anuncios sin el campo atributos.km: no dan error, simplemente no salen
db.anuncios.find({ "atributos.km": { $lt: 100000 } }, { titulo: 1, _id: 0 })
   // solo el Seat

   // Ejercicio B6 — Agregaciones

// B6.1 Número de anuncios por categoría, de más a menos
db.anuncios.aggregate([
  { $group: { _id: "$categoria", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
])

// B6.2 Precio medio por categoría
db.anuncios.aggregate([
  { $group: { _id: "$categoria", precioMedio: { $avg: "$precio" } } }
])

// B6.3 Número de anuncios por ciudad
db.anuncios.aggregate([
  { $group: { _id: "$ciudad", total: { $sum: 1 } } }
])
// B6.4 Valor total en venta por vendedor (solo DISPONIBLE)
db.anuncios.aggregate([
  { $match: { estado: "DISPONIBLE" } },
  { $group: { _id: "$vendedor.nombre", valorEnVenta: { $sum: "$precio" } } },
  { $sort: { valorEnVenta: -1 } }
])

// B6.5 Reto: la categoría con más visitas en total
db.anuncios.aggregate([
  { $group: { _id: "$categoria", totalVisitas: { $sum: "$visitas" } } },
  { $sort: { totalVisitas: -1 } },
  { $limit: 1 }
])
db.usuarios.updateOne({ _id: ObjectId("660000000000000000000005") }, { $addToSet: { favoritos: ObjectId("670000000000000000000002") } })
// Segunda vez: matchedCount 1, modifiedCount 0 → no se duplica


// Ejercicio B7 — Modificar

// B7.1 Ana añade una cuarta foto al iPhone
db.anuncios.findOne({ _id: ObjectId("670000000000000000000003") }, { fotos: 1 })
db.anuncios.updateOne({ _id: ObjectId("670000000000000000000003") }, { $push: { fotos: { url: "https://img.rastro.es/a3-4.jpg", orden: 4 } } })

// B7.2 Alguien abre la ficha del Xiaomi: +1 visita
db.anuncios.findOne({ _id: ObjectId("670000000000000000000005") }, { titulo: 1, visitas: 1 })
db.anuncios.updateOne({ _id: ObjectId("670000000000000000000005") }, { $inc: { visitas: 1 } })

// B7.3 Sara quita el iPhone de favoritos y añade el Ford Focus
db.usuarios.findOne({ _id: ObjectId("660000000000000000000005") }, { favoritos: 1 })
db.usuarios.updateOne({ _id: ObjectId("660000000000000000000005") }, { $pull: { favoritos: ObjectId("670000000000000000000003") } })
db.usuarios.updateOne({ _id: ObjectId("660000000000000000000005") }, { $addToSet: { favoritos: ObjectId("670000000000000000000002") } })
db.usuarios.updateOne({ _id: ObjectId("660000000000000000000005") }, { $addToSet: { favoritos: ObjectId("670000000000000000000002") } })
// Segunda vez: matchedCount 1, modifiedCount 0 → no se duplica

// B7.4 Luis acepta la oferta de Sara por el Seat
db.ofertas.findOne({ _id: ObjectId("680000000000000000000003") }, { estado: 1, importe: 1 })
db.anuncios.findOne({ _id: ObjectId("670000000000000000000001") }, { titulo: 1, estado: 1 })
db.ofertas.updateOne({ _id: ObjectId("680000000000000000000003") }, { $set: { estado: "ACEPTADA" } })
db.anuncios.updateOne({ _id: ObjectId("670000000000000000000001") }, { $set: { estado: "RESERVADO" } })
// Dos instrucciones: si se corta la luz entre ellas, la oferta queda ACEPTADA
// y el anuncio DISPONIBLE (datos incoherentes). Haría falta una transacción.

// B7.5 Rebajas: todos los coches bajan un 10 %
db.anuncios.find({ categoria: "Coches" }, { titulo: 1, precio: 1, _id: 0 })
db.anuncios.updateMany({ categoria: "Coches" }, { $mul: { precio: 0.9 } })
// matchedCount 2, modifiedCount 2: Seat 6500 → 5850, Ford 4200 → 3780

// B7.6 Luis cambia su nombre a «Luis M. Martín»
db.usuarios.updateOne({ _id: ObjectId("660000000000000000000002") }, { $set: { nombre: "Luis M. Martín" } })

// Sus anuncios siguen mostrando el nombre antiguo, porque es una copia:
db.anuncios.find({ "vendedor.id": ObjectId("660000000000000000000002") }, { titulo: 1, "vendedor.nombre": 1, _id: 0 })
// → 'Luis Martín' en el Seat y el Xiaomi

// Se arregla en todas las colecciones donde se copió el nombre:
db.anuncios.updateMany({ "vendedor.id": ObjectId("660000000000000000000002") }, { $set: { "vendedor.nombre": "Luis M. Martín" } })      // 2
db.ofertas.updateMany({ "comprador.id": ObjectId("660000000000000000000002") }, { $set: { "comprador.nombre": "Luis M. Martín" } })   // 1
db.valoraciones.updateMany({ "autor.id": ObjectId("660000000000000000000002") }, { $set: { "autor.nombre": "Luis M. Martín" } })     // 0

db.anuncios.find({ "vendedor.id": ObjectId("660000000000000000000002") }, { titulo: 1, "vendedor.nombre": 1, _id: 0 })
// → 'Luis M. Martín' en los dos anuncios