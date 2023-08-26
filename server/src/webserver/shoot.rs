use std::{io::{self}};
use tokio::{fs::File, io::BufWriter};

use axum::{extract::{Path, BodyStream, Multipart}, body::Bytes, BoxError};
use futures::{Stream, TryStreamExt};
use http::StatusCode;
use tokio_util::io::StreamReader;

use crate::error::{Error, Result};

// https://github.com/tokio-rs/axum/blob/24f0f3eae8054c7a495cd364087f2dd7fa8b87e0/examples/stream-to-file/src/main.rs
pub async fn save_request_body(
     Path(file_name): Path<String>,
    request: BodyStream,
) -> Result<()> {
    println!("File name: {}", file_name);
    println!("Body: {:?}", request);
    stream_to_file(&file_name, request).await
    // "Hello, world!".to_string()
}

pub async fn shoot_request(mut multipart: Multipart) -> Result<()> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        println!("File: {:?}", field);
        let file_name = if let Some(file_name) = field.file_name() {
            file_name.to_owned()
        } else {
            continue;
        };

        stream_to_file(&file_name, field).await?;
    }

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
    .map_err(|err| Error::BadRequestInvalidStream  { inner: err.to_string() })
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