import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { Checkbox } from "@/components/ui/checkbox";
import { getBrowserLang } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import env from "@/env.ts";


interface SystemConfig {
    fontSet: string
    registerIsEnable: boolean
    fileChunkSize: string
    softDeleteRetentionTime: string
    uploadSessionTimeout: string
    adminUid: number
}

export function SystemSettings({ onBack }: { onBack?: () => void }) {
    const { t } = useTranslation()
    const { openConfirmDialog } = useConfirmDialog()
    const [config, setConfig] = useState<SystemConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const token = localStorage.getItem("token")

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true)
            try {
                const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/config"), {
                    headers: {
                        Token: token || "",
                        Lang: getBrowserLang(),
                    },
                })
                const res = await response.json()
                if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                    setConfig(res.data)
                } else {
                    openConfirmDialog(res.message || t("error"), "error", onBack)
                }
            } catch {
                openConfirmDialog(t("error"), "error", onBack)
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [token, openConfirmDialog, t, onBack])

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/config"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Token: token || "",
                    Lang: getBrowserLang(),
                },
                body: JSON.stringify(config),
            })
            const res = await response.json()
            if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                openConfirmDialog(t("saveSuccess"), "success")
            } else {
                openConfirmDialog(res.message || t("saveFailed"), "error", onBack)
            }
        } catch {
            openConfirmDialog(t("saveFailed"), "error", onBack)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">{t("loading")}</div>
    }

    if (!config) {
        return <div className="p-8 text-center text-red-500">{t("error")}</div>
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("systemSettings")}</CardTitle>
                    <CardDescription>管理同步服务的全局配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fontSet">{t("fontSet")}</Label>
                        <Input
                            id="fontSet"
                            value={config.fontSet}
                            onChange={(e) => setConfig({ ...config, fontSet: e.target.value })}
                            placeholder="e.g. /static/fonts/font.woff2 or local"
                        />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("fontSetDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="registerIsEnable"
                                checked={config.registerIsEnable}
                                onCheckedChange={(checked) => setConfig({ ...config, registerIsEnable: !!checked })}
                            />
                            <Label htmlFor="registerIsEnable">{t("registerIsEnable")}</Label>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("registerIsEnableDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fileChunkSize">{t("fileChunkSize")}</Label>
                        <Input
                            id="fileChunkSize"
                            value={config.fileChunkSize}
                            onChange={(e) => setConfig({ ...config, fileChunkSize: e.target.value })}
                            placeholder="e.g. 1MB, 512KB"
                        />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("fileChunkSizeDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="softDeleteRetentionTime">{t("softDeleteRetentionTime")}</Label>
                        <Input
                            id="softDeleteRetentionTime"
                            value={config.softDeleteRetentionTime}
                            onChange={(e) => setConfig({ ...config, softDeleteRetentionTime: e.target.value })}
                            placeholder="e.g. 30d, 24h"
                        />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("softDeleteRetentionTimeDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="uploadSessionTimeout">{t("uploadSessionTimeout")}</Label>
                        <Input
                            id="uploadSessionTimeout"
                            value={config.uploadSessionTimeout}
                            onChange={(e) => setConfig({ ...config, uploadSessionTimeout: e.target.value })}
                            placeholder="e.g. 1h, 30m"
                        />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("uploadSessionTimeoutDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminUid">{t("adminUid")}</Label>
                        <Input
                            id="adminUid"
                            type="number"
                            value={config.adminUid}
                            onChange={(e) => setConfig({ ...config, adminUid: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{t("adminUidDesc")}</p>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSave} disabled={saving} className="w-full">
                            {saving ? t("submitting") : t("save")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
