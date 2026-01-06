# Application.Ts

A lightweight, dependency-free except template.ts and stackview.ts TypeScript framework for building single-page applications (SPAs) with pure vanilla JavaScript and CSS. No build tools required, just modern web standards.

## What is Application.Ts?

Application.Ts is a minimalist SPA framework that combines:
- **Routing**: URL-based navigation with parameters and guards
- **Templating**: Reactive data binding with Template.Ts
- **View Management**: Stack-based view transitions with StackView.Ts
- **Component Model**: Web Components for reusable UI elements

Built on web standards, Application.Ts provides a simple yet powerful foundation for creating modern web applications without the complexity of larger frameworks.

## Quick Setup

```bash
npm install application.ts
```

```typescript
import { App } from 'application.ts';
import { HomeView } from './views/home.view';

const app = new App('#root');

app.router
    .map('/', HomeView)
    .notFound(NotFoundView);

app.start();
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

## Features

### 🚀 Routing
- Pattern-based routing with URL parameters
- Navigation guards (canEnter)
- Programmatic navigation
- Browser history support
- Query string handling

```typescript
app.router
    .map('/', HomeView)
    .map('/user/:id', UserView)
    .map('/dashboard', DashboardView, {
        canEnter: () => AuthService.isLoggedIn()
    })
    .notFound(NotFoundView);
```

#### Route Guards with canEnter

Protect routes with navigation guards. The `canEnter` function can:
- Return `true` to allow navigation
- Return `false` to block navigation
- Return a string path to redirect

```typescript
// Simple authentication check
app.router.map('/dashboard', DashboardView, {
    canEnter: () => {
        return AuthService.isLoggedIn();
    }
});

// Redirect to login if not authenticated
app.router.map('/profile', ProfileView, {
    canEnter: () => {
        if (!AuthService.isLoggedIn()) {
            return '/login'; // Redirect to login page
        }
        return true; // Allow access
    }
});

// Access route parameters in guard
app.router.map('/admin/:section', AdminView, {
    canEnter: (params) => {
        if (!AuthService.isAdmin()) {
            return '/'; // Redirect to home
        }
        return true;
    }
});

// Async guards for API checks
app.router.map('/document/:id', DocumentView, {
    canEnter: async (params) => {
        const hasAccess = await checkDocumentPermission(params.id);
        return hasAccess ? true : '/unauthorized';
    }
});
```

### 🎨 Reactive Templates
Data binding with Template.Ts v2:
- `@on:` - Event handlers
- `@prop:` - Property binding
- `@att` - Attribute binding
- `@batt` - Boolean attribute binding
- `@if` - Conditional rendering
- `@for` - List rendering
- `{{ }}` - Expression interpolation

```typescript
const template = `
<div>
    <h1>{{ title }}</h1>
    <button @on:click="increment">Count: {{ count }}</button>
    <ul>
        <li @for="items">{{ item.name }}</li>
    </ul>
</div>`;
```

### 🧩 Component System
Build reusable components with AppView base class:

```typescript
import { AppView, Register } from 'application.ts';

@Register
export class MyComponent extends AppView {
    template() {
        return `<div>{{ message }}</div>`;
    }

    state() {
        return { message: 'Hello World' };
    }
}
```

### 📐 Layouts
Wrap views with shared layouts:

```typescript
app.router
    .map('/', HomeView)
    .map('/about', AboutView)
    .setLayout(DefaultLayout);
```

### 🎯 View Lifecycle
Hook into view lifecycle events:

```typescript
export class MyView extends AppView {
    async onMounted() {
        // View mounted to DOM
    }

    async stackViewShown() {
        // View became visible
    }

    async stackViewHidden() {
        // View hidden
    }
}
```

## How to Use

### 1. Create a View

```typescript
// views/home.view.ts
import { AppView, Register } from 'application.ts';

const template = `
<div class="home">
    <h1>{{ title }}</h1>
    <p>Counter: {{ count }}</p>
    <button @on:click="increment">Increment</button>
</div>`;

class State {
    title: string = 'Home Page';
    count: number = 0;
    
    increment: () => void = () => {
        this.count++;
    };
}

@Register
export class HomeView extends AppView {
    template() {
        return template;
    }

    state() {
        return new State();
    }
}
```

### 2. Set Up Routes

```typescript
// main.ts
import { App } from 'application.ts';
import { HomeView } from './views/home.view';
import { AboutView } from './views/about.view';
import { UserView } from './views/user.view';

const app = new App('#root');

app.router
    .map('/', HomeView)
    .map('/about', AboutView)
    .map('/user/:id', UserView);

app.start();
```

### 3. Navigate Between Views

```typescript
// Programmatic navigation
this.navigate('/about');
this.navigate('/user/123');

// In templates with links
<a href="/about">About</a>
<a href="/user/42">User Profile</a>
```

### 4. Access Route Parameters

```typescript
export class UserView extends AppView {
    async onMounted() {
        const userId = this.params?.id;
        console.log('User ID:', userId);
    }
}
```

### 5. Create Components

```typescript
// components/button.component.ts
import { AppView, Register } from 'application.ts';

const template = `
<button @on:click="handleClick" class="btn">
    {{ label }}
</button>`;

@Register
export class AppButton extends AppView {
    template() { return template; }
    
    state() {
        return {
            label: 'Click me',
            handleClick: () => {
                this.dispatchEvent(new CustomEvent('buttonclick', {
                    bubbles: true
                }));
            }
        };
    }
    
    get label() { return this.viewState.label; }
    set label(value: string) { this.setState('label', value); }
}
```

Use in templates:
```html
<app-button @prop:label="'Save'" @on:buttonclick="handleSave"></app-button>
```

## Examples

Explore the `/examples` folder for complete working examples:

- **Minimal** - The simplest possible app
- **Basic** - Routing, layouts, and components
- **Advanced** - Full-featured SPA with services, state management, and more

## API Reference

### App

```typescript
const app = new App(selector: string, options?: AppOptions);
app.router // Access router
app.start() // Start the application
```

### Router

```typescript
router.map(path: string, view: typeof AppView, options?: RouteOptions)
router.setLayout(layout: typeof AppView)
router.notFound(view: typeof AppView)
router.navigate(path: string)
router.start()
```

### AppView

```typescript
abstract class AppView {
    template(): string // Define HTML template
    state() // Define reactive state
    
    // Lifecycle hooks
    onBeforeMount()
    onMounted()
    onBeforeUnmount()
    onUnmounted()
    onStateChanged()
    onParamsChanged()
    
    // Navigation
    navigate(path: string)
    
    // State management
    setState(key: string, value: any)
    setStates(updates: Record<string, any>)
    update() // Force re-render
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Links

- [Template.Ts Documentation](https://www.npmjs.com/package/template.ts)
- [StackView.Ts Documentation](https://www.npmjs.com/package/stackview.ts)
