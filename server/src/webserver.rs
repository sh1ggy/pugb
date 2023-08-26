use std::convert::Infallible;

use async_stream::try_stream;
use axum::{
    extract::{self, State},
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

use crate::actor::{ActorRef, InternalBroadcast, InternalRequest};

use crate::error::{Error, Result};

pub mod auth;

static AUTH_COOKIE: &str = "auth_token";

pub async fn auth_handler(
    cookies: Cookies,
    State(req_client): State<reqwest::Client>,
    Extension(actor): Extension<ActorRef>,
    Json(req): Json<CodeRequestDTO>,
) -> Result<Json<Value>> {

    // TODO do a join on the servres of the user and games that exist and send back to client
    let body = Json(json!({
        "result": {
            "success": true
        }
    }));

    // Make code request to get rt
    let form = reqwest::multipart::Form::new()
        .text("client_id", std::env::var("CLIENT_ID").unwrap())
        .text("client_secret", std::env::var("CLIENT_SECRET").unwrap())
        .text("grant_type", "authorization_code")
        .text("code", req.code.clone())
        .text("redirect_uri", req.redirect_uri.clone())
        .text("code_verifier", req.code_verifier.clone())
        .text("scope", "identify");

    let url = "https://discord.com/api/oauth2/token";
    // const options = {
    //     headers: {
    //         'content-type': 'application/x-www-form-urlencoded',
    //         'Accept': 'application/json'
    //     },
    // }
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        reqwest::header::HeaderValue::from_static("application/x-www-form-urlencoded"),
    );
    headers.insert(
        reqwest::header::ACCEPT,
        reqwest::header::HeaderValue::from_static("application/json"),
    );
    let response = req_client
        .post(url)
        .multipart(form)
        .headers(headers)
        .send()
        .await
        .unwrap()
        .json::<serde_json::Value>()
        .await
        .unwrap();
    println!("Response: {:?}", response);
    let rt = "";

    cookies.add(Cookie::new(AUTH_COOKIE, rt.to_string()));

    // actor.sender.send(InternalRequest::GetUser { rt: (), res: () }});

    Ok(body)
}

pub async fn refresh_games(cookies: Cookies) -> Result<Json<Value>> {
    let body = Json(json!({
        "result": {
            "success": true
        }
    }));
    Err(Error::AuthFailNoAuthTokenCookie)
}

// Get query param for game id
pub async fn game_sse_handler(
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
) -> Sse<impl Stream<Item = core::result::Result<Event, Infallible>>> {
    println!("Cookies: {:?}", cookies.get("hello_world"));
    let mut rx = actor.broadcast.subscribe();
    let thign = Event::default().json_data("Hello, world!").unwrap().id("1");
    let guard = SSEGuard {
        actor: actor.clone(),
    };
    let stream = try_stream! {
        loop {
            match rx.recv().await {
                Ok(i) => {
                    let mut event = Event::default();

                    match i {

                        InternalBroadcast::Test {msg} => {

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

pub struct SSEGuard {
    pub actor: ActorRef,
}

impl Drop for SSEGuard {
    fn drop(&mut self) {
        tracing::info!("stream closed");
    }
}

#[derive(Debug, Deserialize)]
pub struct CodeRequestDTO {
    code: String,
    code_verifier: String,
    redirect_uri: String,
}

struct CodeResponseDTO {}

struct UserData {}
