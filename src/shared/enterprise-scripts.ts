/**
 * 企业版站点的内容脚本（后台）：清单里的内容脚本只匹配 GitHub 自己的站点，已授权的企业版站点（见 enterprise.ts）
 * 动态注册同样的两份：主世界桥接、内容脚本，document_start；没有已授权的站点时注销。
 * 词典脚本的站点一并扩展（见 locale-script.ts）
 */
import type { ScriptPublicPath } from 'wxt/utils/inject-script'
import { syncRegisteredScript } from './script-registration'

/** 内容脚本与主世界桥接的构建产物：路径类型由 WXT 按实际产物生成，改名时类型检查报错 */
export const CONTENT_SCRIPT_FILE: ScriptPublicPath = '/content-scripts/content.js'
export const BRIDGE_SCRIPT_FILE: ScriptPublicPath = '/content-scripts/turbo-bridge.js'

/** 企业版站点的主世界桥接、内容脚本的注册 ID */
export const ENTERPRISE_BRIDGE_ID = 'gcn-enterprise-bridge'
export const ENTERPRISE_CONTENT_ID = 'gcn-enterprise-content'

/** 按已授权的企业版站点的匹配模式注册、更新或注销。先桥接：内容脚本派发的重置事件要有桥接接收 */
export async function syncEnterpriseScripts(matches: readonly string[]): Promise<void> {
  const enabled = matches.length > 0
  await syncRegisteredScript(ENTERPRISE_BRIDGE_ID, enabled ? { js: [BRIDGE_SCRIPT_FILE], matches, world: 'MAIN' } : undefined)
  await syncRegisteredScript(ENTERPRISE_CONTENT_ID, enabled ? { js: [CONTENT_SCRIPT_FILE], matches } : undefined)
}
