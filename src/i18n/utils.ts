import i18n, { ensureResourceLoaded } from "./translations";


// 切换语言
export const changeLang = async (lang: string) => {
  localStorage.setItem("lang", lang)
  // 先把资源预加载好
  await ensureResourceLoaded(lang);
  await i18n.changeLanguage(lang) // 切换语言
}

// 获取语言
export function getBrowserLang(): string {
  let lang
  if (localStorage.getItem("lang")) {
    lang = localStorage.getItem("lang")
  } else {
    lang = navigator.language
  }
  let to = lang?.toString()

  return to ? to : "en"
}