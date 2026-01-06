/**
 * Login Page
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { AuthService } from '../services/auth.service';
import '../components/error-message.component';

const template = /*html*/`
<div class="login-page">
    <div class="login-container">
        <div class="login-card">
            <h1>Welcome Back</h1>
            <p class="login-subtitle">Sign in to access the advanced example</p>
            
            <app-error-message @prop:error="error"></app-error-message>
            
            <form @on:submit="handleSubmit" class="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username"
                        placeholder="Enter your username"
                        required
                        @on:input="handleInput"
                    />
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        placeholder="Enter your password"
                        required
                        @on:input="handleInput"
                    />
                </div>
                
                <button type="submit" class="btn btn-primary btn-block" @batt:disabled="loading">
                    {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>
            
            <div class="login-info">
                <p><strong>Demo credentials:</strong></p>
                <p>Username: <code>demo</code></p>
                <p>Password: <code>password</code></p>
            </div>
        </div>
    </div>
</div>`;

class State {
    loading: boolean = false;
    error: any = null;
    username: string = '';
    password: string = '';

    handleInput: (event: Event) => void = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.name === 'username') {
            this.username = target.value;
        } else if (target.name === 'password') {
            this.password = target.value;
        }
    };

    handleSubmit: (event: Event) => void = (event) => {
        event.preventDefault();
    };
}

@Register
export class LoginPage extends AppView {
    private authService!: AuthService;

    template(): string {
        return template;
    }

    state() {
        const state = new State();

        // Set up submit handler
        state.handleSubmit = (e) => this.handleSubmit(e);

        return state;
    }

    async onMounted() {
        // Get services
        this.authService = container.resolve<AuthService>('AuthService');

        // Check if already logged in
        if (this.authService.isAuthenticated()) {
            this.navigate('/');
            return;
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();

        const { username, password } = this.viewState;

        if (!username || !password) {
            this.setState('error', {
                message: 'Please enter username and password',
                title: 'Validation Error',
                dismissible: true
            });
            return;
        }

        try {
            this.setState('loading', true);
            this.setState('error', null);

            const user = await this.authService.login(username, password);

            if (user) {
                // Login successful, redirect to dashboard
                this.navigate('/');
            }
        } catch (error: any) {
            this.setState('error', {
                message: error.message || 'Invalid credentials',
                title: 'Authentication Error',
                dismissible: true
            });
        } finally {
            this.setState('loading', false);
        }
    }
}
