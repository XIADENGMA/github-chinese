import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import advisories from './security/advisories'
import advisoryForm from './security/advisory-form'
import alerts from './security/alerts'
import codeScanning from './security/code-scanning'
import cvss from './security/cvss'
import cvssCalculator from './security/cvss-calculator'
import dependabot from './security/dependabot'
import overview from './security/overview'
import secretScanning from './security/secret-scanning'

/** 页面类型 security：存储库「安全和质量」标签页（/owner/repo/security/*）与全局 GitHub Advisory Database（/advisories）。 */
export default mergeDictionaries(
  overview,
  alerts,
  advisories,
  advisoryForm,
  cvss,
  cvssCalculator,
  dependabot,
  codeScanning,
  secretScanning,
) satisfies PageDictionary
