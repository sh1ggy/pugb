use std::net::SocketAddr;

use axum::{
    extract::State,
    middleware,
    routing::{get, post},
    Extension, Router,
};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tracing::debug;

use crate::webserver::{auth::main_response_mapper, auth_handler, game_sse_handler, refresh_games};

mod actor;
mod discord;
mod error;
mod models;
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
    let req_client = reqwest::Client::new();

    let mut actor = actor::Actor::new();
    let app = Router::new()
        .route("/auth", post(auth_handler))
        .route("/game_sse", get(game_sse_handler))
        .route("/refresh_games", get(refresh_games))
        .with_state(req_client)
        .layer(middleware::map_response(main_response_mapper))
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
