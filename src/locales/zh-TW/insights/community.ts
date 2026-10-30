import type { PageDictionary } from '../../../core/types'

/** 社区标准（/community）、社区见解图（/graphs/community）、见解功能升级提示 */
export default {
  static: {
    'Community standards': '社群標準',
    'Community Standards': '社群標準',
    // Here’s how this project compares to <recommended community standards>.
    'Here’s how this project compares to': '以下比較此專案和',
    "Here's how this project compares to": '以下比較此專案和',
    'recommended community standards': '建議的社群標準',
    Checklist: '檢查清單',
    License: '授權條款',
    'Issue templates': '議題範本',
    'Pull request template': '拉取請求範本',
    'Repository admins accept content reports': '儲存庫管理員接受內容檢舉',
    'Additional community file': '其他社群檔案',
    "Describe your project's accessibility commitment, supported environments, known limitations, and how people can report barriers.":
      '描述專案的無障礙承諾、支援的環境、已知限制和使用者回報障礙的方式。',
    'Describe your project’s accessibility commitment, supported environments, known limitations, and how people can report barriers.':
      '描述專案的無障礙承諾、支援的環境、已知限制和使用者回報障礙的方式。',
    'Writing an accessibility statement': '撰寫無障礙聲明',
    'View an ACCESSIBILITY.md example': '查看 ACCESSIBILITY.md 範例',
    'Add accessibility file': '新增無障礙檔案',
    // What is <the community profile>?（community profile 是社群健康检查清单，作「社群概況」，与「社群檔案」区分）
    'What is': '什麼是',
    'the community profile': '社群概況',
    Added: '已新增',
    'Not added yet': '尚未新增',
    // 检查清单各项的帮助链接
    'Add a description to your repository so people understand the goals of your project.':
      '為儲存庫新增描述，讓其他人瞭解專案的目標。',
    'Writing a README': '撰寫讀我檔案',
    'What is a code of conduct?': '什麼是行為準則？',
    'Writing contributing guidelines': '撰寫貢獻指南',
    'Choosing a license': '選擇授權條款',

    // 专用存储库的见解功能
    'Upgrade to GitHub Pro or make this repository public to enable this feature.':
      '升級到 GitHub 專業版或將此儲存庫設為公開以啟用此功能。',
    'Contact an administrator to upgrade to GitHub Team or make this repository public to enable this feature.':
      '聯絡管理員升級到 GitHub 團隊版或將此儲存庫設為公開以啟用此功能。',
    'We want to know how these insights are helping you and where they could be improved.':
      '我們想瞭解這些洞察對你有何幫助，又有哪些地方可以改進。',

    // 社区见解图（启用讨论的存储库）
    'Enable Discussions to unlock Community Insights!': '啟用討論以解鎖社群洞察！',
    'Discussions is the central space for your community to share announcements, ask questions, and host conversations.':
      '討論是你的社群分享公告、提出問題和展開對話的中心空間。',
    'Community insights': '社群洞察',
    'Count of total contribution activity to Discussions, Issues, and PRs': '討論、議題和 PR 的貢獻活動總數',
    'We tried our best, but the graph wouldn’t load. Try reloading the page.': '圖表無法載入。請嘗試重新載入頁面。',
    "We tried our best, but the graph wouldn't load. Try reloading the page.": '圖表無法載入。請嘗試重新載入頁面。',
    'Discussions page views': '討論頁面瀏覽次數',
    'Total page views to Discussions segmented by logged in vs anonymous users.':
      '依已登入和匿名使用者區分的討論頁面總瀏覽次數。',
    'Not enough data yet.': '尚無足夠資料。',
    'It usually takes about a week to populate this chart.': '通常約需一週才能產生此圖表。',
    'Read more about insights': '瞭解洞察',
    'Discussions daily contributors': '討論每日貢獻者',
    // unique users 取台湾流量统计通行的「不重複使用者」；reacted → 新增表情回應，upvoted → 投贊成票
    'Count of unique users who have reacted, upvoted, marked an answer, commented, or posted in the selected period.':
      '所選期間內曾新增表情回應、投贊成票、標示答案、留言或發文的不重複使用者人數。',
    'Discussions new contributors': '討論新貢獻者',
    'Count of unique new users to Discussions who have reacted, upvoted, marked an answer, commented, or posted in the selected period.':
      '所選期間內首次在討論中新增表情回應、投贊成票、標示答案、留言或發文的不重複使用者人數。',
  },
  scoped: {
    'Code of conduct': '行為準則',
    README: '讀我檔案',
    Contributing: '貢獻指南',
    'Security policy': '安全性政策',
    Propose: '提議',
    Stargazers: '加星號的使用者',
    Watchers: '關注者',
    'You know': '你認識的',
    Quantity: '數量',
    Timeline: '時間軸',
    'logged in': '已登入',
    anonymous: '匿名',
  },
} satisfies PageDictionary
