import type { PageDictionary } from '../../core/types'
import home from './education/home'
import partners from './education/partners'
import schools from './education/schools'
import shared from './education/shared'
import students from './education/students'
import teachers from './education/teachers'
import { mergeDictionaries } from './helpers'

/**
 * GitHub 教育介绍页（/education 及学生、教师、学校、合作伙伴子页）。
 * shared 收页内导航、标签页标题、共用 CTA 与常见问题、全局导航与页脚里的产品名（scoped，等待全站 sweep），
 * 以及推荐语、学校案例标题的忽略规则；其余按子页分文件。
 * 第三方内容（引言、人名与职务、学校名、合作伙伴产品名）保持原文；
 * 页面是 Primer Brand 渲染的 React 页面，被链接 / <b> 拆开的句子用 inline 整句收录，
 * 只隔注释的相邻文本按整组收录并给出各段。
 */
export default mergeDictionaries(shared, home, students, teachers, schools, partners) satisfies PageDictionary
