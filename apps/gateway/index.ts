/*
 * Standalone gateway process
 */

import 'dotenv/config';

import type { DiscordGetGatewayBot } from '@biscuitland/api-types';
import { GatewayIntents } from '@biscuitland/api-types';

import { DefaultRestAdapter } from '@biscuitland/rest';
import { ShardManager } from '@biscuitland/ws';

import WebSocket from 'ws';


const rest = new DefaultRestAdapter({
    token: '',
    url: `http://localhost:${process.env.REST_PORT}`,
});

let is: any = null;
let ws: WebSocket | null;

const ask = () => {
    ws = new WebSocket(`ws://localhost:${process.env.WS_PORT}`)
        .on('error', () => ws?.close())
        .on('close', () => {
            if (is == null) {
                is = setInterval(() => {
                    ask();
                }, 10000);
            }
        }).on('open', () => {
            clearInterval(is);
            is = null;
        });
};

const init = async () => {
    const gateway = await rest.get<DiscordGetGatewayBot>('/gateway/bot');

    const socket = new ShardManager({
        config: {
            token: process.env.AUTH!,
            intents: GatewayIntents.Guilds
        },
        gateway,
        handleDiscordPayload(shard, payload) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ id: shard.options.id, payload }));
            }
        },
    });

    console.log('Open gateway');
    await socket.spawns();
};

init();

