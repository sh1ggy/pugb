use serenity::async_trait;
use serenity::builder::EditThread;
use serenity::model::channel::Message;
use serenity::model::prelude::GuildChannel;
use serenity::model::prelude::Reaction;
use serenity::model::prelude::Ready;
use serenity::prelude::*;
use serenity::Client;
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
        if msg.content.starts_with("@start") {
            let first_msg = msg.reply_mention(&ctx.http, "Sup back sexy").await.unwrap();

            let channel = msg.channel(&ctx.http).await.unwrap();
            let mut game_name = msg.author.name;
            game_name.push_str("'s irl battlegrounds / wall of shame");
            let guild_result = channel
                .id()
                .create_public_thread(&ctx, first_msg.id, |create_builder| {
                    create_builder.name(game_name)
                })
                .await
                .unwrap();
            // first_msg.react(ctx.http, reaction_type).await.unwrap();
            let internal_msg = InternalRequest::Start_Game {
                msg: first_msg,
                thread: guild_result,
            };
            ctx.data
                .write()
                .await
                .get::<ActorRef>()
                .unwrap()
                .sender
                .send(internal_msg);

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

    async fn reaction_add(&self, _ctx: Context, reaction: Reaction) {
        println!("Reacty: {:?}", reaction);
    }

    async fn ready(&self, ctx: Context, ready: Ready) {
        info!("{} is connected!", ready.user.name);
        let guilds: Vec<_> = ready
            .guilds
            .iter()
            .filter(|g| !g.unavailable)
            .map(|g| g.id)
            .collect();
        let internal_msg = InternalRequest::InitServer { guilds, ctx: ctx.http.clone() };
        ctx.data
            .write()
            .await
            .get::<ActorRef>()
            .unwrap()
            .sender
            .send(internal_msg);
    }
}
