use serde_json::value::Index;
use serenity::model::prelude::Message;

#[derive(Clone)]
pub struct ActorRef {
    pub sender: tokio::sync::mpsc::UnboundedSender<InternalCommand>,
    // Subscribe to internal commands.
    pub broadcast: tokio::sync::broadcast::Sender<InternalCommand>,
}

#[derive(Clone, Debug)]
pub enum InternalCommand {
    // -- Actor commands.
    Test { msg: Message },
    // -- Actor broadcasts
}

struct Game {
    id: u64,
    name: String,
    // players: Vec<Player>,
}

pub struct Actor {
    // pub games: Vec<Game>,
    // Db connection
    pub broadcaster: tokio::sync::broadcast::Sender<InternalCommand>,
    pub receiver: tokio::sync::mpsc::UnboundedReceiver<InternalCommand>,

    pub self_ref: ActorRef,
}

impl Actor {
    pub fn new() -> Self {
        let (broadcaster_tx, _rx) = tokio::sync::broadcast::channel::<InternalCommand>(16);
        let (tx, mpsc_rx) = tokio::sync::mpsc::unbounded_channel::<InternalCommand>();
        let self_ref = ActorRef {
            sender: tx.clone(),
            broadcast: broadcaster_tx.clone(),
        };
        Self {
            self_ref,
            broadcaster: broadcaster_tx,
            receiver: mpsc_rx,
            // games: Vec::new(),
        }
    }

    pub fn get_ref(&self) -> ActorRef {
        self.self_ref.clone()
    }

    pub async fn run(&mut self) {
        loop {
            let cmd = self.receiver.recv().await.unwrap();
            let clone = cmd.clone();
            match cmd {
                InternalCommand::Test { msg } => {
                    println!("Actor got a test command: {:?}", msg);
                    self.broadcaster.send(clone).unwrap();
                }
            }
        }
    }
}
