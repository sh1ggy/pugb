use axum::{response::{Response, IntoResponse}, Json};
use http::{Method, StatusCode};
use serde_json::json;
use uuid::Uuid;

use crate::error::Error;


pub async fn main_response_mapper(
	// ctx: Option<Ctx>,
	// uri: Uri,
	req_method: Method,
	res: Response,
) -> Response {
	println!("->> {:<12} - main_response_mapper", "RES_MAPPER");
	let uuid = Uuid::new_v4();

	// -- Get the eventual response error.
	let service_error = res.extensions().get::<Error>();

	// -- If client error, build the new reponse.
	let error_response =
		service_error
			.as_ref()
			.map(|e| {
				let client_error_body = json!({
					"error": {
						"type": e.as_ref(),
						"req_uuid": uuid.to_string(),
					}
				});

				println!("    ->> client_error_body: {client_error_body}");

				// Build the new response from the client_error_body
				(StatusCode::INTERNAL_SERVER_ERROR, Json(client_error_body)).into_response()
			});

	// Build and log the server log line.
	// let client_error = client_status_error.unzip().1;

	error_response.unwrap_or(res)
}