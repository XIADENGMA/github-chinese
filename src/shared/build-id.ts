/** 构建时由 wxt.config.ts 注入；测试等环境没有 */
declare const __GCN_BUILD_ID__: string | undefined

/**
 * 构建标识：源码的内容哈希（见 wxt.config.ts），源码不同则不同；同一份源码的各次构建相同，
 * 同一次构建的词典脚本与内容脚本相同。词典登记据此区分页面上旧版本留下的登记（见 locale-loader.ts）；没有注入时为 dev
 */
export const BUILD_ID: string = typeof __GCN_BUILD_ID__ === 'string' ? __GCN_BUILD_ID__ : 'dev'
