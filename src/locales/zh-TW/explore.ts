import type { PageDictionary } from '../../core/types'
import events from './explore/events'
import home from './explore/home'
import languages from './explore/languages'
import topics from './explore/topics'
import trending from './explore/trending'
import { mergeDictionaries } from './helpers'

/**
 * 探索：/explore 推荐动态与电子邮件订阅、/trending 热门储存库与开发人员、/topics 主题、/collections 精选集、
 * /events（/resources/events）活动。
 * 储存库名、描述、主题名、精选集内容等用户内容由全局与本词典的 ignore 跳过。
 */
export default mergeDictionaries(home, trending, languages, topics, events) satisfies PageDictionary
