import { GitBranch, UserPlus, HardDrive, Trash2, Clock, Shield, Loader2, Type, Lock, Save, Settings } from "lucide-react";
import { addCacheBuster } from "@/lib/utils/cache-buster";
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/common/Toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getBrowserLang } from "@/i18n/utils";
import env from "@/env.ts";

import { VersionOverview } from "./version-overview";
import { Overview } from "./overview";


interface SystemConfig {
    fontSet: string
    authTokenKey: string
    tokenExpiry: string
    shareTokenKey: string
    shareTokenExpiry: string
    registerIsEnable: boolean
    fileChunkSize: string
    softDeleteRetentionTime: string
    uploadSessionTimeout: string
    historyKeepVersions: number
    historySaveDelay: string
    adminUid: number
}

export function SystemSettings({ onBack, isDashboard = false }: { onBack?: () => void, isDashboard?: boolean }) {
    const { t } = useTranslation()
    const [config, setConfig] = useState<SystemConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const token = localStorage.getItem("token")

    const parseDurationToSeconds = (duration: string): number | null => {
        if (!duration) return null
        const match = duration.match(/^(\d+)(s|m|h|d)$/)
        if (!match) return null
        const value = parseInt(match[1])
        const unit = match[2]
        switch (unit) {
            case 's': return value
            case 'm': return value * 60
            case 'h': return value * 3600
            case 'd': return value * 86400
            default: return null
        }
    }

    const updateConfig = useCallback((updates: Partial<SystemConfig>) => {
        setConfig(prev => prev ? { ...prev, ...updates } : null)
    }, [])

    const handleSaveConfig = async () => {
        if (!config) return
        if (config.historyKeepVersions < 100) {
            toast.error(t("ui.settings.historyKeepVersionsMinError"))
            return
        }
        if (config.historySaveDelay) {
            const seconds = parseDurationToSeconds(config.historySaveDelay)
            if (seconds === null) {
                toast.error(t("ui.settings.historySaveDelayFormatError"))
                return
            }
            if (seconds < 10) {
                toast.error(t("ui.settings.historySaveDelayMinError"))
                return
            }
        }
        setSaving(true)
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/config"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    Lang: getBrowserLang(),
                },
                body: JSON.stringify(config),
            })
            const res = await response.json()
            if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                toast.success(t("ui.settings.saveSuccess"))
            } else {
                toast.error(res.message || t("ui.settings.saveFailed"))
            }
        } catch {
            toast.error(t("ui.settings.saveFailed"))
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true)
            try {
                const response = await fetch(addCacheBuster(env.API_URL + "/api/admin/config"), {
                    headers: { "Authorization": `Bearer ${token}`, Lang: getBrowserLang() },
                })
                const res = await response.json()
                if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                    setConfig(res.data)
                } else {
                    toast.error(res.message || t("ui.common.error"))
                    if (!config) onBack?.()
                }
            } catch {
                toast.error(t("ui.common.error"))
                if (!config) onBack?.()
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [onBack, t, token])

    if (loading) return <div className="p-8 text-center">{t("ui.common.loading")}</div>
    if (!config) return <div className="p-8 text-center text-destructive">{t("ui.common.error")}</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 md:pb-4">
            {/* 左列 */}
            <div className="flex flex-col gap-4">
                {isDashboard ? (
                    /* 概况页左侧占位 Box */
                    <div className="rounded-xl border border-border bg-card p-6 min-h-[400px] flex items-center justify-center custom-shadow">
                        <div className="text-muted-foreground text-sm italic">{t("ui.common.comingSoon")}</div>
                    </div>
                ) : (
                    <>
                        {/* 版本信息 */}
                        <VersionOverview />

                        {/* 服务器系统信息 */}
                        <Overview />
                    </>
                )}
            </div>

            {/* 右列 */}
            <div className="flex flex-col gap-4">
                {isDashboard ? (
                    /* 概况页右侧占位 Box */
                    <div className="rounded-xl border border-border bg-card p-6 min-h-[400px] flex items-center justify-center custom-shadow">
                        <div className="text-muted-foreground text-sm italic">{t("ui.common.comingSoon")}</div>
                    </div>
                ) : (
                    <>
                        {/* 系统配置卡片群 */}
                        <div className="rounded-xl border border-border bg-card p-6 space-y-5 custom-shadow">
                            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                {t("ui.settings.systemConfig")}
                            </h2>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Type className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.fontSet")}</span>
                                </div>
                                <Input value={config.fontSet} onChange={(e) => updateConfig({ fontSet: e.target.value })} placeholder="e.g. /static/fonts/font.css" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.fontSetDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.authTokenKey")}</span>
                                </div>
                                <Input value={config.authTokenKey} onChange={(e) => updateConfig({ authTokenKey: e.target.value })} placeholder="e.g. token" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.authTokenKeyDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.tokenExpiry")}</span>
                                </div>
                                <Input value={config.tokenExpiry} onChange={(e) => updateConfig({ tokenExpiry: e.target.value })} placeholder="e.g. 365d, 24h, 30m" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.tokenExpiryDesc") }} />
                            </div>
                            <div className="border-t border-border" />


                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.shareTokenKey")}</span>
                                </div>
                                <Input value={config.shareTokenKey} onChange={(e) => updateConfig({ shareTokenKey: e.target.value })} placeholder="e.g. fns" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.shareTokenKeyDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.shareTokenExpiry")}</span>
                                </div>
                                <Input value={config.shareTokenExpiry} onChange={(e) => updateConfig({ shareTokenExpiry: e.target.value })} placeholder="e.g. 30d, 24h, 30m" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.shareTokenExpiryDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.registerIsEnable")}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="registerIsEnable" checked={config.registerIsEnable} onCheckedChange={(checked) => updateConfig({ registerIsEnable: !!checked })} />
                                    <Label htmlFor="registerIsEnable" className="text-sm">{config.registerIsEnable ? t("ui.common.isEnabled") : t("ui.common.close")}</Label>
                                </div>
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.registerIsEnableDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.adminUid")}</span>
                                </div>
                                <Input type="number" value={config.adminUid} onChange={(e) => updateConfig({ adminUid: parseInt(e.target.value) || 0 })} placeholder="e.g. 1" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.adminUidDesc") }} />
                            </div>
                            <div className="border-t border-border" />


                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <HardDrive className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.fileChunkSize")}</span>
                                </div>
                                <Input value={config.fileChunkSize} onChange={(e) => updateConfig({ fileChunkSize: e.target.value })} placeholder="e.g. 1MB, 512KB" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.fileChunkSizeDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.softDeleteRetentionTime")}</span>
                                </div>
                                <Input value={config.softDeleteRetentionTime} onChange={(e) => updateConfig({ softDeleteRetentionTime: e.target.value })} placeholder="e.g. 30d, 24h" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.softDeleteRetentionTimeDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.uploadSessionTimeout")}</span>
                                </div>
                                <Input value={config.uploadSessionTimeout} onChange={(e) => updateConfig({ uploadSessionTimeout: e.target.value })} placeholder="e.g. 1h, 30m" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.uploadSessionTimeoutDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.historyKeepVersions")}</span>
                                </div>
                                <Input type="number" min="100" value={config.historyKeepVersions} onChange={(e) => updateConfig({ historyKeepVersions: parseInt(e.target.value) || 100 })} placeholder="e.g. 100" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.historyKeepVersionsDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{t("ui.settings.historySaveDelay")}</span>
                                </div>
                                <Input value={config.historySaveDelay} onChange={(e) => updateConfig({ historySaveDelay: e.target.value })} placeholder="e.g. 10s, 1m" className="rounded-xl" />
                                <p className="text-xs text-muted-foreground whitespace-pre-line" dangerouslySetInnerHTML={{ __html: t("ui.settings.historySaveDelayDesc") }} />
                            </div>

                            <div className="border-t border-border" />

                            <Button onClick={handleSaveConfig} disabled={saving} className="w-full rounded-xl">
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("ui.auth.submitting")}</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" />{t("ui.settings.saveSettings")}</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
