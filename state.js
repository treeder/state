
export class State extends EventTarget { // implements EventTarget (partially anyways) https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

  static statePrefix = 'state.'

  constructor() {
    super()

    this.stateMap = new Map()

    this.loadState()

    window.addEventListener('storage', (e) => {
      if (e.key.startsWith(State.statePrefix)) {
        // console.log("storage event", e)
        let key = e.key.substring(State.statePrefix.length)
        let value = null
        if (e.newValue) {
          value = JSON.parse(e.newValue)
        }
        this.dispatchEvent(new CustomEvent(key, {
          detail: {
            action: value ? 'set' : 'delete',
            key: key,
            value: value,
          },
        }))
      }
    })
  }

  loadState() {
    // the alternative way using individual keys
    for (let key in window.localStorage) {
      console.log("KEY:", key)
      if (key.startsWith(State.statePrefix)) {
        let value = window.localStorage.getItem(key)
        console.log("value:", value)
        value = JSON.parse(value)
        this.stateMap.set(key.substring(State.statePrefix.length), value)
      }
    }
  }

  set(key, value) {
    let m = this.stateMap.set(key, value)
    window.localStorage.setItem(`${State.statePrefix}${key}`, JSON.stringify(value))
    this.dispatchEvent(new CustomEvent(key, {
      detail: {
        action: 'set',
        key,
        value,
      },
    }))
    return m
  }

  delete(key) {
    let r = this.stateMap.delete(key)
    window.localStorage.removeItem(`${State.statePrefix}${key}`)
    this.dispatchEvent(new CustomEvent(key, {
      detail: {
        action: 'delete',
        key,
        deleted: r, // true if element existed and was removed, or false if the element did not exist.
      },
    }))
  }

  get(key) {
    return this.stateMap.get(key)
  }

}

export const state = new State()
export default state
