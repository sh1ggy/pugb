use axum::Router;

fn main() {
    println!("Hello, world!");
    dotenv::dotenv().ok();

        tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        // .with_target(false)
        .init();

    // let app = Router::new()


}
