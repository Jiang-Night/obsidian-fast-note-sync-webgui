import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { StorageConfig } from "@/lib/types/storage";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import env from "@/env.ts";


/**
 * 存储配置 API 处理钩子
 */
export function useStorageHandle() {
    const { t } = useTranslation()
    const { openConfirmDialog } = useConfirmDialog()
    const token = localStorage.getItem("token")!

    /**
     * 获取当前语言
     */
    const getLang = () => {
        return localStorage.getItem("i18nextLng") || "zh-CN"
    }

    /**
     * 获取存储配置列表
     */
    const handleStorageList = useCallback(async (callback: (list: StorageConfig[]) => void) => {
        try {
            const response = await fetch(env.API_URL + "/api/storage?limit=100", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Domain: window.location.origin,
                    Token: token,
                    Lang: getLang(),
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
            openConfirmDialog(t("api.storage.list.error") + ": " + error, "error")
        }
    }, [token, openConfirmDialog, t])

    /**
     * 删除存储配置
     */
    const handleStorageDelete = async (id: string) => {
        try {
            const response = await fetch(env.API_URL + "/api/storage", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: {
                    "Content-Type": "application/json",
                    Domain: window.location.origin,
                    Token: token,
                    Lang: getLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                openConfirmDialog(res.message || t("api.storage.delete.success"), "success")
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.delete.error") + ": " + error, "error")
        }
    }

    /**
     * 新增或更新存储配置
     */
    const handleStorageUpdate = async (data: StorageConfig, callback: (data: StorageConfig) => void) => {
        try {
            const formData = {
                ...data,
                isEnabled: data.isEnabled ? 1 : 0
            }

            const response = await fetch(env.API_URL + "/api/storage", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                    Domain: window.location.origin,
                    Token: token,
                    Lang: getLang(),
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const res = await response.json()
            if (res.code < 100 && res.code > 0) {
                openConfirmDialog(res.message, "success")
                data.id = res.data
                callback(data)
            } else {
                openConfirmDialog(res.message + ": " + res.details, "error")
            }
        } catch (error) {
            openConfirmDialog(t("api.storage.save.error") + ": " + error, "error")
        }
    }

    /**
     * 获取支持的存储类型
     */
    const handleStorageTypes = async (callback: (types: string[]) => void) => {
        try {
            const response = await fetch(env.API_URL + "/api/storage/enabled_types", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Domain: window.location.origin,
                    Token: token,
                    Lang: getLang(),
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
            openConfirmDialog(t("api.storage.types.error") + ": " + error, "error")
        }
    }

    return {
        handleStorageList,
        handleStorageDelete,
        handleStorageUpdate,
        handleStorageTypes,
    }
}
