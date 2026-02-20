import * as z from "zod";


export const backupConfigSchema = z.object({
    vault: z.string().min(1, "请选择保险库"),
    type: z.enum(["full", "incremental", "sync"], {
        required_error: "请选择备份类型",
    }),
    cronStrategy: z.enum(["daily", "weekly", "monthly", "custom"], {
        required_error: "请选择定时策略",
    }),
    cronExpression: z.string().optional(),
    storageIds: z.string().min(1, "请至少选择一个存储后端"),
    isEnabled: z.boolean().default(true),
    retentionDays: z.number().min(1, "保留天数至少为1天").optional(),
}).refine((data) => {
    if (data.cronStrategy === "custom" && !data.cronExpression) {
        return false;
    }
    return true;
}, {
    message: "自定义策略下 Cron 表达式不能为空",
    path: ["cronExpression"],
});

export type BackupFormData = z.infer<typeof backupConfigSchema>;
