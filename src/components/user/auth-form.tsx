import "../../styles/auth.css";

import { createLoginSchema, createRegisterSchema, type LoginFormData, type RegisterFormData } from "@/lib/validations/user-schema";
import { Sun, Moon, User, Lock, Mail, KeyRound, Github, LogIn, Wifi } from "lucide-react";
import { AnimatedBackground } from "@/components/user/animated-background";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useTheme } from "@/components/context/theme-context";
import { useAuth } from "@/components/api-handle/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/common/Toast";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";


interface AuthFormProps {
  onSuccess: () => void
  registerIsEnable?: boolean
}

const formVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  }
};

export function AuthForm({ onSuccess, registerIsEnable = true }: AuthFormProps) {
  const { t } = useTranslation()
  const { isLoading, login, registerUser } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const loginSchema = createLoginSchema(t)
  const registerSchema = createRegisterSchema(t)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSoft = () => {
    window.open("https://github.com/haierkeys/fast-note-sync-service", "_blank", "noopener,noreferrer")
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    const result = await login(data)
    if (result.success) {
      onSuccess()
    } else {
      toast.error(result.error!)
    }
  }

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data)
    if (result.success) {
      onSuccess()
    } else {
      toast.error(result.error!)
    }
  }

  const toggleTab = (tab: 'login' | 'register') => {
    if (tab === activeTab) return
    if (tab === 'register' && !registerIsEnable) {
      toast.info(t("registerClosed"))
      return
    }
    setActiveTab(tab)
  }

  return (
    <div className={`auth-page-container ${resolvedTheme}`}>
      <AnimatedBackground />

      {/* Floating Actions (Top Right) */}
      <div className="auth-floating-actions">
        <button
          onClick={onSoft}
          className="auth-floating-switcher"
          title="Source Code"
        >
          <Github />
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="auth-floating-switcher"
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
        </button>
        <LanguageSwitcher
          showText={false}
          className="auth-floating-switcher"
        />
      </div>

      <main className="relative z-50 w-full max-w-md px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-logo-wrapper flex flex-col items-center"
        >
          <div className="auth-logo-box">
            <Wifi size={44} className="auth-logo-icon" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Fast Note Sync</h1>
          <p className="auth-subtitle">
            {t("subtitle") || "Welcome Back"}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="auth-card"
        >
          {/* Tabs Switcher at Top */}
          <div className="auth-tabs-container">
            <div className="auth-tabs">
              <button
                onClick={() => toggleTab('login')}
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              >
                {t("login")}
              </button>
              <button
                onClick={() => toggleTab('register')}
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              >
                {t("registerButton") || t("register")}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      placeholder={t("credentialsPlaceholder")}
                      {...loginForm.register("credentials")}
                      className="auth-input pl-12 h-14"
                    />
                    {loginForm.formState.errors.credentials && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {loginForm.formState.errors.credentials.message}
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      {...loginForm.register("password")}
                      className="auth-input pl-12 h-14"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button-primary mt-6"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {t("login")}
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                className="space-y-3"
              >
                <div className="space-y-3">
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      placeholder={t("usernamePlaceholder")}
                      {...registerForm.register("username")}
                      className="auth-input pl-12 h-12"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...registerForm.register("email")}
                      className="auth-input pl-12 h-12"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      {...registerForm.register("password")}
                      className="auth-input pl-12 h-12"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <KeyRound className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 group-focus-within:opacity-70 transition-opacity`} />
                    <Input
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      {...registerForm.register("confirmPassword")}
                      className="auth-input pl-12 h-12"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mt-1 ml-4">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button-primary mt-4"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : t("registerButton")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>

        {/* Footer info & GitHub Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center space-y-6"
        >
          <footer
            className="auth-brand-footer"
            dangerouslySetInnerHTML={{ __html: t("footerTitle") }}
          />
        </motion.div>
      </main>
    </div>
  )
}
