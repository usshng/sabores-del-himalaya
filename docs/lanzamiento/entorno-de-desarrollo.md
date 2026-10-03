# Entorno de Desarrollo — Sistema de Petición de Comida a Domicilio

Oct 3, 2026 · @Qiu

## Control de versiones

| Identificador | Modificación | Petición de cambio |
| --- | --- | --- |
| v1 | Versión inicial del entorno de desarrollo | -- |

## Objetivo y alcance

Herramientas y versiones que usará todo el equipo, para que el proyecto funcione igual en todos los ordenadores. Cualquier cambio se tramita como petición de cambio y genera una nueva versión de este documento.

## Arquitectura y tech stack

Dos proyectos: un backend Spring Boot que expone una API REST y un frontend React que la consume. Los datos se guardan en MySQL.

&#91;embedded content: arquitectura local · 5 componentes\]

| Tecnología | Versión | Para qué |
| --- | --- | --- |
| Java | 25 LTS | Lenguaje del backend |
| Spring Boot (con Spring Security, Spring Data JPA y Spring Mail) | 4.1 | API REST, login, acceso a datos y correo de activación |
| MySQL | 9.7 LTS | Base de datos |
| Node.js | 24 LTS | Necesario para ejecutar Vite y npm |
| React + TypeScript | 19.2 + 6.0 | Interfaz web |
| Vite | 8 | Arrancar y empaquetar el frontend |
| Tailwind CSS + shadcn/ui | 4.3 | Estilos y componentes ya hechos |

## Herramientas de desarrollo

Salvo que se indique otra cosa, se instala la última versión estable.

| Herramienta | Para qué |
| --- | --- |
| Visual Studio Code | Editor único para backend y frontend |
| Maven (incluido en el repositorio con `mvnw`) | Dependencias y build del backend |
| npm (viene con Node.js) | Dependencias y scripts del frontend |
| MySQL Workbench 26.7 | Ver y administrar la base de datos |
| Git + GitHub | Control de versiones, en un repositorio privado |
| JUnit + Mockito | Pruebas del backend |
| Postman | Probar la API sin pasar por el frontend |
| Mailpit | Recibir en local los correos de activación, sin enviarlos de verdad |

En VS Code cada uno instala las extensiones de Java, Spring Boot, ESLint, Prettier y Tailwind CSS. Las herramientas de calidad de código y de recuento de líneas se definen en el Estándar de Codificación.

## Justificación de las decisiones

Criterio general: tecnologías demandadas en el mercado laboral, aprovechar que el equipo ya sabe Java y usar versiones con soporte durante todo el curso.

| Decisión | Motivo | Alternativa descartada |
| --- | --- | --- |
| Java 25 LTS | JDK 27 es la versión más reciente, pero no es LTS y su soporte gratuito acaba en marzo de 2027 ([Oracle](https://www.oracle.com/Java/technologies/downloads/)). Spring Boot 4.1.1 solo es compatible hasta Java 26 ([Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html)) | JDK 27 |
| React + TypeScript | React es el framework web más usado, con un 44,7 % en la encuesta de Stack Overflow 2025 ([resumen](https://dev.to/davidshq/thoughts-on-stackoverflow-2025-developer-survey-part-1-3d5o)), y aparece en las ofertas de empleo | Thymeleaf + Bootstrap |
| Tailwind CSS + shadcn/ui | Tailwind es el framework CSS más usado en proyectos nuevos: 37 % frente a 21,6 % de Bootstrap en State of CSS 2025 ([Tailkits](https://tailkits.com/blog/popular-css-frameworks/)). shadcn/ui aporta componentes ya hechos | Bootstrap |
| TypeScript 6.0 | TypeScript 7.0 salió en julio de 2026 sin API programática estable, así que herramientas como typescript-eslint aún no pueden usarlo ([InfoQ](https://infoq.com/news/2026/08/typescript-7-released/)) | TypeScript 7.0 |
| MySQL 9.7 LTS + Workbench 26.7 | Workbench 8.0 ya no se mantiene; Workbench 26.7 lo sustituye y es compatible con MySQL 8.4 LTS y 9.7 LTS ([Oracle](https://blogs.oracle.com/mysql/introducing-mysql-workbench-26)) | MySQL 8.4 + Workbench 8.0 |

## Estructura del repositorio

Backend y frontend viven en un único repositorio de GitHub, cada uno en su carpeta. Así una sola etiqueta de versión (por ejemplo `v0.3`) identifica el sistema completo, que es lo que piden la línea base y el registro de pruebas.

```
food-ordering-platform/
├── backend/            Proyecto Spring Boot (Maven)
├── frontend/           Proyecto React + Vite
├── docs/               Documentación del equipo, en Markdown
│   ├── lanzamiento/
│   ├── gestion/
│   ├── configuracion/
│   ├── calidad/
│   ├── desarrollo/
│   ├── retrospectiva/
│   └── course/         Material de la asignatura (solo en local)
├── AGENTS.md           Contexto para agentes de IA
└── README.md           Cómo instalar y arrancar
```

Las carpetas de `docs/` siguen la estructura de la entrega de la asignatura, así cada documento está donde lo pide la entrega. `AGENTS.md` resume el stack, los comandos y las reglas, y enlaza al resto de `docs/` para que los agentes de IA tengan el contexto.

`docs/course/` guarda en local el enunciado, las transparencias y las plantillas para que los agentes puedan consultarlos. Está en `.gitignore` y nunca se sube a GitHub: el material es de los profesores y quedaría en el historial si el repositorio se hiciera público. Cada miembro lo descarga de Moodle.

## Instalación y arranque

Los comandos exactos estarán en el `README.md` del repositorio.

1. Instalar JDK 25, Node.js 24 LTS, MySQL 9.7 y MySQL Workbench 26.7.
2. Instalar Git, VS Code con sus extensiones, Postman y Mailpit.
3. Crear en MySQL la base de datos `food-ordering-platform`.
4. Clonar el repositorio y poner las credenciales propias de MySQL en el fichero local que indica el README (no se sube a GitHub).
5. Arrancar el backend con `./mvnw spring-boot:run` dentro de `backend/`.
6. Arrancar el frontend con `npm install` y `npm run dev` dentro de `frontend/`, y abrir http://localhost:5173.

El entorno está listo cuando la página de prueba muestra datos del backend y las pruebas (`./mvnw test`) pasan.
