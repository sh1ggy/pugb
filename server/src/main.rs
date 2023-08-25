use std::net::SocketAddr;

use axum::{
    routing::{get, post},
    Router, Extension,
};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tracing::debug;

use crate::webserver::{auth_handler, game_sse_handler};

mod actor;
mod discord;
mod error;
mod webserver;

#[tokio::main]
async fn main() {
    println!("Hello, world!");
    dotenv::dotenv().ok();
    let token = std::env::var("DISCORD_TOKEN").unwrap();
    println!("Token: {}", token);

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let mut actor = actor::Actor::new();
    let app = Router::new()
        .route("/auth", post(auth_handler))
        .route("/game_sse", get(game_sse_handler))
        .layer(Extension(actor.get_ref()))
        .layer(CookieManagerLayer::new());
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::debug!("listening on {}", addr);


    let mut client = discord::build_client(actor.get_ref()).await;

    tokio::spawn(async move {
        actor.run().await;
    });


    tokio::spawn(async move {
        if let Err(why) = client.start().await {
            println!("An error occurred while running the client: {:?}", why);
        }
    });


    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
