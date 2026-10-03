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

TODO: añadir los comandos cuando existan los proyectos de backend y frontend.
