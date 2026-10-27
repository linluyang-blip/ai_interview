"use client";

// BYOK：使用者自己的 Gemini API 金鑰，只存在瀏覽器的 localStorage
// 呼叫 /api/interview 時放在 API_KEY_HEADER 標頭帶給後端，後端不會保存

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rehearse.geminiApiKey";
const CHANGE_EVENT = "rehearse:api-key-change"; // 同一分頁內通知各元件金鑰已變更
const OPEN_EVENT = "rehearse:open-api-key-settings"; // 讓任何元件都能打開設定視窗

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return ""; // 無痕模式或封鎖網站資料時 localStorage 可能無法使用
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 存不進去就只能這次使用，不影響其他功能
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // 其他分頁改了金鑰也同步
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// 讀取目前的金鑰，金鑰變更時元件會自動重新渲染；伺服器端渲染時一律視為未設定
export function useApiKey() {
  return useSyncExternalStore(subscribe, getApiKey, () => "");
}

export function openApiKeySettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenApiKeySettings(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

// 遮住中間，只顯示頭尾，讓使用者辨識是哪一把金鑰
export function maskApiKey(key: string) {
  return key.length <= 10 ? "••••••" : `${key.slice(0, 6)}••••••${key.slice(-4)}`;
}
