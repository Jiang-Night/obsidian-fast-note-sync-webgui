import { BackupConfig, BackupHistory, BackupConfigRequest } from "@/lib/types/backup";
import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { toast } from "@/components/common/Toast";
import { getBrowserLang } from "@/i18n/utils";
import { useCallback, useMemo } from "react";
import env from "@/env.ts";


/**
 * 备份管理 API 处理钩子
 */
export function useBackupHandle() {
    const { openConfirmDialog } = useConfirmDialog()
    const token = localStorage.getItem("token")!

    /**
     * 获取备份配置列表
     */
    const handleBackupConfigList = useCallback(async (callback: (list: BackupConfig[]) => void) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/backup/configs"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Domain: window.location.origin,
                    Lang: getBrowserLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                callback(res.data || [])
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog("获取备份配置列表失败: " + error, "error")
        }
    }, [token, openConfirmDialog])

    /**
     * 删除备份配置
     */
    const handleBackupConfigDelete = useCallback(async (id: number) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + `/api/backup/config?id=${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    Domain: window.location.origin,
                    Lang: getBrowserLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                toast.success("删除成功")
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog("删除备份配置失败: " + error, "error")
        }
    }, [token, openConfirmDialog])

    /**
     * 新增或更新备份配置
     */
    const handleBackupConfigUpdate = useCallback(async (data: BackupConfigRequest, callback: (data: BackupConfig) => void) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/backup/config"), {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Domain: window.location.origin,
                    Lang: getBrowserLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                toast.success(res.message || "保存成功")
                callback(res.data)
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog("保存备份配置失败: " + error, "error")
        }
    }, [token, openConfirmDialog])

    /**
     * 手动触发备份执行
     */
    const handleBackupExecute = useCallback(async (id: number) => {
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/backup/execute"), {
                method: "POST",
                body: JSON.stringify({ id }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Domain: window.location.origin,
                    Lang: getBrowserLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                toast.success(res.message || "手动触发成功")
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog("触发备份失败: " + error, "error")
        }
    }, [token, openConfirmDialog])

    /**
     * 获取备份历史记录
     */
    /**
     * 获取备份历史记录
     */
    /**
     * 获取备份历史记录
     */
    const handleBackupHistory = useCallback(async (page: number, pageSize: number, configId: number, callback?: (data: { list: BackupHistory[], total: number }) => void) => {
        try {
            const url = env.API_URL + `/api/backup/historys?page=${page}&pageSize=${pageSize}&configId=${configId}`;

            const response = await fetch(addCacheBuster(url), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Domain: window.location.origin,
                    Lang: getBrowserLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                if (callback) {
                    // 兼容处理：文档显示返回 Array，但也可能返回 ListRes
                    if (res.data && Array.isArray(res.data)) {
                        // 如果没有返回 total，则标记为 -1，由 UI 处理分页逻辑
                        callback({ list: res.data, total: res.total ?? -1 })
                    } else if (res.data && res.data.list) {
                        const total = res.data.pager?.totalRows ?? res.data.total ?? 0;
                        callback({ list: res.data.list, total })
                    } else {
                        callback({ list: [], total: 0 })
                    }
                }
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog("获取备份历史失败: " + error, "error")
        }
    }, [token, openConfirmDialog])

    return useMemo(() => ({
        handleBackupConfigList,
        handleBackupConfigDelete,
        handleBackupConfigUpdate,
        handleBackupExecute,
        handleBackupHistory,
    }), [
        handleBackupConfigList,
        handleBackupConfigDelete,
        handleBackupConfigUpdate,
        handleBackupExecute,
        handleBackupHistory,
    ])
}
