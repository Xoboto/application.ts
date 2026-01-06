# Advanced Example

A full-featured SPA demonstrating production-ready patterns with Application.Ts framework.

## Features

### Architecture
- **Dependency Injection**: Service container with singleton pattern
- **State Management**: Reactive state with subscribe/setState pattern
- **API Integration**: RESTful API client using JSONPlaceholder
- **Authentication**: Mock auth with route guards and localStorage persistence
- **TypeScript Models**: Strongly typed interfaces for all entities

### Services
- `HttpClient`: Generic HTTP client with error handling
- `ServiceContainer`: Simple DI container for managing dependencies
- `AuthService`: Mock authentication with login/logout
- `UserService`: CRUD operations for users
- `PostService`: Posts and comments management
- `StateService`: Global reactive state management

### Components
- `LoadingSpinner`: Reusable loading indicator
- `ErrorMessage`: Error display component
- `DataTable`: Generic table with search, sort, and pagination
- `Modal`: Reusable dialog component

### Pages
- **Dashboard**: Statistics and recent activity overview
- **Users**: List all users with search and filtering
- **User Detail**: Individual user profile with posts
- **Posts**: Posts list with comments and filtering
- **Login**: Authentication page (demo credentials below)

### UI/UX
- Responsive sidebar navigation with collapse
- Dark/light theme toggle
- Professional styling with CSS variables
- Smooth animations and transitions
- Mobile-friendly responsive design

## Demo Credentials

```
Username: demo
Password: password
```

(Any username/password combination will work in this mock implementation)

## API

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com) for demo data:
- `/users` - User list and details
- `/posts` - Posts and comments
- Full CRUD operations (simulated)

## Project Structure

```
advanced/
├── components/        # Reusable UI components
│   ├── data-table.component.ts
│   ├── error-message.component.ts
│   ├── loading-spinner.component.ts
│   └── modal.component.ts
├── layouts/          # Page layouts
│   └── advanced.layout.ts
├── models/           # TypeScript interfaces
│   └── index.ts
├── pages/            # Application pages
│   ├── dashboard.page.ts
│   ├── login.page.ts
│   ├── posts.page.ts
│   ├── user-detail.page.ts
│   └── users.page.ts
├── services/         # Business logic and API
│   ├── auth.service.ts
│   ├── container.service.ts
│   ├── http.service.ts
│   ├── post.service.ts
│   ├── state.service.ts
│   └── user.service.ts
├── index.html        # Entry HTML
├── index.ts          # Application bootstrap
├── styles.css        # Global styles
└── README.md         # This file
```

## Key Patterns

### Service Registration
```typescript
container.registerSingleton('HttpClient', HttpClient);
container.registerSingleton('UserService', UserService, 
  container.resolve<HttpClient>('HttpClient')
);
```

### State Management
```typescript
appState.subscribe((state) => {
  console.log('State updated:', state);
});

appState.setState({ loading: true });
```

### Route Guards
```typescript
app.router.map('/dashboard', DashboardPage, {
  canEnter: () => {
    const auth = container.resolve<AuthService>('AuthService');
    return auth.isAuthenticated() ? true : '/login';
  }
});
```

### Component Usage
```typescript
const table = document.querySelector('data-table');
table.setColumns([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' }
]);
table.setData(users);
table.onRowClick((user) => {
  console.log('Clicked:', user);
});
```

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Navigate to
http://localhost:3000/advanced/
```

## Building for Production

```bash
# Build all examples
npm run build

# Output
examples/dist/advanced/
```

## Learning Path

1. **Start with Login** - See authentication in action
2. **Explore Dashboard** - View API integration and state management
3. **Browse Users** - Experience DataTable component
4. **View User Details** - See dynamic routing with parameters
5. **Check Posts** - Modal dialogs and filtering

## Technologies

- **Application.Ts**: SPA framework (zero dependencies)
- **Template.Ts**: Reactive templating
- **StackView.Ts**: View transitions
- **TypeScript**: Type safety
- **Vite**: Build tool
- **JSONPlaceholder**: Demo API

## Next Steps

- Add more services (Todos, Albums, Photos)
- Implement real-time updates with WebSocket
- Add form validation library
- Implement caching layer
- Add unit tests with Vitest
- Add E2E tests with Playwright

## License

MIT
