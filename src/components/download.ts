/** 下载后延迟释放对象 URL，避免部分浏览器在下载开始前失效 */
export const REVOKE_DELAY_MS = 30_000

/** 以文件形式下载文本 */
export function downloadText(fileName: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}
