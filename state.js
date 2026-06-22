export class State extends EventTarget {
  // implements EventTarget (partially anyways) https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

  static statePrefix = 'state.'

  constructor(options = {}) {
    super()

    this.options = options
    this.storage = options.storage || 'local'

    if (this.storage === 'local') {
      this.storageObj = typeof window !== 'undefined' ? window.localStorage : null
    } else if (this.storage === 'session') {
      this.storageObj = typeof window !== 'undefined' ? window.sessionStorage : null
    } else {
      this.storageObj = this.storage
    }

    this.stateMap = new Map()

    this.loadState()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.storageArea && e.storageArea !== this.storageObj) {
          return
        }
        if (e.key && e.key.startsWith(State.statePrefix)) {
          // console.log("storage event", e)
          let key = e.key.substring(State.statePrefix.length)
          let value = null
          if (e.newValue) {
            value = JSON.parse(e.newValue)
          }
          this.dispatchEvent(
            new CustomEvent(key, {
              detail: {
                action: value ? 'set' : 'delete',
                key,
                value,
              },
            }),
          )
        }
      })
    }
  }

  loadState() {
    if (!this.storageObj) return
    for (const key in this.storageObj) {
      if (key.startsWith(State.statePrefix)) {
        let value = this.storageObj.getItem(key)
        try {
          value = JSON.parse(value)
          this.stateMap.set(key.substring(State.statePrefix.length), value)
        } catch (e) {
          console.log(`[state] ${key} invalid json`)
        }
      }
    }
  }

  /**
   * Set the value of a state key.
   * @param {string} key
   * @param {any} value
   * @param {object} opts
   * @param {boolean} [opts.skipStorage=false] if true, the value will not be stored in storage
   */
  set(key, value, opts = {}) {
    const m = this.stateMap.set(key, value)
    if (!opts.skipStorage && this.storageObj) {
      this.storageObj.setItem(`${State.statePrefix}${key}`, JSON.stringify(value))
    }
    this.dispatchEvent(
      new CustomEvent(key, {
        detail: {
          action: 'set',
          key,
          value,
        },
      }),
    )
    return m
  }

  delete(key) {
    const r = this.stateMap.delete(key)
    if (this.storageObj) {
      this.storageObj.removeItem(`${State.statePrefix}${key}`)
    }
    this.dispatchEvent(
      new CustomEvent(key, {
        detail: {
          action: 'delete',
          key,
          deleted: r, // true if element existed and was removed, or false if the element did not exist.
        },
      }),
    )
  }

  get(key) {
    return this.stateMap.get(key)
  }
}

export const state = new State()
export default state
