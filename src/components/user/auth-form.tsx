import { createLoginSchema, createRegisterSchema, type LoginFormData, type RegisterFormData } from "@/lib/validations/user-schema";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { User, Lock, Mail, KeyRound, Github } from "lucide-react";
import { useAuth } from "@/components/api-handle/use-auth";
import { motion, AnimatePresence } from "motion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/common/Toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";


interface AuthFormProps {
  onSuccess: () => void
  registerIsEnable?: boolean
}

const SPRING_CONFIG = { type: "spring", stiffness: 300, damping: 30 } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formVariants: any = {
  hidden: { opacity: 0, x: 0, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemVariants: any = {
  hidden: { opacity: 0, y: 15, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

export function AuthForm({ onSuccess, registerIsEnable = true }: AuthFormProps) {
  const { t, i18n } = useTranslation()
  const { isLoading, login, registerUser } = useAuth()
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

  const handleTabChange = (tab: 'login' | 'register') => {
    if (tab === 'register' && !registerIsEnable) {
      toast.info(t("registerClosed"))
      return
    }
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* 增强背景光斑层 (装饰用) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        variants={containerVariants as any}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative"
      >
        {/* 主要卡片容器 - 玻璃拟态 */}
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 custom-shadow rounded-[2rem] p-8 sm:p-10 relative z-10 overflow-hidden">
          {/* 卡片内部点缀 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          {/* Logo & Header */}
          <motion.header variants={itemVariants as any} className="flex flex-col items-center gap-4 mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <span className="text-primary-foreground font-black text-2xl tracking-tighter">OS</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text">
                Fast Note Sync
              </h1>
              <p
                className="text-muted-foreground/80 text-sm font-medium whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: activeTab === 'login' ? t("loginSub") || "Welcome Back" : t("registerSub") || "Create Account"
                }}
              />
            </div>
          </motion.header>

          {/* Tab 切换 */}
          <motion.div variants={itemVariants as any} className="relative flex p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl mb-8 border border-border/20">
            <motion.div
              className="absolute top-1.5 bottom-1.5 bg-background rounded-xl shadow-md border border-border/10"
              initial={false}
              animate={{
                left: activeTab === 'login' ? '6px' : 'calc(50% + 2px)',
                width: 'calc(50% - 8px)',
              }}
              transition={SPRING_CONFIG}
            />
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <User className={`w-4 h-4 transition-transform ${activeTab === 'login' ? 'scale-110' : ''}`} />
              {t("login")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <KeyRound className={`w-4 h-4 transition-transform ${activeTab === 'register' ? 'scale-110' : ''}`} />
              {t("register")}
            </button>
          </motion.div>

          {/* 表单区域 */}
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'login' ? (
              <motion.form
                key="login"
                variants={formVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="space-y-5"
              >
                <motion.div variants={itemVariants as any} className="space-y-2">
                  <Label htmlFor="credentials">{t("credentials")}</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="credentials"
                      placeholder={t("credentialsPlaceholder")}
                      {...loginForm.register("credentials")}
                      className="h-12 pl-10 bg-background/50 border-border/40 rounded-xl focus-visible:ring-primary/20 hover:border-primary/30 transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                  {loginForm.formState.errors.credentials && (
                    <p className="text-xs text-destructive font-medium mt-1 ml-1">
                      {loginForm.formState.errors.credentials.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("password")}</Label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      {...loginForm.register("password")}
                      className="h-12 pl-10 bg-background/50 border-border/40 rounded-xl focus-visible:ring-primary/20 hover:border-primary/30 transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium mt-1 ml-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : t("login")}
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                variants={formVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                className="space-y-4"
              >
                <motion.div variants={itemVariants as any} className="space-y-1.5">
                  <Label htmlFor="reg-username">{t("username")}</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="reg-username"
                      placeholder={t("usernamePlaceholder")}
                      {...registerForm.register("username")}
                      className="h-11 pl-10 bg-background/50 border-border/40 rounded-xl"
                    />
                  </div>
                  {registerForm.formState.errors.username && (
                    <p className="text-xs text-destructive font-medium ml-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="space-y-1.5">
                  <Label htmlFor="reg-email">{t("email")}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...registerForm.register("email")}
                      className="h-11 pl-10 bg-background/50 border-border/40 rounded-xl"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium ml-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="space-y-1.5">
                  <Label htmlFor="reg-password">{t("password")}</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      {...registerForm.register("password")}
                      className="h-11 pl-10 bg-background/50 border-border/40 rounded-xl"
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium ml-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="space-y-1.5">
                  <Label htmlFor="reg-confirmPassword">{t("confirmPassword")}</Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="reg-confirmPassword"
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      {...registerForm.register("confirmPassword")}
                      className="h-11 pl-10 bg-background/50 border-border/40 rounded-xl"
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive font-medium ml-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants as any} className="pt-3">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : t("registerButton")}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* 底部页脚 */}
        <motion.footer
          variants={itemVariants as any}
          className="mt-8 flex flex-col items-center gap-4 px-4"
        >
          <div className="text-center space-y-2">
            <p className="text-muted-foreground/60 text-xs font-medium leading-relaxed whitespace-pre-line">
              <span dangerouslySetInnerHTML={{ __html: t("subtitlePrefix") }} />{" "}
              <a
                href="https://github.com/haierkeys/obsidian-fast-note-sync"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 hover:text-primary underline underline-offset-4 transition-colors decoration-primary/20"
                dangerouslySetInnerHTML={{ __html: t("subtitlePluginName") }}
              />
              {i18n.language === "zh-CN" && <span dangerouslySetInnerHTML={{ __html: ` ${t("subtitleSuffix")}` }} />}
            </p>
          </div>

          <div className="flex h-10 items-center justify-center gap-1.5 bg-muted/20 backdrop-blur-md px-4 rounded-full border border-border/20 shadow-sm">
            <LanguageSwitcher
              showText={true}
              className="text-[11px] h-7 px-2 font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground hover:bg-background/40 rounded-lg transition-all"
            />
            <div className="w-px h-3 bg-border/40 mx-1" />
            <Button
              variant="ghost"
              onClick={onSoft}
              type="button"
              className="text-[11px] h-7 px-2 font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground hover:bg-background/40 rounded-lg transition-all inline-flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </Button>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  )
}
