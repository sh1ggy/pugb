use std::io::{self};
use tokio::{fs::File, io::BufWriter, sync::oneshot};

use axum::{
    body::Bytes,
    extract::{BodyStream, Multipart, Path},
    BoxError, Extension,
};
use futures::{Stream, TryStreamExt};
use http::StatusCode;
use tokio_util::io::StreamReader;
use tower_cookies::Cookies;

use crate::{
    actor::{ActorRef, InternalRequest},
    error::{Error, Result},
};


// https://github.com/tokio-rs/axum/blob/24f0f3eae8054c7a495cd364087f2dd7fa8b87e0/examples/stream-to-file/src/main.rs

pub async fn shoot_request(
    Path((game_id, user_id)): Path<(u64, u64)>,
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
    mut multipart: Multipart,
) -> Result<()> {
    // let user = ctx_resolver(actor.clone(), &cookies).await?;
    let mut bytes: Option<Vec<u8>> = None;
    let mut killee: Option<String> = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        let field_name = if let Some(field_name) = field.name() {
            field_name.to_owned()
        } else {
            continue;
        };
        if (field_name == "image") {
            let bytes_struct: Bytes = field.bytes().await.unwrap();
            let raw_bytes: Vec<u8> = bytes_struct.into();
            bytes = Some(raw_bytes);
        } 
        else if (field_name == "killee") {
            killee = Some(field.text().await.unwrap());
        }
        
        else {
            continue;
        }
    }


    let bytes = match bytes {
        Some(bytes) => bytes,
        None => {
            return Err(Error::BadRequestInvalidParams {
                inner: "image".to_owned(),
            });
        }
    };

    let killee = match killee {
        Some(killee) => killee,
        None => {
            return Err(Error::BadRequestInvalidParams {
                inner: "killee".to_owned(),
            });
        }
    };

    let (send, recv) = oneshot::channel();
    let killer = user_id.to_string(); 
    println!("Killer: {:?}, game: {}, killee: {}", user_id, game_id, killee);
    actor
        .sender
        .send(InternalRequest::Shoot {
            image: bytes,
            res: send,
            game_id,
            killee,
            killer,
        })
        .unwrap();

    recv.await.unwrap()?;

    Ok(())
}
