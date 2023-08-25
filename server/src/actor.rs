pub struct ActorRef {
    pub sender: tokio::sync::mpsc::Sender<InternalCommand>,
    pub broadcast: tokio::sync::broadcast::Sender<InternalCommand>,
}

pub enum InternalCommand {}
