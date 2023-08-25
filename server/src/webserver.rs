use std::convert::Infallible;

use async_stream::try_stream;
use axum::{
    extract,
    response::{
        sse::{Event, KeepAlive},
        Sse,
    },
    Extension, Json,
};
use futures::Stream;
use serde::Deserialize;
use serde_json::{json, Value};
use tower_cookies::{Cookie, Cookies};

use crate::actor::ActorRef;
use crate::actor::InternalCommand;

use crate::error::{Error, Result};
pub async fn auth_handler(
    cookies: Cookies,
    Json(req): Json<CodeRequestDTO>,
) -> Result<Json<Value>> {
    cookies.add(Cookie::new("hello_world", req.code.clone()));

    // TODO do a join on the servres of the user and games that exist and send back to client
    let body = Json(json!({
        "result": {
            "success": true
        }
    }));

    Ok(body)
}

pub async fn refresh_games() -> &'static str {
    "Check your cookies."
}

pub async fn game_sse_handler(
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
) -> Sse<impl Stream<Item = core::result::Result<Event, Infallible>>> {
    println!("Cookies: {:?}", cookies.get("hello_world"));
    let mut rx = actor.broadcast.subscribe();
    let thign = Event::default().json_data("Hello, world!").unwrap().id("1");
    let stream = try_stream! {
        loop {
            match rx.recv().await {
                Ok(i) => {
                    let mut event = Event::default();

                    match i {

                        InternalCommand::Test {msg} => {

                            println!("Message: {:?}", msg);
                            event = Event::default()
                            .json_data(msg)
                            .unwrap();
                        },
                        _ => {
                            println!("Something else: {:?}", i);
                        }
                    }

                    yield event;
                },

                Err(e) => {
                    tracing::error!(error = ?e, "Failed to get");
                }
            }
        }
    };

    Sse::new(stream).keep_alive(KeepAlive::default())
}

#[derive(Debug, Deserialize)]
pub struct CodeRequestDTO {
    code: String,
    // code_verifier: String,
    // redirect_uri: String,
}

struct CodeResponseDTO {}

struct UserData {}
