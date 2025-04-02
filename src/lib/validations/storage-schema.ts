import * as z from "zod"
import { StorageTypeValue, type StorageType } from "@/lib/types/storage"

export const storageSchema = z.object({
  type: z.enum(StorageTypeValue as [StorageType], {
    required_error: "请选择存储类型",
  }),
  endpoint: z.string().optional(),
  region: z.string().optional(),
  accountId: z.string().optional(),
  bucketName: z.string().optional(),
  accessKeyId: z.string().optional(),
  accessKeySecret: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  customPath: z.string().optional(),
  accessUrlPrefix: z.string().min(1, "访问地址前缀不能为空"),
  isEnabled: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false)
    .optional(),
})

export type StorageFormData = z.infer<typeof storageSchema>