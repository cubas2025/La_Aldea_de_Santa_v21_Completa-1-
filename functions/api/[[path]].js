// Cloudflare Pages Functions: misma API de llamadas que el Worker (worker/index.mjs),
// por si publicas la web como proyecto de Pages en lugar de Worker.
// Las variables secretas se ponen en Pages → Settings → Variables and Secrets.
import { handleApi } from '../../worker/index.mjs';

export const onRequest = ({ request, env }) => handleApi(request, env, new URL(request.url));
