import { getBrowserLang } from "@/i18n/utils";


/**
 * Add a random parameter and language to URL to bypass CDN cache and set language
 * @param url - The base URL
 * @returns URL with random parameter and lang parameter
 */
export function addCacheBuster(url: string): string {
    const separator = url.includes("?") ? "&" : "?"
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const lang = getBrowserLang()
    return `${url}${separator}_=${timestamp}_${random}&lang=${lang}`
}
