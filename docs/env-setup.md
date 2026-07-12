# Environment Configuration Reference

TransitOps uses a template-based environment configuration system.

## Setup Instructions

1. Copy `.env.values.example` to `.env.values.dev` (gitignored).
2. The values specified in `.env.values.dev` will be used for local development.

## Env Variables

* `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://transitops:transitops@localhost:5432/transitops`).
* `ACCESS_TOKEN_SECRET`: JWT secret for signing short-lived access tokens.
* `REFRESH_TOKEN_SECRET`: JWT secret for signing refresh tokens.
* `WEB_ORIGIN`: CORS origin validation URL for the frontend (e.g., `http://localhost:3000`).
* `NODE_ENV`: Runtime environment (`development`, `production`, `test`).
