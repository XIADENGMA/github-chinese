import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script'
import { zhTW } from '../locales/zh-TW/index'
import { registerLocale } from '../shared/locale-loader'

/** 繁体中文词典脚本：由内容脚本按需加载（见 shared/locale-loader） */
export default defineUnlistedScript(() => registerLocale('zh-TW', zhTW))
