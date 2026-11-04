# Strapi starter for Wodby

A starter for the [Wodby Strapi service](https://github.com/wodby/service-strapi) and
[Strapi stack](https://github.com/wodby/stack-strapi).

It includes:

- [Strapi 5](https://docs.strapi.io) with TypeScript, the admin panel and the Users & Permissions plugin
- PostgreSQL through `DATABASE_URL`
- an example `Article` collection type whose entries anyone can read at `/api/articles`
- email through SMTP when `SMTP_HOST` is set
- Wodby CI build, push, deployment and a post-deployment health check on Strapi's `/_health`

## Local development

Start a PostgreSQL server, for example with Docker:

```shell
docker run -d --name strapi-postgres -p 5432:5432 \
  -e POSTGRES_USER=strapi -e POSTGRES_PASSWORD=strapi -e POSTGRES_DB=strapi \
  postgres:18-alpine
```

Copy `.env.example` to `.env`, replace each `tobemodified` value with a random
string, then run:

```shell
npm install
npm run develop
```

Open http://localhost:1337/admin and create the first administrator. Create an
article under Content Manager, then read it at
http://localhost:1337/api/articles. The `Public` role may read articles: the
permission is granted once, on the first start, by `src/index.ts`.

Create content types in the admin panel's Content-Type Builder. It writes them
to `src/api` and `src/components`, and Strapi updates the type definitions in
`types/generated`. Commit these files.

Check types and run the production build locally:

```shell
npm run typecheck
npm run build
NODE_ENV=production npm run start
```

## On Wodby

The pipeline in `.wodby/pipeline.yml` installs dependencies with `npm ci`, then
the service's image build runs `npm run build`. The container starts with
`npm run start` and listens on port 3000.

The service sets the secrets Strapi needs (`APP_KEYS`, `API_TOKEN_SALT`,
`ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`) and
`DATABASE_URL` for the linked PostgreSQL service. `DATABASE_URL` takes
precedence over the `DATABASE_HOST`-style variables in `config/database.ts`.
Runtime variables are not available during the build; Strapi reads them when
it starts.

`config/server.ts` trusts the `X-Forwarded-*` headers of Wodby's gateway, so
Strapi treats HTTPS requests as secure and marks its cookies `Secure`, and uses
`WODBY_PRIMARY_URL` as the public URL for links such as those in emails. Uploaded media is written to `public/uploads`; on Wodby the image
links that directory to a persistent volume.

When a mail service is linked, Wodby sets `SMTP_HOST` and `SMTP_PORT`, and
`config/plugins.ts` sends email through it. Set `SMTP_FROM` to choose the
sender address.

In a development workspace, Wodby runs `npm run dev` (`strapi develop`). The
server restarts when you change code, the admin panel reloads, and the
Content-Type Builder is available. Commit what it writes to `src` and
`types/generated`.
