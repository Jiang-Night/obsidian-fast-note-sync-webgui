export type StorageType = "oss" | "s3" | "r2" | "minio" | "localfs" | "webdav"
export const StorageTypeValue = ["oss", "s3", "r2", "minio", "localfs", "webdav"]

export interface StorageConfig {
  id: string
  type: StorageType
  endpoint?: string
  region?: string
  accountId?: string
  bucketName?: string
  accessKeyId?: string
  accessKeySecret?: string
  user?: string
  password?: string
  customPath?: string
  accessUrlPrefix: string
  isEnabled: boolean
}
