# state

Super lightweight JavaScript state library using ESM modules. Modern and easy to use.

Uses the standard [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) interface.

Features:

- Uses localStorage so state remains intact even if user leaves and comes back.
- Can listen for state changes from anywhere, even across browser tabs!

## Usage

Import this library:

```js
<script type="module">import state from 'https://cdn.jsdelivr.net/gh/treeder/state@3/state.js'</script>
```

Add listeners:

```js
state.addEventListener('car', (e) => {
  console.log('car change event:', e.detail)
  this.car = e.detail.value
})
```

Update state elsewhere:

```js
state.set('car', car)
```

Set state with a Time-To-Live (TTL) in milliseconds (e.g., expires in 5 seconds):

```js
state.set('car', car, { ttl: 5000 })
```

Fetch state on page load:

```js
state.get('car')
```

Delete from the state:

```js
state.delete('car')
```

## Storage Options

By default, the default `state` export uses `localStorage`. You can import the `State` class to create a new instance with a different storage backend:

- `'local'` (default): Uses `localStorage` (persists across page reloads and tab/browser sessions).
- `'session'`: Uses `sessionStorage` (persists across page reloads, but resets when the tab is closed).
- `'memory'`: Ephemeral in-memory storage (resets on page reload or navigation). Useful for communicating across component boundaries on the current page without persisting state.
- Or pass a custom storage object conforming to the `Storage` API.

```js
import { State } from 'https://cdn.jsdelivr.net/gh/treeder/state@3/state.js'

// Use sessionStorage
const sessionState = new State({ storage: 'session' })

// Use in-memory storage (reset on page reloads)
const memoryState = new State({ storage: 'memory' })

// Use a custom storage backend
const customState = new State({ storage: myCustomStorageObj })
```

💥 That's it!

You can use this anywhere, including in web components.
