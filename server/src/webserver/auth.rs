use axum::{
    middleware::Next,
    response::{IntoResponse, Response},
    Extension, Json,
};
use axum::http::Request;
use http::{Method, StatusCode};
use serde_json::json;
use tokio::sync::oneshot;
use tower_cookies::Cookies;
use uuid::Uuid;

use crate::{
    actor::{ActorRef, InternalRequest},
    error::{Error, Result},
    webserver::AUTH_COOKIE, models::{UserData, UserDataDTO},
};



// pub async fn mw_ctx_resolver<B>(
//     Extension(actor): Extension<ActorRef>,
//     cookies: Cookies,
//     mut req: Request<B>,
//     next: Next<B>,
// ) -> Result<Response> {
//     println!("->> {:<12} - mw_ctx_resolver", "MIDDLEWARE");
//     let auth_token = cookies.get(AUTH_COOKIE).map(|c| c.value().to_string());
//     match auth_token {
//         Some(rt) => {
//             println!("    ->> auth_token: {}", rt);
//             let (tx, rx) = oneshot::channel();
//             let req = InternalRequest::GetUser { rt, res: tx };
//             actor.sender.send(req).unwrap();
//             let user_data = rx.await.unwrap()?;
//             println!("    ->> user_data: {:?}", user_data);
//             req.extensions_mut().insert(user_data);
//         }
//         None => return Err(Error::AuthFailNoAuthTokenCookie),
//     }
//     Ok(next.run(req).await)
// }

pub async fn ctx_resolver(
    (actor): ActorRef,
    cookies: &Cookies,
) -> Result<UserDataDTO> {
    println!("->> {:<12} - mw_ctx_resolver", "MIDDLEWARE");
    let auth_token = cookies.get(AUTH_COOKIE).map(|c| c.value().to_string());
    match auth_token {
        Some(rt) => {
            println!("    ->> auth_token: {}", rt);
            let (tx, rx) = oneshot::channel();
            let req = InternalRequest::GetUser { rt, res: tx };
            actor.sender.send(req).unwrap();
            let user_data = rx.await.unwrap()?;
            println!("    ->> user_data: {:?}", user_data);
			return Ok(user_data);
        }
        None => return Err(Error::AuthFailNoAuthTokenCookie),
    }
}


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
    let error_response = service_error.as_ref().map(|e| {
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
