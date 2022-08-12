/*
 * Standalone gateway process
 */

import type { DiscordGatewayPayload, DiscordGetGatewayBot } from "@biscuitland/api-types";

import { DefaultWsAdapter } from "@biscuitland/ws";
import { DefaultRestAdapter } from "@biscuitland/rest";
import { ActivityTypes, GatewayOpcodes, GatewayIntents } from "@biscuitland/api-types";

const INTENTS = GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent;

import "dotenv/config";

const rest = new DefaultRestAdapter({
    token: process.env.AUTH!,
    version: 10
});

const config = await rest.get<DiscordGetGatewayBot>("/gateway/bot").then((res) => {
    return {
        url: res.url,
        shards: res.shards,
        sessionStartLimit: {
            total: res.session_start_limit.total,
            remaining: res.session_start_limit.remaining,
            resetAfter: res.session_start_limit.reset_after,
            maxConcurrency: res.session_start_limit.max_concurrency,
        },
    };
});

const gw = new DefaultWsAdapter({
    totalShards: config.shards,
    gatewayBot: config,
    gatewayConfig: {
        token: process.env.AUTH!,
        intents: INTENTS,
    },
    async handleDiscordPayload(shard, data: unknown) {
        if (!(data as DiscordGatewayPayload).t) return;

        await fetch(`http://localhost:${process.env.GW_PORT}`, {
            method: "POST",
            body: JSON.stringify({ shardId: shard.id, data }),
        })
        .then(res => res.text())
        .catch(_ => null);
    },
});

gw.options.lastShardId = gw.options.gatewayBot.shards - 1;
gw.agent.options.totalShards = gw.options.gatewayBot.shards;

console.log("Open gateway on port %d", Number.parseInt(process.env.GW_PORT!));

gw.shards();
