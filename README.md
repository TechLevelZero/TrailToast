# TrailToast

**TrailToast** is a light, animated toast notification system that initially appears under your mouse cursor and then trails to the top-right corner of the screen. With theme support and stacked notifications, it offers a dynamic and visually appealing way to deliver messages in your web app that won't get missed.

Inspierd by Theo video - https://www.youtube.com/watch?v=LeCKu0HqGFQ

---

## ✨ Features

- 🐭 **Mouse-Originated Animations** – Toasts first appear at the user's cursor location.
- 🛸 **Animated Glide Movement** – Smoothly transitions to a stack in the top-right corner.
- 🎨 **Theme Support** – 7 built-in themes and support for custom colours, set padding, borders, and more!
- 📦 **Zero Dependencies** – Lightweight and self-contained at **11KB**.
- ⏳ **Configurable Timings** – Easily control appearance, movement, and fade-out timing.
- 📚 **Programmatic API** – `show()`, `clearAll()`, `getActiveCount()`

---

## 🚀 Getting Started

### 1. Include in Your Project

#### Option A: Browser (Global)

```html
<script src="trailtoast.min.js"></script>
<script>
  const toast = new TrailToast();
  toast.show('Hello from TrailToast!');
</script>
```

#### Option B: ES Modules / CommonJS

```js
import TrailToast from './trailtoast.js';

const toast = new TrailToast();
toast.show('Hello from TrailToast!');
```

---

## 🧪 Usage Examples

```js
const toast = new TrailToast();

// Basic usage
toast.show('This is a basic toast.');

// Themed toast
toast.show('Success!', { theme: 'success' });

// Custom styles
toast.show('Custom look!', {
  backgroundColor: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
  textColor: '#fff',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  padding: '20px 30px',
  borderRadius: '16px'
});

// Custom timing
toast.show('Stays longer', {
  fadeDelay: 8000,
  moveDelay: 2000
});

// Disable cursor origin
toast.show('Always appears in the top-right!', { spawnAtCursor: false });
```

---

## 🎨 Themes Available

- `default`
- `success`
- `error`
- `warning`
- `info`
- `dark`
- `light`

---

## 🆚 Comparison to Known Libraries

| Feature                         | TrailToast      | [Toastr](https://github.com/CodeSeven/toastr) | [Notyf](https://github.com/caroso1222/notyf) | [React-Toastify](https://github.com/fkhadra/react-toastify) |
|---------------------------------|------------------|-----------------|------------------|---------------------------|
| Mouse-Origin Positioning        | ✅               | ❌              | ❌               | ❌                        |
| Animated Stack Movement         | ✅               | ❌              | ❌               | ❌                        |
| Built-in Themes                 | ✅               | ✅              | ✅               | ✅                        |
| Customizable Appearance         | ✅               | ✅              | ✅               | ✅                        |
| No Dependencies                 | ✅               | ✅              | ✅               | ❌ (React)                |
| Framework Agnostic              | ✅               | ✅              | ✅               | ❌

> TrailToast is a unique UI enhancement that focuses on animation and interaction, giving the user full confidence in the acions performed.

---

## ⚙️ Options

You can pass global options on initialization or override per toast.

```js
new TrailToast({
  moveDelay: 1000,
  fadeDelay: 5000,
  fadeOutDuration: 500,
  topOffset: 20,
  rightOffset: 20,
  toastHeight: 60,
  backgroundColor: 'linear-gradient(45deg, #667eea, #764ba2)',
  textColor: 'white',
  borderColor: 'rgba(255, 255, 255, 0.2)'
});
```

---

## 📦 API

```js
toast.show(message, options = {})
toast.clearAll()
toast.getActiveCount()
```

---

## 📁 License

MIT © **TechLevelZero** Made with the sounds of **Sleep Token** and **Bea and her Business** for this project.

---


## 📸 Demo

[View HTML Demo](https://techlevelzero.github.io/TrailToast/demo.html)
