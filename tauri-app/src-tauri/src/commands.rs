use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::io::{Write, BufRead, BufReader};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptedWallet {
    pub encrypted_data: Vec<u8>,
    pub nonce: Vec<u8>,
    pub salt: Vec<u8>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WalletData {
    pub private_key: String,
    pub address: String,
}

/// Get the path to the encrypted wallet file
/// In Tauri v2, we'll pass the app handle from the command
/// For now, we'll use a platform-specific approach
fn get_wallet_path() -> Result<PathBuf, String> {
    // Use platform-specific app data directory
    let app_data = if cfg!(target_os = "macos") {
        dirs::data_local_dir()
            .ok_or("Failed to get data directory")?
            .join("1key")
    } else if cfg!(target_os = "windows") {
        dirs::data_local_dir()
            .ok_or("Failed to get data directory")?
            .join("1key")
    } else {
        // Linux and others
        dirs::home_dir()
            .ok_or("Failed to get home directory")?
            .join(".local")
            .join("share")
            .join("1key")
    };
    
    fs::create_dir_all(&app_data)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    
    Ok(app_data.join("wallet.encrypted"))
}

/// Derive encryption key from PIN using Argon2
fn derive_key_from_pin(pin: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    use argon2::Argon2;
    use argon2::password_hash::{rand_core::OsRng, SaltString};
    use base64::{Engine as _, engine::general_purpose};
    
    // Create Argon2 instance
    let argon2 = Argon2::default();
    
    // If salt is empty, generate a new one
    let salt_string = if salt.is_empty() {
        SaltString::generate(&mut OsRng)
    } else {
        // Convert salt bytes to base64 string, then parse as SaltString
        let salt_b64 = general_purpose::STANDARD.encode(salt);
        SaltString::from_b64(&salt_b64)
            .map_err(|e| format!("Invalid salt: {}", e))?
    };
    
    // Derive key
    let mut key = [0u8; 32];
    let salt_bytes = salt_string.as_salt().as_str().as_bytes();
    argon2
        .hash_password_into(pin.as_bytes(), salt_bytes, &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;
    
    Ok(key)
}

/// Encrypt wallet data with PIN-derived key
fn encrypt_wallet(wallet: &WalletData, pin: &str) -> Result<EncryptedWallet, String> {
    use aes_gcm::{
        aead::{Aead, AeadCore, KeyInit, OsRng},
        Aes256Gcm,
    };
    use rand::RngCore;
    
    // Generate random salt for key derivation (16 bytes)
    let mut salt_bytes = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt_bytes);
    let salt_vec = salt_bytes.to_vec();
    
    // Derive encryption key from PIN
    let key = derive_key_from_pin(pin, &salt_vec)?;
    let cipher = Aes256Gcm::new(&key.into());
    
    // Serialize wallet data
    let wallet_json = serde_json::to_string(wallet)
        .map_err(|e| format!("Serialization failed: {}", e))?;
    let wallet_bytes = wallet_json.as_bytes();
    
    // Generate nonce
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    
    // Encrypt
    let encrypted = cipher
        .encrypt(&nonce, wallet_bytes.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;
    
    Ok(EncryptedWallet {
        encrypted_data: encrypted,
        nonce: nonce.to_vec(),
        salt: salt_vec,
    })
}

/// Decrypt wallet data with PIN
fn decrypt_wallet(encrypted: &EncryptedWallet, pin: &str) -> Result<WalletData, String> {
    use aes_gcm::{
        aead::{Aead, KeyInit},
        Aes256Gcm,
    };
    
    // Derive encryption key from PIN
    let key = derive_key_from_pin(pin, &encrypted.salt)?;
    let cipher = Aes256Gcm::new(&key.into());
    
    // Decrypt
    use aes_gcm::Nonce;
    let nonce = Nonce::from_slice(&encrypted.nonce);
    let decrypted = cipher
        .decrypt(nonce, encrypted.encrypted_data.as_ref())
        .map_err(|_| "Decryption failed. Wrong PIN?")?;
    
    // Deserialize
    let wallet_json = String::from_utf8(decrypted)
        .map_err(|e| format!("Deserialization failed: {}", e))?;
    let wallet: WalletData = serde_json::from_str(&wallet_json)
        .map_err(|e| format!("Parsing failed: {}", e))?;
    
    Ok(wallet)
}

/// Check if wallet exists
#[tauri::command]
pub fn wallet_exists() -> Result<bool, String> {
    let wallet_path = get_wallet_path()?;
    Ok(wallet_path.exists())
}

/// Store encrypted wallet
#[tauri::command]
pub fn store_encrypted_wallet(encrypted: EncryptedWallet) -> Result<(), String> {
    let wallet_path = get_wallet_path()?;
    let encrypted_json = serde_json::to_string(&encrypted)
        .map_err(|e| format!("Serialization failed: {}", e))?;
    fs::write(&wallet_path, encrypted_json)
        .map_err(|e| format!("Failed to write wallet: {}", e))?;
    Ok(())
}

/// Load encrypted wallet from storage
#[tauri::command]
pub fn load_encrypted_wallet() -> Result<Option<EncryptedWallet>, String> {
    let wallet_path = get_wallet_path()?;
    if !wallet_path.exists() {
        return Ok(None);
    }
    let encrypted_json = fs::read_to_string(&wallet_path)
        .map_err(|e| format!("Failed to read wallet: {}", e))?;
    let encrypted: EncryptedWallet = serde_json::from_str(&encrypted_json)
        .map_err(|e| format!("Parsing failed: {}", e))?;
    Ok(Some(encrypted))
}

/// Decrypt wallet with PIN
#[tauri::command]
pub fn decrypt_wallet_with_pin(pin: String) -> Result<WalletData, String> {
    let encrypted = load_encrypted_wallet()?
        .ok_or("No wallet found")?;
    decrypt_wallet(&encrypted, &pin)
}

/// Encrypt and store wallet with PIN
#[tauri::command]
pub fn encrypt_and_store_wallet(wallet: WalletData, pin: String) -> Result<(), String> {
    let encrypted = encrypt_wallet(&wallet, &pin)?;
    store_encrypted_wallet(encrypted)
}

/// Delete wallet
#[tauri::command]
pub fn delete_wallet() -> Result<(), String> {
    let wallet_path = get_wallet_path()?;
    if wallet_path.exists() {
        fs::remove_file(&wallet_path)
            .map_err(|e| format!("Failed to delete wallet: {}", e))?;
    }
    Ok(())
}

// Sidecar communication helpers
#[derive(Serialize, Deserialize, Debug)]
struct SidecarRequest {
    id: u64,
    method: String,
    params: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug)]
struct SidecarResponse {
    id: Option<u64>,
    result: Option<serde_json::Value>,
    error: Option<SidecarError>,
}

#[derive(Serialize, Deserialize, Debug)]
struct SidecarError {
    code: i32,
    message: String,
    data: Option<String>,
}

// Global sidecar process state
static SIDECAR_COUNTER: Mutex<u64> = Mutex::new(0);

fn call_sidecar(method: &str, params: Option<serde_json::Value>) -> Result<serde_json::Value, String> {
    // Get sidecar path - in production this would be bundled
    // For now, we'll use the development path
    let sidecar_path = if cfg!(debug_assertions) {
        // Development: use node directly with the script
        "node"
    } else {
        // Production: use bundled sidecar
        "aztec-sidecar"
    };
    
    let mut counter = SIDECAR_COUNTER.lock().unwrap();
    *counter += 1;
    let request_id = *counter;
    drop(counter);
    
    let mut child = if cfg!(debug_assertions) {
        Command::new(sidecar_path)
            .arg("../sidecar/aztec-sidecar.js")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?
    } else {
        Command::new(sidecar_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?
    };
    
    let mut stdin = child.stdin.take().ok_or("Failed to open stdin")?;
    let stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    
    // Send request
    let request = SidecarRequest {
        id: request_id,
        method: method.to_string(),
        params,
    };
    
    let request_json = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;
    
    writeln!(stdin, "{}", request_json)
        .map_err(|e| format!("Failed to write to sidecar: {}", e))?;
    drop(stdin);
    
    // Read response
    let reader = BufReader::new(stdout);
    
    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read from sidecar: {}", e))?;
        if line.trim().is_empty() {
            continue;
        }
        
        // Skip ready signal
        if line.contains("\"ready\"") {
            continue;
        }
        
        let response: SidecarResponse = serde_json::from_str(&line)
            .map_err(|e| format!("Failed to parse response: {}", e))?;
        
        if let Some(error) = response.error {
            return Err(format!("Sidecar error: {} (code: {})", error.message, error.code));
        }
        
        if let Some(result) = response.result {
            return Ok(result);
        }
    }
    
    Err("No response from sidecar".to_string())
}

/// Initialize Aztec sidecar
#[tauri::command]
pub fn aztec_initialize(node_url: String) -> Result<serde_json::Value, String> {
    call_sidecar("initialize", Some(serde_json::json!({ "nodeUrl": node_url })))
}

/// Create Aztec account via sidecar
#[tauri::command]
pub fn aztec_create_account() -> Result<serde_json::Value, String> {
    call_sidecar("createAccount", None)
}

/// Connect to existing Aztec account via sidecar
#[tauri::command]
pub fn aztec_connect_account(credentials: serde_json::Value) -> Result<serde_json::Value, String> {
    call_sidecar("connectExistingAccount", Some(serde_json::json!({ "credentials": credentials })))
}

/// Deploy Aztec account via sidecar
#[tauri::command]
pub fn aztec_deploy_account() -> Result<serde_json::Value, String> {
    call_sidecar("deployAccount", None)
}

/// Test sidecar connection
#[tauri::command]
pub fn aztec_test() -> Result<serde_json::Value, String> {
    call_sidecar("test", None)
}

/// Deploy PasswordManager contract
#[tauri::command]
pub fn password_manager_deploy() -> Result<serde_json::Value, String> {
    call_sidecar("deployPasswordManager", None)
}

/// Create password entry
#[tauri::command]
pub fn password_manager_create_entry(
    contract_address: String,
    label: String,
    password: String,
    id: u64,
    randomness: u64,
) -> Result<serde_json::Value, String> {
    call_sidecar(
        "createPasswordEntry",
        Some(serde_json::json!({
            "contractAddress": contract_address,
            "label": label,
            "password": password,
            "id": id,
            "randomness": randomness,
        })),
    )
}

/// Get password entry IDs
#[tauri::command]
pub fn password_manager_get_entry_ids(
    contract_address: String,
    offset: Option<u64>,
) -> Result<serde_json::Value, String> {
    call_sidecar(
        "getPasswordEntryIds",
        Some(serde_json::json!({
            "contractAddress": contract_address,
            "offset": offset.unwrap_or(0),
        })),
    )
}

/// Get password entry by ID
#[tauri::command]
pub fn password_manager_get_entry_by_id(
    contract_address: String,
    id: u64,
    offset: Option<u64>,
) -> Result<serde_json::Value, String> {
    call_sidecar(
        "getPasswordEntryById",
        Some(serde_json::json!({
            "contractAddress": contract_address,
            "id": id,
            "offset": offset.unwrap_or(0),
        })),
    )
}

/// Update password entry
#[tauri::command]
pub fn password_manager_update_entry(
    contract_address: String,
    label: String,
    password: String,
    id: u64,
    randomness: u64,
) -> Result<serde_json::Value, String> {
    call_sidecar(
        "updatePasswordEntry",
        Some(serde_json::json!({
            "contractAddress": contract_address,
            "label": label,
            "password": password,
            "id": id,
            "randomness": randomness,
        })),
    )
}

/// Delete password entry
#[tauri::command]
pub fn password_manager_delete_entry(
    contract_address: String,
    id: u64,
) -> Result<serde_json::Value, String> {
    call_sidecar(
        "deletePasswordEntry",
        Some(serde_json::json!({
            "contractAddress": contract_address,
            "id": id,
        })),
    )
}

