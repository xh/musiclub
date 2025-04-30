# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This application is built using Hoist, a custom framework for building web applications built by
[Extremely Heavy Industries](https://xh.io) (aka "XH").

The server-side code is written in Groovy (v3.0) with the Grails (v6.2) framework and the Hoist Core
plugin (https://github.com/xh/hoist-core/) from XH.

The client-side code is written in TypeScript (v5) with React (v18) and the Hoist React npm library
(https://github.com/xh/hoist-react/) from XH. Note that all React code avoids JSX syntax and uses
Hoist's custom `elementFactory` syntax instead to specify and render React components.

## Build/Run Commands
- Build: `yarn build` for client / `gradlew build` for server
- Lint JS/TS: `yarn lint:js`
- Lint SCSS: `yarn lint:styles`
- Start dev server: `yarn start` for client / `gradlew bootRun` for server

## Code Style Guidelines
- TypeScript for client code
- Groovy for server code
- 4-space tabs for code, 2-space for SCSS/JSON
- Single quotes, no trailing commas
- Arrow functions without parens when possible
- PascalCase for components/classes, camelCase for variables/methods
- Organize imports alphabetically, group by type
- Component files follow naming pattern: ComponentName.ts/ComponentName.scss
- Use proper typing (avoid 'any' unless necessary)
- Handle exceptions properly with try/catch for async operations
- Follow the Hoist Model / Component MVC pattern - separate models from views
- Error handling via standard error types
