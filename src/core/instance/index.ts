import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'
function Vue(options) {
  //vue 构造函数
  if (__DEV__ && !(this instanceof Vue)) {
    //只能被初始化一次 __DEV__是rollup注入的
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  debugger
  this._init(options)
}
debugger
//@ts-expect-error Vue has function type
initMixin(Vue)
//@ts-expect-error Vue has function type
stateMixin(Vue)
//@ts-expect-error Vue has function type
eventsMixin(Vue)
//@ts-expect-error Vue has function type
lifecycleMixin(Vue)
//@ts-expect-error Vue has function type
renderMixin(Vue)

export default Vue as unknown as GlobalAPI
