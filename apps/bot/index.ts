import { Actions, Biscuit } from '@biscuitland/core';
import { DefaultRestAdapter } from '@biscuitland/rest';
import { WebSocketServer } from 'ws';

import 'dotenv/config';

const rest = new DefaultRestAdapter({
    token: '',
    url: `http://localhost:${process.env.REST_PORT}`
});

const session = new Biscuit({ token: process.env.AUTH!, rest });

session.events.on('ready', ready => {
    // NOTE: this event won't be emitted unless a new shard spawns
    console.log(`Ready on shard ${ready.shard}! logged in as ${ready.user.tag}`);
});

session.events.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) { return; }
    if (interaction.commandName === 'say') {
        const reply = interaction.options.getString('text', true);
        await interaction.respondWith({ content: reply });
    }
});

const app = new WebSocketServer({ port: process.env.WS_PORT! });
const textDecoder = new TextDecoder();

app.on('connection', ws => {
    ws.on('message', (uint: Buffer | ArrayBuffer) => {
        const decompressable = new Uint8Array(uint);
        const data = JSON.parse(textDecoder.decode(decompressable));

        Actions.raw(session, data.id, data.payload);

        if (!data.payload.t || !data.payload.d) { return; }

        Actions[data.payload.t as keyof typeof Actions]?.(
            session,
            data.id,
            data.payload.d
        );

    });
});


