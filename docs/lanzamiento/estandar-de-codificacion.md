# Estándar de Codificación — Sistema de Petición de Comida a Domicilio

Oct 3, 2026 · @Qiu

## Control de versiones

| Identificador | Modificación | Petición de cambio |
| --- | --- | --- |
| v1 | Versión inicial del estándar de codificación | -- |

## Objetivo y alcance

Reglas que sigue todo el código del proyecto. Checkstyle, ESLint y Prettier comprueban automáticamente buena parte de ellas, y Calidad usa este documento en la inspección de código.

## Idioma

- Código, comentarios, commits y nombres de ramas en inglés.
- Los textos que ve el usuario, en español.

## Buenas prácticas

- Métodos y funciones cortos que hacen una sola cosa.
- Nombres descriptivos y sin abreviaturas: `orderTotal`, no `ot`.
- Sin código duplicado: lo que se repite se extrae a una función.
- Sin números mágicos: los valores fijos van en constantes con nombre, como `MAX_EDIT_MINUTES`.
- Cada cambio en la lógica de negocio va acompañado de su prueba.

## Comentarios

- Explican por qué se hace algo, no qué hace el código.
- No se deja código comentado: Git ya guarda las versiones anteriores.
- Javadoc en los métodos públicos de los servicios.
- Los `TODO` llevan el ID de su tarea, por ejemplo `// TODO(US07): validate opening hours`.

## Commits

- Formato [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`.
- Tipos: `feat`, `fix`, `refactor`, `test`, `docs` y `chore`.
- Descripción en imperativo, en minúscula, sin punto final y de 72 caracteres como máximo.
- La historia de usuario va al final: `feat(orders): add order status update (US07)`.

## Ramas

- `main` está protegida: nadie hace push directo y todo entra mediante pull request.
- Cada rama sale de `main` y se nombra `tipo/usXX-descripcion-corta`, en minúsculas, en inglés y con guiones.
- Tipos de rama: `feature`, `fix`, `refactor`, `docs` y `chore`. Por ejemplo, `feature/us07-order-status` o `fix/us12-cart-total`.
- La rama se borra después del merge.

## Pull requests

- Un pull request por historia de usuario o tarea, con el título en formato Conventional Commits.
- Antes de pedir revisión, el código compila y pasan las pruebas y el lint.
- Necesita la aprobación de al menos otro miembro; nadie aprueba su propio pull request.
- Se integra con «Squash and merge», así cada pull request queda como un solo commit en `main`.
- Si hay conflictos, los resuelve el autor actualizando su rama con `main`.
- Los comentarios de la revisión pueden usarse como evidencia de la inspección de código.

## Seguimiento de tareas

- El product backlog y las tareas del sprint se llevan en GitHub Projects, con las columnas Backlog, To do, In progress, In review y Done.
- Cada historia de usuario es un issue con su ID en el título, y sus tareas son issues enlazados a ella.
- Cada pull request enlaza su issue con `Closes #12`, así la tarea pasa sola a Done al hacer merge.
- Los esfuerzos reales y la planificación se siguen registrando en la plantilla de la asignatura.

## Java (backend)

- Estilo Google Java Style, con sangría de 4 espacios y líneas de hasta 120 caracteres.
- Nombres estándar de Java: clases en PascalCase, métodos y variables en camelCase, constantes en UPPER\_SNAKE\_CASE.
- Cada clase lleva el sufijo de su capa: `OrderController`, `OrderService`, `OrderRepository`.
- La lógica de negocio va en los servicios, y la API devuelve DTOs, no entidades.

## TypeScript y React (frontend)

- Formato de Prettier y reglas de ESLint, con su configuración por defecto.
- Componentes en PascalCase, uno por fichero (`DishCard.tsx`); el resto, en camelCase.
- Prohibido usar `any`.
- Las llamadas a la API van en `src/api/`, no dentro de los componentes.

## API REST

- Las URLs nombran recursos, nunca acciones: `POST /api/orders`, no `/api/createOrder`. La acción la indica el método HTTP.
- Métodos: `GET` consulta, `POST` crea, `PUT` o `PATCH` modifica y `DELETE` elimina.
- Prefijo `/api/` y recursos en plural con guiones: `/api/daily-menus`. Las relaciones se anidan: `/api/orders/42/items`.
- Claves del JSON en camelCase.

## Recuento de líneas de código

Se cuentan con cloc las líneas con código (sin blancos ni comentarios) de `backend/src/main` y `frontend/src`, separadas por lenguaje. No cuentan la configuración, el código generado ni los componentes de shadcn/ui sin modificar, y las pruebas se cuentan aparte. Se mide al cerrar cada sprint:

```
cloc backend/src/main frontend/src --exclude-dir=ui
```
