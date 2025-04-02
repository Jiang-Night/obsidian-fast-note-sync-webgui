import env from "@/env.ts"
import { useConfirmDialog } from "@/components/context/confirm-dialog-context"
import { getBrowserLang } from "@/lib/i18n/utils"
import type { ChangePassword } from "@/lib/types/user"

export function handleUser() {
  const { openConfirmDialog } = useConfirmDialog() // 使用 useContext 来获取上下文值
  const token = localStorage.getItem("token")!


  const handleChangePassword = async (data: ChangePassword, callback: (data2: ChangePassword) => void) => {

    const formData = { ...data }

    const response = await fetch(env.API_URL + "/api/user/change_password", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
        Domain: window.location.origin,
        Token: token,
        Lang: getBrowserLang(),
      },
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const res = await response.json()
    if (res.code < 100 && res.code >0) {
      openConfirmDialog(res.message, "success")

      callback(data)
    } else {
      openConfirmDialog(res.message + ": " + res.details, "error")
    }
  }


  return {
    handleChangePassword,
  }
}
