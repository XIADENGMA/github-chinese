import { describe, expect, it } from 'vitest'
import {
  compileSearchBlockRules,
  EMPTY_BLOCK_LIST,
  isBlockedResult,
  isEmptyBlockList,
  MAX_RULE_LENGTH,
  normalizeRule,
  ownerOfPath,
  parseRule,
  ruleKeyOf
} from '../../../src/shared/search-block'

describe('ownerOfPath', () => {
  it.each([
    ['/octocat', { owner: 'octocat' }],
    ['/octocat/', { owner: 'octocat' }],
    ['/octocat/hello-world', { owner: 'octocat', name: 'hello-world' }],
    ['/vuejs/core/issues/1', { owner: 'vuejs', name: 'core' }],
    ['/octocat/.github', { owner: 'octocat', name: '.github' }],
    ['/orgs/octo-org/repositories', { owner: 'octo-org' }],
    ['/users/octocat/packages/container/package/sample', { owner: 'octocat' }]
  ])('%s：%j', (path, expected) => {
    expect(ownerOfPath(path)).toEqual(expected)
  })

  it.each(['/', '', '/search', '/topics/vue', '/Topics/vue', '/marketplace/actions/x', '/orgs', '/orgs/-x', '/-x'])(
    '%s：不是用户、存储库下的路径',
    path => {
      expect(ownerOfPath(path)).toBeUndefined()
    }
  )

  it('解码路径；无法解码的段原样判断', () => {
    expect(ownerOfPath('/octocat/hello%2Dworld')).toEqual({ owner: 'octocat', name: 'hello-world' })
    expect(ownerOfPath('/%E7%A4%BA%E4%BE%8B')).toBeUndefined()
    expect(ownerOfPath('/octocat/%E0%A4%A')).toEqual({ owner: 'octocat' })
  })
})

describe('parseRule', () => {
  it.each([
    ['@octocat', { kind: 'owner', owner: 'octocat' }],
    ['  @octocat  ', { kind: 'owner', owner: 'octocat' }],
    ['@octo-org', { kind: 'owner', owner: 'octo-org' }],
    ['octocat/hello-world', { kind: 'repo', owner: 'octocat', name: 'hello-world' }],
    ['vuejs/core.js', { kind: 'repo', owner: 'vuejs', name: 'core.js' }],
    ['https://github.com/octocat', { kind: 'owner', owner: 'octocat' }],
    ['http://www.github.com/octocat?tab=repositories', { kind: 'owner', owner: 'octocat' }],
    ['github.com/octocat/hello-world.git', { kind: 'repo', owner: 'octocat', name: 'hello-world' }],
    ['https://github.com/vuejs/core/issues/1#top', { kind: 'repo', owner: 'vuejs', name: 'core' }],
    ['https://github.com/orgs/octo-org/packages', { kind: 'owner', owner: 'octo-org' }]
  ] as const)('%j：所有者、存储库', (line, expected) => {
    expect(parseRule(line)).toEqual(expected)
  })

  it.each([
    ['octocat', 'octocat'],
    ['"@octocat"', '@octocat'],
    ['"octocat/hello-world"', 'octocat/hello-world'],
    ['" Sample text "', 'Sample text'],
    ['Sample text', 'Sample text'],
    ['示例文本', '示例文本'],
    ['-octocat', '-octocat'],
    ['octocat/', 'octocat/'],
    ['octocat/hello/world', 'octocat/hello/world'],
    ['https://gist.github.com/octocat', 'https://gist.github.com/octocat']
  ])('%j：关键词', (line, keyword) => {
    expect(parseRule(line)).toEqual({ kind: 'keyword', keyword })
  })

  it.each([
    '',
    '   ',
    '""',
    '"  "',
    '@',
    '@ octocat',
    '@-octocat',
    '@octocat/hello-world',
    'https://github.com/',
    'https://github.com/settings/profile'
  ])('%j：无效', line => {
    expect(parseRule(line)).toBeUndefined()
  })

  it(`超过 ${MAX_RULE_LENGTH} 个字符：无效`, () => {
    expect(parseRule('x'.repeat(MAX_RULE_LENGTH))).toEqual({ kind: 'keyword', keyword: 'x'.repeat(MAX_RULE_LENGTH) })
    expect(parseRule('x'.repeat(MAX_RULE_LENGTH + 1))).toBeUndefined()
  })
})

describe('normalizeRule', () => {
  it('去掉首尾空白，GitHub 地址换成所有者、存储库的写法；关键词保持原样（含引号）', () => {
    expect(normalizeRule(' @octocat ')).toBe('@octocat')
    expect(normalizeRule('https://github.com/hubot')).toBe('@hubot')
    expect(normalizeRule('https://github.com/vuejs/core/issues')).toBe('vuejs/core')
    expect(normalizeRule('vuejs/Core')).toBe('vuejs/Core')
    expect(normalizeRule(' "Sample text" ')).toBe('"Sample text"')
    expect(normalizeRule('Sample text')).toBe('Sample text')
  })

  it('无效：空、空引号、@ 后不是用户名、不是用户与存储库的 GitHub 地址、超长', () => {
    for (const line of ['', '  ', '""', '@-x', 'https://github.com/settings', 'x'.repeat(MAX_RULE_LENGTH + 1)]) {
      expect(normalizeRule(line), line).toBeUndefined()
    }
  })
})

describe('ruleKeyOf', () => {
  it('同一所有者、存储库、关键词的规则键相同：不区分大小写，地址与简写相同，关键词引号可有可无', () => {
    expect(ruleKeyOf('@OctoCat')).toBe(ruleKeyOf('https://github.com/octocat'))
    expect(ruleKeyOf('Vuejs/Core')).toBe(ruleKeyOf('https://github.com/vuejs/core/issues'))
    expect(ruleKeyOf('"Sample TEXT"')).toBe(ruleKeyOf('sample text'))
  })

  it('写法不同的规则键不同；无效的规则按原文', () => {
    expect(ruleKeyOf('@octocat')).not.toBe(ruleKeyOf('octocat'))
    expect(ruleKeyOf('vuejs/core')).not.toBe(ruleKeyOf('"vuejs/core"'))
    expect(ruleKeyOf(' @-x ')).toBe(ruleKeyOf('@-x'))
    expect(ruleKeyOf('@-x')).not.toBe(ruleKeyOf('@-y'))
  })
})

describe('compileSearchBlockRules / isBlockedResult', () => {
  const list = compileSearchBlockRules(['@OctoCat', 'vuejs/Core', 'Sample Text', '@hubot', '""'])

  it('编译为小写；跳过无效的行', () => {
    expect(list).toEqual({
      owners: new Set(['octocat', 'hubot']),
      repos: new Set(['vuejs/core']),
      keywords: ['sample text']
    })
  })

  it('所有者：其存储库及存储库下的结果、该用户本身', () => {
    expect(isBlockedResult({ owner: 'octocat', repo: 'octocat/hello-world', text: '' }, list)).toBe(true)
    expect(isBlockedResult({ owner: 'OCTOCAT', text: '' }, list)).toBe(true)
    expect(isBlockedResult({ owner: 'octocat-bot', text: '' }, list)).toBe(false)
  })

  it('存储库：只命中这个存储库', () => {
    expect(isBlockedResult({ owner: 'vuejs', repo: 'VueJS/core', text: '' }, list)).toBe(true)
    expect(isBlockedResult({ owner: 'vuejs', repo: 'vuejs/router', text: '' }, list)).toBe(false)
  })

  it('关键词：文字含这段即命中，不区分大小写；不按所有者判断（不带 @ 的用户名按关键词）', () => {
    expect(isBlockedResult({ owner: 'vuejs', repo: 'vuejs/router', text: 'A SAMPLE TEXT here' }, list)).toBe(true)
    expect(isBlockedResult({ text: 'sample' }, list)).toBe(false)
    const bare = compileSearchBlockRules(['octocat'])
    expect(isBlockedResult({ owner: 'octocat', text: '' }, bare)).toBe(false)
    expect(isBlockedResult({ owner: 'octocat', text: 'octocat/hello-world' }, bare)).toBe(true)
  })

  it('没有规则时为空', () => {
    expect(isEmptyBlockList(EMPTY_BLOCK_LIST)).toBe(true)
    expect(isEmptyBlockList(compileSearchBlockRules(['""', '']))).toBe(true)
    expect(isEmptyBlockList(list)).toBe(false)
    expect(isBlockedResult({ owner: 'octocat', text: 'Sample text' }, EMPTY_BLOCK_LIST)).toBe(false)
  })
})
