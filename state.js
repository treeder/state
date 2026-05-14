export class State extends EventTarget {
  // implements EventTarget (partially anyways) https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

  static statePrefix = "state.";

  constructor() {
    super();

    this.stateMap = new Map();

    this.loadState();

    window.addEventListener("storage", (e) => {
      if (e.key.startsWith(State.statePrefix)) {
        // console.log("storage event", e)
        let key = e.key.substring(State.statePrefix.length);
        let value = null;
        if (e.newValue) {
          value = JSON.parse(e.newValue);
        }
        this.dispatchEvent(
          new CustomEvent(key, {
            detail: {
              action: value ? "set" : "delete",
              key: key,
              value: value,
            },
          }),
        );
      }
    });
  }

  loadState() {
    for (let key in window.localStorage) {
      if (key.startsWith(State.statePrefix)) {
        let value = window.localStorage.getItem(key);
        try {
          value = JSON.parse(value);
          this.stateMap.set(key.substring(State.statePrefix.length), value);
        } catch (e) {
          console.log(`[state] ${key} invalid json`);
        }
      }
    }
  }

  /**
   * Set the value of a state key.
   * @param {string} key
   * @param {any} value
   * @param {object} opts
   * @param {boolean} [opts.skipStorage=false] if true, the value will not be stored in localStorage
   */
  set(key, value, opts = {}) {
    let m = this.stateMap.set(key, value);
    if (!opts.skipStorage) {
      window.localStorage.setItem(
        `${State.statePrefix}${key}`,
        JSON.stringify(value),
      );
    }
    this.dispatchEvent(
      new CustomEvent(key, {
        detail: {
          action: "set",
          key,
          value,
        },
      }),
    );
    return m;
  }

  delete(key) {
    let r = this.stateMap.delete(key);
    window.localStorage.removeItem(`${State.statePrefix}${key}`);
    this.dispatchEvent(
      new CustomEvent(key, {
        detail: {
          action: "delete",
          key,
          deleted: r, // true if element existed and was removed, or false if the element did not exist.
        },
      }),
    );
  }

  get(key) {
    return this.stateMap.get(key);
  }
}

export const state = new State();
export default state;
