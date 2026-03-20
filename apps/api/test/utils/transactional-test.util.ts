import { MikroORM, RequestContext } from '@mikro-orm/postgresql';

type orm = MikroORM;

export default async (em: orm['em'], fn: () => Promise<void>) => {
  await RequestContext.create(em, async () => {
    const em = RequestContext.getEntityManager();
    await em?.begin();

    await fn();

    await em?.rollback();
  });
};
