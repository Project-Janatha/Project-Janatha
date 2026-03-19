/**
 * [[route]].ts
 *
 * Om Sri Chinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * Cloudflare Pages Functions catch-all handler.
 * Mounts the Hono app to handle all /api/* requests.
 */
import app from '../../packages/backend/src/app'

export const onRequest: PagesFunction = (context) => {
  return app.fetch(context.request, context.env, context)
}
