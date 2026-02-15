import { useTranslation } from "react-i18next";


/**
 * 同步与备份组件
 * 显示左右两个占位 Box，用于未来的同步与备份功能
 */
export function SyncBackup() {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 md:pb-4">
            {/* 左侧占位 Box */}
            <div className="rounded-xl border border-border bg-card p-6 min-h-[400px] flex items-center justify-center custom-shadow">
                <div className="text-muted-foreground text-sm italic">{t("comingSoon")}</div>
            </div>

            {/* 右侧占位 Box */}
            <div className="rounded-xl border border-border bg-card p-6 min-h-[400px] flex items-center justify-center custom-shadow">
                <div className="text-muted-foreground text-sm italic">{t("comingSoon")}</div>
            </div>
        </div>
    );
}
