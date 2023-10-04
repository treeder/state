# state
JavaScript client side state using modules. Super simple.

## Usage

Import this library:

```js
```js
<script type="module">
import state from 'https://cdn.jsdelivr.net/gh/treeder/state@0/state.js'
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

💥 That's it!

You can use this anywhere, including in web components.
