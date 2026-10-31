/** 私密代码片段（secret）标题旁的标签；按元素判断，不看文字（文字可能已译成中文） */
const SECRET_GIST_SELECTOR = '.gisthead .Label, h1 .Label, [title="Only those with the link can see this gist."]'

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/**
 * 不公开的页面：私有、内部存储库的页面，私密代码片段的页面。其中的链接、图片不交给第三方。
 * url 为页面地址，缺省取 doc.URL
 */
export function isPrivatePage(doc: Document, url: string = doc.URL): boolean {
  const meta = doc.querySelector('meta[name="octolytics-dimension-repository_public"]')
  if (meta?.getAttribute('content') === 'false') return true
  return hostnameOf(url) === 'gist.github.com' && doc.querySelector(SECRET_GIST_SELECTOR) !== null
}
