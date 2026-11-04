import type { PageDictionary } from '../../../core/types'

/**
 * CVSS v3 / v4 指标说明（公告详情、Dependabot 警报侧栏、公告表单的严重性计算器）
 * 术语（与 cvss-calculator.ts 一致）：score → 分數（Base Score → 基本分數），scoring → 評分，overall → 整體，
 * component → 元件，vulnerable system → 有漏洞的系統，subsequent system → 後續系統，Physical → 實體，
 * user interaction → 使用者互動，probability → 機率。
 */
export default {
  static: {
    // 总体评分
    'CVSS overall score': 'CVSS 整體分數',
    'CVSS overall score details': 'CVSS 整體分數詳細資料',
    'Learn more about the CVSS overall score': '瞭解 CVSS 整體分數',
    'This score calculates overall vulnerability severity from 0 to 10 and is based on the Common Vulnerability Scoring System (CVSS).':
      '此分數以 0 到 10 計算漏洞的整體嚴重性，並以通用漏洞評分系統 (CVSS) 為依據。',
    'This score calculates overall vulnerability severity from 0 to 10 and is based on the Common Vulnerability Scoring System.':
      '此分數以 0 到 10 計算漏洞的整體嚴重性，並以通用漏洞評分系統為依據。',

    // CVSS v3 基本指标
    'CVSS base metrics': 'CVSS 基本指標',
    'CVSS v3 base metrics': 'CVSS v3 基本指標',
    'CVSS v4 base metrics': 'CVSS v4 基本指標',
    'Base metrics': '基本指標',
    'Learn more about base metrics': '瞭解基本指標',
    'Attack vector': '攻擊向量',
    'Attack vector:': '攻擊向量：',
    'Attack complexity': '攻擊複雜度',
    'Attack complexity:': '攻擊複雜度：',
    'Privileges required': '所需權限',
    'Privileges required:': '所需權限：',
    'User interaction': '使用者互動',
    'User interaction:': '使用者互動：',
    Scope: '範圍',
    'Scope:': '範圍：',
    Confidentiality: '機密性',
    'Confidentiality:': '機密性：',
    Integrity: '完整性',
    'Integrity:': '完整性：',
    'Availability:': '可用性：',
    'More severe the more the remote (logically and physically) an attacker can be in order to exploit the vulnerability.':
      '攻擊者能在越遠的位置（邏輯上和實體上）利用漏洞，嚴重性越高。',
    'More severe the more remote (logically and physically) an attacker can be in order to exploit the vulnerability.':
      '攻擊者能在越遠的位置（邏輯上和實體上）利用漏洞，嚴重性越高。',
    'More severe for the least complex attacks.': '攻擊越不複雜，嚴重性越高。',
    'More severe if no privileges are required.': '不需要權限時，嚴重性較高。',
    'More severe when no user interaction is required.': '不需要使用者互動時，嚴重性較高。',
    'More severe when a scope change occurs, e.g. one vulnerable component impacts resources in components beyond its security scope.':
      '範圍發生變更時，嚴重性較高，例如一個有漏洞的元件影響到其安全範圍以外的元件資源。',
    'More severe when loss of data confidentiality is highest, measuring the level of data access available to an unauthorized user.':
      '資料機密性損失最大時，嚴重性最高，衡量的是未獲授權的使用者可存取資料的程度。',
    'More severe when loss of data integrity is the highest, measuring the consequence of data modification possible by an unauthorized user.':
      '資料完整性損失最大時，嚴重性最高，衡量的是未獲授權的使用者修改資料可能造成的後果。',
    'More severe when the loss of impacted component availability is highest.': '受影響元件的可用性損失最大時，嚴重性最高。',

    // CVSS v4 基本指标
    'Exploitability Metrics': '可利用性指標',
    'Attack Vector': '攻擊向量',
    'Attack Complexity': '攻擊複雜度',
    'Attack Requirements': '攻擊要求',
    'Privileges Required': '所需權限',
    'User Interaction': '使用者互動',
    'Vulnerable System Impact Metrics': '有漏洞系統影響指標',
    'Subsequent System Impact Metrics': '後續系統影響指標',
    'How remotely an attacker can exploit the vulnerable system. More remote attacks have greater severity because more potential attackers can reach them.':
      '攻擊者能從多遠的位置利用有漏洞的系統。越遠端的攻擊，能發動的潛在攻擊者越多，因此嚴重性越高。',
    'Actions an attacker must take to evade or circumvent built-in security controls. Exploits requiring non-trivial, target-specific customization have greater complexity.':
      '攻擊者為規避或繞過內建安全控制而必須採取的動作。需要針對目標大幅自訂的漏洞利用程式，複雜度較高。',
    'Deployment or execution conditions that must exist for the attack to succeed. Unlike Attack Complexity, these conditions arise naturally and are not intended to mitigate attacks.':
      '攻擊成功必須具備的部署或執行條件。不同於攻擊複雜度，這些條件是自然產生的，並非用來緩解攻擊。',
    'Privileges an attacker must already have to exploit the vulnerability. How the attacker obtained those privileges is out of scope. Self-service accounts do not count if the attacker can grant themselves the required privileges during the attack.':
      '攻擊者利用漏洞前必須已具備的權限。攻擊者如何取得這些權限不在考量範圍內。如果攻擊者能在攻擊過程中自行授予所需權限，自助式帳號不列入計算。',
    'Whether exploitation requires a human other than the attacker, or a process initiated by that user, to participate.':
      '利用漏洞時，是否需要攻擊者以外的人員或該使用者啟動的處理程序參與。',
    'The loss of confidentiality in the vulnerable system after successful exploitation, including unauthorized access to or disclosure of its information.':
      '成功利用後，有漏洞系統的機密性損失，包括其資訊遭未經授權存取或揭露。',
    'The loss of integrity in the vulnerable system after successful exploitation, including unauthorized data changes or the ability to repudiate critical actions.':
      '成功利用後，有漏洞系統的完整性損失，包括資料遭未經授權變更，或關鍵動作可遭否認。',
    'The loss of availability in the vulnerable system after successful exploitation. This includes attacks that consume resources such as network bandwidth, processor cycles, or disk space.':
      '成功利用後，有漏洞系統的可用性損失。這包括消耗網路頻寬、處理器週期或磁碟空間等資源的攻擊。',
    'The loss of confidentiality in a subsequent system after successful exploitation, including unauthorized access to or disclosure of its information.':
      '成功利用後，後續系統的機密性損失，包括其資訊遭未經授權存取或揭露。',
    'The loss of integrity in a subsequent system after successful exploitation, including unauthorized data changes or the ability to repudiate critical actions.':
      '成功利用後，後續系統的完整性損失，包括資料遭未經授權變更，或關鍵動作可遭否認。',
    'The loss of availability in a subsequent system after successful exploitation. This includes attacks that consume resources such as network bandwidth, processor cycles, or disk space.':
      '成功利用後，後續系統的可用性損失。這包括消耗網路頻寬、處理器週期或磁碟空間等資源的攻擊。',

    // EPSS：… within the next 30 days. Data by <FIRST>.
    'EPSS score': 'EPSS 分數',
    'Exploit Prediction Scoring System (EPSS)': '漏洞利用預測評分系統 (EPSS)',
    'Exploit Prediction Scoring System': '漏洞利用預測評分系統',
    'This score estimates the probability of this vulnerability being exploited within the next 30 days. Data by':
      '此分數估計此漏洞在未來 30 天內遭到利用的機率。資料來源',
    'This score estimates the probability of this vulnerability being exploited within the next 30 days. Data provided by':
      '此分數估計此漏洞在未來 30 天內遭到利用的機率。資料來源',
    'Learn more about the EPSS score.': '瞭解 EPSS 分數。',

    // 严重性计算器（公告表单；score 同 advisory-form.ts 作「分數」，scoring 作「評分」）
    'Score could not be calculated': '無法計算分數',
    'Please fill out this field with a valid vector string': '請在此欄位填入有效的向量字串',
    'Vector string': '向量字串',
    'CVSS vector string': 'CVSS 向量字串',
    Calculator: '計算機',
    'Assess severity using CVSS': '使用 CVSS 評估嚴重性',
    'Select severity': '選擇嚴重性',
    'Severity score': '嚴重性分數'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效（Active 同时是机密扫描的有效性，与 Inactive 成对）
    Availability: '可用性',
    Required: '需要',
    Active: '有效',
    // 指标取值（单词过于通用，只在安全页生效）
    Adjacent: '相鄰',
    'Adjacent Network': '相鄰網路',
    Physical: '實體',
    Changed: '已變更',
    Unchanged: '未變更',
    Present: '存在',
    Passive: '被動'
  },
  regexp: [
    // EPSS 百分位：(5th percentile)
    [/^\((\d+)(?:st|nd|rd|th) percentile\)$/, '（第 $1 百分位數）']
  ]
} satisfies PageDictionary
