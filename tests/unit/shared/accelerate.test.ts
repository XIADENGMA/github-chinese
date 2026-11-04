import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  accelerateLink,
  BUILTIN_SOURCES,
  measureLatency,
  parseAccelerableLink,
  parseCloneUrl,
  parseDownloadLink,
  parseImageUrl,
  parseSourceTemplate,
  probe,
  probeUrl,
  sourceName,
  supportsLink,
  templateKey,
  type AccelerableLink,
  type AccelerateSource,
  type ProbeDeps
} from '../../../src/shared/accelerate'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'

function link(href: string): AccelerableLink {
  const parsed = parseDownloadLink(href)
  if (!parsed) throw new Error(`不可加速：${href}`)
  return parsed
}

const MIRROR: AccelerateSource = { id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}' }

afterEach(() => {
  vi.useRealTimers()
})

describe('parseDownloadLink', () => {
  it.each([
    [RELEASE, 'release'],
    ['https://github.com/vuejs/core/releases/latest/download/vue.zip', 'release'],
    ['https://github.com/vuejs/core/archive/refs/heads/main.zip', 'archive'],
    ['https://github.com/vuejs/core/archive/refs/tags/v3.5.0.tar.gz', 'archive'],
    ['https://github.com/vuejs/core/raw/refs/heads/main/README.md', 'raw'],
    ['https://raw.githubusercontent.com/vuejs/core/main/README.md', 'raw'],
    ['https://raw.githubusercontent.com/vuejs/core/refs/heads/main/packages/vue/index.js', 'raw'],
    ['https://github.com/vuejs/core/blob/main/README.md?raw=true', 'raw'],
    ['https://codeload.github.com/vuejs/core/zip/refs/heads/main', 'archive'],
    ['https://codeload.github.com/vuejs/core/tar.gz/v3.5.0', 'archive'],
    ['https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip', 'gist'],
    ['https://gist.github.com/octocat/0831f3fbd83ac4d46451/raw/c197afe/sample.sh', 'raw'],
    ['https://gist.githubusercontent.com/octocat/0831f3fbd83ac4d46451/raw/sample.sh', 'raw']
  ])('%s → %s', (href, kind) => {
    expect(parseDownloadLink(href)?.kind).toBe(kind)
  })

  it.each([
    ['存储库首页', 'https://github.com/vuejs/core'],
    ['发行版页面', 'https://github.com/vuejs/core/releases/tag/v3.5.0'],
    ['文件页面', 'https://github.com/vuejs/core/blob/main/README.md'],
    ['只有前缀', 'https://github.com/vuejs/core/releases/download/'],
    ['Actions 产物', 'https://github.com/vuejs/core/actions/runs/1/artifacts/2'],
    ['codeload 的旧格式', 'https://codeload.github.com/vuejs/core/legacy.zip/refs/heads/main'],
    ['codeload 带 token（私有存储库）', 'https://codeload.github.com/vuejs/core/zip/main?token=ABC'],
    ['代码片段页面', 'https://gist.github.com/octocat/0831f3fbd83ac4d46451'],
    ['文件页面不带 raw=true', 'https://github.com/vuejs/core/blob/main/README.md'],
    ['Raw 路径不全', 'https://raw.githubusercontent.com/vuejs/core/main'],
    ['带 token（私有存储库）', 'https://raw.githubusercontent.com/vuejs/core/main/a.txt?token=ABC'],
    ['http', 'http://github.com/vuejs/core/archive/main.zip'],
    ['带端口', 'https://github.com:8443/vuejs/core/archive/main.zip'],
    ['带用户名', 'https://user@github.com/vuejs/core/archive/main.zip'],
    ['其他网站', 'https://example.com/vuejs/core/archive/main.zip'],
    ['不是地址', 'not a url']
  ])('%s：不可加速', (_name, href) => {
    expect(parseDownloadLink(href)).toBeUndefined()
  })

  it('去掉 # 之后的片段；github.com 的路径不带开头的 /，保留查询串', () => {
    expect(parseDownloadLink(`${RELEASE}?x=1#top`)).toEqual({
      kind: 'release',
      url: `${RELEASE}?x=1`,
      path: 'vuejs/core/releases/download/v3.5.0/vue.global.js?x=1'
    })
  })

  it('raw.githubusercontent.com 的路径换成 github.com 上的 raw 路径', () => {
    expect(link('https://raw.githubusercontent.com/vuejs/core/main/README.md').path).toBe('vuejs/core/raw/main/README.md')
  })

  it('效果相同的写法统一：codeload 换成 github.com 的 archive，blob?raw=true 换成 raw', () => {
    expect(link('https://codeload.github.com/vuejs/core/zip/refs/heads/main')).toEqual({
      kind: 'archive',
      url: 'https://github.com/vuejs/core/archive/refs/heads/main.zip',
      path: 'vuejs/core/archive/refs/heads/main.zip'
    })
    expect(link('https://codeload.github.com/vuejs/core/tar.gz/v3.5.0').url).toBe('https://github.com/vuejs/core/archive/v3.5.0.tar.gz')
    expect(link('https://github.com/vuejs/core/blob/main/README.md?raw=true')).toEqual({
      kind: 'raw',
      url: 'https://github.com/vuejs/core/raw/main/README.md',
      path: 'vuejs/core/raw/main/README.md'
    })
  })

  it('Gist：Raw 换成 gist.githubusercontent.com；不在 github.com 上，没有路径', () => {
    expect(link('https://gist.github.com/octocat/0831f3fbd83ac4d46451/raw/c197afe/sample.sh#L1')).toEqual({
      kind: 'raw',
      url: 'https://gist.githubusercontent.com/octocat/0831f3fbd83ac4d46451/raw/c197afe/sample.sh'
    })
    expect(link('https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip')).toEqual({
      kind: 'gist',
      url: 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
    })
  })
})

describe('parseCloneUrl / parseAccelerableLink', () => {
  it('存储库与代码片段的 https 克隆地址', () => {
    expect(parseCloneUrl('https://github.com/vuejs/core.git')).toEqual({
      kind: 'clone',
      url: 'https://github.com/vuejs/core.git',
      path: 'vuejs/core.git'
    })
    expect(parseCloneUrl('https://gist.github.com/0831f3fbd83ac4d46451.git')).toEqual({
      kind: 'clone',
      url: 'https://gist.github.com/0831f3fbd83ac4d46451.git'
    })
  })

  it.each([
    ['SSH', 'git@github.com:vuejs/core.git'],
    ['不带 .git', 'https://github.com/vuejs/core'],
    ['GitHub CLI', 'gh repo clone vuejs/core'],
    ['带查询串', 'https://github.com/vuejs/core.git?x=1'],
    ['路径过深', 'https://github.com/vuejs/core/sub.git'],
    ['其他网站', 'https://example.com/vuejs/core.git']
  ])('%s：不是可加速的克隆地址', (_name, href) => {
    expect(parseCloneUrl(href)).toBeUndefined()
  })

  it('后台选源：下载链接与克隆地址都识别', () => {
    expect(parseAccelerableLink(RELEASE)?.kind).toBe('release')
    expect(parseAccelerableLink('https://github.com/vuejs/core.git')?.kind).toBe('clone')
    expect(parseAccelerableLink('https://avatars.githubusercontent.com/u/1?v=4')).toBeUndefined()
  })
})

describe('parseImageUrl', () => {
  it.each([
    ['https://avatars.githubusercontent.com/u/583231?s=40&v=4', undefined],
    ['https://github.githubassets.com/images/icons/emoji/unicode/1f600.png', undefined],
    ['https://user-images.githubusercontent.com/1/sample.png', undefined],
    ['https://raw.githubusercontent.com/vuejs/core/main/logo.png', 'vuejs/core/raw/main/logo.png'],
    ['https://github.com/vuejs/core/raw/main/logo.png', 'vuejs/core/raw/main/logo.png'],
    ['https://github.com/vuejs/core/blob/main/logo.png?raw=true', 'vuejs/core/raw/main/logo.png']
  ])('%s → 图片', (href, path) => {
    const parsed = parseImageUrl(href)
    expect(parsed?.kind).toBe('image')
    expect(parsed?.path).toBe(path)
  })

  it.each([
    ['私有附件', 'https://private-user-images.githubusercontent.com/1/sample.png?jwt=abc'],
    ['外部图片的代理', 'https://camo.githubusercontent.com/abc/def'],
    ['带 token', 'https://raw.githubusercontent.com/vuejs/core/main/logo.png?token=ABC'],
    ['data:', 'data:image/png;base64,AAAA'],
    ['其他网站', 'https://example.com/logo.png']
  ])('%s：不经加速源', (_name, href) => {
    expect(parseImageUrl(href)).toBeUndefined()
  })
})

describe('accelerateLink', () => {
  it.each([
    ['https://ghfast.top/{url}', `https://ghfast.top/${RELEASE}`],
    ['https://mirror.example/?u={url}', `https://mirror.example/?u=${RELEASE}`],
    ['https://mirror.example/{path}', 'https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js'],
    ['https://ghfast.top', `https://ghfast.top/${RELEASE}`],
    ['https://ghfast.top/', `https://ghfast.top/${RELEASE}`],
    ['https://mirror.example/gh/', `https://mirror.example/gh/${RELEASE}`]
  ])('%s', (template, expected) => {
    expect(accelerateLink(template, link(RELEASE))).toBe(expected)
  })

  it('链接中的 $& 等不当作替换模式', () => {
    const href = 'https://github.com/vuejs/core/raw/main/a$&b$1.txt'
    expect(accelerateLink('https://ghfast.top/{url}', link(href))).toBe(`https://ghfast.top/${href}`)
  })

  it('{path} 模板遇到不在 github.com 上的地址：不加速', () => {
    const gist = link('https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip')
    expect(accelerateLink('https://mirror.example/{path}', gist)).toBeUndefined()
    expect(accelerateLink('https://mirror.example/{url}', gist)).toBe(`https://mirror.example/${gist.url}`)
  })
})

describe('supportsLink', () => {
  const GIST = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
  const AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'
  const PATH_MIRROR: AccelerateSource = { id: 'custom-2', name: 'Path', template: 'https://path.example/{path}' }
  const byId = (id: string): AccelerateSource => BUILTIN_SOURCES.find(source => source.id === id)!
  const avatar = (): AccelerableLink => parseImageUrl(AVATAR)!

  it('内置源跳过实测不支持的主机；自定义源视为都支持，用 {path} 的只支持 github.com 上的地址', () => {
    expect(supportsLink(byId('gh-proxy-hk'), link(GIST))).toBe(false)
    expect(supportsLink(byId('ghfast'), link(GIST))).toBe(true)
    expect(supportsLink(byId('ghfast'), avatar())).toBe(false)
    expect(supportsLink(MIRROR, avatar())).toBe(true)
    expect(supportsLink(PATH_MIRROR, link(GIST))).toBe(false)
    expect(supportsLink(PATH_MIRROR, link(RELEASE))).toBe(true)
  })
})

describe('parseSourceTemplate', () => {
  it.each([
    ['https://ghfast.top/{url}', 'https://ghfast.top/{url}'],
    ['  https://ghfast.top  ', 'https://ghfast.top'],
    ['https://mirror.example/{path}', 'https://mirror.example/{path}'],
    ['https://mirror.example/?u={url}', 'https://mirror.example/?u={url}']
  ])('%s → 合法', (text, expected) => {
    expect(parseSourceTemplate(text)).toBe(expected)
  })

  it.each([
    ['空', '  '],
    ['http', 'http://mirror.example/{url}'],
    ['不是地址', 'mirror.example/{url}'],
    ['javascript', 'javascript:alert(1)//{url}'],
    ['占位符在域名里', 'https://{path}'],
    ['占位符紧接域名', 'https://mirror.example{url}'],
    ['两个占位符', 'https://mirror.example/{url}/{path}'],
    ['重复的占位符', 'https://mirror.example/{url}{url}'],
    ['其他花括号', 'https://mirror.example/{URL}'],
    ['GitHub 自己的域名', 'https://github.com/{path}'],
    ['GitHub 子域名', 'https://raw.githubusercontent.com/{path}'],
    ['带用户名', 'https://user:pass@mirror.example/{url}'],
    ['过长', `https://mirror.example/${'a'.repeat(200)}/{url}`]
  ])('%s → 不合法', (_name, text) => {
    expect(parseSourceTemplate(text)).toBeUndefined()
  })
})

describe('probeUrl', () => {
  it('加速源站点的根路径', () => {
    expect(probeUrl('https://ghfast.top/{url}')).toBe('https://ghfast.top/')
    expect(probeUrl('https://mirror.example:8443/gh/?u={url}')).toBe('https://mirror.example:8443/')
    expect(probeUrl('http://mirror.example/{url}')).toBeUndefined()
  })
})

describe('内置加速源', () => {
  it('模板都合法、标识不重复', () => {
    for (const source of BUILTIN_SOURCES) expect(parseSourceTemplate(source.template), source.id).toBe(source.template)
    expect(new Set(BUILTIN_SOURCES.map(source => source.id)).size).toBe(BUILTIN_SOURCES.length)
  })
})

describe('templateKey / sourceName', () => {
  it('效果相同的写法得到同一个键：省略 {url}、末尾的 /', () => {
    expect(templateKey('https://ghfast.top')).toBe(templateKey('https://ghfast.top/{url}'))
    expect(templateKey('https://ghfast.top/')).toBe(templateKey('https://ghfast.top/{url}'))
    expect(templateKey('https://mirror.example/{path}')).not.toBe(templateKey('https://mirror.example/{url}'))
  })

  it('名称：去掉首尾空白，过长截断；为空时用域名', () => {
    expect(sourceName('  Mirror  ', 'https://mirror.example/{url}')).toBe('Mirror')
    expect(sourceName('x'.repeat(40), 'https://mirror.example/{url}')).toBe('x'.repeat(30))
    expect(sourceName(' ', 'https://mirror.example:8443/{url}')).toBe('mirror.example')
  })
})

describe('probe / measureLatency', () => {
  /** 假请求：依次取耗时（毫秒），error 为网络错误，hang 为一直不应答（中止时拒绝） */
  function fakeDeps(steps: readonly (number | 'error' | 'hang')[]): ProbeDeps & { calls: RequestInit[] } {
    let clock = 0
    let index = 0
    const calls: RequestInit[] = []
    return {
      calls,
      now: () => clock,
      fetch: (_url, init) => {
        calls.push(init)
        const step = steps[index++] ?? 'error'
        if (step === 'error') return Promise.reject(new TypeError('Failed to fetch'))
        if (step === 'hang') {
          return new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
          })
        }
        clock += step
        return Promise.resolve({})
      }
    }
  }

  it('HEAD、no-cors，不用缓存、不带 Cookie 与来源页；返回耗时', async () => {
    const deps = fakeDeps([123])
    expect(await probe('https://ghfast.top/', 3000, deps)).toEqual({ ok: true, ms: 123 })
    expect(deps.calls[0]).toMatchObject({
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
  })

  it('网络错误 → error；超时 → timeout（中止请求）', async () => {
    expect(await probe('https://ghfast.top/', 3000, fakeDeps(['error']))).toEqual({ ok: false, reason: 'error' })
    vi.useFakeTimers()
    const deps = fakeDeps(['hang'])
    const task = probe('https://ghfast.top/', 3000, deps)
    await vi.advanceTimersByTimeAsync(3000)
    expect(await task).toEqual({ ok: false, reason: 'timeout' })
    expect(deps.calls[0]?.signal?.aborted).toBe(true)
  })

  it('延迟为首次请求的耗时，Ping 为之后三次的中位数', async () => {
    expect(await measureLatency('https://ghfast.top/', fakeDeps([420, 90, 70, 110]))).toEqual({
      latency: { ok: true, ms: 420 },
      ping: { ok: true, ms: 90 }
    })
  })

  it('首次请求失败：没有 Ping；之后的请求失败：Ping 为失败', async () => {
    expect(await measureLatency('https://ghfast.top/', fakeDeps(['error']))).toEqual({
      latency: { ok: false, reason: 'error' }
    })
    expect(await measureLatency('https://ghfast.top/', fakeDeps([420, 90, 'error']))).toEqual({
      latency: { ok: true, ms: 420 },
      ping: { ok: false, reason: 'error' }
    })
  })
})
