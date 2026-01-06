import { AppView, AppViewState } from '../../../src';

/**
 * About Page View
 */

const template = /*html*/`
<div>
    <div class="container">
        <div class="card">
            <h1 class="card-title">{{ title }}</h1>
            <p class="card-body">{{ description }}</p>
        </div>

        <h2 class="mb-2">Technologies Used</h2>
        
        <div class="list">
            <div class="list-item" @for="technologies">
                <h3>{{ item.name }} <span class="badge badge-primary">v{{ item.version }}</span></h3>
                <p>{{ item.description }}</p>
            </div>
        </div>

        <div class="text-center mt-2">
            <a href="/" class="btn btn-outline">← Back to Home</a>
        </div>
    </div>
</div>`;

class State implements AppViewState {
    // title
    title: string = '';

    // description
    description: string = '';

    // technologies list
    technologies: Array<{ name: string; version: string; description: string }> = [
        {
            name: 'Template.Ts',
            version: '1.0.6',
            description: 'A lightweight templating engine for creating dynamic HTML templates with TypeScript. Supports data binding, loops, conditionals, and event handling.'
        },
        {
            name: 'StackView.Ts',
            version: '1.0.0',
            description: 'A simple view management library for building SPAs with smooth transitions and lifecycle hooks.'
        },
        {
            name: 'TypeScript',
            version: '5.6',
            description: 'Provides type safety and better developer experience with full IntelliSense support.'
        },
        {
            name: 'Vite',
            version: '5.4',
            description: 'Fast build tool and development server with hot module replacement.'
        }
    ];
}

export class AboutPage extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    async onMounted() {
        console.log('About page mounted');
    }
}
