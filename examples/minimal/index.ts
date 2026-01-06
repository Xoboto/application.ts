/**
 * Minimal Example - The simplest App.Ts application
 */

import { App, AppView, Register } from '../../src';

/**
 * Home Page - Simple welcome page
 */
@Register
class HomePage extends AppView {
    template(): string {
        return /*html*/`
            <div class="container">
                <h1>{{ title }}</h1>
                <p>{{ message }}</p>
                <button @on:click="increment" class="btn">
                    Clicked {{ count }} times
                </button>
            </div>
        `;
    }

    state() {
        return {
            title: '⚡ Minimal App.Ts',
            message: 'The smallest possible application - just one page with state!',
            count: 0,
            increment: () => {
                this.setState('count', this.viewState.count + 1);
            }
        };
    }
}

// Create and start app
const app = new App('#app');

app.router
    .map('/', HomePage)
    .notFound(HomePage);

app.start();

console.log('⚡ Minimal App.Ts loaded!');
