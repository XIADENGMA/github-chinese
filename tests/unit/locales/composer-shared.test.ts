import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import type { PageDictionary, RegExpRule } from '../../../src/core/types'
import cnCopilot from '../../../src/locales/zh-CN/copilot'
import * as cnAgents from '../../../src/locales/zh-CN/copilot/agents'
import * as cnChat from '../../../src/locales/zh-CN/copilot/chat'
import * as cnSkills from '../../../src/locales/zh-CN/copilot/skills'
import cnDashboard from '../../../src/locales/zh-CN/dashboard'
import twCopilot from '../../../src/locales/zh-TW/copilot'
import * as twAgents from '../../../src/locales/zh-TW/copilot/agents'
import * as twChat from '../../../src/locales/zh-TW/copilot/chat'
import * as twSkills from '../../../src/locales/zh-TW/copilot/skills'
import twDashboard from '../../../src/locales/zh-TW/dashboard'

/** 任务创建失败横幅的说明文字 */
const TASK_FAILURE_SAMPLES: readonly string[] = [
  "Unable to start task for 'Fix the bug'. Please try again.",
  "Unable to start task for 'Fix the bug': Repository not found"
]

/**
 * 首页 Copilot 输入框与 /copilot/agents 共用的组件：输入框下方的环境条（范围、存储库、分支、环境、代理、工具权限选择器）、
 * 图片附件、任务创建失败横幅、粘贴代码块的读屏播报
 */
const COMPOSER_SAMPLES: readonly string[] = [
  'Personal (octocat)',
  'Select conversation scope, current: Personal',
  'Repositories in @octo-org and public repositories',
  "Repositories are limited to your personal account. Change the Chat scope to work in another owner's repositories.",
  'Cloud sessions are disabled for octo-org',
  'Repository: octocat/hello-world',
  'Branch: main',
  'Remove octocat/hello-world',
  'Environment: Cloud',
  'Chat (octo-org)',
  'Mode: Chat (Personal)',
  'Space: Resolving…',
  'Resolving space: Docs',
  'Space selected: Docs',
  'Custom agent: Reviewer',
  'Select MCP permission mode, current: Allow all',
  'Tool permissions: "Autopilot" isn\'t available for this session. Choose an available option to continue.',
  ...TASK_FAILURE_SAMPLES,
  'Image: screenshot.png',
  'Image limit reached (3)',
  'You can attach up to 3 images per task',
  'notes.txt could not be attached. Text and PDF files must be 10 MB or smaller, and you can attach up to 10 text, PDF, or image files at a time.',
  '2 files could not be attached: a.zip, b.exe. Text and PDF files must be 10 MB or smaller, and you can attach up to 10 text, PDF, or image files at a time.',
  "The GPT-5 model doesn't support answering questions about images. Select a different model and try again.",
  'Block pasted, 2 total',
  'Block removed, 1 left'
]

interface LocaleCase {
  readonly dashboard: PageDictionary
  readonly copilot: PageDictionary
  readonly agents: typeof cnAgents
  readonly chat: typeof cnChat
  readonly skills: typeof cnSkills
}

const LOCALES: readonly (readonly [string, LocaleCase])[] = [
  ['zh-CN', { dashboard: cnDashboard, copilot: cnCopilot, agents: cnAgents, chat: cnChat, skills: cnSkills }],
  ['zh-TW', { dashboard: twDashboard, copilot: twCopilot, agents: twAgents, chat: twChat, skills: twSkills }]
]

/** 规则在列表中的位置（按同一对象查找） */
function positions(rules: readonly RegExpRule[], list: readonly RegExpRule[]): number[] {
  return rules.map(rule => list.indexOf(rule))
}

describe.each(LOCALES)('%s 首页输入框沿用的 copilot 规则', (_, { dashboard, copilot, agents, chat, skills }) => {
  const home = createMatcher([['dashboard', dashboard]])
  const copilotPage = createMatcher([['copilot', copilot]])
  const shared = [...agents.COMPOSER_SHARED_RULES, ...chat.COMPOSER_SHARED_RULES, ...skills.COMPOSER_SHARED_RULES]

  it.each(COMPOSER_SAMPLES)('首页词典译出，与 Copilot 页同译：%s', sample => {
    const result = home.translate(sample, ['common', 'dashboard'])
    expect(result).toBeDefined()
    expect(result).not.toBe(sample)
    expect(result).toBe(copilotPage.translate(sample, ['common', 'copilot']))
  })

  it('共用规则即 agents、chat、skills 中能译出示例的全部规则，先后不变，与 copilot 词典是同一对象', () => {
    const copilotRules = [...(agents.default.regexp ?? []), ...(chat.default.regexp ?? []), ...(skills.default.regexp ?? [])]
    const matched = copilotRules.filter(([pattern]) => COMPOSER_SAMPLES.some(sample => pattern.test(sample)))
    expect(shared.length).toBeGreaterThan(0)
    expect(positions(shared, copilotRules)).toEqual(positions(matched, copilotRules))
    expect(positions(shared, dashboard.regexp ?? []).every(index => index >= 0)).toBe(true)
  })

  it('任务创建失败横幅的说明规则即 agents 中能译出横幅示例的字符串替换规则', () => {
    const rules = agents.default.regexp ?? []
    const matched = rules.filter(
      ([pattern, replacement]) => typeof replacement === 'string' && TASK_FAILURE_SAMPLES.some(sample => pattern.test(sample))
    )
    expect(positions(agents.TASK_FAILURE_RULES, rules)).toEqual(positions(matched, rules))
  })
})
