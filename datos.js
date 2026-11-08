   db = db.getSiblingDB("rastro")
db.dropDatabase()

db.usuarios.insertMany([
  { _id: ObjectId("660000000000000000000001"), nombre: "Ana García",  email: "ana@rastro.es",   ciudad: "Valencia",  fechaAlta: new Date("2025-03-10"), favoritos: [ObjectId("670000000000000000000008")], valoracionMedia: 0, numValoraciones: 0 },
  { _id: ObjectId("660000000000000000000002"), nombre: "Luis Martín", email: "luis@rastro.es",  ciudad: "Valencia",  fechaAlta: new Date("2024-11-02"), favoritos: [], valoracionMedia: 0, numValoraciones: 0 },
  { _id: ObjectId("660000000000000000000003"), nombre: "Marta Ruiz",  email: "marta@rastro.es", ciudad: "Alicante",  fechaAlta: new Date("2025-06-21"), favoritos: [], valoracionMedia: 5, numValoraciones: 1 },
  { _id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz",   email: "hugo@rastro.es",  ciudad: "Castellón", fechaAlta: new Date("2026-01-15"), favoritos: [], valoracionMedia: 0, numValoraciones: 0 },
  { _id: ObjectId("660000000000000000000005"), nombre: "Sara López",  email: "sara@rastro.es",  ciudad: "Valencia",  fechaAlta: new Date("2026-09-30"), favoritos: [ObjectId("670000000000000000000001"), ObjectId("670000000000000000000003"), ObjectId("670000000000000000000008")], valoracionMedia: 0, numValoraciones: 0 }
])

db.anuncios.insertMany([
  { _id: ObjectId("670000000000000000000001"), titulo: "Seat Ibiza 2015", descripcion: "Siempre en garaje, ITV pasada.", precio: 6500, categoria: "Coches", estado: "DISPONIBLE", ciudad: "Valencia", fechaPublicacion: new Date("2026-10-01"), visitas: 340,
    vendedor: { id: ObjectId("660000000000000000000002"), nombre: "Luis Martín" },
    fotos: [ { url: "https://img.rastro.es/a1-1.jpg", orden: 1 }, { url: "https://img.rastro.es/a1-2.jpg", orden: 2 } ],
    atributos: { marca: "Seat", modelo: "Ibiza", anio: 2015, km: 98000, combustible: "gasolina" } },
  { _id: ObjectId("670000000000000000000002"), titulo: "Ford Focus 2012", descripcion: "Correa cambiada hace un año.", precio: 4200, categoria: "Coches", estado: "DISPONIBLE", ciudad: "Castellón", fechaPublicacion: new Date("2026-10-12"), visitas: 95,
    vendedor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" },
    fotos: [ { url: "https://img.rastro.es/a2-1.jpg", orden: 1 } ],
    atributos: { marca: "Ford", modelo: "Focus", anio: 2012, km: 165000, combustible: "diésel" } },
  { _id: ObjectId("670000000000000000000003"), titulo: "iPhone 13 128 GB", descripcion: "Con funda y cargador.", precio: 380, categoria: "Móviles", estado: "DISPONIBLE", ciudad: "Valencia", fechaPublicacion: new Date("2026-10-20"), visitas: 512,
    vendedor: { id: ObjectId("660000000000000000000001"), nombre: "Ana García" },
    fotos: [ { url: "https://img.rastro.es/a3-1.jpg", orden: 1 }, { url: "https://img.rastro.es/a3-2.jpg", orden: 2 }, { url: "https://img.rastro.es/a3-3.jpg", orden: 3 } ],
    atributos: { marca: "Apple", modelo: "iPhone 13", almacenamientoGB: 128, bateriaPct: 87 } },
  { _id: ObjectId("670000000000000000000004"), titulo: "Samsung Galaxy A52", descripcion: "Pantalla sin rayas.", precio: 150, categoria: "Móviles", estado: "VENDIDO", ciudad: "Alicante", fechaPublicacion: new Date("2026-09-05"), visitas: 210,
    vendedor: { id: ObjectId("660000000000000000000003"), nombre: "Marta Ruiz" },
    fotos: [ { url: "https://img.rastro.es/a4-1.jpg", orden: 1 } ],
    atributos: { marca: "Samsung", modelo: "Galaxy A52", almacenamientoGB: 128, bateriaPct: 80 } },
  { _id: ObjectId("670000000000000000000005"), titulo: "Xiaomi Redmi Note 10", descripcion: "Funciona perfecto.", precio: 90, categoria: "Móviles", estado: "DISPONIBLE", ciudad: "Valencia", fechaPublicacion: new Date("2026-10-22"), visitas: 48,
    vendedor: { id: ObjectId("660000000000000000000002"), nombre: "Luis Martín" },
    fotos: [ { url: "https://img.rastro.es/a5-1.jpg", orden: 1 } ],
    atributos: { marca: "Xiaomi", modelo: "Redmi Note 10", almacenamientoGB: 64, bateriaPct: 91 } },
  { _id: ObjectId("670000000000000000000006"), titulo: "Chaqueta vaquera Levi's", descripcion: "Poco uso.", precio: 25, categoria: "Ropa", estado: "DISPONIBLE", ciudad: "Alicante", fechaPublicacion: new Date("2026-10-25"), visitas: 12,
    vendedor: { id: ObjectId("660000000000000000000003"), nombre: "Marta Ruiz" },
    fotos: [],
    atributos: { talla: "M", marca: "Levi's", genero: "unisex" } },
  { _id: ObjectId("670000000000000000000007"), titulo: "Zapatillas Nike Air", descripcion: "Talla 42, como nuevas.", precio: 40, categoria: "Ropa", estado: "RESERVADO", ciudad: "Valencia", fechaPublicacion: new Date("2026-10-18"), visitas: 77,
    vendedor: { id: ObjectId("660000000000000000000001"), nombre: "Ana García" },
    fotos: [ { url: "https://img.rastro.es/a7-1.jpg", orden: 1 } ],
    atributos: { talla: "42", marca: "Nike", genero: "hombre" } },
  { _id: ObjectId("670000000000000000000008"), titulo: "Mesa de comedor de roble", descripcion: "Para 6 personas.", precio: 120, categoria: "Muebles", estado: "DISPONIBLE", ciudad: "Castellón", fechaPublicacion: new Date("2026-10-26"), visitas: 160,
    vendedor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" },
    fotos: [ { url: "https://img.rastro.es/a8-1.jpg", orden: 1 } ],
    atributos: { material: "roble", ancho: 160, fondo: 90, alto: 75 } }
])

db.ofertas.insertMany([
  { _id: ObjectId("680000000000000000000001"), importe: 340, estado: "PENDIENTE", fecha: new Date("2026-10-27"),
    anuncio: { id: ObjectId("670000000000000000000003"), titulo: "iPhone 13 128 GB", precio: 380 },
    comprador: { id: ObjectId("660000000000000000000005"), nombre: "Sara López" } },
  { _id: ObjectId("680000000000000000000002"), importe: 6000, estado: "RECHAZADA", fecha: new Date("2026-10-05"),
    anuncio: { id: ObjectId("670000000000000000000001"), titulo: "Seat Ibiza 2015", precio: 6500 },
    comprador: { id: ObjectId("660000000000000000000001"), nombre: "Ana García" } },
  { _id: ObjectId("680000000000000000000003"), importe: 6200, estado: "PENDIENTE", fecha: new Date("2026-10-26"),
    anuncio: { id: ObjectId("670000000000000000000001"), titulo: "Seat Ibiza 2015", precio: 6500 },
    comprador: { id: ObjectId("660000000000000000000005"), nombre: "Sara López" } },
  { _id: ObjectId("680000000000000000000004"), importe: 150, estado: "ACEPTADA", fecha: new Date("2026-09-10"),
    anuncio: { id: ObjectId("670000000000000000000004"), titulo: "Samsung Galaxy A52", precio: 150 },
    comprador: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" } },
  { _id: ObjectId("680000000000000000000005"), importe: 35, estado: "ACEPTADA", fecha: new Date("2026-10-27"),
    anuncio: { id: ObjectId("670000000000000000000007"), titulo: "Zapatillas Nike Air", precio: 40 },
    comprador: { id: ObjectId("660000000000000000000002"), nombre: "Luis Martín" } }
])

db.valoraciones.insertOne({
  anuncioId: ObjectId("670000000000000000000004"),
  autor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" },
  valoradoId: ObjectId("660000000000000000000003"),
  estrellas: 5, comentario: "Todo perfecto", fecha: new Date("2026-09-15")
})