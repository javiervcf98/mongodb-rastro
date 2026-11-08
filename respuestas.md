//EJERCICIO A1//
1.Escribe las columnas que tendría la tabla anuncios si cada atributo es una columna. Cuéntalas.

Son 16 columnas y 3 atributos

id, titulo, categoria,                  
marca, modelo, año, km, combustible,    --<coche
almacenamiento_gb, bateria_pct,         --<moviles
talla, genero,                          --<ropa
material, fondo, ancho                  --<muebles

2.Rellena la fila de la chaqueta. ¿Cuántas columnas quedan en NULL?
//A1.2// Fila de la chaqueta

| Columna            | Valor            |
|--------------------|------------------|
| id                 | 6                |
| titulo             | Chaqueta vaquera |
| categoria          | Ropa             |
| marca              | Levi's           |
| modelo             | NULL             |
| anio               | NULL             |
| km                 | NULL             |
| combustible        | NULL             |
| almacenamiento_gb  | NULL             |
| bateria_pct        | NULL             |
| talla              | M                |
| genero             | unisex           |
| material           | NULL             |
| ancho              | NULL             |
| fondo              | NULL             |
| alto               | NULL             |

3.Mañana llega la categoría Deporte (talla, tipo de bici, pulgadas de rueda). ¿Qué tendrías que cambiar en la base de datos?
//A1.3// Llega la categoría Deporte

Hay que cambiar la estructura de la tabla añadiendo columnas nuevas:

    ALTER TABLE anuncios
    ADD COLUMN tipo_bici VARCHAR (30),
    ADD COLUMN pulgadas_rueda INTEGER;

No hace falta cambiar nada en MongoDB, puesto que la columna de Deporte sale con sus propios atributos.

4.Otra opción en SQL: una tabla por categoría (coches, moviles…), cada una con anuncio_id. ¿Cuántos JOIN harían falta para listar «todos los anuncios de Valencia con sus datos»?
//A1.4// Una tabla por categoría

Hacen falta **4 LEFT JOIN**, uno por cada tabla de categoría:

    SELECT *
    FROM anuncios a
    LEFT JOIN coches  c ON c.anuncio_id = a.id
    LEFT JOIN moviles m ON m.anuncio_id = a.id
    LEFT JOIN ropa    r ON r.anuncio_id = a.id
    LEFT JOIN muebles u ON u.anuncio_id = a.id
    WHERE a.ciudad = 'Valencia';

Tiene que ser LEFT JOIN porque cada anuncio solo está en una tabla de
categoría; con un JOIN normal no saldría ninguno. Además, cada categoría
nueva obliga a crear otra tabla y a añadir otro JOIN a la consulta.

5.### A1.5 Los documentos en MongoDB

```js
{ titulo: "iPhone 13 128 GB", categoria: "Móviles", precio: 380,
  atributos: { marca: "Apple", modelo: "iPhone 13", almacenamientoGB: 128, bateriaPct: 87 } }

{ titulo: "Mesa de comedor de roble", categoria: "Muebles", precio: 120,
  atributos: { material: "roble", ancho: 160, fondo: 90, alto: 75 } }
```

Cada documento solo lleva los atributos de su categoría: no hay columnas
vacías (NULL) y una categoría nueva no obliga a cambiar nada.

//EJERCICIO A-2//
// A2 Anuncio y vendedor

//A2.1 ¿Por qué no embebemos el usuario completo?

1.**El usuario tiene vida propia.** No pertenece a un solo anuncio: Luis
   tiene varios anuncios, hace ofertas y escribe valoraciones. Si se borra
   un anuncio, el usuario debe seguir existiendo.
2.**Sus datos se repetirían en cada anuncio.** Si Luis cambia su email,
   habría que cambiarlo en todos sus anuncios, y si se olvida alguno los
   datos quedarían incoherentes.

Por eso el usuario va en su propia colección `usuarios` y el anuncio solo
guarda una referencia a él (su `_id`).

// A2.2 ¿Por qué copiamos el nombre y no el email ni la ciudad?

Solo copiamos lo imprescindible para pintar la ficha y que cambia poco,
porque cada dato copiado hay que actualizarlo en todos los anuncios si
cambia.

- **El nombre** se muestra en la ficha («Vendido por Luis Martín») y casi
  nunca cambia.
- **El email** no se muestra en la ficha y además es un dato privado.
- **La ciudad** del vendedor tampoco hace falta: el anuncio ya tiene su
  propio campo `ciudad` con dónde está el producto.

Si se necesitan más datos del vendedor, se consultan en `usuarios` con
`vendedor.id`.
//A2.3 Si Luis cambia su nombre, ¿qué documentos hay que actualizar?

Todos los documentos donde se copió su nombre:

- Su documento en `usuarios` (el dato original).
- Sus anuncios en `anuncios` (`vendedor.nombre`): el Seat y el Xiaomi.
- Las ofertas que ha hecho en `ofertas` (`comprador.nombre`): la de las
  zapatillas Nike.
- Las valoraciones que haya escrito en `valoraciones` (`autor.nombre`):
  ahora mismo ninguna.

En SQL bastaría con cambiar una fila, porque el nombre se guarda una sola
vez. Es el inconveniente de copiar datos (desnormalizar).

//A2.4 En el gimnasio de SQL, ¿cómo se resolvía «mostrar el nombre del monitor de cada clase»? ¿Qué cambia aquí?

SELECT c.nombre AS clase, m.nombre AS monitor
FROM clases c
JOIN monitores m ON m.id = c.monitor_id;

Guardaba solo el monitor_id y el nombre se obtenia con un JOIN. Cambia que en SQL se guarda una vez y se une al leer; en MongoDB se copia para que sea de una lectura mas rapida, pero si cambia hay que actualizar.

//A3 Ofertas

- ¿Al leer el anuncio necesito las ofertas? No, solo le interesan al
  vendedor.
- ¿Pertenecen solo al anuncio? No, también al comprador, que quiere ver
  «mis ofertas» de muchos anuncios distintos.
- ¿Se consultan solas?** Sí, en la pantalla «mis ofertas».
- ¿Pueden crecer sin límite?** Sí, un anuncio popular puede recibir muchas
  y el documento tiene un máximo de 16 MB.

Las cuatro respuestas apuntan a lo mismo: creo una colección `ofertas`
aparte, y cada oferta guarda una referencia al anuncio y otra al comprador.

//A3.2
Documento de oferta de ejemplo

```js
{
  importe: 340,
  estado: "PENDIENTE",
  fecha: new Date("2026-10-27"),
  anuncio:   { id: ObjectId("670000000000000000000003") },
  comprador: { id: ObjectId("660000000000000000000005"), nombre: "Sara López" }
}
```

La oferta guarda una referencia al anuncio y otra al comprador. Del
comprador copio también el nombre, para que el vendedor vea quién oferta
sin hacer otra consulta.

//A3.3
¿Qué copiarías dentro de la oferta?

Copiaría el **título** y el **precio** del anuncio dentro de la oferta,
junto a su id:

```js
anuncio: { id: ObjectId("670000000000000000000003"), titulo: "iPhone 13 128 GB", precio: 380 }
```

Así la pantalla «mis ofertas» se pinta con una sola consulta a `ofertas`,
sin abrir cada anuncio. El id se mantiene para poder ir al anuncio si Sara
pulsa en él.

//A3.4
 Si Ana baja el precio a 350 €, ¿cambia el precio de la oferta?

**No.** El precio guardado en la oferta es el que tenía el anuncio cuando
Sara hizo la oferta: es una foto de ese momento. Sara ofreció 340 € cuando
pedían 380 €; si lo cambiáramos a 350 €, parecería que pidió otra rebaja
y perderíamos esa información.

Es lo mismo que el precio de una línea de pedido en Furniro: si el producto
cambia de precio después, el pedido ya hecho no cambia.

A diferencia del nombre del vendedor, que se copia solo para leer más
rápido y sí hay que actualizarlo, esta copia es un dato histórico y no
debe tocarse.

//A4
¿Embebes las valoraciones dentro del usuario valorado, o colección aparte? Justifícalo.
- ¿Al leer el usuario necesito sus valoraciones? No todas: el perfil
  muestra sobre todo la nota media.
- ¿Pertenecen solo al usuario valorado?** No, también a su autor y al
  anuncio por el que se valora.
- ¿Se consultan solas?** Sí, y además hay que impedir que alguien valore
  dos veces la misma compra, lo que se controla con un índice único en su
  propia colección.
- ¿Pueden crecer sin límite? Sí, un vendedor activo puede tener miles,
  y el documento tiene un máximo de 16 MB.

Por eso creo una colección `valoraciones` aparte. En el usuario solo
guardo un resumen (nota media y número de valoraciones) para mostrar el
perfil rápido.

//A4.2 Escribe un documento de valoración: Hugo (660000000000000000000004) valora con 5 estrellas a Marta (660000000000000000000003) por el anuncio 670000000000000000000004, comentario «Todo perfecto».

```js
{
  anuncioId: ObjectId("670000000000000000000004"),
  autor: { id: ObjectId("660000000000000000000004"), nombre: "Hugo Sanz" },
  valoradoId: ObjectId("660000000000000000000003"),
  estrellas: 5,
  comentario: "Todo perfecto",
  fecha: new Date("2026-09-15")
}
```
//A4.3 Un usuario solo puede valorar una vez cada compra. En SQL pondrías un UNIQUE (…, …). ¿Sobre qué dos campos crearías un índice único en MongoDB?

Lo crearía sobre la pareja **`autor.id` + `anuncioId`**: así no se puede
repetir la combinación «este usuario valora este anuncio».

```js
db.valoraciones.createIndex({ "autor.id": 1, anuncioId: 1 }, { unique: true })
```

//A4.4 El perfil muestra la nota media del usuario. Calcularla cada vez recorriendo todas sus valoraciones es lento. ¿Qué dos campos guardarías en el documento del usuario para mostrarla al momento?

Guardaría **`valoracionMedia`** y **`numValoraciones`** en el usuario.

- `valoracionMedia` se muestra directamente en el perfil, sin recorrer
  las valoraciones.
- `numValoraciones` permite mostrar cuántas tiene y, sobre todo, actualizar
  la media cuando llega una nueva sin recalcularlo todo:
  `nueva media = (media × número + estrellas) / (número + 1)`.

Por ejemplo, Marta tiene media 5 con 1 valoración. Si recibe una de
3 estrellas: (5 × 1 + 3) / 2 = 4, con 2 valoraciones.

//A4.5//

**Predicción:**

**Resultado:** Error.

    MongoInvalidArgumentError: Update document requires atomic operators

**Explicación:** `updateOne` necesita un operador que diga qué hacer con
el campo (`$set`, `$inc`…). Sin él, `{ precio: 80 }` es ambiguo y podría
interpretarse como sustituir el documento entero, perdiendo el resto de
datos del anuncio. La forma correcta es `{ $set: { precio: 80 } }`. Lo
detiene mongosh antes de enviarlo al servidor, por eso el error es
`MongoInvalidArgumentError` y no `MongoServerError`.

//A.5//
Un usuario normal, ¿cuántos favoritos tendrá? ¿Y cuántos usuarios pueden tener en favoritos un anuncio popular?

-Un usuario normal** tendrá unas decenas de favoritos, como mucho un
  par de cientos. Es un número pequeño y con límite natural.
-Un anuncio popular** puede estar en favoritos de miles de usuarios, y
  no tiene un límite claro.

El lado del usuario es pequeño y el lado del anuncio puede crecer sin
límite.

//A.5.2//
Descarto la **b) (array de usuarios en el anuncio)**. Un anuncio popular
puede estar en favoritos de miles de usuarios, así que el array crecería
sin límite y podría acercarse al máximo de 16 MB por documento. Además,
la ficha del anuncio se lee millones de veces y cargaría miles de ids que
no se muestran.

La a) es segura porque el array del usuario es pequeño, y la c) también
funciona, pero necesita una colección más.

//A.5.3//
La **a) (array de anuncios en el usuario)**. Los ids de los favoritos ya
están dentro del documento del usuario, que además suele estar cargado
mientras usa la app. Basta con buscar esos anuncios:

```js
db.anuncios.find({ _id: { $in: sara.favoritos } })
```

Con la c) primero habría que consultar la colección `favoritos` para
obtener los ids y después buscar los anuncios: un paso más en una pantalla
que se usa muchísimo.

//A5.4//
Contando los usuarios cuyo array `favoritos` contiene el id del anuncio.
Un filtro sobre un array busca los documentos que contienen ese valor:

```js
db.usuarios.countDocuments({ favoritos: ObjectId("670000000000000000000008") })
```

Con los datos de la práctica, la mesa de roble da 2 (Ana y Sara).

//A5.5//
¿Qué operador usarías para añadir un favorito sin que se repita si el usuario pulsa dos veces?

A5.5 Añadir un favorito sin repetirlo

Usaría **`$addToSet`**, que solo añade el valor si no está ya en el array.
Si el usuario pulsa dos veces, la segunda no cambia nada:

```js
db.usuarios.updateOne(
  { _id: ObjectId("660000000000000000000001") },
  { $addToSet: { favoritos: ObjectId("670000000000000000000002") } }
)
```

Con `$push` el anuncio se añadiría dos veces, porque añade siempre.

//A6//
1.**Mensajes de chat → Referenciar** (colección `mensajes`). Crecen sin
   límite, son privados y se consultan en la pantalla del chat, no al
   abrir el anuncio.

   //A6.2//
   **Dirección de envío → Embeber** dentro de la compra (en nuestro
   modelo, la oferta aceptada). Pertenece solo a esa compra, es pequeña y
   es una foto del momento: si el usuario cambia su dirección después, la
   compra ya enviada no debe cambiar.

   //A6.3//
 **Etiquetas → Embeber** como array dentro del anuncio. Son pocas, se
   muestran siempre con el anuncio y son solo palabras sin datos propios,
   así que no hace falta una colección aparte.

   //A6.4//
   **Categorías → Referenciar** (colección `categorias`). Las comparten
   muchos anuncios, tienen datos propios que pueden cambiar (como el icono)
   y se consultan solas en el menú o al publicar. En el anuncio basta con
   copiar el nombre de la categoría.

   //A6.5//
   **Historial de precios → Embeber** como array dentro del anuncio.
   Pertenece solo a ese anuncio, son pocos cambios y se puede mostrar en
   la ficha («ha bajado de precio») sin otra consulta.

   //A6.6//
   **Anuncios dentro del usuario → Referenciar** (colección `anuncios`).
   Los anuncios son lo principal de la app y se buscan solos, mezclando
   vendedores (por ejemplo, «coches baratos»); además un vendedor puede
   tener muchos. Cada anuncio apunta a su vendedor con `vendedor.id`.

   //A6.7//
   **Furniro: líneas de un pedido → Embeber** como array dentro del
   pedido. Siempre se leen con el pedido, no tienen sentido sin él y son
   pocas. Cada línea referencia al producto y copia su precio en el
   momento de la compra.

   //A6.8//
   **Furniro: reseñas de un producto → Referenciar** (colección `resenas`).
   Un producto popular puede tener miles, también pertenecen a su autor y
   la ficha no las necesita todas. En el producto guardaría solo un
   resumen: nota media y número de reseñas.

   //A6.9//
   
 Mi diseño coincide con el modelo en las cuatro colecciones: fotos
embebidas en el anuncio, vendedor referenciado con el nombre copiado,
ofertas y valoraciones en colecciones aparte con datos copiados, resumen
de la nota en el usuario y favoritos como array de ids en el usuario.

La única diferencia está en las categorías: en el A6 propuse una colección
`categorias` porque tenían icono y atributos obligatorios. En el modelo la
categoría es solo un texto dentro del anuncio, lo cual es suficiente
porque en esta práctica no tienen datos propios.

Los demás casos del A6 (mensajes, etiquetas, historial de precios,
dirección de envío) no aparecen en el modelo porque la app de la práctica
no tiene esas funciones. Si se añadieran, los guardaría como decidí en
el A6.

//B2.3//
No he tenido que cambiar nada antes de insertar: el anuncio de la bicicleta
llega con sus propios atributos (talla, tipo y pulgadas de rueda) y MongoDB
lo guarda sin más, porque cada documento puede tener una estructura distinta.

En PostgreSQL habría que modificar antes la tabla con ALTER TABLE para
añadir las columnas nuevas (o crear una tabla nueva para Deporte, con su
JOIN correspondiente). Si no, el INSERT daría error porque esas columnas
no existen.

//B4.1//
Un usuario con el email de Ana

**Predicción:** Fallara porque se duplica el codigo valor, ya existia una clave valor con ese mismo nombre.

**Resultado:** rastro> db.usuarios.insertOne({ nombre: "Ana Copia", email: "ana@rastro.es", ciudad: "Valencia", fechaAlta: new Date(), favoritos: [], valoracionMedia: 0, numValoraciones: 0 })
MongoServerError: E11000 duplicate key error collection: rastro.usuarios index: email_1 dup key: { email: "ana@rastro.es" }
rastro>

**Explicación:**Lo ha impedido el índice único `email_1` que creé en el B3.
Ya existía un usuario con ese email y el índice no permite repetirlo, así
que el documento no se guarda. Es lo mismo que haría un UNIQUE en SQL.

//B4.2//
**Resultado:** Error.

    MongoServerError: E11000 duplicate key error collection: rastro.valoraciones
    index: autor.id_1_anuncioId_1 dup key: { autor.id: ObjectId('660000000000000000000004'),
    anuncioId: ObjectId('670000000000000000000004') }

**Explicación:** Lo ha impedido el índice único sobre `autor.id` + `anuncioId`
del B3. Ya existía una valoración de Hugo por ese anuncio, y el índice no
permite repetir la pareja. Así un usuario solo puede valorar una vez cada
compra.

//B4.3//
**Resultado:** Sin error. Se ha guardado con `acknowledged: true`.

**Explicación:** MongoDB no tiene claves ajenas, así que no comprueba que
`vendedor.id` corresponda a un usuario que exista. Los índices tampoco lo
impiden, porque solo miran dentro de su propia colección. Es un problema:
el anuncio queda apuntando a un vendedor inexistente, y al abrir su perfil
o hacerle una oferta no se encontraría a nadie.

//B4.4//
**Resultado:** El insertOne se guarda sin error. En la búsqueda de menos
de 100 € salen el Xiaomi, la chaqueta, las zapatillas y la prueba fantasma,
pero **no sale la lámpara**.

**Explicación:** El precio se guardó como texto ("75") y no como número.
MongoDB no comprueba el tipo de los campos, así que lo acepta, pero al
buscar con `$lt: 100` solo compara números, y la lámpara queda fuera. Es
un problema: el anuncio nunca saldrá en búsquedas por precio y no da
ningún aviso.

(Además, al pegar la instrucción se coló un error de escritura y el campo
se guardó como `vendedvendedor` en lugar de `vendedor`. MongoDB tampoco
lo detectó: no comprueba los nombres de los campos.)

//B4.6//
**Resultado:** Sin error, pero devuelve `null`.

**Explicación:** El `_id` del iPhone está guardado como
`ObjectId("670000000000000000000003")`, y la búsqueda usa el texto
`"670000000000000000000003"`. Son tipos distintos y MongoDB no los
considera iguales, así que no encuentra nada. No da error, solo `null`,
lo que hace que el fallo sea fácil de pasar por alto. Hay que buscar con
`ObjectId("...")`.
Lo he comprobado buscando con `ObjectId("670000000000000000000003")` y
esta vez sí devuelve el iPhone.

//B4.7//
En el gimnasio, `plan_id` era una clave ajena: PostgreSQL habría rechazado
el INSERT con un error y no se habría guardado nada.

En MongoDB no hay claves ajenas, así que la responsabilidad es de la
**aplicación**: antes de insertar el anuncio, el código debe comprobar en
`usuarios` que el vendedor existe, y si no, no guardarlo.

//B4.8//
Porque su precio se guardó como texto (`"75"`) y no como número (`75`).
La búsqueda `{ precio: { $lt: 100 } }` compara con un número, y MongoDB
solo compara valores del mismo tipo, así que el texto queda fuera de la
búsqueda.

//B4.9//
En los dos casos MongoDB guardó un dato incorrecto sin dar ningún error:
en el B4.3 no comprobó que el vendedor existiera, y en el B4.4 no comprobó
que el precio fuera un número. MongoDB no valida por defecto las
referencias ni los tipos de los campos (tampoco los nombres, como vi con
`vendedvendedor`), así que es la aplicación la que tiene que asegurarse
de que los datos son correctos antes de guardarlos.

//B5.6//¿Por qué buscar por id y no por nombre?
Porque el id es único y nunca cambia. El nombre puede repetirse (podría
haber dos «Luis Martín») y puede cambiar: lo comprobé en el B7.6, donde
después de cambiar el nombre de Luis sus anuncios seguían con el antiguo.
Buscando por id siempre se encuentra al usuario correcto.

//B5.12//
No dan error: los anuncios que no tienen el campo `atributos.km` (como el
iPhone) simplemente no cumplen la condición y no salen en el resultado.
Lo he comprobado quitando el filtro de categoría: sigue saliendo solo el
Seat Ibiza.

Es lógico porque en MongoDB cada documento puede tener campos distintos,
así que buscar por un campo que solo existe en algunos documentos es
normal. Si se quiere saber qué documentos tienen un campo, existe el
operador `$exists`.

//B7.4//
He necesitado **dos instrucciones**: una para cambiar la oferta a ACEPTADA
y otra para cambiar el anuncio a RESERVADO, porque son dos documentos en
dos colecciones distintas.

Si se cortara la luz entre las dos, la oferta quedaría ACEPTADA pero el
Seat seguiría DISPONIBLE: los datos serían incoherentes y otros usuarios
podrían seguir ofertando por un coche ya comprometido.

En SQL se resolvería con una transacción (todo o nada). En MongoDB cada
operación sobre un solo documento es atómica, pero para cambiar varios
documentos a la vez hace falta una transacción explícita.

//B7.6//
Después de actualizar su usuario, sus anuncios seguían mostrando
«Luis Martín», porque el nombre del vendedor es una copia y MongoDB no
actualiza las copias solo. He tenido que cambiarlo a mano en las tres
colecciones donde se copia el nombre: `anuncios` (2 documentos), `ofertas`
(1) y `valoraciones` (0, porque Luis no ha escrito ninguna). Es el
inconveniente de desnormalizar.

//B8//
1.Dos razones por las que MongoDB encaja en Rastro

Cada categoría de anuncio tiene atributos distintos y salen categorías
nuevas, y MongoDB permite que cada documento tenga su propia estructura
sin cambiar nada (lo vi con la bicicleta de Deporte). Además, la ficha de
un anuncio se lee de una pieza: fotos, atributos y vendedor están en un
solo documento, sin JOIN.

2.¿Qué parte de una app como Rastro guardarías en SQL? ¿Por qué?

Los pagos, facturas y saldos, porque tienen una estructura fija, están muy
relacionados y necesitan que la base de datos impida datos incoherentes,
con claves ajenas y transacciones (como vi en el B7.4 al aceptar la oferta).

3.¿Por qué las fotos van embebidas y las ofertas en otra colección?

Las fotos siempre se leen con el anuncio, solo pertenecen a él y son pocas.
Las ofertas no siempre se necesitan, también pertenecen al comprador
(«mis ofertas») y pueden ser muchísimas.

4.¿Por qué la oferta guarda una copia del precio del anuncio?

Para guardar el precio que tenía el anuncio cuando se hizo la oferta, como
el precio de una línea de pedido en Furniro. Si el vendedor lo cambia
después, la oferta debe seguir mostrando el precio original.

5.¿Qué es desnormalizar? Una ventaja y un inconveniente

Desnormalizar es copiar datos de un documento en otro. La ventaja es que se
lee todo con una sola consulta (la ficha muestra el nombre del vendedor sin
consultar `usuarios`); el inconveniente es que, si el dato cambia, hay que
actualizarlo en todas las copias, como me pasó al cambiar el nombre de Luis
en el B7.6.

6.En MongoDB, ¿quién se encarga de que una referencia exista?

La aplicación. MongoDB no tiene claves ajenas y deja guardar referencias
a documentos que no existen, como vi en el B4.3 con el vendedor fantasma.
