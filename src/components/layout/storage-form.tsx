import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStorageHandle } from "@/components/api-handle/storage-handle";
import { createStorageSchema } from "@/lib/validations/storage-schema";
import type { StorageConfig } from "@/lib/types/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";


interface StorageFormProps {
    /** 现有配置(编辑模式) */
    config?: StorageConfig
    /** 支持的存储类型列表 */
    types: Array<string>
    /** 提交成功回调 */
    onSubmit: () => void
    /** 取消回调 */
    onCancel?: () => void
}

/**
 * 云存储配置表单组件
 */
export function StorageForm({ config, types, onSubmit, onCancel }: StorageFormProps) {
    const { t } = useTranslation()

    const [storageType, setStorageType] = useState<StorageConfig["type"] | undefined>(config?.type)

    const { handleStorageUpdate } = useStorageHandle()

    const schema = useMemo(() => createStorageSchema(t), [t])

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<StorageConfig>({
        resolver: zodResolver(schema),
        defaultValues: config || { isEnabled: true },
    })

    // ESC 键取消
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && onCancel) {
                e.preventDefault()
                onCancel()
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onCancel])

    const onFormSubmit = (data: StorageConfig) => {
        if (config) {
            data.id = config.id
        }
        handleStorageUpdate(data, () => {
            onSubmit()
        })
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {/* 存储类型 */}
                <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.type")}</Label>
                    <Select
                        name="type"
                        onValueChange={(value) => {
                            setValue("type", value as StorageConfig["type"])
                            setStorageType(value as StorageConfig["type"])
                        }}
                        defaultValue={config?.type}>
                        <SelectTrigger id="type" className="bg-background border-input focus:ring-primary/20">
                            <SelectValue placeholder={t("ui.storage.selectType")} />
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type, index) => (
                                <SelectItem value={type} key={index}>
                                    {t(`ui.storage.storageType.${type}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.type.message}</p>}
                </div>

                {/* OSS 端点 */}
                {storageType === "oss" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="endpoint" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.endpoint")}</Label>
                        <Input id="endpoint" autoComplete="off" placeholder={t("ui.storage.placeholder.endpoint.oss")} className="bg-background border-input" {...register("endpoint")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.endpoint.oss")}</p>
                        {errors.endpoint && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.endpoint.message}</p>}
                    </div>
                )}

                {/* 区域 (S3 和 MinIO) */}
                {(storageType === "s3" || storageType === "minio") && (
                    <div className="space-y-1.5">
                        <Label htmlFor="region" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.region")}</Label>
                        <Input id="region" autoComplete="off" placeholder={t("ui.storage.placeholder.region")} className="bg-background border-input" {...register("region")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.region")}</p>
                        {errors.region && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.region.message}</p>}
                    </div>
                )}

                {/* R2 账户 ID */}
                {storageType === "r2" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="accountId" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.accountId")}</Label>
                        <Input id="accountId" autoComplete="off" placeholder={t("ui.storage.placeholder.accountId")} className="bg-background border-input" {...register("accountId")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.accountId")}</p>
                        {errors.accountId && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.accountId.message}</p>}
                    </div>
                )}

                {/* WebDAV URL */}
                {storageType === "webdav" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="endpoint" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.webdavUrl")}</Label>
                        <Input id="endpoint" autoComplete="off" placeholder={t("ui.storage.placeholder.webdavUrl")} className="bg-background border-input" {...register("endpoint")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.webdavUrl")}</p>
                        {errors.endpoint && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.endpoint.message}</p>}
                    </div>
                )}

                {/* WebDAV 用户名 */}
                {storageType === "webdav" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="user" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.webdavUser")}</Label>
                        <Input id="user" autoComplete="off" placeholder={t("ui.storage.placeholder.webdavUser")} className="bg-background border-input" {...register("user")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.webdavUser")}</p>
                        {errors.user && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.user.message}</p>}
                    </div>
                )}

                {/* WebDAV 密码 */}
                {storageType === "webdav" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.webdavPassword")}</Label>
                        <Input id="password" type="text" placeholder={t("ui.storage.placeholder.webdavPassword")} className="bg-background border-input no-password-prompt" {...register("password")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.webdavPassword")}</p>
                        {errors.password && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.password.message}</p>}
                    </div>
                )}

                {/* MinIO 端点 */}
                {storageType === "minio" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="endpoint" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.endpoint")}</Label>
                        <Input id="endpoint" autoComplete="off" placeholder={t("ui.storage.placeholder.endpoint.minio")} className="bg-background border-input" {...register("endpoint")} />
                        <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.endpoint.minio")}</p>
                        {errors.endpoint && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.endpoint.message}</p>}
                    </div>
                )}

                {/* 存储桶名称 (非 LocalFS 和 WebDAV) */}
                {storageType !== "localfs" && storageType !== "webdav" && storageType !== undefined && (
                    <div className="space-y-1.5">
                        <Label htmlFor="bucketName" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.bucketName")}</Label>
                        <Input id="bucketName" autoComplete="off" placeholder={t("ui.storage.placeholder.bucketName")} className="bg-background border-input" {...register("bucketName")} />
                        {errors.bucketName && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.bucketName.message}</p>}
                    </div>
                )}


                {/* Access Key ID (非 LocalFS 和 WebDAV) */}
                {storageType !== "localfs" && storageType !== "webdav" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="accessKeyId" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.accessKeyId")}</Label>
                        <Input id="accessKeyId" autoComplete="off" placeholder={t("ui.storage.placeholder.accessKeyId")} className="bg-background border-input" {...register("accessKeyId")} />
                        {errors.accessKeyId && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.accessKeyId.message}</p>}
                    </div>
                )}

                {/* Access Key Secret (非 LocalFS 和 WebDAV) */}
                {storageType !== "localfs" && storageType !== "webdav" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="accessKeySecret" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.accessKeySecret")}</Label>
                        <Input id="accessKeySecret" type="text" placeholder={t("ui.storage.placeholder.accessKeySecret")} className="bg-background border-input no-password-prompt" {...register("accessKeySecret")} />
                        {errors.accessKeySecret && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.accessKeySecret.message}</p>}
                    </div>
                )}

                {/* 自定义路径 (所有类型) */}
                <div className="space-y-1.5">
                    <Label htmlFor="customPath" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.customPath")}</Label>
                    <Input id="customPath" autoComplete="off" placeholder={t("ui.storage.placeholder.customPath")} className="bg-background border-input" {...register("customPath")} />
                    <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.customPath")}</p>
                    {errors.customPath && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.customPath.message}</p>}
                </div>


                {/* 访问 URL 前缀 */}
                <div className="space-y-1.5">
                    <Label htmlFor="accessUrlPrefix" className="text-xs font-semibold text-muted-foreground ml-1">{t("ui.storage.accessUrlPrefix")}</Label>
                    <Input id="accessUrlPrefix" autoComplete="off" placeholder={t("ui.storage.placeholder.accessUrlPrefix")} className="bg-background border-input" {...register("accessUrlPrefix")} />
                    <p className="text-[11px] text-muted-foreground ml-1">{t("ui.storage.help.accessUrlPrefix")}</p>
                    {errors.accessUrlPrefix && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.accessUrlPrefix.message}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
                {/* 是否启用 */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isEnabled"
                        name="isEnabled"
                        defaultChecked={config ? (config.isEnabled ? true : false) : true}
                        onCheckedChange={(checked) => setValue("isEnabled", Boolean(checked))}
                        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="isEnabled" className="text-sm font-medium text-foreground">{t("ui.common.isEnabled")}</Label>
                </div>

                <div className="flex items-center gap-3">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            {t("ui.common.cancel")}
                        </Button>
                    )}
                    <Button type="submit" size="sm" className="px-8 rounded-lg shadow-sm">
                        {config ? t("ui.common.save") : t("ui.common.add")}
                    </Button>
                </div>
            </div>
        </form>
    )
}
