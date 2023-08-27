use std::collections::HashMap;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use async_session::chrono;
use serde_json::value::Index;
use serde_json::{from_value, Value};
use serenity::http::Http;
use serenity::model::prelude::{
    AttachmentType, ChannelId, Guild, GuildChannel, GuildId, Message, MessageId,
};
use serenity::model::user::User;
use tokio::sync::{broadcast, mpsc, oneshot};

use crate::error::{Error, Result};
use crate::models::{
    DiscordTokenResponse, Game, GameDTO, GameStateDTO, GuildDTO, Kill, Player, PremiumType,
    ThreadDTO, UserData, UserDataDTO,
};

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
    Start_Game {
        msg: Message,
        thread: GuildChannel,
    },
    // -- Actor broadcasts

    // -- Actor Requests
    GetUser {
        rt: String,
        res: oneshot::Sender<Result<UserDataDTO>>,
    },
    InitServer {
        guilds: Vec<GuildId>,
        ctx: Arc<Http>,
    },
    Shoot {
        game_id: u64,
        killee: String,
        killer: String,
        image: Vec<u8>,
        res: oneshot::Sender<Result<()>>,
    },
    Join {
        message_id: MessageId,
        user: User,
        res: oneshot::Sender<Result<()>>,
    },
    Rez {
        game_id: u64,
        player: String,
        image: Vec<u8>,
        res: oneshot::Sender<Result<()>>,
    },
    
}

#[derive(Debug, Clone)]
pub enum InternalBroadcast {
    // -- Actor broadcasts
    Test {
        msg: Message,
    },
    // This is why you might want multiple broadcasters per game, or an mpsc per connection
    Kill {
        game_state: GameStateDTO,
    },
    Died {
        killer: String,
        killee: String,
        game_id: u64,
    },
}

fn time() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
}
pub struct Actor {
    // pub games: Vec<Game>,
    // Db connection
    pub broadcaster: InternalBroadcaster,
    pub receiver: tokio::sync::mpsc::UnboundedReceiver<InternalRequest>,
    pub self_ref: ActorRef,
    pub http_req: reqwest::Client,

    // pub users: HashMap<String, UserData>,
    pub users: HashMap<String, (UserData, Vec<GuildDTO>)>,
    pub games: HashMap<ChannelId, Game>,
    // pub guilds: Option<Vec<GuildId>>,
    pub guilds: Vec<GuildId>,
    pub ctx: Option<Arc<Http>>,
    pub kill_counter: u64,
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
            games: HashMap::new(),
            guilds: Vec::new(),
            ctx: None,
            kill_counter: 0,
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
                    let user = self.get_user(rt).await;
                    res.send(user).unwrap();
                }
                InternalRequest::Start_Game { msg, thread } => {
                    let mut game = Game {
                        first_message: msg.id,
                        players: HashMap::new(),
                        thread,
                        killfeed: Vec::new(),
                    };
                    let user = msg.author;
                    let user_id = user.id.clone();
                    let player = Player {
                        active: crate::models::PlayerActive::NotActive,
                        state: crate::models::PlayerState::Alive,
                        user,
                    };
                    game.players.insert(user_id, player);
                    self.games.insert(game.thread.id.clone(), game);
                }
                InternalRequest::InitServer { guilds, ctx } => {
                    println!("Setting up server");
                    self.guilds = guilds;
                    self.ctx = Some(ctx);
                }
                InternalRequest::Shoot {
                    image,
                    res,
                    game_id,
                    killee,
                    killer,
                } => {
                    println!("in handle {:?}, {:?}, {:?}", image, self.games, self.guilds);
                    let ctx = if let Some(ctx) = self.ctx.as_ref() {
                        ctx
                    } else {
                        continue;
                    };

                    let chan_id = ChannelId(game_id);

                    match self.games.get_mut(&chan_id) {
                        Some(game) => {
                            let killee_clone = killee.clone();
                            let res_img = game
                                .thread
                                .send_message(ctx, move |m| {
                                    let attatchment = AttachmentType::Bytes {
                                        data: image.into(),
                                        filename: "Hey man.jpg".into(),
                                    };
                                    let kileeId: u64 = killee_clone.parse().unwrap();
                                    m.add_file(attatchment);
                                    m.allowed_mentions(|am| am.empty_parse().users(vec![kileeId]));
                                    m
                                })
                                .await
                                .unwrap();
                            // Create Kill here
                            let mut cdn_url = "https://cdn.discordapp.com/attachments/".to_string();
                            // let proxy =  res_img.attachments[0].proxy_url.clone();
                            // let url = res_img.attachments[0].url.clone();
                            println!("res_img: {:?}", res_img.attachments[0]);

                            let current_time: u128 = time();

                            self.kill_counter += 1;
                            let kill = Kill {
                                image: res_img.attachments[0].url.clone(),
                                id: self.kill_counter.to_string(),
                                killmessageId: res_img.id,
                                time: current_time,
                                killerId: killer,
                                killeeId: killee,
                                state: crate::models::KillState::Normal,
                                
                            };
                            game.killfeed.push(kill);

                            res.send(Ok(())).unwrap();

                            self.broadcaster
                                .send(InternalBroadcast::Kill {
                                    killfeed: game.killfeed.clone(),
                                    game_id: game.thread.id.0,
                                })
                                .unwrap();
                        }
                        None => {
                            res.send(Err(Error::BadRequestInvalidParams {
                                inner: format!("No Game of id {}", chan_id),
                            }))
                            .unwrap();
                            continue;
                        }
                    }
                }
                InternalRequest::Join {
                    message_id,
                    user,
                    res,
                } => {
                    let ctx = if let Some(ctx) = self.ctx.as_ref() {
                        ctx
                    } else {
                        continue;
                    };

                    let game = self
                        .games
                        .values_mut()
                        .find(|g| g.first_message == message_id);

                    match game {
                        Some(game) => {
                            let user_id = user.id.clone();
                            let player = Player {
                                active: crate::models::PlayerActive::NotActive,
                                state: crate::models::PlayerState::Alive,
                                user,
                            };
                            println!("Player joined: {:?} in game: {:?}", player, game);
                            game.players.insert(user_id, player);
                            res.send(Ok(())).unwrap();
                        }
                        None => {
                            res.send(Err(Error::BadRequestInvalidParams {
                                inner: format!("No Game on the message of id {}", message_id),
                            }))
                            .unwrap();
                            continue;
                        }
                    }
                }
                InternalRequest::Rez { game_id, player, image, res } => {

                },
            }
        }
    }

    pub async fn get_user(&mut self, rt: String) -> Result<UserDataDTO> {
        // Get user from hashmap, if doesnt exist make request to discord api

        let stuff = match self.users.get(&rt) {
            Some(user) => {
                println!("User found in cache");
                user.clone()
            }
            None => {
                println!("User not found in cache");
                self.refresh_user(rt.clone()).await?
            }
        };

        let avail_games = self
            .games
            .values()
            .filter(|game| {
                game.players
                    .iter()
                    .find(|(id, player)| id.0.to_string() == stuff.0.id)
                    .is_some()
            })
            .map(|g| GameDTO {
                thread: ThreadDTO {
                    id: g.thread.id.0.to_string(),
                    name: g.thread.name.clone(),
                    guildID: g.thread.guild_id.0.to_string(),
                },
                state: GameStateDTO {
                    thread: g.thread.id,
                    players: g.players.values().map(|x| x.clone()).clone().collect(),
                    killfeed: g.killfeed.clone(),
                },
            })
            .collect();

        let dto = UserDataDTO {
            user: stuff.0,
            guilds: stuff.1,
            games: avail_games,
        };
        Ok(dto)
    }
    pub async fn refresh_user(&mut self, rt: String) -> Result<(UserData, Vec<GuildDTO>)> {
        let mut access_token = self.get_access_token(&rt).await?;
        access_token.insert_str(0, "Bearer ");
        let fetched_user = self.get_user_from_api(&access_token, &rt).await?;
        let user_guilds = self.get_user_guilds(&access_token).await?;

        // let joined_guilds:Vec<&GuildId> = user_guilds.iter().map(|f| {
        //     let matching_guild = self.guilds
        //         .iter()
        //         .find(|g| g.0.to_string() == f.id);
        //     matching_guild

        // }).filter_map(|f| f.clone())
        // .collect();
        // println!("joined_guilds: {:?}", joined_guilds);

        // Store the fetched user in the cache
        // Save all details of user on the cache// TODO db
        // self.users.insert(rt, fetched_user.clone());
        // Ok(fetched_user)

        Ok((fetched_user, user_guilds))
    }

    async fn get_user_guilds(&self, access_token: &str) -> Result<Vec<GuildDTO>> {
        let url = format!("https://discordapp.com/api/users/@me/guilds");

        let mut headers = reqwest::header::HeaderMap::new();

        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&access_token).unwrap(),
        );
        headers.insert(
            reqwest::header::ACCEPT,
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        let response = self
            .http_req
            .get(url)
            .headers(headers)
            .send()
            .await
            .unwrap()
            .json::<Vec<GuildDTO>>()
            .await
            .unwrap();

        // let response = response.json::<Value>().await.unwrap();
        println!("Response: {:?}", &response);
        Ok(response)
        // Err(Error::AuthFailIncorrectCode)
    }

    async fn get_user_from_api(&self, access_token: &str, rt: &str) -> Result<UserData> {
        let url = format!("https://discord.com/api/v8/users/@me");

        let mut headers = reqwest::header::HeaderMap::new();

        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&access_token).unwrap(),
        );
        headers.insert(
            reqwest::header::ACCEPT,
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        // let response = response.json::<Value>().await.unwrap();

        let response = self
            .http_req
            .get(url)
            .headers(headers)
            .send()
            .await
            .unwrap();

        // println!("Response: {:?}", &response.text().await.unwrap());
        let response = response.json::<Value>().await.unwrap();

        let deserialized_enum: PremiumType = response["premium_type"]
            .as_i64()
            .unwrap()
            .try_into()
            .unwrap();
        let user = UserData {
            // to string and clone is the same thing
            id: from_value(response["id"].clone()).unwrap(),
            username: response["username"].as_str().unwrap().to_string(),
            avatar: response["avatar"].as_str().unwrap().to_string(),
            email: response["email"].as_str().unwrap().to_string(),
            premium_type: deserialized_enum,
            rt: rt.to_string(),
        };
        Ok(user)
    }

    async fn get_access_token(&self, rt: &str) -> Result<String> {
        let url = "https://discord.com/api/oauth2/token";
        let client_id = std::env::var("CLIENT_ID").unwrap();
        let client_secret = std::env::var("CLIENT_SECRET").unwrap();
        // Make code request to get rt

        // It requires a URL encoded form, not multipart
        let params = [
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("grant_type", "refresh_token".to_string()),
            ("refresh_token", rt.to_string()),
        ];
        let mut headers = reqwest::header::HeaderMap::new();

        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/x-www-form-urlencoded"),
        );
        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&rt).unwrap(),
        );
        headers.insert(
            reqwest::header::ACCEPT,
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        let response = self
            .http_req
            .post(url)
            .form(&params)
            .headers(headers)
            .send()
            .await
            .unwrap()
            .json::<DiscordTokenResponse>()
            .await
            .map_err(|e| {
                println!("Error, couldnt get rt: {:?}", e);
                Error::AuthFailTokenExpired
            })?;

        // println!("Response1: {:?}", response.text().await.unwrap());
        // let response = response.json::<Value>().await.unwrap();
        // println!("Response: {:?}", response);
        // Err(Error::AuthFailIncorrectCode)

        Ok(response.access_token)
    }

    fn broadcast_game_update(&self) {
        // TODO
    }
}
