/**
 * Error Message Component
 */

import { error } from 'console';
import { AppView, Register } from '../../../src';

const template = /*html*/`
<div class="error-message" @if="error">
    <div class="error-icon">⚠️</div>
    <div class="error-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button @on:click="dismiss" class="btn btn-secondary" @if="dismissible">Dismiss</button>
    </div>
</div>`;

class State {
    error: boolean = false;
    title: string = 'Error';
    message: string = '';
    dismissible: boolean = true;
    dismiss: () => void = () => {
        this.error = false;
    };
}

export interface ErrorState {
    title: string;
    message: string;
    dismissible: boolean;
}

@Register
export class AppErrorMessage extends AppView {
    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    showError(message: string, title: string = 'Error', dismissible: boolean = true) {
        this.setStates({
            error: true,
            message,
            title,
            dismissible
        })
    }

    hide() {
        this.setState('error', false);
    }

    get error (): ErrorState | null {
        if (this.viewState.error) {
            return {
                title: this.viewState.title,
                message: this.viewState.message,
                dismissible: this.viewState.dismissible
            };
        }
        return null;        
    }
    set error (error: ErrorState | null) {
        if (error) {
            this.setStates({
                error: true,
                message: error.message,
                title: error.title,
                dismissible: error.dismissible
            });
        } else {
            this.setState('error', false);
        }
    }
}
