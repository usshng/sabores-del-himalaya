# AGENTS.md

## Proyecto

Sistema de petición de comida a domicilio (proyecto de la asignatura). Un backend Spring Boot expone una API REST que consume un frontend React; los datos se guardan en MySQL. Backend y frontend viven en este mismo repositorio.

## Stack

| Tecnología | Versión |
| --- | --- |
| Java | 25 LTS |
| Spring Boot (Spring Security, Spring Data JPA, Spring Mail) | 4.1 |
| Maven (vía `mvnw`) | incluido en el repositorio |
| MySQL | 9.7 LTS |
| Node.js + npm | 24 LTS |
| React + TypeScript | 19.2 + 6.0 (no 7.0) |
| Vite | 8 |
| Tailwind CSS + shadcn/ui | 4.3 |
| Pruebas backend | JUnit + Mockito |
| Correo en local | Mailpit |

## Estructura

```
backend/     Proyecto Spring Boot (Maven)
frontend/    Proyecto React + Vite
docs/        Documentación del equipo, en Markdown
AGENTS.md    Este fichero
README.md    Instalación y arranque
```

## Documentación (`docs/`)

| Carpeta | Contenido |
| --- | --- |
| `docs/lanzamiento/` | [Entorno de desarrollo](docs/lanzamiento/entorno-de-desarrollo.md) y [estándar de codificación](docs/lanzamiento/estandar-de-codificacion.md) |
| `docs/gestion/` | Documentos de gestión |
| `docs/configuracion/` | Documentos de configuración |
| `docs/calidad/` | Documentos de calidad |
| `docs/desarrollo/` | Historias de usuario (referencia funcional) |
| `docs/retrospectiva/` | Retrospectivas |
| `docs/course/` | Material de la asignatura: enunciado, transparencias y plantillas. Solo en local |

## Estándar de codificación (resumen)

El documento completo manda: [docs/lanzamiento/estandar-de-codificacion.md](docs/lanzamiento/estandar-de-codificacion.md).

- **Idioma:** código, comentarios, commits y ramas en inglés; textos visibles para el usuario en español.
- **General:** funciones cortas con una sola responsabilidad, nombres descriptivos sin abreviaturas, sin duplicación, sin números mágicos (constantes con nombre). Cada cambio en lógica de negocio lleva su prueba.
- **Comentarios:** explican el porqué; sin código comentado; Javadoc en los métodos públicos de los servicios; `TODO` con ID de tarea: `// TODO(US07): validate opening hours`.
- **Java:** Google Java Style con sangría de 4 espacios y líneas de hasta 120 caracteres. Sufijo de capa en las clases (`OrderController`, `OrderService`, `OrderRepository`). Lógica en los servicios; la API devuelve DTOs, nunca entidades.
- **TypeScript/React:** Prettier y ESLint con configuración por defecto. Un componente por fichero, en PascalCase (`DishCard.tsx`); el resto en camelCase. Prohibido `any`. Las llamadas a la API van en `src/api/`.
- **API REST:** prefijo `/api/`, recursos en plural con guiones (`/api/daily-menus`), sin verbos en la URL, relaciones anidadas (`/api/orders/42/items`), JSON en camelCase.
- **Commits:** Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), en imperativo, minúscula, sin punto, máx. 72 caracteres, con la historia al final: `feat(orders): add order status update (US07)`.
- **Ramas:** salen de `main` (protegida, solo PR) como `tipo/usXX-descripcion-corta`, p. ej. `feature/us07-order-status`.

## Comandos

Backend, desde `backend/`:

| Comando | Qué hace |
| --- | --- |
| `./mvnw spring-boot:run` | Arranca la API en http://localhost:8080 con el perfil `local` (MySQL; necesita `src/main/resources/application-local.properties`) |
| `./mvnw test` | Ejecuta las pruebas con el perfil `test` (H2 en memoria, sin MySQL) |
| `./mvnw verify` | Pruebas y Checkstyle (`checkstyle.xml`); tiene que pasar antes de cada pull request |

Frontend, desde `frontend/`:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca Vite en http://localhost:5173 con proxy de `/api` a http://localhost:8080 |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Aplica o comprueba el formato de Prettier |
| `npm run build` | Comprobación de tipos y build de producción |
| `npx shadcn@latest add <componente>` | Añade un componente de shadcn/ui a `src/components/ui/` |

Notas:

- Las pruebas de integración del backend usan `@ActiveProfiles("test")`; sin él intentan conectarse a MySQL.
- Checkstyle sigue Google Java Style (4 espacios, 120 caracteres) y exige Javadoc solo en los métodos públicos de las clases `*Service`; no añadas Javadoc de relleno en el resto.
- `src/components/ui/` se deja tal como lo genera shadcn: Prettier lo ignora y no se edita a mano.
- Las llamadas a la API van en `src/api/` (por ejemplo, `healthApi.ts`).

## Restricciones

- Nunca subas nada de `docs/course/`.
- Las historias de usuario de `docs/desarrollo/` son la referencia funcional; no inventes requisitos.
- Sigue el estándar de codificación en todo el código que generes.
