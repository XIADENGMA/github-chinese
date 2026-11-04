import type { PageDictionary } from '../../../core/types'

/**
 * 首页新手引导与推广卡片：新版入门清单、文档与资源卡片、下载推荐、入门视频，
 * 旧版“通过教程项目学习 / 开始编写代码 / 使用行业工具”卡片，以及 GitHub 教育推广。
 * 产品名按用户要求译成中文（.harvest/scratch/followups/product-names.md）：Copilot Chat → Copilot 聊天、
 * GitHub Desktop → GitHub 桌面版、GitHub Pages → GitHub 頁面、Codespaces → 程式碼空間、GitHub Education → GitHub 教育；
 * GitHub、Copilot、Git 与第三方产品名（Visual Studio、VS Code、YouTube）保留。
 */
export default {
  static: {
    // 入门清单
    'You finished your onboarding tasks!': '你已完成入門任務！',
    'Now the real magic begins when you ship something amazing. Continue to check out tutorials, best practices, and docs to get the most out of GitHub.':
      '交付出色的作品後，真正的魔法才正要開始。繼續查看教學課程、最佳做法和說明文件，充分運用 GitHub。',
    'Remove from dashboard': '從儀表板移除',
    'Create your first code project': '建立你的第一個程式碼專案',
    'It’s your own space to experiment, learn, and share code with the world.': '這是屬於你的空間，可以實驗、學習，並與全世界分享程式碼。',
    'Introduction to GitHub tutorial': 'GitHub 入門教學',
    'Create a personal README.md': '建立個人 README.md',
    'Blank project': '空白專案',
    'Start a Copilot chat': '開始與 Copilot 聊天',
    'Ask Copilot questions about coding or GitHub and get instant help with your first project.':
      '向 Copilot 提出程式設計或 GitHub 的問題，為你的第一個專案取得即時協助。',
    'Complete your profile': '完成你的個人檔案',
    'Add a bio, upload an avatar, and personalize your details — building your social coding presence and connecting with others.':
      '新增個人簡介、上傳頭像並自訂個人資訊——打造你在社群程式開發中的形象，並與他人建立聯繫。',
    'Complete profile': '完成個人檔案',
    'All tasks completed!': '所有任務都已完成！',
    'Item progress': '項目進度',

    // 文档与资源卡片
    'GitHub Documentation': 'GitHub 說明文件',
    'Help for wherever you are on your journey': '無論處於哪個階段都能找到協助',
    'About GitHub and Git': '關於 GitHub 和 Git',
    'How to create your first repository': '如何建立你的第一個儲存庫',
    'Creating a pull request': '建立拉取請求',
    'What is GitHub Copilot?': '什麼是 GitHub Copilot？',
    'GitHub flow': 'GitHub 流程',
    'Hello World exercise': 'Hello World 練習',
    'Copilot Chat Cookbook': 'Copilot 聊天實用手冊',
    'Start with GitHub Docs': '從 GitHub 說明文件開始',
    'Tutorials · 150+ guides': '教學課程 · 150+ 篇指南',
    'Getting started playlist': '入門播放清單',
    'Explore community': '探索社群',
    "Browse others' code and open source projects": '瀏覽他人的程式碼和開源專案',

    // 下载推荐
    'Download Visual Studio with Copilot': '下載搭載 Copilot 的 Visual Studio',
    'Chat with Copilot to build your first website, troubleshoot your code, or guide you through your GitHub journey.':
      '與 Copilot 聊天，打造你的第一個網站、排解程式碼問題，或引導你探索 GitHub。',
    'Download GitHub for Desktop': '下載 GitHub 桌面版',
    'GitHub Desktop simplifies Git workflows and brings core GitHub features to your desktop, helping developers of all levels focus on building and collaborating effectively.':
      'GitHub 桌面版簡化了 Git 工作流程，並將 GitHub 的核心功能帶到你的桌面，協助各種程度的開發人員專注於開發和高效協作。',
    "Whether you're new to Git or a seasoned user, GitHub Desktop enables collaboration from your desktop and can simplify your development workflow.":
      '無論你是 Git 新手還是資深使用者，GitHub 桌面版都能讓你直接在桌面上協作，並簡化你的開發工作流程。',
    'Visual Studio Code with Copilot': '搭載 Copilot 的 Visual Studio Code',
    'Customizable. Contextual. AI-powerful. GitHub Copilot can use your code and custom instructions to code the way you prefer.':
      '可自訂。懂上下文。AI 驅動。GitHub Copilot 能運用你的程式碼和自訂指示，依你偏好的方式撰寫程式碼。',

    // 入门视频
    'GitHub for beginners on YouTube': 'YouTube 上的 GitHub 新手教學',
    "Designed to help you master the basics of GitHub, whether you're new to coding or looking to enhance your version control skills.":
      '協助你掌握 GitHub 基礎知識，無論你是程式設計新手，還是想提升版本控制技能。',
    'Start playlist': '開始播放',
    'Watch video': '觀看影片',
    'Video thumbnail': '影片縮圖',

    // 旧版首页：欢迎与教程项目（分句间的 — 译作 ——，两侧不加空格）
    'The home for all developers — including you.': '所有開發人員的家——包括你。',
    'Welcome to your personal dashboard, where you can find an introduction to how GitHub works, tools to help you build software, and help merging your first lines of code.':
      '歡迎來到你的個人儀表板，你可以在這裡瞭解 GitHub 的運作方式、取得開發軟體的工具，並在合併第一行程式碼時獲得協助。',
    'Learn with a tutorial project': '用教學專案學習',
    'Introduction to GitHub': 'GitHub 入門',
    'Get started using GitHub in less than an hour.': '不到一小時就能開始使用 GitHub。',
    'Create a site or blog from your GitHub repositories with GitHub Pages.': '使用 GitHub 頁面，從你的 GitHub 儲存庫建立網站或部落格。',
    'Code with Copilot': '使用 Copilot 撰寫程式碼',
    'Develop with AI-powered code suggestions using GitHub Copilot, Codespaces, and VS Code.':
      '使用 GitHub Copilot、程式碼空間和 VS Code，以 AI 驅動的程式碼建議來開發。',
    // 教程项目 Hello GitHub Actions（同 Introduction to GitHub → GitHub 入門）
    'Hello GitHub Actions': 'GitHub 動作入門',
    'Create a GitHub Action and use it in a workflow.': '建立 GitHub 動作並在工作流程中使用。',
    'See more tutorial projects': '查看更多教學專案',

    // 旧版首页：开始编写代码
    'Start writing code': '開始撰寫程式碼',
    "A repository contains all of your project's files, revision history, and collaborator discussion.":
      '儲存庫包含專案的所有檔案、修訂歷史記錄和協作者討論。',
    'name your new repository...': '為新儲存庫命名...',
    'Anyone on the internet can see this repository': '網際網路上的任何人都能看到此儲存庫',
    'You choose who can see and commit to this repository': '由你決定誰能查看並提交到此儲存庫',
    // 卡片显示原因：标点随原文，不加冒号
    "You're seeing this because you haven't created a repository in a while.": '你看到此內容是因為你有一段時間沒有建立儲存庫了。',
    "You're seeing this because you haven't used repositories, issues, and pull requests recently.":
      '你看到此內容是因為你最近沒有使用儲存庫、議題和拉取請求。',
    'Repositories that need your help': '需要你協助的儲存庫',
    'See more repos with good first issues': '查看更多含有適合新手議題的儲存庫',

    // 旧版首页：使用行业工具（拉取请求的动词 open → 建立）
    'Use tools of the trade': '使用專業工具',
    "You're seeing this because you haven't opened a pull request in a while.": '你看到此內容是因為你有一段時間沒有建立拉取請求了。',
    'Simplify your development workflow with a GUI': '用圖形介面簡化開發工作流程',
    'Install GitHub Desktop': '安裝 GitHub 桌面版',
    'to visualize, commit, and push changes without ever touching the command line.':
      '，不必使用命令列就能以視覺化方式檢視、提交並推送變更。',
    'Get AI-based coding suggestions': '取得 AI 程式碼建議',
    'Try GitHub Copilot free for 30 days,': '免費試用 GitHub Copilot 30 天，',
    'which suggests entire functions in real time, right from your editor.': '它能直接在編輯器中即時建議完整函式。',
    'Write code in your web browser': '在網頁瀏覽器中撰寫程式碼',
    'the github.dev web-based editor': 'github.dev 網頁版編輯器',
    'from your repository or pull request to create and commit changes.': '，從儲存庫或拉取請求中建立並提交變更。',
    'Install a powerful code editor': '安裝功能強大的程式碼編輯器',
    'is a multi-platform code editor optimized for building and debugging software.':
      '是一款針對建置並偵錯軟體最佳化的跨平台程式碼編輯器。',
    'Set up your local dev environment': '設定本機開發環境',
    'set up Git': '設定 Git',
    ', simplify your dev workflow with': '，簡化開發工作流程可使用',
    'bring GitHub to the command line': '把 GitHub 帶到命令列',

    // 旧版首页：开始使用 GitHub
    'Get started on GitHub': '開始使用 GitHub',
    "You're seeing this because you haven't used GitHub's core features, yet.": '你看到此內容是因為你還沒有使用過 GitHub 的核心功能。',
    'Introduce yourself with a profile README': '用個人檔案讀我檔案介紹自己',
    'Share information about yourself by creating a profile README, which appears at the top of your profile page.':
      '建立個人檔案讀我檔案來分享你的資訊，它會顯示在個人檔案頁面頂端。',
    'Follow this exercise to try the GitHub flow': '跟著這個練習體驗 GitHub 流程',
    'GitHub’s “Hello World” tutorial teaches you essentials, where you create your own repository and learn GitHub’s pull request workflow for creating and reviewing code.':
      'GitHub 的「Hello World」教學課程會教你基本知識，你將建立自己的儲存庫，並學習 GitHub 用來建立、審查程式碼的拉取請求工作流程。',
    "GitHub's “Hello World” tutorial teaches you essentials, where you create your own repository and learn GitHub's pull request workflow for creating and reviewing code.":
      'GitHub 的「Hello World」教學課程會教你基本知識，你將建立自己的儲存庫，並學習 GitHub 用來建立、審查程式碼的拉取請求工作流程。',
    'Try the GitHub flow': '體驗 GitHub 流程',
    'About version control and Git': '關於版本控制和 Git',
    'Learn about the version control system, Git, and how it works with GitHub.': '瞭解版本控制系統 Git，以及它如何與 GitHub 搭配運作。',
    'The GitHub Flow': 'GitHub 流程',
    "Adopt GitHub's lightweight, branch-based workflow to collaborate on projects.": '採用 GitHub 以分支為基礎的輕量工作流程來協作專案。',

    // 旧版新手提示
    'Learn Git and GitHub without any code!': '不必寫程式碼也能學習 Git 和 GitHub！',
    'Using the Hello World guide, you’ll create a repository, start a branch,': '透過 Hello World 指南，你將建立儲存庫、新增分支、',
    'write comments, and open a pull request.': '撰寫留言並建立拉取請求。',
    "Let's get started!": '開始吧！',
    'Hide this notice forever': '永久隱藏此通知',
    'Welcome to GitHub! What’s next?': '歡迎來到 GitHub！接下來要做什麼？',
    'Tell us about yourself': '介紹一下你自己',
    'Browse interesting repositories': '瀏覽有趣的儲存庫',
    'You don’t have any repositories yet!': '你還沒有任何儲存庫！',
    'Create your first repository': '建立你的第一個儲存庫',
    'Learn more about Git and GitHub': '瞭解 Git 和 GitHub',

    // GitHub 教育推广
    'Join GitHub Education!': '加入 GitHub 教育！',
    'GitHub Education opens doors to new skills, tools, and a collaborative community eager to drive innovation. Join us and build a foundation for your future in technology.':
      'GitHub 教育為你開啟通往新技能、新工具和熱衷推動創新的協作社群的大門。加入我們，為你的科技未來打下基礎。',
    'Join GitHub Education': '加入 GitHub 教育',
    'Learn. Collaborate. Grow.': '學習。協作。成長。',
    'GitHub Education gives you the tools and community support to take on tech challenges and turn them into opportunities. Your future in tech starts here!':
      'GitHub 教育為你提供工具和社群支援，讓你迎接科技挑戰並化為機會。你的科技未來從這裡開始！',
    'Go to GitHub Education': '前往 GitHub 教育'
  },
  scoped: {
    'Getting started': '入門',
    Playlist: '播放清單',
    // 清单进度未拼接时的尾段：<数字>/<数字> + complete
    complete: '已完成',
    // 旧版首页：开始编写代码的表单标签；Use + <the github.dev web-based editor> + from your repository …
    'Repository name': '儲存庫名稱',
    Use: '使用'
  },
  regexp: [
    // 入门清单进度：2/3 completed（新手清单）/ 2/3 complete（共享清单组件）
    [/^(\d+)\/(\d+) completed?$/, '已完成 $1/$2'],
    // 资源卡片：Read · Est. 5m / Watch · 9 videos
    [/^Read · Est\. (\d+)m$/, '閱讀 · 約 $1 分鐘'],
    [/^Watch · (\d+) videos?$/, '觀看 · $1 部影片']
  ]
} satisfies PageDictionary
