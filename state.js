
export class State extends EventTarget { // implements EventTarget (partially anyways) https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

    static stateKey = 'state'
    static statePrefix = 'state.'

    constructor() {
        super()

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
        // NOTE: I may drop the 'state' object from local storage and just use individual keys, better for event handling.
        const storedState = localStorage.getItem(State.stateKey)
        if (!storedState) {
            this.stateMap = new Map()
            return null
        }
        // console.log("storedState:", storedState)
        let state = null
        try {
            state = JSON.parse(storedState)
            // console.log("storedState:", state)
        } catch (err) {
            console.error("error parsing stored state:", err)
        }
        this.stateMap = new Map(Object.entries(state))

        // the alternative way using individual keys
        for (let key in localStorage) {
            let value = localStorage.getItem(key)
            value = JSON.parse(value)
            this.stateMap.set(key, value)
        }
        return state
    }

    saveState() {
        // can probably ditch this whole state object now that we're using individual keys
        localStorage.setItem(State.stateKey, JSON.stringify(Object.fromEntries(this.stateMap)))
    }

    set(key, value) {
        let m = this.stateMap.set(key, value)
        localStorage.setItem(`${State.statePrefix}${key}`, JSON.stringify(value))
        this.saveState()
        this.dispatchEvent(new CustomEvent(key, {
            detail: {
                action: 'set',
                key,
                value,
            },
        }))
        return m // can chain calls together
    }

    delete(key) {
        let r = this.stateMap.delete(key)
        localStorage.removeItem(`${State.statePrefix}${key}`)
        this.saveState()
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
