import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { storageSchema } from "@/lib/validations/storage-schema"
import { handleStorage } from "@/components/api-handle/storage-handle"
import type { StorageConfig } from "@/lib/types/storage"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface StorageFormProps {
  config?: StorageConfig
  types: Array<string>
  onSubmit: () => void
}

export function StorageForm({ config, types, onSubmit }: StorageFormProps) {
  const { t } = useTranslation()

  const [storageType, setStorageType] = useState<StorageConfig["type"] | undefined>(config?.type)

  const { handleStorageUpdate } = handleStorage()

  // prettier-ignore
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<StorageConfig>({
    resolver: zodResolver(storageSchema),
    defaultValues: config || { isEnabled: true },
  })

  const onFormSubmit = (data: StorageConfig) => {
    if (config) {
      data.id = config.id
    }
    console.log(data)
    handleStorageUpdate(data, () => {
      onSubmit()
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 border px-4 py-10  mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">{t("type")}</Label>
          <Select
            name="type"
            onValueChange={(value) => {
              setValue("type", value as StorageConfig["type"])
              setStorageType(value as StorageConfig["type"])
            }}
            defaultValue={config?.type}>
            <SelectTrigger id="type">
              <SelectValue placeholder={t("selectStorageType")} />
            </SelectTrigger>
            <SelectContent>
              {types.map((type, index) => (
                <SelectItem value={type} key={index}>
                  {t(`${type}Name`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
        {storageType === "oss" && (
          <div className="space-y-2">
            <Label htmlFor="endpoint">{t("endpoint")}</Label>
            <Input id="endpoint" autoComplete="off" {...register("endpoint")} />
            {errors.endpoint && <p className="text-sm text-red-500">{errors.endpoint.message}</p>}
          </div>
        )}
        {storageType === "s3" && (
          <div className="space-y-2">
            <Label htmlFor="region">{t("region")}</Label>
            <Input id="region" autoComplete="off" {...register("region")} />
            {errors.region && <p className="text-sm text-red-500">{errors.region.message}</p>}
          </div>
        )}
        {storageType === "r2" && (
          <div className="space-y-2">
            <Label htmlFor="accountId">{t("accountId")}</Label>
            <Input id="accountId" autoComplete="off" {...register("accountId")} />
            {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
          </div>
        )}
        {storageType === "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="endpoint">{t("webUrl")}</Label>
            <Input id="endpoint" autoComplete="off" {...register("endpoint")} />
            {errors.endpoint && <p className="text-sm text-red-500">{errors.endpoint.message}</p>}
          </div>
        )}
        {storageType === "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="user">{t("webUser")}</Label>
            <Input id="user" autoComplete="off" {...register("user")} />
            {errors.user && <p className="text-sm text-red-500">{errors.user.message}</p>}
          </div>
        )}
        {storageType === "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="password">{t("webPassword")}</Label>
            <Input id="password" autoComplete="off" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
        )}
        {storageType === "minio" && (
          <div className="space-y-2">
            <Label htmlFor="endpoint">{t("endpoint")}</Label>
            <Input id="endpoint" autoComplete="off" {...register("endpoint")} />
            {errors.endpoint && <p className="text-sm text-red-500">{errors.endpoint.message}</p>}
          </div>
        )}
        {storageType !== "localfs" && storageType !== "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="bucketName">{t("bucketName")}</Label>
            <Input id="bucketName" autoComplete="off" {...register("bucketName")} />
            {errors.bucketName && <p className="text-sm text-red-500">{errors.bucketName.message}</p>}
          </div>
        )}
        {storageType !== "localfs" && storageType !== "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">{t("accessKeyId")}</Label>
            <Input id="accessKeyId" autoComplete="off" {...register("accessKeyId")} />
            {errors.accessKeyId && <p className="text-sm text-red-500">{errors.accessKeyId.message}</p>}
          </div>
        )}
        {storageType !== "localfs" && storageType !== "webdav" && (
          <div className="space-y-2">
            <Label htmlFor="accessKeySecret">{t("accessKeySecret")}</Label>
            <Input id="accessKeySecret" autoComplete="off" type="password" {...register("accessKeySecret")} />
            {errors.accessKeySecret && <p className="text-sm text-red-500">{errors.accessKeySecret.message}</p>}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="customPath">{t("customPath")}</Label>
          <Input id="customPath" autoComplete="off" {...register("customPath")} />
          {errors.customPath && <p className="text-sm text-red-500">{errors.customPath.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessUrlPrefix">{t("accessUrlPrefix")}</Label>
          <Input id="accessUrlPrefix" autoComplete="off" {...register("accessUrlPrefix")} />
          {errors.accessUrlPrefix && <p className="text-sm text-red-500">{errors.accessUrlPrefix.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {config ? <Checkbox id="isEnabled" name="isEnabled" defaultChecked={config?.isEnabled ? true : false} onCheckedChange={(checked) => setValue("isEnabled", Boolean(checked))} /> : <Checkbox id="isEnabled" name="isEnabled" defaultChecked={true} onCheckedChange={(checked) => setValue("isEnabled", Boolean(checked))} />}

        <Label htmlFor="isEnabled">{t("isEnabled")}</Label>
      </div>

      <Button type="submit" className="w-full">
        {config ? t("save") : t("add")}
      </Button>
    </form>
  )
}
