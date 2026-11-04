import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 空结果标题：Your search did not match any repositories */
const EMPTY_HEADINGS: Readonly<Record<string, string>> = {
  code: '沒有與搜尋相符的程式碼',
  repositories: '沒有與搜尋相符的儲存庫',
  issues: '沒有與搜尋相符的議題',
  'pull requests': '沒有與搜尋相符的拉取請求',
  discussions: '沒有與搜尋相符的討論',
  users: '沒有與搜尋相符的使用者',
  commits: '沒有與搜尋相符的提交',
  packages: '沒有與搜尋相符的套件',
  wikis: '沒有與搜尋相符的 Wiki',
  topics: '沒有與搜尋相符的主題',
  // 产品名译中文（用户定）：Marketplace → 市集；结果含应用程序与动作，统称「項目」
  marketplace: '沒有與搜尋相符的市集項目'
}

/** 「However we found 3 repositories that matched…」中的类型 */
const FOUND_KINDS: Readonly<Record<string, string>> = {
  'code result': '程式碼結果',
  'code results': '程式碼結果',
  repository: '儲存庫',
  repositories: '儲存庫',
  issue: '議題',
  issues: '議題',
  'pull request': '拉取請求',
  'pull requests': '拉取請求',
  discussion: '討論',
  discussions: '討論',
  user: '使用者',
  users: '使用者',
  commit: '提交',
  commits: '提交',
  package: '套件',
  packages: '套件',
  wiki: 'Wiki',
  wikis: 'Wiki',
  topic: '主題',
  topics: '主題'
}

/** 量词随名词：使用者作「位」，程式碼结果（搜索结果）作「項」，其余作「個」 */
const FOUND_MEASURES: Readonly<Record<string, string>> = {
  'code result': '項',
  'code results': '項',
  user: '位',
  users: '位'
}

function measure(kind: string): string {
  return FOUND_MEASURES[kind] ?? '個'
}

/** 3 + repositories → 3 個儲存庫；英文类型名前加空格：3 個 Wiki；量词随名词：3 項程式碼結果、12 位使用者 */
function foundCount(count: string, kind: string): string {
  return joinCjk(`${count} ${measure(kind)}`, FOUND_KINDS[kind] ?? kind)
}

/** 链接中单独出现的「数量 + 类型」；存储库、议题、拉取请求、讨论、提交、软件包的计数由 common 收录 */
const FOUND_COUNT_KINDS = ['code results?', 'users?', 'wikis?', 'topics?'].join('|')

/** 空结果页：标题、提示折叠项（含代码搜索的索引说明与正则示例） */
export default {
  static: {
    // 标题与说明
    'Your search did not match any': '沒有與搜尋相符的',
    'You could try one of the tips below.': '可嘗試以下提示。',
    'Try one of the tips below to find more code': '嘗試以下提示以找到更多程式碼',
    'Try one of the tips below to find more repositories': '嘗試以下提示以找到更多儲存庫',
    'However we found': '不過找到了',
    'that matched your search query. Alternatively try one of the tips below.': '與搜尋查詢相符。也可嘗試以下提示。',
    'You could try an': '可以嘗試',

    // 提示：跨存储库、组织
    'Search across repositories': '跨儲存庫搜尋',
    'Within a repository:': '在單一儲存庫中：',
    'Across several:': '跨多個儲存庫：',
    'Alternative way:': '另一種寫法：',
    'Search across an organization': '在組織內搜尋',
    'Within an organization:': '在組織內：',
    "User's code:": '使用者的程式碼：',
    'User’s code:': '使用者的程式碼：',
    // Note that … 不译出“注意：”（原文没有冒号；正则表达式提示同）；regex 取微软繁中「規則運算式」
    "Note that we don't currently support regular expressions in the repo or org qualifiers. For more information on search syntax, see our":
      'repo 和 org 限定詞目前不支援規則運算式。如需搜尋語法的詳細資訊，請參閱',
    'Note that we don’t currently support regular expressions in the repo or org qualifiers. For more information on search syntax, see our':
      'repo 和 org 限定詞目前不支援規則運算式。如需搜尋語法的詳細資訊，請參閱',
    'syntax guide': '語法指南',

    // 提示：文件扩展名
    'Find a particular file extension': '尋找特定副檔名的檔案',
    'With .txt extensions:': '副檔名為 .txt：',
    'JavaScript and TypeScript files:': 'JavaScript 和 TypeScript 檔案：',
    // 原文用逗号带出 not just the extension，译文同样用逗号，不改成括号
    'The path qualifier can search the entire file path, not just the extension, and supports regular expressions. For more information, see our':
      'path 限定詞可搜尋完整的檔案路徑，不只是副檔名，還支援規則運算式。如需詳細資訊，請參閱',

    // 提示：为什么找不到代码
    "Why wasn't my code found?": '為什麼找不到我的程式碼？',
    'Why wasn’t my code found?': '為什麼找不到我的程式碼？',
    'When you search within a repository for the first time, please note that the repository undergoes indexing.':
      '首次在儲存庫中搜尋時，該儲存庫需要先建立索引。',
    'This process may take a few minutes.': '此過程可能需要幾分鐘。',
    'The index currently includes more than 70 million popular public repositories, plus all private repositories that users search for.':
      '索引目前包含超過 7000 萬個熱門公開儲存庫，以及使用者搜尋過的所有私人儲存庫。',
    "Beyond that, we also don't include all files in the search index:": '此外，搜尋索引並未包含所有檔案：',
    'Beyond that, we also don’t include all files in the search index:': '此外，搜尋索引並未包含所有檔案：',
    // vendored code 指随储存库附带的第三方程式码
    'Vendored and generated code is excluded': '排除隨附的第三方程式碼和產生的程式碼',
    'Empty files and files over 350 kiB are excluded': '排除空白檔案和超過 350 kiB 的檔案',
    'Only UTF-8 encoded files are indexed': '僅為 UTF-8 編碼的檔案建立索引',
    'Very large repositories may not be indexed': '可能不會為超大型儲存庫建立索引',
    'We intend to continue to increase the amount of code available in the index as much as possible. If we are missing files that are useful to you, feel free to':
      '我們會持續盡可能擴大索引中的程式碼量。如果缺少對你有用的檔案，歡迎',
    'provide feedback here': '在此提供意見回饋',

    // 提示：正则表达式
    'Regular expressions': '規則運算式',
    'Sparse followed by index:': 'sparse 後接 index：',
    'Lines that end with return:': '以 return 結尾的行：',
    'File paths matching:': '相符的檔案路徑：',
    // escape 取微软繁中「逸出」
    "Note that you'll have to escape any slashes in the regex. For more information, see our":
      '規則運算式中的斜線必須逸出。如需詳細資訊，請參閱',
    'Note that you’ll have to escape any slashes in the regex. For more information, see our':
      '規則運算式中的斜線必須逸出。如需詳細資訊，請參閱',

    // 提示：已保存的搜索
    'Always searching within the same organization or set of repositories? Try constructing a query and click the save button in the top right corner.':
      '經常在同一個組織或同一組儲存庫中搜尋？可建立查詢後按一下右上角的儲存按鈕。'
  },
  scoped: {
    // 数量在单独元素中：3 + code results（搜索结果量词作「項」）
    'code results': '項程式碼結果',
    'code result': '項程式碼結果'
  },
  regexp: [
    // 「Your search did not match any 」「repositories」拼接（类型词不单独收录，避免误译路径、代码中的同名单词）
    [new RegExp(`^Your search did not match any (${Object.keys(EMPTY_HEADINGS).join('|')})$`), (_, type) => EMPTY_HEADINGS[type] ?? type],
    [
      new RegExp(
        `^However we found (\\d[\\d.,]*[kKMB]?) (${Object.keys(FOUND_KINDS).join('|')}) that matched your search query\\. Alternatively try one of the tips below\\.$`
      ),
      (_, count, kind) =>
        `${joinCjk(`不過找到了 ${count} ${measure(kind)}與搜尋查詢相符的`, FOUND_KINDS[kind] ?? kind)}。也可嘗試以下提示。`
    ],
    // 句中类型为链接时：However we found <3 code results> that matched…
    [new RegExp(`^(\\d[\\d.,]*[kKMB]?) (${FOUND_COUNT_KINDS})$`), (_, count, kind) => foundCount(count, kind)]
  ]
} satisfies PageDictionary
