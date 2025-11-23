import { AppView, AppViewState } from '../../src';

/**
 * Counter Page View - Interactive Demo
 */

const template = /*html*/`
<div>
    <div class="container">
        <div class="card">
            <h1 class="card-title text-center">Counter Demo</h1>
            <p class="card-body text-center">
                Interactive counter to demonstrate state management and reactivity
            </p>
        </div>

        <div class="card">
            <div class="text-center">
                <h2 class="mb-2" style="font-size: 4rem; color: var(--primary-color);">
                    {{ count }}
                </h2>
                
                <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
                    <button class="btn btn-danger" @on:click="decrement">- {{ step }}</button>
                    <button class="btn btn-secondary" @on:click="reset">Reset</button>
                    <button class="btn btn-primary" @on:click="increment">+ {{ step }}</button>
                </div>

                <div class="form-group" style="max-width: 300px; margin: 0 auto;">
                    <label class="form-label">Step Value:</label>
                    <input 
                        type="number" 
                        class="form-control" 
                        @att:value="step"
                        @on:input="changeStep"
                        min="1"
                        max="100"
                    />
                </div>
            </div>
        </div>

        <div class="card" @if="history.length > 0">
            <h3 class="card-title">History</h3>
            <div class="list">
                <div class="list-item" @for="history">
                    <span class="badge" @att:class="item >= 0 ? 'badge-success' : 'badge-danger'">
                        {{ item >= 0 ? '+' : '' }}{{ item }}
                    </span>
                </div>
            </div>
        </div>

        <div class="text-center mt-2">
            <a href="/" class="btn btn-outline">← Back to Home</a>
        </div>
    </div>
</div>`;

class State implements AppViewState {
    public count: number = 0;
    public step: number = 1;
    public history: number[] = [];

    public increment(): void {
        const newCount = this.count + this.step;
        this.history.unshift(this.step);
        this.count = newCount;
    }

    public decrement(): void {
        const newCount = this.count - this.step;
        this.history.unshift(-this.step);
        this.count = newCount;
    }

    public reset(): void {
        this.history = [];
        this.count = 0;
    }

    public changeStep(e: Event): void {
        const value = parseInt((e.target as HTMLInputElement).value) || 1;
        this.step = Math.max(1, Math.min(100, value));
    }
}
    
export class CounterPage extends AppView {
    template(): string {
        return template;
    }

    state(): State {
        return new State();
    }

    async onMounted() {
        console.log('Counter page mounted');
    }
}
