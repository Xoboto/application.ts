/**
 * Dashboard Page
 * Main page showing statistics and recent activity
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { appState } from '../services/state.service';
import '../components/loading-spinner.component';
import '../components/error-message.component';

const template = /*html*/`
<div class="dashboard-page">
    <app-loading-spinner @prop:visible="loading" @prop:message="loadingMessage"></app-loading-spinner>
    <app-error-message @prop:error="error"></app-error-message>
    
    <div class="dashboard-content" @if="!loading">
        <h1>Dashboard</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>{{ stats.totalUsers }}</h3>
                    <p>Total Users</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <h3>{{ stats.totalPosts }}</h3>
                    <p>Total Posts</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💬</div>
                <div class="stat-content">
                    <h3>{{ stats.totalComments }}</h3>
                    <p>Total Comments</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⚡</div>
                <div class="stat-content">
                    <h3>{{ stats.avgPostsPerUser }}</h3>
                    <p>Avg Posts/User</p>
                </div>
            </div>
        </div>
        
        <div class="dashboard-sections">
            <div class="recent-users">
                <h2>Recent Users</h2>
                <div class="user-list">
                    <div class="user-card" @for="recentUsers" @on:click="navigateToUser">
                        <div class="user-avatar">{{ getInitials(item.name) }}</div>
                        <div class="user-info">
                            <h4>{{ item.name }}</h4>
                            <p>{{ item.email }}</p>
                            <span class="user-company">{{ item.company.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="recent-posts">
                <h2>Recent Posts</h2>
                <div class="post-list">
                    <div class="post-card" @for="recentPosts" @on:click="navigateToPost">
                        <h4>{{ item.title }}</h4>
                        <p>{{ truncate(item.body, 100) }}</p>
                        <span class="post-user">User {{ item.userId }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

class State {
    loading: boolean = true;
    loadingMessage: string = '';
    error: any = null;
    stats: {
        totalUsers: number;
        totalPosts: number;
        totalComments: number;
        avgPostsPerUser: number;
    } = {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        avgPostsPerUser: 0
    };
    recentUsers: any[] = [];
    recentPosts: any[] = [];

    getInitials: (name: string) => string = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    truncate: (text: string, length: number) => string = (text, length) => {
        return text.length > length ? text.slice(0, length) + '...' : text;
    };

    navigateToUser: (ev: Event, item: any) => void = (ev: Event, item: any) => {};

    navigateToPost: (ev: Event, item: any) => void = (ev: Event, item: any) => {};
}

@Register
export class DashboardPage extends AppView {
    private userService!: UserService;
    private postService!: PostService;
    private unsubscribe?: () => void;

    template(): string {
        return template;
    }

    state() {
        const state = new State();
        state.navigateToPost = (ev: Event, item: any) => {
            this.navigate(`/posts/${item.id}`);
        };
        state.navigateToUser = (ev: Event, item: any) => {
            this.navigate(`/user/${item.id}`);
        };
        return state;
    }

    async onMounted() {
        // Get services
        this.userService = container.resolve<UserService>('UserService');
        this.postService = container.resolve<PostService>('PostService');

        // Subscribe to state
        this.unsubscribe = appState.subscribe((state) => {
            this.setState('loading', state.loading);
            if (state.loading) {
                this.setState('loadingMessage', 'Loading dashboard data...');
            }
        });

        await this.loadData();
    }

    async stackViewHidden() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    private async loadData() {
        try {
            appState.setState({ loading: true });
            this.setState('loading', true);

            // Fetch all data in parallel
            const [users, posts] = await Promise.all([
                this.userService.getUsers(),
                this.postService.getPosts()
            ]);

            // Calculate stats
            const totalUsers = users.length;
            const totalPosts = posts.length;
            
            // Get comments count from first few posts
            const samplePosts = posts.slice(0, 5);
            const commentPromises = samplePosts.map(p => this.postService.getComments(p.id));
            const commentArrays = await Promise.all(commentPromises);
            const avgCommentsPerPost = commentArrays.reduce((sum, arr) => sum + arr.length, 0) / samplePosts.length;
            const totalComments = Math.round(avgCommentsPerPost * totalPosts);

            this.setStates({
                stats: {
                    totalUsers,
                    totalPosts,
                    totalComments,
                    avgPostsPerUser: Math.round((totalPosts / totalUsers) * 10) / 10
                },
                recentUsers: users.slice(0, 5),
                recentPosts: posts.slice(0, 6),
                loading: false
            });

            appState.setState({ loading: false });
        } catch (error: any) {
            appState.setState({ loading: false });
            this.setState('error', {
                message: error.message || 'Failed to load dashboard data',
                title: 'Dashboard Error',
                dismissible: true
            });
        }
    }
}
