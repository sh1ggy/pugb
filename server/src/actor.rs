use std::collections::HashMap;

use serde_json::value::Index;
use serenity::model::prelude::Message;
use serenity::model::user::User;
use tokio::sync::{broadcast, mpsc, oneshot};

use crate::error::{Error, Result};
use crate::models::UserData;

type InternalRequester = tokio::sync::mpsc::UnboundedSender<InternalRequest>;
type InternalBroadcaster = tokio::sync::broadcast::Sender<InternalBroadcast>;

#[derive(Clone)]
pub struct ActorRef {
    pub sender: InternalRequester,
    // Subscribe to internal commands.
    pub broadcast: InternalBroadcaster,
}

#[derive(Debug)]
pub enum InternalRequest {
    // -- Actor commands.
    Test {
        msg: Message,
    },
    // -- Actor broadcasts

    // -- Actor Requests
    GetUser {
        rt: String,
        res: oneshot::Sender<UserData>,
    },
}

#[derive(Debug, Clone)]
pub enum InternalBroadcast {
    // -- Actor broadcasts
    Test { msg: Message },
}

struct Game {
    id: u64,
    name: String,
    // players: Vec<Player>,
}

pub struct Actor {
    // pub games: Vec<Game>,
    // Db connection
    pub broadcaster: InternalBroadcaster,
    pub receiver: tokio::sync::mpsc::UnboundedReceiver<InternalRequest>,
    pub self_ref: ActorRef,
    pub http_req : reqwest::Client,

    pub users: HashMap<String, UserData>,
}

impl Actor {
    pub fn new() -> Self {
        let (broadcaster_tx, _rx) = broadcast::channel::<_>(16);
        let (tx, mpsc_rx) = mpsc::unbounded_channel::<_>();
        let self_ref = ActorRef {
            sender: tx.clone(),
            broadcast: broadcaster_tx.clone(),
        };
        Self {
            self_ref,
            broadcaster: broadcaster_tx,
            receiver: mpsc_rx,
            users: HashMap::new(),
            http_req: reqwest::Client::new(),
            // games: Vec::new(),
        }
    }

    pub fn get_ref(&self) -> ActorRef {
        self.self_ref.clone()
    }

    // Having this thread panic is kinda bad since it kills the whole server
    pub async fn run(&mut self) {
        loop {
            let cmd = self.receiver.recv().await.unwrap();
            // let clone = cmd.clone();
            match cmd {
                InternalRequest::Test { msg } => {
                    println!("Actor got a test command: {:?}", msg);
                    // TODO handle
                    self.broadcaster
                        .send(InternalBroadcast::Test { msg })
                        .unwrap();
                }
                InternalRequest::GetUser { rt, res } => {
                    println!("Actor got a get user command: {:?}", rt);
                    // TODO handle
                    let user = self.get_user(rt).await.unwrap();
                    res.send(user).unwrap();
                },
            }
        }
    }

    pub async fn get_user(&mut self, rt: String) -> Result<UserData> {
        // Get user from hashmap, if doesnt exist make request to discord api
        if let Some(user) = self.users.get(&rt) {
            return Ok(user.clone());
        } else {
            // Fetch the user from the API
            let fetched_user = self.get_user_from_api(&rt).await;
            // Store the fetched user in the cache
            self.users.insert(rt, fetched_user.clone());
            Ok(fetched_user)
        }
    }

    async fn get_user_from_api(&self, rt: &str) -> UserData {
        let url = format!("https://discord.com/api/v8/users/@me");
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&rt).unwrap(),
        );
        headers.insert(
            reqwest::header::ACCEPT,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        // let response = self
        //     .http_req
        //     .get(url)
        //     .headers(headers)
        //     .send()
        //     .await
        //     .unwrap()
        //     .json::<serde_json::Value>()
        //     .await
        //     .unwrap();

        let response = self
            .http_req
            .get(url)
            .headers(headers)
            .send()
            .await
            .unwrap()
            .json::<UserData>()
            .await
            .unwrap();
        println!("Response: {:?}", response);
        // let user = UserData {
        //     id: response["id"].as_str().unwrap().to_string(),
        //     username: response["username"].as_str().unwrap().to_string(),
        //     avatar: response["avatar"].as_str().unwrap().to_string(),
        //     email: response["email"].as_str().unwrap().to_string(),
        //     premium_type: response["premium_type"].as_i64().unwrap(),
        //     rt: rt.to_string(),
        // };
        response
    }


    
    fn broadcast_game_update(&self) {
        // TODO
    }
}


