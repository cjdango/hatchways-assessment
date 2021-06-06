const Koa = require('koa');
const Router = require('@koa/router');
const dotenv = require('dotenv');
const { getPosts } = require('./routes');

dotenv.config();

const app = new Koa();
const router = new Router({ prefix: '/api' });

router
  .get('/ping', (ctx) => {
    ctx.body = { success: true };
  })
  .get('/posts',
    async (ctx) => {
      const {
        sortBy = 'id',
        direction = 'asc',
        tags,
      } = ctx.query;

      const httpRequest = {
        query: {
          sortBy,
          direction,
          tags,
        }
      }

      try {
        ctx.body = { posts: await getPosts(httpRequest) };
      } catch ({ message: error }) {
        ctx.status = 400;
        ctx.body = { error };
      }
    });

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);
