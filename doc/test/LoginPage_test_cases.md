---
description: 測試案例模板
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】渲染登入表單基本元素

**範例輸入**：Rendering LoginPage component
**期待輸出**：頁面包含 Email 輸入框、密碼輸入框、登入按鈕、以及「顯示密碼」切換按鈕

---

## [x] 【前端互動】切換密碼顯示狀態

**範例輸入**：點擊「顯示密碼」按鈕 (👁️/🙈)
**期待輸出**：密碼輸入框的 `type` 屬性在 `password` 和 `text` 之間切換，按鈕圖示隨之變更

---

## [x] 【function 邏輯】驗證無效 Email 格式

**範例輸入**：Email 輸入 "invalid-email"，點擊登入
**期待輸出**：顯示「請輸入有效的 Email 格式」錯誤訊息，且不呼叫 Login API

---

## [x] 【function 邏輯】驗證密碼強度不足

**範例輸入**：密碼輸入 "weak" (長度不足) 或 "password" (無數字)，點擊登入
**期待輸出**：顯示「密碼必須至少 8 個字元」或「密碼必須包含英文字母和數字」錯誤訊息，且不呼叫 Login API

---

## [x] 【Mock API】登入成功導轉

**範例輸入**：輸入有效 Email/Password，Mock API 回傳成功 (200 OK)
**期待輸出**：呼叫 `login` function，並驗證 `navigate` 被呼叫且路徑為 `/dashboard`

---

## [x] 【Mock API】登入失敗顯示錯誤

**範例輸入**：輸入有效 Email/Password，Mock API 回傳失敗 (401 Unauthorized，message: "帳號或密碼錯誤")
**期待輸出**：頁面顯示錯誤 Banner「帳號或密碼錯誤」，Loading 狀態解除

---

## [x] 【前端互動】登入中狀態鎖定

**範例輸入**：點擊登入按鈕觸發 Loading
**期待輸出**：按鈕顯示「登入中...」且為 disabled，輸入框皆為 disabled

---

## [x] 【function 邏輯】已登入狀態自動導轉

**範例輸入**：`useAuth` 回傳 `isAuthenticated: true`
**期待輸出**：Component mount 後自動導轉至 `/dashboard`
