import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 代码空间：预生成配置列表、新建 / 编辑预生成配置（触发器、区域可用性、模板历史记录、
 * 失败通知、高级选项）。
 * 术语：codespace → 程式碼空間，prebuild → 預先建置，configuration → 設定，trigger → 觸發條件，schedule → 排程，
 * region → 區域，template → 範本，optimization → 最佳化，Weekdays → 平日（与 org-settings/archive.ts 一致）。
 */
export default {
  static: {
    // 列表
    'Prebuild configuration created': '已建立預先建置設定',
    'Prebuild configuration deleted': '已刪除預先建置設定',
    'Prebuild configuration': '預先建置設定',
    'Set up prebuild': '設定預先建置',
    'There are no prebuilds configured for this repository': '此儲存庫尚未設定預先建置',
    'Prebuild configurations speed up Codespace creations significantly by pre-executing all the tasks required to build your development environment.':
      '預先建置設定會預先執行建置開發環境所需的所有工作，大幅加快程式碼空間的建立速度。',
    'Learn more about setting up prebuilds': '瞭解如何設定預先建置',
    'Currently Running': '目前執行中',
    'See output': '查看輸出',
    'Manually trigger': '手動觸發',
    'Disable runs': '停用執行',
    'Enable runs': '啟用執行',
    'Are you sure you want to delete this prebuild configuration? Running workflow may fail and templates associated with this configuration will be deleted.':
      '確定要刪除此預先建置設定嗎？執行中的工作流程可能會失敗，與此設定關聯的範本也會一併刪除。',

    // 新建 / 编辑
    '/ New prebuild configuration': '/ 新增預先建置設定',
    '/ Edit configuration': '/ 編輯設定',
    'Prebuilds consume storage space that will incur a billable charge. Learn more about':
      '預先建置會佔用儲存空間並產生費用。瞭解',
    'prebuild configurations': '預先建置設定',
    'Your prebuild will be built from the branch and configuration file selected below. Learn more about':
      '預先建置將根據下方選擇的分支和設定檔建置。瞭解',
    'prebuild configuration.': '預先建置設定。',
    'Configuration File:': '設定檔：',
    'Default Codespaces Configuration': '預設程式碼空間設定',
    'Access and cost control': '存取和費用控制',
    'Prebuild triggers': '預先建置觸發條件',
    // 原文只写 Actions 而指整个产品，补 GitHub 前缀
    'You can specify how often to prebuild your codespace based on changes to your repository or a schedule to manage Actions usage.':
      '你可以根據儲存庫變更或排程指定預先建置程式碼空間的頻率，以管理 GitHub 動作使用量。',
    'Learn about prebuild triggers': '瞭解預先建置觸發條件',
    'Every push': '每次推送',
    'Your codespace will prebuild on every push to this branch': '你的程式碼空間會在每次推送到此分支時預先建置',
    'Configuration change': '設定變更',
    'Your codespace will prebuild when a change is detected on the devcontainer.json and associated configuration files':
      '你的程式碼空間會在偵測到 devcontainer.json 和相關設定檔有變更時預先建置',
    'Your codespace will prebuild on a schedule': '你的程式碼空間會依排程預先建置',
    'Every day': '每天',
    'Region availability': '區域可用性',
    'Reduce prebuild availability to only specific regions': '僅在特定區域提供預先建置',
    'By default, your prebuilt image will be available to all regions where codespaces are available and storage costs will apply for each region. You can adjust this to manage your storage usage.':
      '根據預設，預先建置的映像檔會在所有提供程式碼空間的區域中提供，且每個區域都會產生儲存費用。你可以調整此設定以管理儲存空間使用量。',
    'Learn about region availability': '瞭解區域可用性',
    'US East': '美國東部',
    'US West': '美國西部',
    'Europe West': '歐洲西部',
    'Southeast Asia': '東南亞',
    'Template history': '範本歷史記錄',
    'You can specify the number of prebuild template versions retained to speed up codespaces from an older commit to manage storage costs. The maximum value is 5 versions.':
      '你可以指定要保留的預先建置範本版本數，以加快從較舊提交建立程式碼空間的速度並管理儲存費用。最多 5 個版本。',
    'Learn about template history': '瞭解範本歷史記錄',
    'Failure notifications': '失敗通知',
    'You can specify users or teams to be notified via e-mail when prebuilds for this particular configuration fail.':
      '你可以指定此設定的預先建置失敗時要透過電子郵件通知的使用者或團隊。',
    'Add by username, full name, or team name': '依使用者名稱、全名或團隊名稱新增',
    "You haven't added anyone yet": '你尚未新增任何人',
    'You haven’t added anyone yet': '你尚未新增任何人',
    'Add members to receive email notifications when prebuilds fail for this configuration':
      '新增成員以在此設定的預先建置失敗時接收電子郵件通知',
    'Show advanced options': '顯示進階選項',
    "You can disable prebuild optimization if you're having issues where codespaces are several commits behind on a specific branch.":
      '如果特定分支上的程式碼空間落後好幾個提交，你可以停用預先建置最佳化。',
    'You can disable prebuild optimization if you’re having issues where codespaces are several commits behind on a specific branch.':
      '如果特定分支上的程式碼空間落後好幾個提交，你可以停用預先建置最佳化。',
    'Learn about prebuild optimization': '瞭解預先建置最佳化',
    'Disable prebuild optimization': '停用預先建置最佳化',
    'This prevents codespaces from attempting to use an older image to speed up boot time. This could adversely affect performance.':
      '這會防止程式碼空間嘗試使用較舊的映像檔來縮短啟動時間。這可能會對效能造成不良影響。',
    'Hide advanced options': '隱藏進階選項',
  },
  scoped: {
    // 排程触发条件：「Days」下拉框的选项是 Weekdays、Every day 与星期名，作「星期」；「Times」作「時間」
    Scheduled: '排程',
    Days: '星期',
    Weekdays: '平日',
    Times: '時間',
    Sunday: '星期日',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    versions: '個版本',
    'Find a branch': '尋找分支',
    'Select branch': '選擇分支',
  },
  regexp: [
    // 范本历史记录：保留的版本数
    [/^(\d+) versions?$/, '$1 個版本'],
  ],
} satisfies PageDictionary
