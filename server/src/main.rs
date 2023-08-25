use std::net::SocketAddr;

use axum::{
    routing::{get, post},
    Router,
};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};

use crate::webserver::auth_handler;


mod discord;
mod webserver;
mod actor;

#[tokio::main]
async fn main() {
    println!("Hello, world!");
    dotenv::dotenv().ok();

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let app = Router::new()
        .route("/auth", post(auth_handler))
        .layer(CookieManagerLayer::new());
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::debug!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
