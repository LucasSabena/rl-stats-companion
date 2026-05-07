use crate::error::{AppError, AppResult};
use tracing::debug;

const RLSTATS_BASE: &str = "https://rlstats.net";

pub struct RlstatsClient {
    http: reqwest::Client,
}

impl RlstatsClient {
    pub fn new() -> AppResult<Self> {
        let http = reqwest::Client::builder()
            .user_agent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
            )
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .map_err(|e| AppError::ConnectionError(format!("Failed to create HTTP client: {e}")))?;

        Ok(Self { http })
    }

    pub async fn fetch_profile_html(&self, platform: &str, identifier: &str) -> AppResult<String> {
        let url = format!("{}/profile/{}/{}", RLSTATS_BASE, platform, identifier);
        debug!(%url, "Fetching RLStats profile HTML");

        let response = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::ConnectionError(format!("Error de red RLStats: {e}")))?;

        let status = response.status();
        let body = response.text().await.unwrap_or_default();

        if status == reqwest::StatusCode::NOT_FOUND || body.contains("Not Found") {
            return Err(AppError::ConfigError(format!(
                "Perfil no encontrado en RLStats: {}/{}",
                platform, identifier
            )));
        }

        if !status.is_success() {
            return Err(AppError::ConnectionError(format!(
                "RLStats devolvio HTTP {}",
                status.as_u16()
            )));
        }

        debug!(len = body.len(), "RLStats HTML fetched");
        Ok(body)
    }
}
