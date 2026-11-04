import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import type { PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'

const matcher = createMatcher(zhCN)

const SETTINGS: readonly PageKey[] = ['common', 'settings']
const ORG_SETTINGS: readonly PageKey[] = ['common', 'org-settings']
const REPO_SETTINGS: readonly PageKey[] = ['common', 'repository', 'repo-settings']

/** 指 webhook 的 hook 全站译「Web 钩子」（docs/GLOSSARY.md） */
describe('Web 钩子术语', () => {
  it.each([
    [SETTINGS, 'Read and write access to repository hooks', '读写存储库 Web 钩子'],
    [ORG_SETTINGS, 'Read access to organization hooks', '读取组织 Web 钩子'],
    [SETTINGS, 'Manage the post-receive hooks for a repository.', '管理存储库的 Web 钩子。'],
    [SETTINGS, 'When this App is deleted and the associated hook is removed.', '此应用被删除且关联的 Web 钩子被移除时。'],
    [SETTINGS, 'Full control of repository hooks', '完全控制存储库 Web 钩子'],
    [SETTINGS, 'Read repository hooks', '读取存储库 Web 钩子'],
    [SETTINGS, 'Repository hooks', '存储库 Web 钩子'],
    [SETTINGS, 'Organization hooks', '组织 Web 钩子'],
    // GitHub 应用表单
    [SETTINGS, 'Webhook', 'Web 钩子'],
    [SETTINGS, 'Webhook URL', 'Web 钩子 URL'],
    [ORG_SETTINGS, 'webhook', 'Web 钩子'],
    // Web 钩子列表
    [REPO_SETTINGS, '(all events)', '（所有事件）'],
    [ORG_SETTINGS, '(all events)', '（所有事件）'],
    // 赞助仪表板侧栏
    [['common', 'sponsors'], 'Webhooks', 'Web 钩子']
  ] as const)('%j：%s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })
})
