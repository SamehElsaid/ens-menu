# ENS Menu

Next.js application for the ENS Menu website and management console.

## Local setup

Requirements: Node.js 20 and npm.

1. Install the locked dependencies:
   ```sh
   npm ci
   ```
2. Copy `.env.example` to `.env.local`.
3. Set the three required core variables:
   `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SECRET_KEY`, and
   `NEXT_PUBLIC_ENCRYPTION_KEY`.
4. Add any optional integrations needed for local development, then start:
   ```sh
   npm run dev
   ```

Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
Use only values intended to be public there. `.env.example` documents every
application-read variable without containing credentials.

## Verification

Run the same checks used by CI:

```sh
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run check:i18n
npm run check:contrast
npm audit --omit=dev
npm run build
```

Vitest is configured to fail when a unit or integration test suite finds no
tests. Existing lint warnings are reported but do not fail solely because of a
warning count. Playwright end-to-end coverage is pending and is not part of
Phase 1 CI.

## Deployment

Configure the required variables and any enabled integrations in the deployment
platform, then install, build, and run the production server:

```sh
npm ci
npm run build
npm run start
```

CI runs on pull requests and pushes to `main`, `master`, and `development`.