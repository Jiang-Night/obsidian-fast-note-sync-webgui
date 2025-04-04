import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CirclePlus, Pencil, Trash2, Check, User, LogOut, Clipboard, Info } from "lucide-react";
import { useConfirmDialog } from "@/components/context/confirm-dialog-context";
import { StorageConfig, StorageTypeValue } from "@/lib/types/storage";
import { handleVault } from "@/components/api-handle/vault-handle";
import { ChangePassword } from "@/components/user/change-password";
import { handleUser } from "@/components/api-handle/user-handle";
import { Cloudflare, Aws, AlibabaCloud } from "@lobehub/icons";
import { useAuth } from "@/components/context/auth-context";
import { StorageForm } from "@/components/vault/vault-form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import env from "@/env.ts";


export function VaultList() {
  useEffect(() => {
    handleUserInfo(logout)
  }, [])

  // 语言包
  const { t } = useTranslation()

  const { handleUserInfo } = handleUser()
  const { logout } = useAuth()

  const [configs, setConfigs] = useState<StorageConfig[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false) // 新增状态：是否显示新增表单
  const [storageTypes, setStorageTypes] = useState<string[]>(StorageTypeValue)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false) // 新增状态控制弹出窗口

  const closeChangePassword = () => {
    setIsChangePasswordOpen(false)
  }

  const username = localStorage.getItem("username")

  const { openConfirmDialog } = useConfirmDialog() // 使用 useContext 来获取上下文值

  const { handleVaultList, handleVaultDelete } = handleVault()

  const reloadList = async () => {
    handleVaultList(setConfigs)
  }

  const handleAdd = async () => {
    await reloadList()
    setIsAdding(false) // 关闭新增表单
  }

  const handleEdit = async (id: string | null) => {
    await handleCancelEdit()
    setEditingId(id) // 设置编辑ID
  }
  const handleSaveEdit = async () => {
    await reloadList()
    setEditingId(null) // 关闭编辑表单
  }
  const handleCancelEdit = () => {
    setEditingId(null) // 关闭编辑表单
  }
  const handleDelete = async (id: string) => {
    openConfirmDialog(t("confirmDelete"), "confirm", async () => {
      setConfigs(configs.filter((config) => config.id !== id))
      handleStorageDelete(id)
    })
  }

  const ShowLink: React.FC<{ url: string; maxLength?: number }> = ({ url, maxLength = 25 }) => {
    const hasProtocol = /^(https?:\/\/)/i.test(url)
    const safeUrl = hasProtocol ? url : `https://${url}`

    // Function to truncate the URL if it exceeds the maxLength
    const truncateUrl = (url: string, maxLength: number): string => {
      if (url.length <= maxLength) {
        return url
      }
      // Try to find a good place to truncate, such as after a slash
      const lastSlashIndex = url.lastIndexOf("/", maxLength)
      if (lastSlashIndex !== -1 && lastSlashIndex > 10) {
        // Ensure we don't truncate too early
        return url.substring(0, lastSlashIndex) + "..."
      }
      return url.substring(0, maxLength - 3) + "..."
    }

    const truncatedSafeUrl = truncateUrl(safeUrl, maxLength)

    return (
      <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline " title={safeUrl}>
        {truncatedSafeUrl}
      </a>
    )
  }

  const ShowPath: React.FC<{ path: string | undefined }> = ({ path }) => {
    path = path ? "/" + path.trim().replace(/^\/|\/$/g, "") + "/" : ""

    return <span className="text-teal-500">{path}</span>
  }

  const handleCopyConfig = () => {
    const config = {
      api: env.API_URL,
      apiToken: localStorage.getItem("token")!,
      vault: "defaultVault",
    }

    const configText = JSON.stringify(config, null, 2)

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(configText)
        .then(() => {
          openConfirmDialog(
            t("copyConfigSuccess"),
            "success",
            undefined,
            <textarea readOnly className="mt-1 block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none h-52">
              {configText}
            </textarea>
          )
        })
        .catch((err) => {
          openConfirmDialog(t("error") + err)
        })
    } else {
      openConfirmDialog(
        t("error") + t("copyConfigError"),
        "error",
        undefined,
        <textarea readOnly className="mt-1 block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none h-52">
          {configText}
        </textarea>
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">{t("VaultListName")}</h2>
          <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => setIsAdding(true)}>
            <CirclePlus className="h-4 w-4" />
            {t("add")}
          </Button>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4" />

          <span className="text-sm ml-1">{username},</span>
          <Button className="p-0 m-0 ml-2" onClick={() => setIsChangePasswordOpen(true)} variant="link">
            修改密码
          </Button>
          <Button className="p-0 m-0 ml-2" variant="link" onClick={logout}>
            {t("logout")}
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 弹出窗口修改密码 */}
      {isChangePasswordOpen && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex w-full">
            <h3 className="font-bold">{t("changePassword")}</h3>
            <Button className="flex items-center  ml-auto" variant="link" onClick={() => setIsChangePasswordOpen(false)}>
              {t("close")}
            </Button>
          </div>
          <ChangePassword close={closeChangePassword} />
        </div>
      )}

      {/* 新增表单 */}
      {isAdding && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex w-full">
            <h3 className="font-bold">{t("addStorage")}</h3>
            <Button className="flex items-center  ml-auto" variant="link" onClick={() => setIsAdding(false)}>
              {t("close")}
            </Button>
          </div>
          <StorageForm types={storageTypes} onSubmit={handleAdd} />
        </div>
      )}

      {/* 编辑表单 */}
      {editingId && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex w-full">
            <h3 className="font-bold">{t("editStorage")}</h3>
            <Button className="flex items-center ml-auto" variant="link" onClick={() => setEditingId(null)}>
              {t("close")}
            </Button>
          </div>
          <StorageForm types={storageTypes} config={configs.find((c) => c.id === editingId)} onSubmit={handleSaveEdit} />
        </div>
      )}

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">{t("actions")}</TableHead>
            <TableHead>{t("type")}</TableHead>
            <TableHead>{t("isEnabled")}</TableHead>
            <TableHead>{t("accessUrlPrefix")}</TableHead>
            <TableHead>{t("customPath")}</TableHead>
            <TableHead>{t("bucketName")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs &&
            configs.map((config) => (
              <TableRow key={config.id} className={config.isEnabled ? "bg-green-100" : ""}>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" className="text-gray-400 p-0 m-0" size="sm" onClick={() => handleEdit(config.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 p-0 m-0" onClick={() => handleDelete(config.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell title={t(config.type + "Desc")}>
                  {config.type.toLowerCase() === "s3" ? <Aws size={18} className="flex float-left mr-2 text-blue-500" /> : ""}
                  {config.type.toLowerCase() === "r2" ? <Cloudflare size={18} className="flex float-left mr-2 text-blue-500" /> : ""}
                  {config.type.toLowerCase() === "oss" ? <AlibabaCloud size={18} className="flex float-left mr-2 text-blue-500" /> : ""}
                  {config.type.toLowerCase() === "minio" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="50px" height="18px" viewBox="0 0 122 18" className="flex float-left mr-2 text-blue-500">
                      <g id="surface1">
                        <path
                          style={{
                            stroke: "none",
                            fillRule: "nonzero",
                            fill: "rgb(78.039217%,17.254902%,28.235295%)",
                            fillOpacity: 1,
                          }}
                          d="M 40.035156 0.304688 L 46.722656 0.304688 L 46.722656 17.691406 L 40.035156 17.691406 Z M 31.929688 0.542969 L 18.351562 7.84375 C 18.15625 7.945312 17.921875 7.945312 17.722656 7.84375 L 4.148438 0.542969 C 3.851562 0.386719 3.519531 0.304688 3.179688 0.304688 L 3.164062 0.304688 C 2.199219 0.246094 1.371094 0.976562 1.300781 1.941406 L 1.300781 17.671875 L 7.984375 17.671875 L 7.984375 10.183594 C 8.007812 9.957031 8.148438 9.757812 8.355469 9.65625 C 8.5625 9.554688 8.804688 9.5625 9 9.683594 L 16.609375 13.777344 C 17.371094 14.183594 18.285156 14.191406 19.058594 13.800781 L 27.085938 9.65625 C 27.28125 9.539062 27.523438 9.53125 27.726562 9.636719 C 27.929688 9.738281 28.066406 9.9375 28.089844 10.160156 L 28.089844 17.671875 L 34.773438 17.671875 L 34.773438 1.941406 C 34.703125 0.980469 33.878906 0.25 32.914062 0.304688 L 32.898438 0.304688 C 32.558594 0.304688 32.226562 0.386719 31.929688 0.542969 Z M 80.066406 0.304688 L 73.285156 0.304688 L 73.285156 8.21875 C 73.261719 8.4375 73.128906 8.632812 72.933594 8.738281 C 72.734375 8.84375 72.5 8.84375 72.304688 8.738281 L 54.726562 0.496094 C 54.453125 0.371094 54.152344 0.304688 53.851562 0.304688 L 53.839844 0.304688 C 52.875 0.246094 52.046875 0.976562 51.980469 1.941406 L 51.980469 17.671875 L 58.707031 17.671875 L 58.707031 9.765625 C 58.730469 9.546875 58.863281 9.351562 59.058594 9.246094 C 59.257812 9.140625 59.492188 9.140625 59.6875 9.246094 L 77.332031 17.488281 C 77.605469 17.613281 77.90625 17.679688 78.207031 17.679688 C 79.167969 17.734375 80 17.003906 80.066406 16.039062 Z M 85.324219 17.691406 L 85.324219 0.304688 L 88.402344 0.304688 L 88.402344 17.691406 Z M 106.511719 18 C 98.234375 18 92.363281 14.542969 92.363281 9 C 92.363281 3.488281 98.269531 0 106.511719 0 C 114.753906 0 120.699219 3.457031 120.699219 9 C 120.699219 14.542969 114.894531 18 106.511719 18 Z M 106.511719 2.304688 C 100.359375 2.304688 95.617188 4.671875 95.617188 9 C 95.617188 13.359375 100.359375 15.695312 106.511719 15.695312 C 112.667969 15.695312 117.441406 13.359375 117.441406 9 C 117.441406 4.671875 112.667969 2.304688 106.511719 2.304688 Z M 106.511719 2.304688 "
                        />
                      </g>
                    </svg>
                  ) : (
                    ""
                  )}
                  {config.type.toLowerCase() === "localfs" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18px" height="18px" viewBox="0 0 18 18" className="flex float-left mr-2 text-blue-500">
                      <g id="surface1">
                        <path
                          style={{
                            stroke: "none",
                            fillRule: "nonzero",
                            fill: "rgb(62.7451%,80.784315%,78.039217%)",
                            fillOpacity: 1,
                          }}
                          d="M 15.695312 1.65625 L 0.289062 11.089844 L 2.230469 1.871094 "
                        />
                        <path
                          style={{
                            stroke: "none",
                            fillRule: "nonzero",
                            fill: "rgb(0.784314%,0.784314%,0.784314%)",
                            fillOpacity: 1,
                          }}
                          d="M 15.625 1.945312 L 17.351562 11.160156 L 17.351562 16.34375 L 0.574219 16.34375 L 0.574219 11.089844 L 2.304688 1.945312 L 15.625 1.945312 M 15.695312 1.367188 L 2.304688 1.367188 C 1.945312 1.367188 1.800781 1.585938 1.65625 1.945312 L 0 11.089844 L 0 16.34375 C 0 16.777344 0.359375 16.921875 0.648438 16.921875 L 17.566406 16.921875 C 18.070312 16.921875 18.070312 16.558594 18.070312 16.34375 L 18.070312 11.089844 L 16.199219 1.945312 C 16.128906 1.511719 16.054688 1.367188 15.695312 1.367188 Z M 15.695312 1.367188 "
                        />
                        <path
                          style={{
                            fill: "none",
                            strokeWidth: 0.496,
                            strokeLinecap: "butt",
                            strokeLinejoin: "miter",
                            stroke: "rgb(0.784314%,0.784314%,0.784314%)",
                            strokeOpacity: 1,
                            strokeMiterlimit: 10,
                          }}
                          d="M 23.502604 21.500651 C 23.502604 21.701389 23.301866 21.902127 23.101128 21.902127 L 1.898872 21.902127 C 1.698134 21.902127 1.497396 21.701389 1.497396 21.500651 L 1.497396 16.997613 C 1.497396 16.8023 1.698134 16.601562 1.898872 16.601562 L 23.101128 16.601562 C 23.301866 16.601562 23.502604 16.8023 23.502604 16.997613 Z M 23.502604 21.500651 "
                          transform="matrix(0.72,0,0,0.72,0,0)"
                        />
                        <path
                          style={{
                            fill: "none",
                            strokeWidth: 0.496,
                            strokeLinecap: "butt",
                            strokeLinejoin: "miter",
                            stroke: "rgb(0.784314%,0.784314%,0.784314%)",
                            strokeOpacity: 1,
                            strokeMiterlimit: 10,
                          }}
                          d="M 5.099826 19.29796 C 5.099826 18.804253 4.698351 18.397352 4.199219 18.397352 C 3.705512 18.397352 3.298611 18.804253 3.298611 19.29796 C 3.298611 19.797092 3.705512 20.198568 4.199219 20.198568 C 4.698351 20.198568 5.099826 19.797092 5.099826 19.29796 Z M 5.099826 19.29796 "
                          transform="matrix(0.72,0,0,0.72,0,0)"
                        />
                        <path
                          style={{
                            fill: "none",
                            strokeWidth: 0.496,
                            strokeLinecap: "butt",
                            strokeLinejoin: "miter",
                            stroke: "rgb(0.392157%,0.392157%,0.392157%)",
                            strokeOpacity: 1,
                            strokeMiterlimit: 10,
                          }}
                          d="M 0.602214 15.500217 L 24.30013 15.500217 "
                          transform="matrix(0.72,0,0,0.72,0,0)"
                        />
                      </g>
                    </svg>
                  ) : (
                    ""
                  )}
                  {config.type.toLowerCase() === "webdav" ? "WebDAV" : ""}
                  {config.type.toLowerCase() === "s3" ? t(config.type) : ""}
                  {config.type.toLowerCase() === "r2" ? t(config.type) : ""}
                  {config.type.toLowerCase() === "oss" ? t(config.type) : ""}

                  {config.type.toLowerCase() === "localfs" ? t(config.type) : ""}
                </TableCell>
                <TableCell>{config.isEnabled ? <Check className="h-4 w-4" /> : ""}</TableCell>
                <TableCell>
                  <ShowLink url={config.accessUrlPrefix} />
                </TableCell>
                <TableCell>
                  <ShowPath path={config.customPath} />
                </TableCell>

                <TableCell>{config.bucketName}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <p className="flex text-sm text-gray-500">
          <Info className="mr-1 h-4 w-4 place-self-center" />
          {t("tableScrollsShowMore")}
        </p>
        <Button variant="outline" className="text-gray-500" size="sm" onClick={handleCopyConfig}>
          <Clipboard className="h-4 w-4" />
          {t("copyConfig")}
        </Button>
      </div>
    </div>
  )
}
