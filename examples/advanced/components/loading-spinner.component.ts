/**
 * Loading Spinner Component
 */

import { AppView, Register } from '../../../src';

const template = /*html*/`
<div class="loading-spinner" @if="show">
    <div class="spinner"></div>
    <p @if="message">{{ message }}</p>
</div>`;

class State {
    show: boolean = true;
    message: string = '';
}

@Register('app-loading-spinner')
export class AppLoadingSpinner extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    get message(): string {
        return this.viewState.message;
    }
    set message(message: string) {
        this.setState('message', message);
    }

    get visible(): boolean {
        return this.viewState.show;
    }
    set visible(value: boolean) {
        this.setState('show', value);
    }
}
