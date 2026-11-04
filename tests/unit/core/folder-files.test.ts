import { describe, expect, it, vi } from 'vitest'
import {
  encodePath,
  fetchFile,
  FolderError,
  listFolder,
  MAX_DIRECTORIES,
  MAX_FILES,
  parseTreeData,
  runPool,
  treePage,
  type FetchLike
} from '../../../src/core/folder-files'

const ORIGIN = 'https://github.com'
const OID = 'a'.repeat(40)

interface Item {
  readonly path: string
  readonly contentType: string
}

function tree(path: string, items: readonly Item[], totalCount = items.length): unknown {
  return { payload: { codeViewTreeRoute: { path, refInfo: { currentOid: OID }, tree: { items, totalCount } } } }
}

const file = (path: string): Item => ({ path, contentType: 'file' })
const directory = (path: string): Item => ({ path, contentType: 'directory' })

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })
}

/** 假请求：按地址应答目录数据；没有配置的地址应答 404 */
function fakeTrees(trees: Readonly<Record<string, unknown>>): FetchLike & { mock: { calls: [string, RequestInit][] } } {
  return vi.fn(async (url: string) => (url in trees ? json(trees[url]) : new Response('', { status: 404 }))) as never
}

async function reason(task: Promise<unknown>): Promise<string | undefined> {
  try {
    await task
    return undefined
  } catch (error) {
    return error instanceof FolderError ? error.reason : String(error)
  }
}

describe('treePage', () => {
  it('目录页：所有者、存储库（解码）', () => {
    expect(treePage('/vuejs/core/tree/main')).toEqual({ owner: 'vuejs', repo: 'core' })
    expect(treePage('/vuejs/core/tree/main/packages/runtime-core')).toEqual({ owner: 'vuejs', repo: 'core' })
    expect(treePage('/octocat/hello%20world/tree/v1.0')).toEqual({ owner: 'octocat', repo: 'hello world' })
  })

  it.each(['/vuejs/core', '/vuejs/core/tree/', '/vuejs/core/blob/main/README.md', '/vuejs/tree/main', '/'])('%s → 不是目录页', pathname => {
    expect(treePage(pathname)).toBeUndefined()
  })
})

describe('encodePath', () => {
  it('每一段分别编码，保留 /', () => {
    expect(encodePath('docs/a b/c#d?.md')).toBe('docs/a%20b/c%23d%3F.md')
    expect(encodePath('中文/文件.txt')).toBe(`${encodeURIComponent('中文')}/${encodeURIComponent('文件.txt')}`)
  })
})

describe('parseTreeData', () => {
  it('路径去掉首尾的 /；没有总数时按条目数', () => {
    expect(parseTreeData(tree('/packages/', [file('packages/a.ts')]))).toEqual({
      path: 'packages',
      oid: OID,
      items: [{ path: 'packages/a.ts', contentType: 'file' }],
      totalCount: 1
    })
    const data = { payload: { codeViewTreeRoute: { path: '', refInfo: { currentOid: OID }, tree: { items: [] } } } }
    expect(parseTreeData(data)?.totalCount).toBe(0)
  })

  it.each([
    ['不是对象', null],
    ['没有 payload', {}],
    ['提交不是 SHA', { payload: { codeViewTreeRoute: { path: '', refInfo: { currentOid: 'main' }, tree: { items: [] } } } }],
    ['条目不是数组', { payload: { codeViewTreeRoute: { path: '', refInfo: { currentOid: OID }, tree: { items: {} } } } }],
    ['条目缺字段', tree('', [{ path: 'a' } as Item])],
    ['路径不是字符串', { payload: { codeViewTreeRoute: { path: 1, refInfo: { currentOid: OID }, tree: { items: [] } } } }]
  ])('%s → undefined', (_name, value) => {
    expect(parseTreeData(value)).toBeUndefined()
  })
})

describe('runPool', () => {
  it('同时进行的不超过上限，全部处理', async () => {
    let running = 0
    let peak = 0
    const done: number[] = []
    await runPool([1, 2, 3, 4, 5], 2, async item => {
      running += 1
      peak = Math.max(peak, running)
      await new Promise(resolve => setTimeout(resolve, 1))
      running -= 1
      done.push(item)
    })
    expect(peak).toBe(2)
    expect(done.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('任一失败时拒绝；空列表直接完成', async () => {
    await expect(runPool([1, 2], 4, async item => (item === 2 ? Promise.reject(new Error('失败')) : undefined))).rejects.toThrow('失败')
    await expect(runPool([], 4, async () => undefined)).resolves.toBeUndefined()
  })
})

describe('listFolder', () => {
  const ROOT = `${ORIGIN}/vuejs/core/tree/main/packages`
  const SUB = `${ORIGIN}/vuejs/core/tree/${OID}/`

  it('逐级列出全部文件（按路径排序），子目录按提交 SHA 请求；子模块、指向目录的符号链接跳过', async () => {
    const fetcher = fakeTrees({
      [ROOT]: tree('packages', [
        file('packages/z.ts'),
        directory('packages/sub dir'),
        { path: 'packages/vendor', contentType: 'submodule' },
        { path: 'packages/link', contentType: 'symlink_file' },
        { path: 'packages/linked-dir', contentType: 'symlink_directory' }
      ]),
      [`${SUB}packages/sub%20dir`]: tree('packages/sub dir', [file('packages/sub dir/a.ts'), directory('packages/sub dir/deep')]),
      [`${SUB}packages/sub%20dir/deep`]: tree('packages/sub dir/deep', [file('packages/sub dir/deep/b.ts')])
    })
    const result = await listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fetcher, new AbortController().signal)
    expect(result.info).toEqual({ owner: 'vuejs', repo: 'core', path: 'packages', oid: OID })
    expect(result.files).toEqual(['packages/link', 'packages/sub dir/a.ts', 'packages/sub dir/deep/b.ts', 'packages/z.ts'])
    expect(fetcher.mock.calls[0]![1]).toMatchObject({ credentials: 'same-origin', headers: { Accept: 'application/json' } })
  })

  it('某级目录只给出部分条目：文件过多', async () => {
    const fetcher = fakeTrees({ [ROOT]: tree('packages', [file('packages/a.ts')], 2000) })
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fetcher, new AbortController().signal))).toBe('tooMany')
  })

  it('文件数、目录数超出上限：文件过多', async () => {
    const files = Array.from({ length: MAX_FILES + 1 }, (_, index) => file(`packages/${index}.ts`))
    expect(
      await reason(
        listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fakeTrees({ [ROOT]: tree('packages', files) }), new AbortController().signal)
      )
    ).toBe('tooMany')
    const directories = Array.from({ length: MAX_DIRECTORIES }, (_, index) => directory(`packages/${index}`))
    expect(
      await reason(
        listFolder(
          ORIGIN,
          '/vuejs/core/tree/main/packages',
          fakeTrees({ [ROOT]: tree('packages', directories) }),
          new AbortController().signal
        )
      )
    ).toBe('tooMany')
  })

  it('没有文件：空文件夹', async () => {
    const fetcher = fakeTrees({ [ROOT]: tree('packages', [{ path: 'packages/vendor', contentType: 'submodule' }]) })
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fetcher, new AbortController().signal))).toBe('empty')
  })

  it('应答失败、数据不合法、不是目录页：失败', async () => {
    const signal = new AbortController().signal
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fakeTrees({}), signal))).toBe('failed')
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fakeTrees({ [ROOT]: { payload: {} } }), signal))).toBe(
      'failed'
    )
    const html: FetchLike = async () => new Response('<html></html>', { status: 200 })
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', html, signal))).toBe('failed')
    expect(await reason(listFolder(ORIGIN, '/vuejs/core/blob/main/README.md', fakeTrees({}), signal))).toBe('failed')
  })

  it('取消：不再请求子目录', async () => {
    const controller = new AbortController()
    const fetcher = vi.fn(async (url: string) => {
      if (url === ROOT) {
        controller.abort()
        return json(tree('packages', [directory('packages/sub')]))
      }
      return json(tree('packages/sub', [file('packages/sub/a.ts')]))
    })
    await expect(listFolder(ORIGIN, '/vuejs/core/tree/main/packages', fetcher, controller.signal)).rejects.toThrow()
    expect(fetcher).toHaveBeenCalledOnce()
  })
})

describe('fetchFile', () => {
  const URL = `${ORIGIN}/vuejs/core/raw/${OID}/README.md`

  it('取回内容；请求带上取消信号与给定的选项', async () => {
    const fetcher = vi.fn(async () => new Response('Sample text'))
    const controller = new AbortController()
    const data = await fetchFile(fetcher, URL, { credentials: 'omit' }, controller.signal)
    expect(new TextDecoder().decode(data)).toBe('Sample text')
    expect(fetcher).toHaveBeenCalledWith(URL, { credentials: 'omit', signal: controller.signal })
  })

  it('应答失败、网络出错时重试一次；仍失败时为失败', async () => {
    const flaky = vi.fn<FetchLike>().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(new Response('ok'))
    expect(new TextDecoder().decode(await fetchFile(flaky, URL, {}, new AbortController().signal))).toBe('ok')
    const broken = vi.fn(async () => new Response('', { status: 500 }))
    expect(await reason(fetchFile(broken, URL, {}, new AbortController().signal))).toBe('failed')
    expect(broken).toHaveBeenCalledTimes(2)
  })

  it('已取消：以 AbortError 拒绝，不再请求', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetcher = vi.fn<FetchLike>()
    await expect(fetchFile(fetcher, URL, {}, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetcher).not.toHaveBeenCalled()
  })
})
