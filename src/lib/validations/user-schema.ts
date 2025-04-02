import * as z from "zod"

const passwordValidation = (t: (key: string) => string) => z.string().min(6, t("passwordMinLength"))

// 登录表单验证
export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    credentials: z.string().min(1, t("credentialsRequired")),
    password: passwordValidation(t),
    remember: z.coerce.boolean().optional().default(false),
  })

// 注册表单验证
export const createRegisterSchema = (t: (key: string) => string) =>
  z.object({
      username: z.string().min(3, t("usernameMinLength")),
      email: z.string().email(t("emailInvalid")),
      password: passwordValidation(t),
      confirmPassword: z.string().min(6, t("passwordMinLength")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    })

// 定义 LoginFormData 类型
export type LoginFormData = {
  credentials: string
  password: string
  remember: boolean
}

// 定义 RegisterFormData 类型
export type RegisterFormData = {
  username: string
  email: string
  password: string
  confirmPassword: string
}


export const changePasswdSchema = z.object({
  oldPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})

export type ChangePasswdFormData = z.infer<typeof changePasswdSchema>
