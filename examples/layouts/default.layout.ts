import { AppView } from '../../src';
import '../components/nav.component';

/**
 * Default Layout
 * Provides a common layout with header navigation and footer
 */

const template = /*html*/`
<div class="layout">
    <header class="layout-header">
        <navigation-bar />
    </header>
    
    <main class="layout-content" data-outlet="content">
        <!-- Page content will be injected here -->
    </main>
    
    <footer class="layout-footer" style="text-align: center; padding: 2rem; background: white; margin-top: 2rem; border-top: 1px solid var(--border-color);">
        <p>© {{ year }} {{ appName }} - Built with App.Ts</p>
    </footer>
</div>`;

export class DefaultLayout extends AppView {
    template(): string {
        return template;
    }

    state() {
        return {
            appName: 'Basic-Example',
            year: new Date().getFullYear()
        };
    }
}
