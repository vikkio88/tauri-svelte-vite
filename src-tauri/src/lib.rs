use tauri::{async_runtime::Mutex, State};

struct AppState {
    messages: Mutex<Vec<String>>,
    count: Mutex<i32>,
}

#[tauri::command]
async fn greet(name: &str, state: State<'_, AppState>) -> Result<Vec<String>, ()> {
    let mut msgs = state.messages.lock().await;
    msgs.push(name.to_string());
    Ok(msgs.to_vec())
}

#[tauri::command]
async fn count(diff: i32, state: State<'_, AppState>) -> Result<i32, ()> {
    let mut cnt = state.count.lock().await;
    *cnt += diff;
    Ok(*cnt)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            messages: Mutex::new(Vec::new()),
            count: Mutex::new(0),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
