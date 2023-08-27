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

use super::auth::ctx_resolver;

// https://github.com/tokio-rs/axum/blob/24f0f3eae8054c7a495cd364087f2dd7fa8b87e0/examples/stream-to-file/src/main.rs

pub async fn shoot_request(
    Path(game_id): Path<u64>,
    Extension(actor): Extension<ActorRef>,
    cookies: Cookies,
    mut multipart: Multipart,
) -> Result<()> {
    let user = ctx_resolver(actor.clone(), &cookies).await?;
    let mut bytes: Option<Vec<u8>> = None;
    let mut killee: Option<String> = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        println!("File: {:?}", field);
        let field_name = if let Some(field_name) = field.name() {
            // println!("File_Name: {:?}", field_name);
            field_name.to_owned()
        } else {
            continue;
        };
        // println!("Field_name: {field_name}");
        if (field_name == "image") {
            // stream_to_file(&"image", field).await?;
            let bytes_struct: Bytes = field.bytes().await.unwrap();
            println!("HEY MAN, GOT IMAGE {:?}", bytes_struct);
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
    let killer = user.user.id.to_string(); 
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

const UPLOADS_DIRECTORY: &str = "uploads";

async fn stream_to_file<S, E>(path: &str, stream: S) -> Result<()>
where
    S: Stream<Item = core::result::Result<Bytes, E>>,
    E: Into<BoxError>,
{
    if !path_is_valid(path) {
        // return Err((StatusCode::BAD_REQUEST, "Invalid path".to_owned()));
        return Err(Error::BadRequestInvalidPath);
    }

    async {
        // Convert the stream into an `AsyncRead`.
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        // let body_with_io_error = stream.map_err(|e| );
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        // Create the file. `File` implements `AsyncWrite`.
        let path = std::path::Path::new(UPLOADS_DIRECTORY).join(path);
        let mut file = BufWriter::new(File::create(path).await?);

        // Copy the body into the file.
        tokio::io::copy(&mut body_reader, &mut file).await?;

        Ok::<_, io::Error>(())
    }
    .await
    .unwrap();
    Ok(())
    // .map_err(|err| Error::BadRequestInvalidStream  { inner: err.to_string() })
    // .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))
}
// to prevent directory traversal attacks we ensure the path consists of exactly one normal
// component
fn path_is_valid(path: &str) -> bool {
    let path = std::path::Path::new(path);
    let mut components = path.components().peekable();

    if let Some(first) = components.peek() {
        if !matches!(first, std::path::Component::Normal(_)) {
            return false;
        }
    }

    components.count() == 1
}
