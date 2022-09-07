# template
Template to make bots using Biscuit
I'll include an small framework with decorators later on

```sh
# .env
AUTH="your discord token"
REST_PORT=3000
GW_PORT=8080
```

## Run
- `npm run rest &`
- `npm run bot &`
- `npm run gateway`

then you should keep the gateway and rest services on as long as possible and just restart the bot service

> This is the optimal way to use Biscuit but be aware that it may be a little bit harder to use than other libraries
> you may want to chage the code to just one service if you plan to do a tiny bot
