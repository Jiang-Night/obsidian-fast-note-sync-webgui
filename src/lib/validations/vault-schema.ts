import * as z from "zod";


/**
 * 笔记仓库校验 Schema（工厂函数，支持 i18n）
 */
export const createVaultSchema = (t: (key: string) => string) => z.object({
    vault: z.string().min(1, t("ui.validation.vault.nameRequired")),
})

export type VaultFormData = z.infer<ReturnType<typeof createVaultSchema>>
