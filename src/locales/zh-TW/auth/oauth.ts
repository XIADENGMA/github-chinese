import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/**
 * OAuth 应用 / GitHub 应用授权页（/login/oauth/authorize）、设备授权确认页、选择授权帐户、授权后重定向。
 * 「X by Y wants to access your Z account」按片段收录：X、Y、Z 是独立元素。
 */
export default {
  static: {
    'Authorize application': '授權應用程式',
    'wants to access your': '想要存取你的',
    'would like permission to:': '要求下列權限：',

    // 权限说明
    'Resources on your account': '你帳號中的資源',
    'Act on your behalf': '代表你執行動作',
    'Know which resources you can access': '得知你可以存取哪些資源',
    'Verify your GitHub identity': '驗證你的 GitHub 身分',
    'View your email addresses': '查看你的電子郵件地址',
    'This application will be able to': '此應用程式將能夠',
    'read and write all public and private repository data': '讀寫所有公開和私人儲存庫的資料',
    '. This includes the following:': '，包括：',
    'Personal user data': '個人使用者資料',
    'Email addresses (read-only)': '電子郵件地址（唯讀）',
    'This application will be able to read your private email addresses.':
      '此應用程式將能夠讀取你不公開的電子郵件地址。',
    'This application will be able to read your organization and team membership and private Projects.':
      '此應用程式將能夠讀取你的組織和團隊成員身分，以及私人專案。',

    // 组织访问
    'This organization allows the application to access organization data as described in the permissions above.':
      '此組織允許應用程式依上述權限存取組織資料。',
    'Until access is granted by an owner, the application cannot access the organization’s private data or modify its public data.':
      '在擁有者授予存取權之前，應用程式無法存取組織不公開的資料，也無法修改其公開資料。',
    "Until access is granted by an owner, the application cannot access the organization's private data or modify its public data.":
      '在擁有者授予存取權之前，應用程式無法存取組織不公開的資料，也無法修改其公開資料。',
    'The application cannot access this organization’s private data or modify its public data.':
      '應用程式無法存取此組織不公開的資料，也無法修改其公開資料。',
    "The application cannot access this organization's private data or modify its public data.":
      '應用程式無法存取此組織不公開的資料，也無法修改其公開資料。',

    // 应用信息
    'Owned & operated by GitHub': '由 GitHub 擁有和營運',
    'Not owned or operated by GitHub': '非 GitHub 擁有或營運',
    'Learn more about OAuth': '瞭解 OAuth',
    'Authorizing will redirect to': '授權後將重新導向至',

    // 选择授权帐户 /login/oauth/select_account
    'From the options below, choose which account you would like to use to authorize this app.':
      '從下列選項中選擇要用來授權此應用程式的帳號。',
    'Use a different account': '使用其他帳號',
    'has not been installed on any accounts you have access to.': '尚未安裝在你有權存取的任何帳號上。',

    // 授权后重定向
    'OAuth application authorized': 'OAuth 應用程式已授權',
    'You are being redirected to the authorized application.': '正在將你重新導向至已授權的應用程式。',
    'If your browser does not redirect you back, please visit': '如果瀏覽器沒有將你導回，請造訪',
    'If your browser does not redirect you back, please': '如果瀏覽器沒有將你導回，請',

    // 重新授权
    'Reauthorization required': '需要重新授權',
    'This application has made an unusually high number of requests to access your account. Please reauthorize the application to continue.':
      '此應用程式存取你帳號的請求次數異常偏高。請重新授權此應用程式以繼續。',
  },
  scoped: {
    // 权限分组
    'Organizations and teams': '組織和團隊',
    'Repository delete': '刪除儲存庫',
    'Commit status': '提交狀態',
    Deployments: '部署',
    Workflow: '工作流程',
    // read / write access → 讀取權限 / 寫入權限（GLOSSARY.zh-TW permission 行），三档同用「權限」
    'Read-only access': '唯讀權限',
    'Read and write access': '讀取和寫入權限',
    'Full access': '完整權限',

    // 授权页片段
    Authorize: '授權',
    by: '來自',
    account: '帳號',
    private: '私人',
    Request: '請求',
    Grant: '授予',
    // 「<Not> owned or operated by GitHub」
    Not: '非',
    'owned or operated by GitHub': 'GitHub 擁有或營運',
    Created: '建立於',
    'GitHub users': '位 GitHub 使用者',
    'click here': '按一下這裡',
    'to continue.': '以繼續。',
    'this setup page': '此設定頁面',
    '(read)': '（唯讀）',
    'Public and': '公開和',
    'Email addresses': '電子郵件地址',
    'Deploy keys': '部署金鑰',
    'Webhooks and services': 'Web 鉤子和服務',
    'Collaboration invites': '協作邀請',
    'Organization access': '組織存取權',
  },
  regexp: [
    [/^Authorize (.+)$/, '授權 $1'],
    [/^Continue as (\S+)$/, '以 $1 身分繼續'],
    [/^Select user to authorize (.+)$/, '選擇要授權 $1 的使用者'],
    [/^More than ([\d.,]+[KkMm]?)$/, '超過 $1'],
    [/^(?:Fewer|Less) than ([\d.,]+[KkMm]?)$/, '少於 $1'],
    [/^More than ([\d.,]+[KkMm]?) GitHub users$/, '超過 $1 位 GitHub 使用者'],
    [/^(?:Fewer|Less) than ([\d.,]+[KkMm]?) GitHub users$/, '少於 $1 位 GitHub 使用者'],
    [/^Verify your GitHub identity \(([\w-]+)\)$/, '驗證你的 GitHub 身分 ($1)'],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk('建立於', translateTime(time))],
  ],
} satisfies PageDictionary
