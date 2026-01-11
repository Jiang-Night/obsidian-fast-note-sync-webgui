import { useState, useCallback } from "react";

export interface ReleaseInfo {
    tag_name: string;
    name: string;
    html_url: string;
    published_at: string;
    body: string;
}

export interface UpdateCheckResult {
    hasUpdate: boolean;
    latestVersion: string | null;
    releaseUrl: string | null;
    releaseNotes: string | null;
    publishedAt: string | null;
}

// 比较版本号，返回 true 如果 latest > current
function compareVersions(current: string, latest: string): boolean {
    // 移除 v 前缀
    const cleanCurrent = current.replace(/^v/, '');
    const cleanLatest = latest.replace(/^v/, '');
    
    const currentParts = cleanCurrent.split('.').map(Number);
    const latestParts = cleanLatest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        const curr = currentParts[i] || 0;
        const lat = latestParts[i] || 0;
        if (lat > curr) return true;
        if (lat < curr) return false;
    }
    return false;
}

export function useUpdateCheck() {
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);

    const checkUpdate = useCallback(async (currentVersion: string): Promise<UpdateCheckResult | null> => {
        if (!currentVersion) {
            setError("Current version is unknown");
            return null;
        }

        setIsChecking(true);
        setError(null);

        try {
            const response = await fetch(
                "https://api.github.com/repos/haierkeys/fast-note-sync-service/releases/latest",
                {
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const release: ReleaseInfo = await response.json();
            const hasUpdate = compareVersions(currentVersion, release.tag_name);

            const result: UpdateCheckResult = {
                hasUpdate,
                latestVersion: release.tag_name,
                releaseUrl: release.html_url,
                releaseNotes: release.body,
                publishedAt: release.published_at,
            };

            setUpdateResult(result);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to check for updates";
            setError(message);
            return null;
        } finally {
            setIsChecking(false);
        }
    }, []);

    return {
        checkUpdate,
        isChecking,
        error,
        updateResult,
    };
}
