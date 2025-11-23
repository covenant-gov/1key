mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_opener::init())
                .expect("failed to initialize opener plugin");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::wallet_exists,
            commands::store_encrypted_wallet,
            commands::load_encrypted_wallet,
            commands::decrypt_wallet_with_pin,
            commands::encrypt_and_store_wallet,
            commands::delete_wallet,
            commands::aztec_initialize,
            commands::aztec_create_account,
            commands::aztec_connect_account,
            commands::aztec_deploy_account,
            commands::aztec_test,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
