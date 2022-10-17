import { ASSET_TYPES } from 'shared/constants'
import type { GlobalAPI } from 'types/global-api'
import { isFunction, isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters(Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  // 'component', 'directive', 'filter'
  // 注册或获取全局过滤器。
  // 注册或获取全局组件。注册还会自动使用给定的 id 设置组件的名称
  // 注册或获取全局指令。
  ASSET_TYPES.forEach(type => {
    // @ts-expect-error function is not exact same type
    Vue[type] = function (
      id: string,
      definition?: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (__DEV__ && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          //对象
          // @ts-expect-error
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && isFunction(definition)) {
          //函数
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
