/**
 * 存储/备份操作错误的信息
 * 给后端错误字符串写个映射，将错误结果更直观的反馈给用户
 * 规则从具体到不具体排序 相当于搞个兜底
 * 没有规则匹配的时候 回退显示原始错误信息，并且加入复制按钮 可以更方便获取报错信息
 */

interface ErrorRule {
    pattern: RegExp;
    key: string;
}

const rules: ErrorRule[] = [
    // --- WebDAV ---
    { pattern: /webdav;.*(401|Unauthorized)/i,  key: "error.storage.webdav.unauthorized" },
    { pattern: /webdav;.*(403|Forbidden)/i,     key: "error.storage.webdav.forbidden" },
    { pattern: /webdav;.*(404|Not Found)/i,     key: "error.storage.webdav.notFound" },
    { pattern: /webdav;.*(405|Method Not Allowed)/i, key: "error.storage.webdav.methodNotAllowed" },
    { pattern: /webdav;.*no such host/i,        key: "error.storage.webdav.unreachable" },
    { pattern: /webdav;.*connection refused/i,   key: "error.storage.webdav.connectionRefused" },
    { pattern: /webdav;.*(timeout|deadline exceeded)/i, key: "error.storage.webdav.timeout" },
    { pattern: /webdav;/i,                      key: "error.storage.webdav.generic" },

    // --- S3 / MinIO / R2 ---
    { pattern: /(aws_s3|minio|cloudflare_r2):.*NoSuchBucket/i,   key: "error.storage.s3.noSuchBucket" },
    { pattern: /(aws_s3|minio|cloudflare_r2):.*AccessDenied/i,   key: "error.storage.s3.accessDenied" },
    { pattern: /(aws_s3|minio|cloudflare_r2):.*no such host/i,   key: "error.storage.s3.unreachable" },
    { pattern: /(aws_s3|minio|cloudflare_r2):.*(timeout|deadline exceeded)/i, key: "error.storage.s3.timeout" },

    // --- Aliyun OSS ---
    { pattern: /oss:.*NoSuchBucket/i,           key: "error.storage.oss.noSuchBucket" },
    { pattern: /oss:.*AccessDenied/i,           key: "error.storage.oss.accessDenied" },
    { pattern: /oss:.*no such host/i,           key: "error.storage.oss.unreachable" },

    // --- Local filesystem ---
    { pattern: /no permission to upload/i,      key: "error.storage.local.noPermission" },
    { pattern: /failed to create the save-fileurl directory/i, key: "error.storage.local.createDirFailed" },
    { pattern: /permission denied/i,            key: "error.storage.local.permissionDenied" },

    // --- Backup-level (no ^ anchor - messages may be wrapped by finishTask) ---
    { pattern: /Partial failure:/i,             key: "error.backup.partialFailure" },
    { pattern: /Upload failed:/i,               key: "error.backup.uploadFailed" },
    { pattern: /Failed to open backup file:/i,  key: "error.backup.openFileFailed" },
    { pattern: /Note Vault does not exist/i,    key: "error.backup.vaultNotExist" },

    // --- Generic network (catch-all, must be last) ---
    { pattern: /no such host/i,                 key: "error.network.unreachable" },
    { pattern: /connection refused/i,           key: "error.network.connectionRefused" },
    { pattern: /(timeout|deadline exceeded)/i,  key: "error.network.timeout" },
];

/**
 * Match a raw error message against known patterns.
 * @returns The i18n key if matched, or null for unknown errors.
 */
export function mapError(rawMessage: string): string | null {
    if (!rawMessage) return null;
    for (const rule of rules) {
        if (rule.pattern.test(rawMessage)) {
            return rule.key;
        }
    }
    return null;
}
