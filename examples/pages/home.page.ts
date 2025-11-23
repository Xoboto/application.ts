import { AppView, AppViewState } from '../../src';

/**
 * Home Page View
 */

const template = /*html*/`
<div>
    <div class="hero">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
    </div>
    
    <div class="container">
        <h2 class="text-center mb-2">Features</h2>
        
        <div class="grid">
            <div class="card" @for="features">
                <div class="card-title">{{ item.icon }} {{ item.title }}</div>
                <div class="card-body">{{ item.description }}</div>
            </div>
        </div>
        
        <div class="text-center mt-2">
            <a href="/about" class="btn btn-primary">Learn More</a>
            <a href="/counter" class="btn btn-outline">Try Counter Demo</a>
        </div>
    </div>
</div>`;

class State implements AppViewState {
    // title
    title: string = '';

    // subtitle
    subtitle: string = '';

    // features list
    features: Array<{ icon: string; title: string; description: string }> = [
        {
            icon: '🚀',
            title: 'Lightweight',
            description: 'Zero dependencies framework core. Only uses Template.Ts and StackView.Ts for templating and view management.'
        },
        {
            icon: '⚡',
            title: 'Fast & Simple',
            description: 'Easy to learn API with powerful routing, state management, and reactive templates.'
        },
        {
            icon: '🎨',
            title: 'Flexible',
            description: 'Build modern SPAs with pure TypeScript, HTML, and CSS. No complex build configurations.'
        },
        {
            icon: '🔧',
            title: 'Type-Safe',
            description: 'Full TypeScript support with proper typing for better developer experience.'
        },
        {
            icon: '📦',
            title: 'Modular',
            description: 'Clean architecture with separate concerns for routing, views, and components.'
        },
        {
            icon: '🎯',
            title: 'Web Standards',
            description: 'Built on Web Components and modern browser APIs for maximum compatibility.'
        }
    ];
}

export class HomePage extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    async onMounted() {
        console.log('Home page mounted');
    }
}
