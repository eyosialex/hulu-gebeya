import { toNodeListener, fromWebHandler, eventHandler, createApp } from 'h3-v2';

const app = createApp();
const handler = eventHandler(fromWebHandler(req => new Response("OK")));
app.use(handler);

console.log(typeof toNodeListener(app));
