import { CreateApplicationCommand } from '@biscuitland/core';
import { ApplicationCommandOptionTypes, GUILD_APPLICATION_COMMANDS } from '@biscuitland/api-types'
import { DefaultRestAdapter} from '@biscuitland/rest';

const rest = new DefaultRestAdapter({
    token: '',
    url: `http://localhost:${process.env.REST_PORT!}`
});

const commands: CreateApplicationCommand[] = [{
    name: 'say',
    description: 'I\'ll say something for you',
    options: [{
        type: ApplicationCommandOptionTypes.String,
        name: 'text',
        description: 'What am I going to say?',
        required: true
    }]
}];

rest.put(GUILD_APPLICATION_COMMANDS('APP_ID', 'GUILD_ID'), commands);