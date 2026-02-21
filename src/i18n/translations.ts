import { initReactI18next } from "react-i18next";
import { getBrowserLang } from "@/i18n/utils";
import i18n from "i18next";


const locales = import.meta.glob('./locales/*.ts');

const loadResources = async (lang: string) => {
  // 1. 尝试直接匹配 (例如: zh-CN)
  let path = `./locales/${lang}.ts`;
  if (locales[path]) {
    try {
      const module: any = await locales[path]();
      return module.default;
    } catch (error) {
      console.error(`Failed to load locale: ${lang}`, error);
    }
  }

  // 2. 尝试不区分大小写匹配 (例如: zh-cn 匹配 zh-CN.ts)
  const lowerLang = lang.toLowerCase();
  const matchedKey = Object.keys(locales).find(k => k.toLowerCase() === `./locales/${lowerLang}.ts`);
  if (matchedKey) {
    try {
      const module: any = await locales[matchedKey]();
      return module.default;
    } catch (error) {
      console.error(`Failed to load locale case-insensitively: ${lang}`, error);
    }
  }

  // 3. 回退到 zh-CN
  console.warn(`Locale ${lang} not found, falling back to zh-CN`);
  const fallback: any = await locales['./locales/zh-CN.ts']();
  return fallback.default;
};

i18n.use(initReactI18next).init({
  resources: {},
  lng: getBrowserLang(),
  fallbackLng: "zh-CN",
  interpolation: { escapeValue: false },
  react: {
    bindI18n: 'languageChanged added', // 关键：在添加资源包时触发重新渲染
    useSuspense: false
  }
});

const initialLang = getBrowserLang();
loadResources(initialLang).then(resource => {
  i18n.addResourceBundle(initialLang, 'translation', resource, true, true);
  // 确保初次加载后触发一次语言变更事件，强制 React 重新渲染
  i18n.changeLanguage(initialLang);
});

i18n.on('languageChanged', async (lang) => {
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    const resource = await loadResources(lang);
    i18n.addResourceBundle(lang, 'translation', resource, true, true);
  }
});

export default i18n;
