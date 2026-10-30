import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import run from './actions/run'
import deployments from './actions/deployments'
import manage from './actions/manage'
import newWorkflow from './actions/new'
import workflows from './actions/workflows'

/**
 * Actions（actions）：工作流运行列表与侧栏、单个工作流页、运行详情与作业日志、
 * 缓存、运行器、使用情况指标、性能指标、部署与环境、新建工作流。
 * 正则按合并顺序匹配：workflows 末尾有 Pin X、Download X、Delete X 等宽泛规则，须排在最后。
 */
export default mergeDictionaries(run, deployments, manage, newWorkflow, workflows) satisfies PageDictionary
