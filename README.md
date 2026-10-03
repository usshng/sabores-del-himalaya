# food-ordering-platform

Sistema de petición de comida a domicilio, desarrollado como proyecto de la asignatura.
Un backend Spring Boot expone una API REST que consume un frontend React; los datos se guardan en MySQL.

## Requisitos

- JDK 25
- Node.js 24 LTS (incluye npm)
- MySQL 9.7 LTS y MySQL Workbench 26.7
- Git
- Visual Studio Code con las extensiones recomendadas (`.vscode/extensions.json`)
- Postman
- Mailpit

Las versiones y su justificación están en [docs/lanzamiento/entorno-de-desarrollo.md](docs/lanzamiento/entorno-de-desarrollo.md).

## Estructura

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
└── README.md
```

> **Aviso:** cada miembro crea la carpeta `docs/course/` y descarga ahí el material de la asignatura desde Moodle.
> Está en `.gitignore` y nunca se sube a GitHub.

## Cómo arrancar

1. Crea la base de datos en MySQL (desde MySQL Workbench o la consola):

   ```sql
   CREATE DATABASE `food-ordering-platform`;
   ```

2. Crea tu fichero de credenciales a partir de la plantilla y rellena tu usuario y contraseña de MySQL. Este fichero está en `.gitignore` y no se sube a GitHub.

   ```bash
   cp backend/src/main/resources/application-local.example.properties backend/src/main/resources/application-local.properties
   ```

3. Arranca el backend (API en http://localhost:8080):

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   En Windows, usa `mvnw.cmd` en lugar de `./mvnw`.

4. En otra terminal, arranca el frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Abre http://localhost:5173. Si la página muestra «Funciona» en el backend y en la base de datos, el entorno está listo.

Antes de abrir un pull request, comprueba que pasan:

```bash
(cd backend && ./mvnw verify)                                       # pruebas y Checkstyle
(cd frontend && npm run lint && npm run format:check && npm run build)
```
