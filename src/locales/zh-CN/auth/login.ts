import type { PageDictionary } from '../../../core/types'

/**
 * 登录、通行密钥、Google / Apple 登录、退出登录、切换帐户、设备激活（/login/device）。
 * 切换帐户页（/switch_account）不属于 auth 页面类型，相关词条只能放 static。
 */
export default {
  static: {
    // 登录页
    'Sign in to GitHub': '登录 GitHub',
    // 「Sign in to <PayPal 标志>」等片段，结账页、设置页等任意页面共用；与「Sign in to GitHub」→「登录 GitHub」一致
    'Sign in to': '登录',
    'Username or email address': '用户名或电子邮件地址',
    // 登录页、设置页与 sudo 确认对话框（出现在任意页面）的密码标签
    Password: '密码',
    'Forgot password?': '忘记密码？',
    'Forgot your password?': '忘记密码？',
    'Signing in…': '登录中…',
    'Signing in...': '登录中...',
    'Your account was created successfully. Please sign in to continue': '帐户已创建，请登录以继续',
    'Your account was created successfully. Please sign in to continue.': '帐户已创建，请登录以继续。',
    'Add an account': '添加帐户',
    'Want to create an account?': '想要创建帐户？',
    'New to GitHub?': '初次使用 GitHub？',
    'Create an account': '创建帐户',
    'Contact GitHub Support': '联系 GitHub 支持',

    // 通行密钥
    'Continue with passkey': '使用通行密钥继续',
    'Sign in with a passkey': '使用通行密钥登录',
    'Sign-in with a passkey': '使用通行密钥登录',
    'This browser or device is reporting partial passkey support.': '此浏览器或设备仅部分支持通行密钥。',
    'This browser or device does not fully support passkeys.': '此浏览器或设备不完全支持通行密钥。',
    'This browser or device is reporting partial passkey support, but you may be able to use a passkey from a nearby device.':
      '此浏览器或设备仅部分支持通行密钥，但或许可以使用附近设备上的通行密钥。',
    "Webauthn isn't supported. Use a different browser or device to use your passkey.":
      '不支持 WebAuthn。请换用其他浏览器或设备使用通行密钥。',
    'Webauthn isn’t supported. Use a different browser or device to use your passkey.':
      '不支持 WebAuthn。请换用其他浏览器或设备使用通行密钥。',
    'Waiting for input from browser interaction...': '正在等待浏览器交互...',
    'Waiting for input from browser interaction…': '正在等待浏览器交互…',

    // Google / Apple 登录
    'Continue with Google': '使用 Google 继续',
    'Continuing with Google...': '正在使用 Google 继续...',
    'Continuing with Google…': '正在使用 Google 继续…',
    'Continue with Apple': '使用 Apple 继续',
    'Continuing with Apple...': '正在使用 Apple 继续...',
    'Continuing with Apple…': '正在使用 Apple 继续…',

    // 登录错误提示
    'Incorrect username or password.': '用户名或密码错误。',
    'Recovery code authentication failed.': '恢复代码身份验证失败。',
    'There have been several failed attempts to sign in from this account or IP address. Please wait a while and try again later.':
      '此帐户或 IP 地址多次登录失败，请稍后再试。',
    'Cookies must be enabled to use GitHub.': '须启用 Cookie 才能使用 GitHub。',

    // 设备激活 /login/device
    'Device Activation': '设备激活',
    'Device activation': '设备激活',
    'Enter the code displayed on your device': '输入设备上显示的代码',
    'GitHub staff will never ask you to enter your code on this page.': 'GitHub 员工绝不会要求你在此页面输入代码。',
    'This authorization was requested from': '此授权请求来自',
    'Make sure you trust this device as it will get access to your account.': '请确认你信任此设备，它将获得你帐户的访问权限。',
    "Congratulations, you're all set!": '恭喜，一切就绪！',
    'Congratulations, you’re all set!': '恭喜，一切就绪！',
    'Your device is now connected.': '设备已连接。',
    "Uh oh, we couldn't find anything": '未找到任何内容',
    'Uh oh, we couldn’t find anything': '未找到任何内容',
    'Please make sure you entered the user code correctly.': '请确认用户代码输入正确。',

    // 退出登录 /logout
    'Are you sure you want to sign out?': '确定要退出登录吗？',
    'Select account to sign out': '选择要退出登录的帐户',
    'Sign out from all accounts': '从所有帐户退出登录',

    // 切换帐户 /switch_account
    'Signed out': '已退出登录',
    'Add a different account': '添加其他帐户'
  },
  scoped: {
    Continue: '继续',
    Loading: '加载中',
    Or: '或',
    'to continue to': '以继续使用',
    'Requested from': '请求来源'
  },
  regexp: [
    // 注册 / 登录表单：使用其他 Google / Apple 帐户
    [/^Use a different (Google|Apple) account$/, '使用其他 $1 帐户']
  ]
} satisfies PageDictionary
