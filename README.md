# state

Super lightweight JavaScript state library using ESM modules. Modern and easy to use.

Uses the standard [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) interface.

Features:

* Uses localStorage so state remains intact even if user leaves and comes back.
* Can listen for state changes from anywhere, even across browser tabs!

## Usage

Import this library:

```js
<script type="module">
import state from 'https://cdn.jsdelivr.net/gh/treeder/state@1/state.js'
</script>
```

Add listeners:

```js
state.addEventListener('car', (e) => {
    console.log("car change event:", e.detail)
    this.car = e.detail.value
})
```

Update state elsewhere:

```js
state.set('car', car)
```

Fetch state on page load:

```js
state.get('car')
```

Delete from the state:

```js
state.delete('car')
```


💥 That's it!

You can use this anywhere, including in web components.
