import React from "react"
import ReactDOM from "react-dom/client"

import { AuthProvider } from "./components/context/auth-context"
import { ConfirmDialogProvider } from "@/components/context/confirm-dialog-context"
import App from "./App"
import "@/lib/i18n/translations"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ConfirmDialogProvider>
        <App />
      </ConfirmDialogProvider>
    </AuthProvider>
  </React.StrictMode>
)
