import type { PageDictionary } from '../../../core/types'

/**
 * 含变量的代码空间文本：计算机规格、提交领先数、按分支创建、编辑器内打开（产品名译法见 codespaces.ts 文件头）。
 * 这些文字主要出现在存储库页 Code 下拉框（页面类型 repository / code），
 * 本文件既合并进 codespaces 词典，也由 repository.ts 合并，在所有存储库页生效。
 * 常见的标准规格另以 static 收录（见 repo-tab.ts），供未合并本文件的页面使用。
 */
export default {
  regexp: [
    // 计算机规格：2-core、8GB RAM · 32GB、2 cores
    [/^(\d+)-core$/, '$1 核'],
    [/^(\d+) cores?$/, '$1 核'],
    [/^(\d+) ?GB RAM [·•] (\d+) ?GB(?: storage)?$/, '$1 GB 内存 · $2 GB 存储'],
    [/^(\d+)-core [·•] (\d+) ?GB RAM [·•] (\d+) ?GB(?: storage)?$/, '$1 核 · $2 GB 内存 · $3 GB 存储'],
    [/^(\d+) ?GB RAM$/, '$1 GB 内存'],
    [/^(\d+) ?GB storage$/, '$1 GB 存储'],

    // Git 状态
    [/^(\d+) commits? ahead$/, '领先 $1 个提交'],
    [/^(\d+) commits? ahead, uncommitted changes$/, '领先 $1 个提交，有未提交的更改'],

    // 创建与打开（代码空间显示名可含空格）
    [/^Create (?:a )?codespace on (\S+)$/, '在 $1 上创建代码空间'],
    [/^Open (.+) in editor$/, '在编辑器中打开 $1'],
    // 评论操作菜单的名称（octocat's comment, Jan 5, 2024）由议题 / 拉取请求词典处理，这里排除
    [/^More actions for (?!.*\b(?:comment|review), )(.+)$/, '$1 的更多操作'],
  ],
} satisfies PageDictionary
