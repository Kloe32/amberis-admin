# Amberis Admin

A lightweight, maintainable admin dashboard for Amberis — built with React, TypeScript and Vite.

This repository provides the admin UI, tooling and build scripts to run, develop and ship the admin portal.

## Quick links

- Framework: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS
- Scripts: `dev`, `build`, `preview`, `lint`

## Requirements

- Node.js 18+ (LTS recommended)
- npm, Yarn or pnpm

## Install

1. Clone the repository

   git clone https://github.com/Kloe32/amberis-admin.git
   cd amberis-admin

2. Install dependencies

   npm install

(Or `yarn` / `pnpm install` if you prefer.)

## Development

Start the dev server with Vite (fast HMR):

   npm run dev

The app will usually be available at http://localhost:5173 — follow the vite output for the exact URL.

## Build

Build the TypeScript project and produce a production bundle:

   npm run build

- The `build` script runs `tsc -b` then `vite build` (see package.json).
- Use `npm run preview` to locally preview the production build.

## Linting

Run ESLint across the codebase:

   npm run lint

The repository includes ESLint and recommended React/TypeScript plugins. Fix issues locally before committing.

## Environment

Create a `.env` (or `.env.local`) file in the project root with any required environment variables. Example variables used by the app:

```
VITE_API_URL=https://api.example.com
VITE_AUTH_TOKEN=some-token
NODE_ENV=development
```

Note: Variables prefixed with `VITE_` are exposed to the client-side app by Vite. Never commit secrets to the repository.

## Testing

There are no test scripts configured in package.json. If you add Jest, Vitest, or Cypress, include the relevant scripts and update this section.

## Project structure (high level)

- src/ — application source (components, pages, routes)
- public/ — static assets
- index.html — Vite entry
- package.json — scripts & dependencies
- tsconfig.* — TypeScript configuration

Adjust the paths above if your tree differs.

## Common troubleshooting

- "Port in use" when running `npm run dev`: either close the conflicting process or run Vite on a different port: `vite --port 3000`.
- TypeScript build errors during `npm run build`: run `npm run build` locally and fix any type errors shown by `tsc -b`.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-change`
3. Make changes and run `npm run lint`
4. Open a pull request with a clear description of the change

If you have a CONTRIBUTING.md or CODE_OF_CONDUCT, link them here.

## License

Add your license file to the repository (for example `LICENSE`) and update this section. If you use MIT, include something like:

This project is licensed under the MIT License — see the LICENSE file for details.

## Maintainer

Kloe32 — https://github.com/Kloe32

If you'd like the README to include badges, CI status, deployment instructions (Vercel/Netlify/Docker), or examples of environment-specific configurations, tell me which items to add and I will update the README accordingly.
