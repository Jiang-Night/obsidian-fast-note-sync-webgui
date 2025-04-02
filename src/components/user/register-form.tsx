import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/components/api-handle/use-auth"

import { createRegisterSchema, type RegisterFormData } from "@/lib/validations/user-schema"
import { changeLang } from "@/lib/i18n/utils"

import { useConfirmDialog } from "@/components/context/confirm-dialog-context"

import { useTranslation } from "react-i18next"

interface RegisterFormProps {
  onSuccess: () => void
  onBackToLogin: () => void
}

export function RegisterForm({ onSuccess, onBackToLogin }: RegisterFormProps) {
  const { t, i18n } = useTranslation()
  //语言包设置

  //注册相关
  const { isLoading, registerUser } = useAuth()

  //消息提示
  const { openConfirmDialog } = useConfirmDialog()

  //表单验证
  const registerSchema = createRegisterSchema(t)
  // prettier-ignore
  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  //注册处理
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data)
    if (result.success) {
      onSuccess()
    } else {
      openConfirmDialog(result.error!) // 设置错误信息
      console.log(result.error)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-5 space-y-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("registerTitle")}</h1>
        <Button
          variant="outline"
          onClick={() => changeLang(i18n.language === "en" ? "zh" : "en")}
          className="text-sm font-medium hover:bg-slate-100 transition-colors">
          <Languages className="mr-2 h-4 w-4" />
          {i18n.language === "en" ? "中文" : "English"}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-gray-500">{t("registerSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="credentials">{t("username")}</Label>
          <Input id="username" placeholder={t("usernamePlaceholder")} {...register("username")} />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" type="password" placeholder={t("passwordPlaceholder")} {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input id="confirmPassword" type="password" placeholder={t("confirmPasswordPlaceholder")} {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("registering") : t("registerButton")}
        </Button>

        <div className="text-center mt-4">
          <Button variant="link" onClick={onBackToLogin} type="button">
            {t("alreadyHaveAccount")} {t("backToLogin")}
          </Button>
        </div>
      </form>
    </div>
  )
}
