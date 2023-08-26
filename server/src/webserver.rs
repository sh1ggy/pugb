use std::convert::Infallible;

use async_stream::try_stream;
use axum::{
    body::Bytes,
    extract::{self, BodyStream, Path, State},
    response::{
        sse::{Event, KeepAlive},
        Sse,
    },
    BoxError, Extension, Json,
};
use futures::Stream;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use serenity::client;
use tokio::sync::oneshot;
use tower_cookies::{Cookie, Cookies};

use crate::{
    actor::{ActorRef, InternalBroadcast, InternalRequest},
    models::{DiscordTokenResponse, UserData, UserDataDTO},
};

use crate::error::{Error, Result};

use self::auth::ctx_resolver;

pub mod auth;
pub mod shoot;

static AUTH_COOKIE: &str = "auth_token";

pub async fn auth_handler(
    cookies: Cookies,
    State(req_client): State<reqwest::Client>,
    Extension(actor): Extension<ActorRef>,
    Json(req): Json<CodeRequestDTO>,
) -> Result<Json<UserDataDTO>> {
    // ) -> Result<()> {
    // TODO do a join on the servres of the user and games that exist and send back to client
    let scopes = vec!["identify", "email", "guilds"];
    let client_id = std::env::var("CLIENT_ID").unwrap();
    let client_secret = std::env::var("CLIENT_SECRET").unwrap();
    println!("Client id: {}, client_secret {}", client_id, client_secret);

    // Make code request to get rt

    // It requires a URL encoded form, not multipart
    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("grant_type", "authorization_code".to_string()),
        ("redirect_uri", req.redirect_uri.clone()),
        ("scope", scopes.join(" ")),
        ("code", req.code.clone()),
        ("code_verifier", req.code_verifier.clone()),
    ];

    let url = "https://discord.com/api/oauth2/token";
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
        .form(&params)
        .headers(headers)
        .send()
        .await
        .unwrap();
    if response.status().is_success() {
        let token_response = response.json::<DiscordTokenResponse>().await.unwrap();

        let rt = token_response.refresh_token.unwrap();

        cookies.add(Cookie::new(AUTH_COOKIE, rt.clone()));
        let (send, recv) = oneshot::channel();

        let user_req = InternalRequest::GetUser { rt, res: send };
        actor.sender.send(user_req);

        let user_data = recv.await.unwrap()?;

        Ok(Json(user_data))
    } else {
        tracing::error!("Response: {:?}", response);
        return Err(Error::AuthFailIncorrectCode);
    }
}

pub async fn get_refreshed_user(
    // State(req_client): State<reqwest::Client>,
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
) -> Result<Json<UserDataDTO>> {
    let user = ctx_resolver(actor.clone(), &cookies).await?;
    // let body = Json(json!({
    //     "result": {
    //         "success": true
    //     },
    //     "game": {
    //         "id": thread_id
    //     }
    // }));
    // Err(Error::AuthFailNoAuthTokenCookie)
    Ok(Json(user))
}

// Get query param for game id
pub async fn game_sse_handler(
    Path(game_id): Path<u64>,
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
) -> Sse<impl Stream<Item = core::result::Result<Event, Infallible>>> {
    println!("Cookies: {:?}", cookies.get("hello_world"));
    let user = ctx_resolver(actor.clone(), &cookies).await;
    let mut rx = actor.broadcast.subscribe();
    let thign = Event::default().json_data("Hello, world!").unwrap().id("1");
    let guard = SSEGuard {
        actor: actor.clone(),
    };

    // let mut event = Event::default().event(event)

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
                        InternalBroadcast::Kill {killfeed, game_id} => {
                            if (game_id != game_id) {
                                continue;
                            }
                            println!("Killfeed: {:?}", killfeed);
                            event = Event::default()
                            .event("kill")
                            .json_data(killfeed)
                            .unwrap();
                        },
                        InternalBroadcast::Died {
                            killer,
                            killee,
                            game_id,
                        } => {

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
