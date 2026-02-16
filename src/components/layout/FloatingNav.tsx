import { Database, FileText, Trash, Settings, RefreshCw, GitBranch, Paperclip, Layout } from "lucide-react";
import { useAppStore, type ModuleId } from "@/stores/app-store";
import { NavItem } from "@/components/navigation/NavItem";
import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/use-mobile";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";


interface FloatingNavProps {
  isAdmin: boolean
  className?: string
}

/**
 * FloatingNav - 悬浮导航栏
 *
 * - 移动端：固定在底部中央
 * - 桌面端：sticky 定位，与内容卡片顶部对齐
 * - 圆角胶囊形状 (rounded-2xl)
 * - 毛玻璃背景
 * - 动画指示器
 */
export function FloatingNav({ isAdmin, className }: FloatingNavProps) {
  const { t } = useTranslation()
  const { currentModule, setModule, versionInfo } = useAppStore()
  const isMobile = useMobile()

  const navItems: Array<{
    id: ModuleId
    icon: typeof Database
    labelKey: string
    adminOnly?: boolean
  }> = [
      { id: "dashboard", icon: Layout, labelKey: "ui.nav.menuDashboard" },
      { id: "vaults", icon: Database, labelKey: "ui.nav.menuVaults" },
      { id: "notes", icon: FileText, labelKey: "ui.nav.menuNotes" },
      { id: "files", icon: Paperclip, labelKey: "ui.nav.menuFiles" },
      { id: "trash", icon: Trash, labelKey: "ui.nav.menuTrash" },
    ]

  // 计划中的功能
  const plannedItems: Array<{
    id: ModuleId
    icon: typeof Database
    labelKey: string
  }> = [
      { id: "sync", icon: RefreshCw, labelKey: "ui.nav.menuSync" },
      { id: "git", icon: GitBranch, labelKey: "ui.nav.menuGit" },
    ]

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className={cn(
      // 移动端：fixed 定位，限制最大宽度（预留左右各 1.5rem 边距）并居中
      "fixed bottom-1 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-3rem)] w-auto",
      // 桌面端：相对定位
      "md:relative md:bottom-auto md:left-auto md:translate-x-0 md:pt-6 md:pl-4 md:max-w-none",
      className
    )}>
      <motion.nav
        aria-label="Main Navigation"
        className={cn(
          // 移动端：水平排列，启用横向滚动并隐藏滚动条
          "flex items-center gap-1 p-2 overflow-x-auto no-scrollbar",
          // 桌面端：垂直排列，重置滚动
          "md:flex-col md:gap-1 md:p-2 md:overflow-visible",
          // 样式
          "bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-lg",
          "custom-shadow backdrop-blur-sm"
        )}
        initial={{ opacity: 0, scale: 0.9, x: 0 }}
        animate={isMobile ? {
          opacity: 1,
          scale: 1,
          x: [0, -30, 10, 0]
        } : {
          opacity: 1,
          scale: 1,
          x: 0
        }}
        transition={isMobile ? {
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          x: { duration: 1.2, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }
        } : {
          duration: 0.3
        }}
      >
        {visibleItems.map((item) => (
          <>
            {/* 在回收站上方添加分隔线（仅桌面端） */}
            {item.id === 'trash' && (
              <div className="hidden md:block w-8 h-px bg-border/50 my-1" />
            )}

            <NavItem
              key={item.id}
              icon={item.icon}
              label={t(item.labelKey)}
              isActive={currentModule === item.id}
              onClick={() => setModule(item.id)}
              tooltipSide="right"
              showDot={item.id === 'settings' && !!versionInfo?.versionIsNew}
            />
            {/* 在看板和笔记仓库之间添加分隔线（仅桌面端） */}
            {item.id === 'dashboard' && (
              <div className="hidden md:block w-8 h-px bg-border/50 my-1" />
            )}
          </>
        ))}

        {/* 计划中的功能 - 桌面端显示 */}
        <div className="hidden md:block w-8 h-px bg-border/50 my-1" />

        {plannedItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            isActive={currentModule === item.id}
            onClick={() => setModule(item.id)}
            tooltipSide="right"
          />
        ))}

        {/* 系统设置 - 始终在最下方 */}
        {isAdmin && (
          <>
            {/* 在设置上方添加分隔线（仅桌面端） */}
            <div className="hidden md:block w-8 h-px bg-border/50 my-1" />
            <NavItem
              key="settings"
              icon={Settings}
              label={t("ui.nav.menuSettings")}
              isActive={currentModule === 'settings'}
              onClick={() => setModule('settings')}
              tooltipSide="right"
              showDot={!!versionInfo?.versionIsNew}
            />
          </>
        )}
      </motion.nav>
    </div>
  )
}
