import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script'
import { zhCN } from '../locales/zh-CN/index'
import { registerLocale } from '../shared/locale-loader'

/** 简体中文词典脚本：由内容脚本按需加载（见 shared/locale-loader） */
export default defineUnlistedScript(() => registerLocale('zh-CN', zhCN))
