import { AppView, AppViewState } from '../../src';

/**
 * 404 Not Found Page View
 */

const template = /*html*/`
<div>
    <div class="container">
        <div class="card text-center">
            <h1 style="font-size: 6rem; color: var(--danger-color);">404</h1>
            <h2 class="card-title">{{ message }}</h2>
            <p class="card-body">
                The page you're looking for doesn't exist or has been moved.
            </p>
        </div>

        <div class="card">
            <h3 class="card-title">Suggestions:</h3>
            <ul class="list">
                <li class="list-item" @for="suggestions">
                    {{ item }}
                </li>
            </ul>
        </div>

        <div class="text-center mt-2">
            <a href="/" class="btn btn-primary">Go to Home</a>
        </div>
    </div>
</div>`;

class State implements AppViewState {
    message: string = 'Page Not Found';
    suggestions: string[] = [
        'Check the URL for typos',
        'Go back to the home page',
        'Use the navigation menu above',
        'Contact support if you believe this is an error'
    ];
}

export class NotFoundPage extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    async onMounted() {
        console.log('404 page mounted');
    }
}
