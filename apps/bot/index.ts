import type { DiscordGatewayPayload } from "@biscuitland/api-types";
import { Actions, Session } from "@biscuitland/core";
import { DefaultRestAdapter } from "@biscuitland/rest";
import Fastify from "fastify";

import "dotenv/config";

const rest = new DefaultRestAdapter({
    url: `http://localhost:${process.env.REST_PORT}`,
    token: process.env.AUTH,
    version: 10
});

const intents = 0;

const session = new Session({ token: process.env.AUTH, rest, intents });

session.events.on("ready", (ready) => {
    console.log(`Ready on shard ${ready.shard}! logged in as ${ready.user.tag}`);
});

session.events.on("messageCreate", (message) => {
    if (message.content.startsWith("!ping")) {
        message.reply({ content: "pong!" });
    }
});

const app = Fastify({});

app.all("*", (req, reply) => {
    let json: {
        data: DiscordGatewayPayload,
        shardId: string
    };

    if (req.method !== "POST") {
        return reply.send(
            new Response(
                JSON.stringify({ error: "method not allowed", status: 405 })
            )
        );
    }

    json = JSON.parse(req.body as string);

    // emit the raw event
    Actions.raw(session, Number.parseInt(json.shardId), json.data);

    if (!json?.data.d || !json.data.t) {
        return;
    }

    // ?. Just in case the bot emits an event that is not supported yet
    Actions[json.data.t]?.(session, Number.parseInt(json.shardId), json.data);

    reply.send(new Response(undefined, { status: 204 }));
});

console.log("Open bot");

app.listen({ port: Number.parseInt(process.env.GW_PORT) });

