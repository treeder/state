/***
 * This one just shows the counter value from the state AND lets you increment it.
 */
import { LitElement, html } from 'lit'
import '@material/web/button/filled-button.js'
import state from '../state.js'

class CounterComponent extends LitElement {
    static properties = {
        counter: { type: Number }
    }

    constructor() {
        super();
        this.counter = 0
    }

    connectedCallback() {
        super.connectedCallback()
        this.counter = state.get('counter')
        console.log("got counter 2:", this.counter)
        state.addEventListener('counter', (e) => {
            console.log("counter event", e)
            this.counter = e.detail.value
        })
    }

    render() {
        return html`
            <div>${this.counter}</div>
            <md-filled-button @click=${this.increment}>Increment</md-filled-button>
        `
    }

    increment() {
        this.counter++
        state.set('counter', this.counter)
    }

}

customElements.define('counter-component', CounterComponent)
