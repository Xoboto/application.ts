/**
 * User Detail Page
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { appState } from '../services/state.service';
import type { User, Post } from '../models';
import '../components/loading-spinner.component';
import '../components/error-message.component';

const template = /*html*/`
<div class="user-detail-page">
    <app-loading-spinner @prop:visible="loading" @prop:message="loadingMessage"></app-loading-spinner>
    <app-error-message @prop:error="error"></app-error-message>
    
    <div class="page-content" @if="user">
        <div class="page-header">
            <button @on:click="goBack" class="btn btn-secondary">← Back</button>
            <h1>User Details</h1>
        </div>
        
        <div class="user-detail-grid">
            <div class="user-info-card">
                <div class="user-avatar-large">{{ getInitials(user.name) }}</div>
                <h2>{{ user.name }}</h2>
                <p class="user-username">@{{ user.username }}</p>
                
                <div class="user-details">
                    <div class="detail-item">
                        <span class="detail-icon">📧</span>
                        <span>{{ user.email }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📞</span>
                        <span>{{ user.phone }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🌐</span>
                        <span>{{ user.website }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🏢</span>
                        <span>{{ user.company.name }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        <span>{{ user.address.city }}, {{ user.address.street }}</span>
                    </div>
                </div>
            </div>
            
            <div class="user-posts-section">
                <h2>Posts by {{ user.name }}</h2>
                <div class="posts-list">
                    <div class="post-card" @for="posts">
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.body }}</p>
                        <button @on:click="viewComments" class="btn btn-link">
                            View Comments
                        </button>
                    </div>
                    <div class="no-posts" @if="posts.length === 0">
                        <p>No posts yet</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

class State {
    loading: boolean = false;
    loadingMessage: string = '';
    error: any = null;
    user: User | null = null;
    posts: Post[] = [];
    
    getInitials: (name: string) => string = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    goBack: () => void = () => {
        window.history.back();
    };

    viewComments: (ev: Event, item: any) => void = (ev: Event, item: any) => {};
}

@Register('user-detail-page')
export class UserDetailPage extends AppView {
    private userService!: UserService;
    private postService!: PostService;
    private userId?: string;

    template(): string {
        return template;
    }

    state() {
        const state = new State();
        state.viewComments = (ev: Event, item: any) => {
            this.navigate(`/posts/${item.id}`);
        };
        return state;
    }

    async onMounted() {
        // Get services
        this.userService = container.resolve<UserService>('UserService');
        this.postService = container.resolve<PostService>('PostService');

        // Get user ID from params
        this.userId = this.params?.id;

        if (!this.userId) {
            this.setState('error', {
                message: 'User ID is required',
                title: 'Invalid Request',
                dismissible: true
            });
            return;
        }

        await this.loadData();
    }

    onParamsChanged() {
        if (this.params?.id !== this.userId) {
            this.userId = this.params?.id;
            this.loadData();
        }
    }

    private async loadData() {
        if (!this.userId) return;

        try {
            this.setStates({
                loading: true,
                loadingMessage: 'Loading user details...'
            });

            const [user, posts] = await Promise.all([
                this.userService.getUser(parseInt(this.userId)),
                this.postService.getPosts(parseInt(this.userId))
            ]);
            
            this.setStates({
                user: user,
                posts: posts,
                loading: false
            });
        } catch (error: any) {
            this.setStates({
                loading: false,
                error: {
                    message: error.message || 'Failed to load user details',
                    title: 'User Detail Error',
                    dismissible: true
                }
            });
        }
    }
}
