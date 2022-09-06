/**
 * Standalone rest process
 */

import { DefaultRestAdapter } from '@biscuitland/rest';
import Fastify from 'fastify';

import 'dotenv/config';

const rest = new DefaultRestAdapter({
    token: process.env.AUTH!,
    version: 10,
});

const app = Fastify({});

app.all('*', async (req, reply) => {
    let response: unknown;

    let url = req.url.replace('/v10', '');

    switch (req.method) {
        case 'GET':
            response = await rest.get(url, req.body);
            break;
        case 'POST':
            response = await rest.post(url, req.body);
            break;
        case 'PUT':
            response = await rest.put(url, req.body);
            break;
        case 'PATCH':
            response = await rest.patch(url, req.body);
            break;
        case 'DELETE':
            response = await rest.delete(url, req.body);
            break;
    }

    if (response) { reply.status(200).send(response); } else { reply.status(204).send({}); }
});

console.log('Open rest on port %d', Number.parseInt(process.env.REST_PORT!));

app.listen({ port: Number.parseInt(process.env.REST_PORT!) });
