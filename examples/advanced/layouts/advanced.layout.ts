/**
 * Advanced Layout
 * Main layout with sidebar navigation and header
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { AuthService } from '../services/auth.service';
import { appState } from '../services/state.service';

const template = /*html*/`
<div class="advanced-layout" @att:class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'">
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>Advanced App</h2>
            <button @on:click="toggleSidebar" class="sidebar-toggle">☰</button>
        </div>
        
        <nav class="sidebar-nav">
            <a href="/" @att:class="isActive('/') ? 'active' : ''">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Dashboard</span>
            </a>
            <a href="/users" @att:class="isActive('/users') ? 'active' : ''">
                <span class="nav-icon">👥</span>
                <span class="nav-label">Users</span>
            </a>
            <a href="/posts" @att:class="isActive('/posts') ? 'active' : ''">
                <span class="nav-icon">📝</span>
                <span class="nav-label">Posts</span>
            </a>
        </nav>

        <div class="sidebar-footer">
            <div class="user-profile">
                <div class="user-avatar">{{ userInitials }}</div>
                <div class="user-info" @if="sidebarOpen">
                    <div class="user-name">{{ currentUser.username }}</div>
                    <div class="user-email">{{ currentUser.email }}</div>
                </div>
            </div>
            <button @on:click="handleLogout" class="btn btn-link logout-btn">
                <span>🚪</span>
                <span @if="sidebarOpen">Logout</span>
            </button>
        </div>
    </aside>
    
    <div class="main-content">
        <header class="app-header">
            <button @on:click="toggleSidebar" class="mobile-menu-btn">☰</button>
            <div class="header-actions">
                <button @on:click="toggleTheme" class="btn btn-icon" title="Toggle Theme">
                    {{ theme === 'dark' ? '☀️' : '🌙' }}
                </button>
            </div>
        </header>
        
        <main class="content-area">
            <div data-outlet="content"></div>
        </main>
        
        <footer class="app-footer">
            <p>© {{ new Date().getFullYear() }} Advanced App. Built with Application.Ts</p>
        </footer>
    </div>
</div>`;

class State {
    sidebarOpen: boolean = true;
    theme: 'light' | 'dark' = 'light';
    currentPath: string = '/';
    currentUser: { username: string; email: string } = { username: 'User', email: '' };
    userInitials: string = 'U';

    toggleSidebar: () => void = () => {
        this.sidebarOpen = !this.sidebarOpen;
        appState.setState({ sidebarOpen: this.sidebarOpen });
    };

    toggleTheme: () => void = () => {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        appState.setState({ theme: this.theme });
        document.documentElement.setAttribute('data-theme', this.theme);
    };

    isActive: (path: string) => boolean = (path) => {
        return this.currentPath === path || this.currentPath.startsWith(path + '/');
    };

    handleLogout: () => void = () => {};
}

@Register
export class AdvancedLayout extends AppView {
    private authService!: AuthService;
    private unsubscribe?: () => void;

    template(): string {
        return template;
    }

    state() {
        const state = new State();
        state.isActive = (path: string) => { return this.app?.currentRoute === path; };
        return state;
    }

    async onMounted() {
        // Get services
        this.authService = container.resolve<AuthService>('AuthService');

        // Set current user
        const user = this.authService.getUser();
        if (user) {
            
            this.setStates({
                currentUser: {
                    username: user.username,
                    email: user.email
                },
                userInitials: this.getInitials(user.username)
            });
        }

        // Set up logout handler
        this.viewState.handleLogout = () => this.handleLogout();

        // Subscribe to state changes
        this.unsubscribe = appState.subscribe((appStateValue) => {
            this.setStates({
                sidebarOpen: appStateValue.sidebarOpen,
                theme: appStateValue.theme
            });
        });

        // Update current path on hash change
        this.updateCurrentPath();
        window.addEventListener('hashchange', () => this.updateCurrentPath());

        // Initialize theme
        const theme = appState.getState().theme;
        document.documentElement.setAttribute('data-theme', theme);
    }

    async stackViewHidden() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        window.removeEventListener('hashchange', () => this.updateCurrentPath());
    }

    private updateCurrentPath() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.split('?')[0].split('#')[0];
        this.setState('currentPath', path);
    }

    private getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    private handleLogout() {
        this.authService.logout();
        this.navigate('/login');
    }
}
