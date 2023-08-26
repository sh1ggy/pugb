use serenity::model::channel::Message;
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
    let intents =  GatewayIntents::GUILD_MESSAGES | GatewayIntents::MESSAGE_CONTENT;
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
        ctx.data
            .write()
            .await
            .get::<ActorRef>()
            .unwrap()
            .sender
            .send(InternalRequest::Test { msg });
    }

    async fn ready(&self, _: Context, ready: Ready) {
        info!("{} is connected!", ready.user.name);
    }
}