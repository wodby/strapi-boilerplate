import type { Core } from '@strapi/strapi';

// Actions of the example Article API that visitors may call without signing in.
const PUBLIC_ACTIONS = ['api::article.article.find', 'api::article.article.findOne'];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await allowPublicArticleReads(strapi);
  },
};

// Lets the Public role read articles, so GET /api/articles works without a
// token. It runs once per database: a permission removed later in the admin
// panel (Settings > Users & Permissions > Roles > Public) stays removed.
async function allowPublicArticleReads(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'core', name: 'boilerplate' });
  if (await store.get({ key: 'public-article-reads' })) {
    return;
  }

  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) {
    return;
  }

  for (const action of PUBLIC_ACTIONS) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });
    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
    }
  }
  await store.set({ key: 'public-article-reads', value: true });
}
