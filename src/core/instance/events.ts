import type { Component } from 'types/component'
import {
  tip,
  toArray,
  isArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

export function initEvents(vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add(event, fn) {
  target.$on(event, fn)
}

function remove(event, fn) {
  target.$off(event, fn)
}

function createOnceHandler(event, fn) {
  const _target = target
  return function onceHandler() {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners(
  vm: Component,
  listeners: Object,
  oldListeners?: Object | null
) {
  target = vm
  updateListeners(
    listeners,
    oldListeners || {},
    add,
    remove,
    createOnceHandler,
    vm
  )
  target = undefined
}

export function eventsMixin(Vue: typeof Component) {
  const hookRE = /^hook:/
  // 监听当前实例上的自定义事件。事件可以由 vm.$emit 触发。回调函数会接收所有传入事件触发函数的额外参数。
  Vue.prototype.$on = function (
    event: string | Array<string>,
    fn: Function
  ): Component {
    const vm: Component = this
    // 可以接受一个数组的事件 但是会把数组拆分成一个个事件然后再调用$on
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // 优化钩子:通过在注册时使用布尔标记而不是哈希查找来实现事件开销
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  // 监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    // 通过调用on注册，然后新定义一个事件 包裹着 注销的方法和原本的事件来实现只执行一次这个事件  好厉害
    function on() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn

    vm.$on(event, on)
    return vm
  }

  // 移除自定义事件监听器。

  // 如果没有提供参数，则移除所有的事件监听器；

  // 如果只提供了事件，则移除该事件所有的监听器；

  // 如果同时提供了事件与回调，则只移除这个回调的监听器。

  Vue.prototype.$off = function (
    event?: string | Array<string>,
    fn?: Function
  ): Component {
    const vm: Component = this
    // all 啥都不传就清理所有的
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    // 如果是批量的事件，那就递归删除
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event!]
    if (!cbs) {
      return vm
    }
    // 如果没得传入函数 把这个事件的回调函数都删了
    if (!fn) {
      vm._events[event!] = null
      return vm
    }
    // specific handler
    let cb
    let i = cbs.length
    // 循环找到那个和传入函数相同的的函数删掉它
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  // 触发当前实例上的事件。附加参数都会传给监听器回调。
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (__DEV__) {
      const lowerCaseEvent = event.toLowerCase()

      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        //必须都是小写，并且存在事件里面
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
            `${formatComponentName(
              vm
            )} but the handler is registered for "${event}". ` +
            `Note that HTML attributes are case-insensitive and you cannot use ` +
            `v-on to listen to camelCase events when using in-DOM templates. ` +
            `You should probably use "${hyphenate(
              event
            )}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        //  invokeWithErrorHandling 可以帮助我们处理程序出错的情况，这样给出更加友好的提示
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
