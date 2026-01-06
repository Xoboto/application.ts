import { AppViewState, AppView } from '../../../src';

/**
 * User Profile Page View - Demonstrates route parameters
 */

const template = /*html*/`
<div>
    <div class="container">
        <div class="card" @if="loading">
            <div class="text-center">
                <div class="spinner" style="margin: 2rem auto;"></div>
                <p>Loading user profile...</p>
            </div>
        </div>

        <div class="alert alert-danger" @if="error">
            {{ error }}
        </div>

        <div @if="user && !loading">
            <div class="card">
                <h1 class="card-title">{{ user?.name }}</h1>
                <p class="card-body">
                    <strong>User ID:</strong> {{ userId }}<br>
                    <strong>Email:</strong> {{ user?.email }}<br>
                    <strong>Role:</strong> <span class="badge badge-primary">{{ user?.role }}</span><br>
                    <strong>Joined:</strong> {{ user?.joined }}
                </p>
            </div>

            <div class="card">
                <h2 class="card-title">Route Parameters Demo</h2>
                <p class="card-body">
                    This page demonstrates how route parameters work. 
                    The user ID "{{ userId }}" was extracted from the URL path <code>/user/:id</code>.
                </p>
                <p class="card-body">
                    Try visiting different user profiles:
                </p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <a @for="users" @att:href="'/user/' + item.key" class="btn btn-outline">{{ item.name }}</a>
                    <a href="/user/100" class="btn btn-outline">User 100 (Not Found)</a>
                </div>
            </div>
        </div>

        <div class="text-center mt-2">
            <a href="/" class="btn btn-outline">← Back to Home</a>
        </div>
    </div>
</div>`;

class State implements AppViewState {
    private view: UserPage;
    constructor(view: UserPage){
        this.view = view;
    }

    userId: string = '';
    user: { key: string; name: string; email: string; role: string; joined: string } | null = null;
    loading: boolean = true;
    error: string | null = null;

    users: { key: string; name: string; email: string; role: string; joined: string }[] = [
        { key: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', joined: 'Jan 2023' },
        { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', joined: 'Mar 2023' },
        { key: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', joined: 'Jun 2023' }
    ];

    fetchUser(id: string): Promise<void> {
        this.loading = true;
        this.error = null;

        this.view.update();

        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(async () => {
                const user = this.users.find((u: { key: string; }) => u.key === id);
                if (user) {
                    this.user = user;
                } else {
                    this.user = null;
                    this.error = `User with ID "${id}" not found.`;
                }

                this.loading = false;
                this.view.update();
                resolve();
            }, 1000);
        });
    }
}

export class UserPage extends AppView {
    constructor() {
        super({autoUpdate: false});
    }

    template(): string {
        return template;
    }

    state() {
        return new State(this);
    }

    async onParamsChanged(newParams: any, oldParams: any) {
        // Called when navigating from /user/1 to /user/2
        console.log(`User ID changed from ${oldParams.id} to ${newParams.id}`);
        
        // Update user ID in state
        this.setState('userId', newParams.id || 'unknown');
        
        // Fetch new user data
        await this.viewState.fetchUser(newParams.id || 'unknown');
    }

    async onMounted() {
        // Get user ID from route parameters
        this.viewState.userId = this.params.id || 'unknown';
        
        // Simulate API call to fetch user data
        await this.viewState.fetchUser(this.viewState.userId);
    }
}
