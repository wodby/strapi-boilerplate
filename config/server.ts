import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public address of the application, used for absolute links such as those
  // in emails. Wodby sets WODBY_PRIMARY_URL to the environment's primary
  // domain; PUBLIC_URL overrides it. Without either, Strapi uses relative links.
  url: env('PUBLIC_URL', env('WODBY_PRIMARY_URL', '')),
  // A reverse proxy terminates TLS (Wodby's gateway does). Trusting its
  // X-Forwarded-* headers lets Strapi see HTTPS requests as secure, which the
  // admin panel's secure cookies require, and the client's address.
  proxy: {
    koa: env.bool('IS_PROXIED', true),
    // The client address is the last one in X-Forwarded-For, the one the
    // nearest proxy added; earlier entries can be forged by the client.
    maxIpsCount: env.int('PROXY_MAX_IPS_COUNT', 1),
  },
  app: {
    keys: env.array('APP_KEYS')!,
  },
});

export default config;
