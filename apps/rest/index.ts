/**
 * Standalone rest process
 */

import { DefaultRestAdapter } from "@biscuitland/rest";
import Fastify from "fastify";

import "dotenv/config";

const rest = new DefaultRestAdapter({
    url: `http://localhost:${process.env["REST_PORT"]!}`,
    token: process.env.AUTH,
    version: 10,
});

const app = Fastify({});

app.all("*", async (req, reply) => {
    let response: unknown;

    switch (req.method) {
    case "GET":
        response = await rest.get(req.url, req.body);
    break;
    case "POST":
        response = await rest.post(req.url, req.body);
    break;
    case "PUT":
        response = await rest.put(req.url, req.body);
    break;
    case "PATCH":
        response = await rest.patch(req.url, req.body);
    break;
    case "DELETE":
        response = await rest.delete(req.url, req.body);
    break;
    }

    if (response)
        reply.status(200).send({ status: 200, data: response });

    else
        reply.status(204).send({ status: 204, data: null });
});

console.log("Open rest on port %d", Number.parseInt(process.env.REST_PORT));

app.listen({ port: Number.parseInt(process.env.REST_PORT) });
