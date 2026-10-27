"use client";

import { useEffect, useRef, useState } from "react";
import { maskApiKey, onOpenApiKeySettings, setApiKey, useApiKey } from "@/lib/apiKey";

// header 上的「API 金鑰」按鈕與設定視窗
export default function ApiKeySettings() {
  const apiKey = useApiKey();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  const [visible, setVisible] = useState(false);

  function open() {
    setDraft("");
    setVisible(false);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  // 其他頁面（例如面試頁）也可以要求打開設定視窗
  useEffect(() => onOpenApiKeySettings(open), []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const key = draft.trim();
    if (!key) return;
    setApiKey(key);
    close();
  }

  function remove() {
    setApiKey("");
    setDraft("");
  }

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm transition hover:border-ink"
      >
        <span className={`size-2 rounded-full ${apiKey ? "bg-sage" : "bg-accent"}`} />
        <span className="hidden sm:inline">{apiKey ? "金鑰已設定" : "設定 API 金鑰"}</span>
        <span className="sm:hidden">金鑰</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close(); // 點背景關閉
        }}
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={save} className="flex flex-col gap-5 p-7">
          <div>
            <div className="font-display text-lg italic text-accent">Settings</div>
            <h2 className="mt-1 font-serif text-2xl font-bold">Gemini API 金鑰</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              本服務使用你自己的金鑰呼叫 Gemini。金鑰只存在這個瀏覽器，每次練習時隨請求送出，伺服器不會保存。
            </p>
          </div>

          {apiKey && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-sage-soft px-4 py-3 text-sm">
              <span>
                目前金鑰：<code className="font-mono">{maskApiKey(apiKey)}</code>
              </span>
              <button type="button" onClick={remove} className="text-accent hover:underline">
                刪除
              </button>
            </div>
          )}

          <label className="flex flex-col gap-2 text-sm font-medium">
            {apiKey ? "更換金鑰" : "輸入金鑰"}
            <div className="flex items-center rounded-2xl border border-line bg-paper pr-2 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
              <input
                type={visible ? "text" : "password"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="AIza..."
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent p-3.5 font-mono font-normal outline-none placeholder:text-ink-2/50"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="rounded-full px-3 py-1.5 text-xs font-normal text-ink-2 hover:bg-paper-2"
              >
                {visible ? "隱藏" : "顯示"}
              </button>
            </div>
          </label>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink-2 underline decoration-line underline-offset-4 hover:text-accent"
          >
            還沒有金鑰？到 Google AI Studio 免費取得 ↗
          </a>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-full px-5 py-2.5 text-sm text-ink-2 hover:bg-paper-2"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              儲存
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
