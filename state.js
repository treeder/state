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
    } else if (this.storage === 'memory') {
      this.storageObj = null
    } else {
      this.storageObj = this.storage
    }

    this.stateMap = new Map()
    this.ttlMap = new Map()

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
          let expiresAt = null
          if (e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue)
              value = parsed?.value
              expiresAt = parsed?.expiresAt
            } catch (err) {
              console.log(`[state] ${e.key} invalid json`)
            }
          }

          if (e.newValue && (!expiresAt || Date.now() <= expiresAt)) {
            this.stateMap.set(key, value)
            if (expiresAt) {
              this.ttlMap.set(key, expiresAt)
            } else {
              this.ttlMap.delete(key)
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
          } else {
            const r = this.stateMap.delete(key)
            this.ttlMap.delete(key)
            this.dispatchEvent(
              new CustomEvent(key, {
                detail: {
                  action: 'delete',
                  key,
                  value: null,
                  deleted: r,
                },
              }),
            )
          }
        }
      })
    }
  }

  loadState() {
    if (!this.storageObj) return
    for (const key in this.storageObj) {
      if (key.startsWith(State.statePrefix)) {
        let raw = this.storageObj.getItem(key)
        try {
          const parsed = JSON.parse(raw)
          const value = parsed?.value
          const expiresAt = parsed?.expiresAt
          const stateKey = key.substring(State.statePrefix.length)
          if (expiresAt && Date.now() > expiresAt) {
            this.storageObj.removeItem(key)
          } else {
            this.stateMap.set(stateKey, value)
            if (expiresAt) {
              this.ttlMap.set(stateKey, expiresAt)
            }
          }
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
   * @param {number} [opts.ttl] Time-To-Live in milliseconds
   */
  set(key, value, opts = {}) {
    const expiresAt = opts.ttl ? Date.now() + opts.ttl : null
    const m = this.stateMap.set(key, value)
    if (expiresAt) {
      this.ttlMap.set(key, expiresAt)
    } else {
      this.ttlMap.delete(key)
    }

    if (!opts.skipStorage && this.storageObj) {
      const wrapped = { value, expiresAt }
      this.storageObj.setItem(`${State.statePrefix}${key}`, JSON.stringify(wrapped))
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
    this.ttlMap.delete(key)
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
    const expiresAt = this.ttlMap.get(key)
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key)
      return undefined
    }
    return this.stateMap.get(key)
  }
}

export const state = new State()
export default state
