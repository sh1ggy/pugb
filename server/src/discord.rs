use serenity::builder::EditThread;
use serenity::model::channel::Message;
use serenity::model::prelude::GuildChannel;
use serenity::model::prelude::Reaction;
use serenity::model::prelude::Ready;
use serenity::prelude::*;
use serenity::Client;
use serenity::async_trait;
use tracing::info;

use crate::actor::ActorRef;
use crate::actor::InternalRequest;

pub async fn build_client(actor: ActorRef) -> Client {
    let token = std::env::var("DISCORD_TOKEN").unwrap();
    // let intents = GatewayIntents::default() | GatewayIntents::GUILD_MESSAGES | GatewayIntents::MESSAGE_CONTENT;
    let intents = GatewayIntents::GUILD_MESSAGES | GatewayIntents::MESSAGE_CONTENT;
    let mut client = Client::builder(&token, intents)
        // .framework(framework)
        .event_handler(Handler)
        .await
        .unwrap();
    {
        let mut data = client.data.write().await;
        data.insert::<ActorRef>(actor);
    }
    client
}

impl TypeMapKey for ActorRef {
    type Value = ActorRef;
}

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        if msg.content == "@start" {
            msg.reply_mention(&ctx.http, "Sup back sexy").await;
            let channel = msg.channel(&ctx.http).await.unwrap();
            let guild_result = channel
                .id()
                .create_public_thread(&ctx, msg.id, |create_builder| create_builder.name("YO"))
                .await
                .unwrap();
            // The cache exists here in data, try and not use it lole
            // let thing = guild_result.id;
            // let new_channel = ctx.data.read().await;
            // if let Err(e) = msg.channel_id.say(&ctx.http, "world!").await {
            //     error!("Error sending message: {:?}", e);
            // }
        }
        // ctx.data
        //     .write()
        //     .await
        //     .get::<ActorRef>()
        //     .unwrap()
        //     .sender
        //     .send(InternalRequest::Test { msg });
    }

    async fn reaction_add(&self, _ctx: Context, _add_reaction: Reaction) {}

    async fn ready(&self, _: Context, ready: Ready) {
        info!("{} is connected!", ready.user.name);
        let guilds: Vec<_> = ready.guilds.iter().filter(|g| !g.unavailable)
        .map(|g| g.id)
        .collect();
    }
}
