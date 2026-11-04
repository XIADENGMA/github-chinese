import type { PageDictionary } from '../../../core/types'

/**
 * 注册（/signup）、电子邮件验证（/account_verifications，不属于 auth 页面类型）、找回密码与更改密码（/password_reset）。
 */

/** 「a, b, or c」→「a、b、c」 */
function joinNames(list: string): string {
  return list
    .split(/,? or |, /)
    .filter(Boolean)
    .join('、')
}

export default {
  static: {
    // 注册页：左侧说明（产品名按用户规定译成中文：GitHub Actions → GitHub 動作；Copilot 是品牌词，保留）
    'Create your free account': '建立免費帳號',
    "Explore GitHub's core features for individuals and organizations.": '探索 GitHub 為個人和組織提供的核心功能。',
    'Explore GitHub’s core features for individuals and organizations.': '探索 GitHub 為個人和組織提供的核心功能。',
    'Access to GitHub Copilot': '使用 GitHub Copilot',
    'Increase your productivity and accelerate software development.': '提高生產力，加快軟體開發。',
    'Collaborate securely on public and private projects.': '在公開和私人專案上安全地協作。',
    'Boost code quality with built-in review tools.': '使用內建審查工具提升程式碼品質。',
    'Save time with CI/CD integrations and GitHub Actions.': '透過 CI/CD 整合和 GitHub 動作節省時間。',
    'Connect with developers worldwide for instant feedback and insights.': '與全球開發人員交流，即時取得意見回饋和洞察。',

    // 注册表单
    'Already have an account?': '已有帳號？',
    'Sign in →': '登入 →',
    'Sign up for GitHub': '註冊 GitHub',
    'Sign up to GitHub': '註冊 GitHub',
    // /join 的分页标题首段
    'Join GitHub': '加入 GitHub',
    'Email*': '電子郵件*',
    'Password*': '密碼*',
    'Username*': '使用者名稱*',
    'Email is invalid or already taken': '電子郵件無效或已被使用',
    'Email cannot be blank': '電子郵件不得空白',
    'The email you have provided is already associated with an account.': '你提供的電子郵件已與某個帳號關聯。',
    'Password is too short': '密碼太短',
    'Password needs a number and lowercase letter': '密碼需要包含數字和小寫字母',
    'Password is strong': '密碼強度高',
    'Password may be compromised': '密碼可能已外洩',
    'Password is in a list of passwords commonly used on other websites': '此密碼列在其他網站常用的密碼清單中',
    'Password cannot be blank': '密碼不得空白',
    'Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.':
      '密碼至少須有 15 個字元，或至少 8 個字元且包含數字和小寫字母。',
    'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.':
      '使用者名稱只能包含英數字元或單一連字號，且不能以連字號開頭或結尾。',
    'Username cannot be blank': '使用者名稱不得空白',
    'Your Country/Region': '國家/地區',
    'Your Country/Region*': '國家/地區*',
    'Select Country/Region': '選擇國家/地區',
    "For compliance reasons, we're required to collect country information to send you occasional updates and announcements.":
      '基於合規要求，我們必須收集國家/地區資訊，以便不定期向你傳送更新和公告。',
    'For compliance reasons, we’re required to collect country information to send you occasional updates and announcements.':
      '基於合規要求，我們必須收集國家/地區資訊，以便不定期向你傳送更新和公告。',
    'Receive occasional product updates and announcements': '不定期接收產品更新和公告',
    'Create account': '建立帳號',
    'By creating an account, you agree to the': '建立帳號即表示你同意',
    ". We'll occasionally send you account-related emails.": '。我們會不定期傳送與帳號相關的電子郵件給你。',
    '. We’ll occasionally send you account-related emails.': '。我們會不定期傳送與帳號相關的電子郵件給你。',

    // 电子邮件验证 /account_verifications
    'Confirm your email address': '確認你的電子郵件地址',
    'We have sent a code to': '我們已將驗證碼傳送至',
    "Didn't get your email?": '沒有收到電子郵件？',
    'Didn’t get your email?': '沒有收到電子郵件？',
    'update your email address': '更新電子郵件地址',
    'Enter code': '輸入驗證碼',
    'Resend the code': '重新傳送驗證碼',

    // 找回密码 /password_reset
    'Reset your password': '重設密碼',
    "Enter your user account's verified email address and we will send you a password reset link.":
      '輸入你帳號中已驗證的電子郵件地址，我們會傳送密碼重設連結給你。',
    'Enter your user account’s verified email address and we will send you a password reset link.':
      '輸入你帳號中已驗證的電子郵件地址，我們會傳送密碼重設連結給你。',
    'Enter your email address': '輸入電子郵件地址',
    'Send password reset email': '傳送密碼重設電子郵件',
    'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.':
      '請查看電子郵件中的密碼重設連結。如果幾分鐘內沒有收到，請檢查垃圾郵件資料夾。',
    "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.":
      '請查看電子郵件中的密碼重設連結。如果幾分鐘內沒有收到，請檢查垃圾郵件資料夾。',
    'Return to Sign in': '返回登入',
    'Return to sign in': '返回登入',

    // 更改密码 /password_reset/<token>
    "Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.":
      '請確認密碼至少有 15 個字元，或至少 8 個字元且包含數字和小寫字母。',
    'Make sure it’s at least 15 characters OR at least 8 characters including a number and a lowercase letter.':
      '請確認密碼至少有 15 個字元，或至少 8 個字元且包含數字和小寫字母。'
  },
  scoped: {
    Username: '使用者名稱',
    'Change password': '變更密碼',
    'Change your password': '變更密碼',
    'reset your password': '重設密碼',
    // 「<a>, <b>, or <c> are available.」
    'are available.': '可供使用。',
    'Email preferences': '電子郵件偏好設定',
    'Unlimited repositories': '無限量儲存庫',
    'Integrated code reviews': '整合式程式碼審查',
    'Automated workflows': '自動化工作流程',
    'Community support': '社群支援',
    "See what's included": '查看包含內容',
    'See what’s included': '查看包含內容'
  },
  regexp: [
    [
      /^Username (\S+) is not available\. (.+) are available\.$/,
      (_, name: string, list: string) => `使用者名稱 ${name} 無法使用。${joinNames(list)} 可供使用。`
    ],
    [/^Username (\S+) is not available\.$/, '使用者名稱 $1 無法使用。'],
    [/^(\S+) is available\.$/, '$1 可供使用。'],
    [/^Change password for @?([\w-]+)$/, '變更 @$1 的密碼']
  ]
} satisfies PageDictionary
