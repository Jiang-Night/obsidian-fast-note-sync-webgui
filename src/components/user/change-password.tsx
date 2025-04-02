// src/components/ChangePassword.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { handleUser } from "@/components/api-handle/user-handle"
import type { ChangePassword } from "@/lib/types/user"
import { changePasswdSchema } from "@/lib/validations/user-schema"

export function ChangePassword({close}: {close: () => void}) {
  const { t } = useTranslation()
    const { handleChangePassword } = handleUser()



  // prettier-ignore

  const {register,handleSubmit} = useForm<ChangePassword>({
    resolver: zodResolver(changePasswdSchema),
    defaultValues: {},
  })
  const onFormSubmit = (data: ChangePassword) => {
    handleChangePassword(data, () => {
      close()
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 border px-4 py-10 mb-6">
      <div className="space-y-2">
        <Label htmlFor="oldPassword">{t("currentPassword")}</Label>
        <Input id="oldPassword" type="password" {...register("oldPassword")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <Input id="newPassword" type="password" {...register("password")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} required />
      </div>
      <Button type="submit">{t("changePassword")}</Button>
    </form>
  )
}
