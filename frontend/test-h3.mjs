import { toNodeListener, fromWebHandler } from 'h3-v2';
const webFetch = async (request) => new Response("Hello World " + request.url);
const nodeApi = toNodeListener(fromWebHandler(webFetch));
const req = { url: '/test', method: 'GET', headers: {} };
const res = { setHeader: console.log, end: (d) => console.log('end:', d ? d.toString() : 'undefined') };
await nodeApi(req, res);
