import type { Core } from '@strapi/strapi';

type PostgresConnection = Exclude<
  Core.Config.Database<'postgres'>['connection']['connection'],
  Function
>;

// PostgreSQL connection. DATABASE_URL, which Wodby sets when a PostgreSQL
// service is linked, takes precedence. Without it, the separate DATABASE_*
// variables are used; their defaults suit a local PostgreSQL server.
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database<'postgres'> => {
  const url = env('DATABASE_URL', '');
  if (url && !/^postgres(ql)?:\/\//.test(url)) {
    throw new Error('DATABASE_URL must be a postgresql:// URL: this project uses PostgreSQL.');
  }

  const ssl = env.bool('DATABASE_SSL', false) && {
    key: env('DATABASE_SSL_KEY', undefined),
    cert: env('DATABASE_SSL_CERT', undefined),
    ca: env('DATABASE_SSL_CA', undefined),
    capath: env('DATABASE_SSL_CAPATH', undefined),
    cipher: env('DATABASE_SSL_CIPHER', undefined),
    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
  };
  const schema = env('DATABASE_SCHEMA', 'public');

  return {
    connection: {
      client: 'postgres',
      connection: url
        ? // Strapi's types expect the separate fields, which the URL provides.
          ({ connectionString: url, ssl, schema } as unknown as PostgresConnection)
        : {
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            ssl,
            schema,
          },
      // No idle connections are kept open: the database can close them, as in
      // containers, and Strapi then reconnects on demand.
      pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 10) },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

export default config;
