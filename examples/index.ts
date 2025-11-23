/**
 * Examples Application Entry Point
 * Demonstrates the usage of App.Ts framework with layouts
 */

import { App } from '../src';

// Import layouts
import { DefaultLayout } from './layouts/default.layout';

// Import pages
import { HomePage } from './pages/home.page';
import { AboutPage } from './pages/about.page';
import { CounterPage } from './pages/counter.page';
import { UserPage } from './pages/user.page';
import { NotFoundPage } from './pages/notfound.page';

// Create and configure the application
const app = new App('#app');

// Register layout
app.registerLayout('DefaultLayout', DefaultLayout);

// Set default layout for all routes
app.setDefaultLayout('DefaultLayout');

// Configure routes - pass view classes directly!
app.router
    .map('/', HomePage)
    .map('/about', AboutPage)
    .map('/counter', CounterPage)
    .map('/user/:id', UserPage)
    .notFound(NotFoundPage);

// Start the application
app.start();

console.log('🚀 App.Ts Examples loaded successfully with DefaultLayout!');
