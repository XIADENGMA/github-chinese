import type { PageDictionary } from '../../../core/types'

/**
 * 登录、通行密钥、Google / Apple 登录、退出登录、切换帐户、设备激活（/login/device）。
 * 切换帐户页（/switch_account）不属于 auth 页面类型，相关词条只能放 static。
 */
export default {
  static: {
    // 登录页
    'Sign in to GitHub': '登入 GitHub',
    // 「Sign in to <PayPal 标志>」等片段，结账页、设置页等任意页面共用；与「Sign in to GitHub」→「登入 GitHub」一致
    'Sign in to': '登入',
    'Username or email address': '使用者名稱或電子郵件地址',
    // 登录页、设置页与 sudo 确认对话框（出现在任意页面）的密码标签
    Password: '密碼',
    'Forgot password?': '忘記密碼？',
    'Forgot your password?': '忘記密碼？',
    'Signing in…': '登入中…',
    'Signing in...': '登入中...',
    'Your account was created successfully. Please sign in to continue': '已成功建立帳號，請登入以繼續',
    'Your account was created successfully. Please sign in to continue.': '已成功建立帳號，請登入以繼續。',
    'Add an account': '新增帳號',
    'Want to create an account?': '想建立帳號嗎？',
    'New to GitHub?': '初次使用 GitHub？',
    'Create an account': '建立帳號',
    'Contact GitHub Support': '聯絡 GitHub 支援',

    // 通行密钥
    'Continue with passkey': '使用密碼金鑰繼續',
    'Sign in with a passkey': '使用密碼金鑰登入',
    'Sign-in with a passkey': '使用密碼金鑰登入',
    'This browser or device is reporting partial passkey support.': '此瀏覽器或裝置僅部分支援密碼金鑰。',
    'This browser or device does not fully support passkeys.': '此瀏覽器或裝置未完整支援密碼金鑰。',
    'This browser or device is reporting partial passkey support, but you may be able to use a passkey from a nearby device.':
      '此瀏覽器或裝置僅部分支援密碼金鑰，但你或許可以使用附近裝置上的密碼金鑰。',
    "Webauthn isn't supported. Use a different browser or device to use your passkey.":
      '不支援 WebAuthn。請改用其他瀏覽器或裝置來使用密碼金鑰。',
    'Webauthn isn’t supported. Use a different browser or device to use your passkey.':
      '不支援 WebAuthn。請改用其他瀏覽器或裝置來使用密碼金鑰。',
    'Waiting for input from browser interaction...': '正在等待瀏覽器互動...',
    'Waiting for input from browser interaction…': '正在等待瀏覽器互動…',

    // Google / Apple 登录
    'Continue with Google': '使用 Google 繼續',
    'Continuing with Google...': '正在使用 Google 繼續...',
    'Continuing with Google…': '正在使用 Google 繼續…',
    'Continue with Apple': '使用 Apple 繼續',
    'Continuing with Apple...': '正在使用 Apple 繼續...',
    'Continuing with Apple…': '正在使用 Apple 繼續…',

    // 登录错误提示
    'Incorrect username or password.': '使用者名稱或密碼不正確。',
    'Recovery code authentication failed.': '復原碼驗證失敗。',
    'There have been several failed attempts to sign in from this account or IP address. Please wait a while and try again later.':
      '此帳號或 IP 位址已多次登入失敗。請稍候片刻再試一次。',
    'Cookies must be enabled to use GitHub.': '必須啟用 Cookie 才能使用 GitHub。',

    // 设备激活 /login/device
    'Device Activation': '裝置啟用',
    'Device activation': '裝置啟用',
    // device code 译作「驗證碼」：「代碼」会命中检查脚本的大陆用语警告
    'Enter the code displayed on your device': '輸入裝置上顯示的驗證碼',
    'GitHub staff will never ask you to enter your code on this page.': 'GitHub 員工絕不會要求你在此頁面輸入驗證碼。',
    'This authorization was requested from': '此授權請求來自',
    'Make sure you trust this device as it will get access to your account.':
      '請確認你信任此裝置，因為它將取得你帳號的存取權。',
    "Congratulations, you're all set!": '恭喜，一切就緒！',
    'Congratulations, you’re all set!': '恭喜，一切就緒！',
    // 设备授权后与帐户连接（GLOSSARY.zh-TW link 行：connect → 連接；网络连线才作「連線」）
    'Your device is now connected.': '你的裝置已連接。',
    "Uh oh, we couldn't find anything": '糟糕，找不到任何內容',
    'Uh oh, we couldn’t find anything': '糟糕，找不到任何內容',
    'Please make sure you entered the user code correctly.': '請確認使用者驗證碼輸入正確。',

    // 退出登录 /logout
    'Are you sure you want to sign out?': '確定要登出嗎？',
    'Select account to sign out': '選擇要登出的帳號',
    'Sign out from all accounts': '登出所有帳號',

    // 切换帐户 /switch_account
    'Signed out': '已登出',
    'Add a different account': '新增其他帳號',
  },
  scoped: {
    Continue: '繼續',
    Loading: '載入中',
    Or: '或',
    'to continue to': '以繼續使用',
    'Requested from': '請求來源',
  },
  regexp: [
    // 注册 / 登录表单：使用其他 Google / Apple 帐户
    [/^Use a different (Google|Apple) account$/, '使用其他 $1 帳號'],
  ],
} satisfies PageDictionary
