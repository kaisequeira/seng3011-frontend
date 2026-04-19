# TANGO UI (Next.js + shadcn/ui)

This frontend talks to the **TANGO combined API Gateway** (Auth/Datasets/Charts/Predictive) and stores auth tokens in HTTP-only cookies via the Next.js route handlers under `app/api/`.

## LocalStack (recommended for local testing)

The LocalStack **API ID changes** each time the backend CDK stack is redeployed, so you should generate a fresh `.env.local` for the frontend after deploy.

1. Deploy the backend to LocalStack (from `../seng3011-tango-apis`):

```bash
docker compose up -d
bash scripts/localstack-cdk-deploy.sh
```

2. Generate frontend env from the backend output:

```bash
npm run env:localstack
```

This reads `../seng3011-tango-apis/.localstack-api.env` and writes `./.env.local` with:

```env
TANGO_API_BASE_URL=http://localhost:4566/_aws/execute-api/<apiId>
```

3. Start the frontend:

```bash
npm run dev
```

## Lint/Format + Pre-Commit Hooks

We use:

- ESLint: `pnpm lint` (or `pnpm lint:fix`)
- Prettier: `pnpm format` (or `pnpm format:check`)
- Husky + lint-staged: runs automatically on `git commit` and only touches staged files.

After `pnpm install`, Husky installs the git hooks automatically.
To run everything locally like CI: `pnpm run verify`.

## Real AWS

Create `.env.local` and set:

```env
TANGO_API_BASE_URL=https://<api-gateway-id>.execute-api.<region>.amazonaws.com/prod
```

## Adding shadcn components

```bash
npx shadcn@latest add button
```

Then import from `components/ui/*`, e.g.:

```tsx
import { Button } from "@/components/ui/button"
```
