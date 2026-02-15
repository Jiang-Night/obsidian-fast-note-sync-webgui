import { Info, GitBranch, Tag, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { useUpdateCheck } from "@/components/api-handle/use-update-check";
import { useVersion } from "@/components/api-handle/use-version";
import { toast } from "@/components/common/Toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";


export function VersionOverview() {
    const { t } = useTranslation()
    const { versionInfo, isLoading: versionLoading } = useVersion()
    const { checkUpdate, isChecking, updateResult } = useUpdateCheck()

    const handleCheckUpdate = async () => {
        if (versionInfo?.version) {
            const result = await checkUpdate(versionInfo.version)
            if (result) {
                toast.success(result.hasUpdate ? t("newVersionAvailable") : t("alreadyLatest"))
            }
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5 custom-shadow">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("versionInfo")}
            </h2>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{t("githubRepo")}</span>
                </div>
                <a href="https://github.com/haierkeys/fast-note-sync-service" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px] sm:max-w-none">
                    fast-note-sync-service
                </a>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{t("currentVersion")}</span>
                </div>
                <code className="text-sm font-mono text-muted-foreground">
                    {versionLoading ? t("loading") : (versionInfo?.version || t("unknown"))}
                </code>
            </div>
            <div className="border-t border-border" />
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <RefreshCw className={`h-5 w-5 text-muted-foreground ${isChecking ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">{t("checkUpdate")}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCheckUpdate} disabled={isChecking || versionLoading || !versionInfo?.version} className="rounded-xl">
                        {isChecking ? t("checking") : t("checkNow")}
                    </Button>
                </div>
                {updateResult || versionInfo?.versionIsNew ? (
                    <div className={`rounded-xl p-4 ${(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                        <div className="flex items-start gap-3">
                            {(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{(updateResult?.hasUpdate || versionInfo?.versionIsNew) ? t("newVersionAvailable") : t("alreadyLatest")}</span>
                                    {(updateResult?.latestVersion || versionInfo?.versionNewName) && <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">{updateResult?.latestVersion || versionInfo?.versionNewName}</code>}
                                </div>
                                {(updateResult?.hasUpdate || versionInfo?.versionIsNew) && (updateResult?.releaseUrl || versionInfo?.versionNewLink) && (
                                    <a href={updateResult?.releaseUrl || versionInfo?.versionNewLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                        {t("viewRelease")} <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
