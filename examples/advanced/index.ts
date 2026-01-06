/**
 * Advanced Example - Main Entry Point
 */

import { App } from '../../src';
import { container } from './services/container.service';
import { HttpClient } from './services/http.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';

// Import layouts
import { AdvancedLayout } from './layouts/advanced.layout';

// Import pages
import { DashboardPage } from './pages/dashboard.page';
import { UsersPage } from './pages/users.page';
import { UserDetailPage } from './pages/user-detail.page';
import { PostsPage } from './pages/posts.page';
import { LoginPage } from './pages/login.page';

// Import styles
import './styles.css';

// Register services with DI container
container.registerSingleton('HttpClient', HttpClient);
container.registerSingleton('AuthService', AuthService);
container.registerSingleton('UserService', UserService, container.resolve<HttpClient>('HttpClient'));
container.registerSingleton('PostService', PostService, container.resolve<HttpClient>('HttpClient'));

// Create app instance
const app = new App('#root');

// Register default layout
app.registerLayout('default', AdvancedLayout);
app.setDefaultLayout('default');

// Configure routes with authentication guard
const authGuard = () => {
    const authService = container.resolve<AuthService>('AuthService');
    if (!authService.isAuthenticated()) {
        return '/login';
    }
    return true;
};

// Map routes
app.router
    .map('/', DashboardPage, { canEnter: authGuard })
    .map('/users', UsersPage, { canEnter: authGuard })
    .map('/user/:id', UserDetailPage, { canEnter: authGuard })
    .map('/posts', PostsPage, { canEnter: authGuard })
    .map('/posts/:id', PostsPage, { canEnter: authGuard })
    .map('/login', LoginPage);

// Start the application
app.start();

console.log('🚀 Advanced Example started with:');
console.log('  - Dependency Injection');
console.log('  - API Integration (JSONPlaceholder)');
console.log('  - State Management');
console.log('  - Authentication Guard');
console.log('  - Reusable Components');
