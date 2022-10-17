import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
import type { GlobalAPI } from 'types/global-api'

export function initGlobalAPI(Vue: GlobalAPI) {
  // 配置文件 通过Object.defineProperty 定义到Vue 够着函数的属性里面去
  const configDef: Record<string, any> = {}
  configDef.get = () => config
  if (__DEV__) {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }

  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 公开实效的方法。注意:这些不被认为是公共API的一部分——避免依赖它们，除非你意识到风险。
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 作用: 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新 property，因为 Vue 无法探测普通的新增 property (比如 this.myObject.newProperty = 'hi')
  Vue.set = set

  //作用: 删除对象的 property。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到 property 被删除的限制，但是你应该很少会使用它。

  Vue.delete = del

  // 作用:  在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
  Vue.nextTick = nextTick

  // 2.6 explicit observable API 显式可观察API
  // 让一个对象可响应。Vue 内部会用它来处理 data 函数返回的对象。 返回的对象可以直接用于渲染函数和计算属性内，并且会在发生变更时触发相应的更新。也可以作为最小化的跨组件状态存储器，
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  //  添加  'components' 'directives' 'filters' 空选项
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 它用于标识在Weex的多实例场景中扩展所有普通对象组件的“基本”构造函数。
  Vue.options._base = Vue

  // 添加keepalive 内置的组件
  extend(Vue.options.components, builtInComponents)

  // 初始化安装插件的API
  initUse(Vue)

  // 全局注册一个混入
  initMixin(Vue)

  // 初始化一个扩展方法 方便生成子组件
  initExtend(Vue)

  // 注册或者获取 全局的 指令 过滤器 组件   'component', 'directive', 'filter'
  initAssetRegisters(Vue)
}
