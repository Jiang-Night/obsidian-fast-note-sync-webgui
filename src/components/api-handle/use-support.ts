import { addCacheBuster } from "@/lib/utils/cache-buster";
import { useState, useCallback } from "react";
import { getBrowserLang } from "@/i18n/utils";
import env from "@/env.ts";


export interface SupportRecord {
    amount: string;
    item: string;
    message: string;
    name: string;
    time: string;
    unit: string;
}

export function useSupport() {
    const [supportList, setSupportList] = useState<SupportRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSupport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(addCacheBuster(env.API_URL + "/api/support"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Lang": getBrowserLang(),
                },
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const res = await response.json();
            if (res.code === 0 || (res.code < 100 && res.code > 0)) {
                setSupportList(res.data || []);
            } else {
                setError(res.message || "Failed to get support records");
            }
        } catch (error) {
            setError("Failed to get support records");
            console.error("Support fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        supportList,
        isLoading,
        error,
        refresh: fetchSupport
    };
}
