import { AppView, Register } from '../../../src';

/**
 * Navigation Component
 * Reusable navigation bar component
 */

const template = /*html*/`
<nav class="nav">
    <div class="nav-container">
        <a href="/" class="nav-brand">{{ brand }}</a>
        <ul class="nav-links">
            <li @for="links">
                <a @att:href="item.path" 
                   @att:class="isActive(item.path) ? 'nav-link active' : 'nav-link'"
                   class="nav-link">
                    {{ item.label }}
                </a>
            </li>
        </ul>
    </div>
</nav>`;

class State {
    brand: string = 'App.Ts';
    currentPath: string = window.location.pathname;
    links: Array<{ path: string; label: string }> = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/counter', label: 'Counter' },
        { path: '/user/1', label: 'User Demo' }
    ];
    isActive = (path: string) => {
        return this.currentPath === path;
    }
}

@Register
export class NavigationBar extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    async onMounted() {
        // Update active state when navigation occurs
        window.addEventListener('navigation:navigate', () => {
            this.setState('currentPath', window.location.pathname);
        });
    }
}
