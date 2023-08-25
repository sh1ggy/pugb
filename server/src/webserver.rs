use axum::{Json, extract};
use serde::Deserialize;
use tower_cookies::{Cookies, Cookie};


pub async fn auth_handler( extract::Json(req): extract::Json<CodeRequestDTO>, cookies: Cookies) -> &'static str {
    // cookies.add(Cookie::new("hello_world", "hello_world"));

    // TODO do a join on the servres of the user and games that exist and send back to client

    "Check your cookies."
}

pub async fn refresh_games() -> &'static str {
    "Check your cookies."
}

#[derive(Deserialize)]
struct CodeRequestDTO {
    code: String,
    code_verifier: String,
    state: String,
}

struct CodeResponseDTO {

}

struct UserData {

}