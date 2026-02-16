import { Plus, Pencil, Trash2, Check, Cloud, HardDrive, Share2, Server } from "lucide-react";
import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { useStorageHandle } from "@/components/api-handle/storage-handle";
import { StorageConfig, StorageTypeValue } from "@/lib/types/storage";
import { StorageForm } from "@/components/layout/storage-form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";


/**
 * 同步与备份组件
 * 左侧: 同步功能 (待开发)
 * 右侧: 云存储配置管理
 */
export function SyncBackup() {
    const { t } = useTranslation()
    const { openConfirmDialog } = useConfirmDialog()

    const [configs, setConfigs] = useState<StorageConfig[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [storageTypes, setStorageTypes] = useState<string[]>(StorageTypeValue)

    const { handleStorageList, handleStorageDelete, handleStorageTypes } = useStorageHandle()

    useEffect(() => {
        reloadList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const reloadList = async () => {
        handleStorageTypes(setStorageTypes)
        handleStorageList(setConfigs)
    }

    const handleAdd = async () => {
        await reloadList()
        setIsAdding(false)
    }

    const handleEdit = async (id: string | null) => {
        setEditingId(null)
        setTimeout(() => setEditingId(id), 0)
    }

    const handleSaveEdit = async () => {
        await reloadList()
        setEditingId(null)
    }

    const handleDelete = async (id: string) => {
        openConfirmDialog(t("ui.storage.confirmDelete"), "confirm", async () => {
            setConfigs(configs.filter((config) => config.id !== id))
            await handleStorageDelete(id)
            await reloadList()
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 md:pb-4 items-start">
            {/* 左侧占位 Box - 同步功能 */}
            <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center custom-shadow">
                <div className="text-muted-foreground text-sm italic">{t("ui.common.comingSoon")}</div>
            </div>

            {/* 右侧 Box - 云存储配置管理 */}
            <div className="rounded-xl border border-border bg-card p-6 custom-shadow">
                <div className="space-y-4">
                    {/* 标题和新增按钮 */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">{t("ui.storage.management")}</h2>
                        <Button onClick={() => setIsAdding(true)} className="rounded-xl shrink-0">
                            <Plus className="h-4 w-4 mr-2" />
                            {t("ui.common.add")}
                        </Button>
                    </div>

                    {/* 新增表单 */}
                    {isAdding && (
                        <div className="p-4 md:p-5 border border-primary/10 rounded-xl bg-primary/5 custom-shadow-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center mb-4">
                                <div className="h-6 w-1 bg-primary rounded-full mr-3" />
                                <h3 className="text-base font-bold text-gray-800">{t("ui.storage.add")}</h3>
                            </div>
                            <StorageForm types={storageTypes} onSubmit={handleAdd} onCancel={() => setIsAdding(false)} />
                        </div>
                    )}

                    {/* 编辑表单 */}
                    {editingId && (
                        <div className="p-4 md:p-5 border border-primary/10 rounded-xl bg-primary/5 custom-shadow-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center mb-4">
                                <div className="h-6 w-1 bg-primary rounded-full mr-3" />
                                <h3 className="text-base font-bold text-gray-800">{t("ui.storage.edit")}</h3>
                            </div>
                            <StorageForm
                                types={storageTypes}
                                config={configs.find((c) => c.id === editingId)}
                                onSubmit={handleSaveEdit}
                                onCancel={() => setEditingId(null)}
                            />
                        </div>
                    )}

                    {/* 配置列表 - 长条卡片式布局 */}
                    {/* 配置列表 - 极致长条布局 */}
                    <div className="flex flex-col gap-2">
                        {configs && configs.length > 0 ? (
                            configs.map((config) => {
                                const Icon = config.type === "localfs" ? HardDrive : config.type === "webdav" ? Server : Cloud;
                                return (
                                    <div
                                        key={config.id}
                                        className={cn(
                                            "group relative flex items-center p-2 px-3 transition-all duration-200 hover:shadow-sm border rounded-lg bg-white",
                                            config.isEnabled ? "border-l-4 border-l-green-500 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.1)]" : "border-l-4 border-l-gray-300"
                                        )}
                                    >
                                        {/* 左侧图标容器 */}
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-md mr-3 shrink-0 transition-colors",
                                            config.isEnabled ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>

                                        {/* 信息主区 */}
                                        <div className="flex items-center flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                                <span className="text-sm font-semibold text-gray-700 truncate min-w-20">
                                                    {t(`ui.storage.storageType.${config.type}`)}
                                                </span>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors",
                                                    config.isEnabled
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                )}>
                                                    {config.isEnabled ? <Check className="h-2.5 w-2.5" /> : null}
                                                    {config.isEnabled ? t("ui.common.isEnabled") : t("ui.common.isDisabled")}
                                                </span>
                                            </div>

                                            {/* 访问地址 - 仅宽屏显示且淡化 */}
                                            {config.accessUrlPrefix && (
                                                <div className="hidden lg:flex items-center ml-6 text-xs text-gray-400 truncate max-w-75 shrink overflow-hidden">
                                                    <Share2 className="h-3 w-3 mr-1 opacity-50" />
                                                    <span className="truncate opacity-70 hover:opacity-100 transition-opacity" title={config.accessUrlPrefix}>
                                                        {config.accessUrlPrefix}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 间距占位 */}
                                        <div className="flex-1"></div>

                                        {/* 右侧操作区 - 带垂直分割线 */}
                                        <div className="flex items-center pl-2 ml-2 border-l border-gray-100 space-x-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                                                onClick={() => handleEdit(config.id as string)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"
                                                onClick={() => handleDelete(config.id as string)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-gray-50/50 mt-4">
                                <Cloud className="h-10 w-10 mb-2 opacity-10" />
                                <p className="text-sm opacity-50 font-medium">{t("ui.storage.noStorage")}</p>
                            </div>
                        )}
                    </div>

                    {/* 提示信息 */}
                </div>
            </div>
        </div>
    )
}
