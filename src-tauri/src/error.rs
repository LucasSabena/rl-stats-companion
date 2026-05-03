use serde::{ser::SerializeStruct, Serialize, Serializer};
use std::io;
use thiserror::Error;

/// Application-wide error type.
/// All variants are serializable so they can be sent to the frontend.
#[derive(Error, Debug, Clone)]
pub enum AppError {
    #[error("IO error: {0}")]
    IoError(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("Connection error: {0}")]
    ConnectionError(String),

    #[error("Config error: {0}")]
    ConfigError(String),

    #[error("Updater error: {0}")]
    UpdaterError(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("type", &self.to_string())?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

impl From<io::Error> for AppError {
    fn from(err: io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::ParseError(err.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::StorageError(err.to_string())
    }
}

impl From<r2d2::Error> for AppError {
    fn from(err: r2d2::Error) -> Self {
        AppError::StorageError(err.to_string())
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(err: std::num::ParseIntError) -> Self {
        AppError::ParseError(err.to_string())
    }
}

impl From<std::num::ParseFloatError> for AppError {
    fn from(err: std::num::ParseFloatError) -> Self {
        AppError::ParseError(err.to_string())
    }
}

impl From<tauri_plugin_updater::Error> for AppError {
    fn from(err: tauri_plugin_updater::Error) -> Self {
        AppError::UpdaterError(err.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::ConnectionError(err.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
