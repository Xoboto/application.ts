/**
 * Posts Page
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { PostService } from '../services/post.service';
import { UserService } from '../services/user.service';
import { appState } from '../services/state.service';
import type { Post, User } from '../models';
import '../components/loading-spinner.component';
import '../components/error-message.component';
import '../components/modal.component';

const template = /*html*/`
<div class="posts-page">
    <app-loading-spinner @prop:visible="loading" @prop:message="loadingMessage"></app-loading-spinner>
    <app-error-message @prop:error="error"></app-error-message>
    
    <div class="page-content" @if="!loading">
        <div class="page-header">
            <h1>Posts</h1>
            <div class="page-actions">
                <select @on:change="handleUserFilter" class="filter-select">
                    <option value="">All Users</option>
                    <option @for="users" @att:value="item.id" @batt:selected="isSelectedUser(item)">{{ item.name }}</option>
                </select>
                <button @on:click="refresh" class="btn btn-primary">Refresh</button>
            </div>
        </div>
        
        <div class="posts-grid">
            <div class="post-card" @for="filteredPosts">
                <div class="post-header" @on:click="showPostDetail">
                    <h3>{{ item.title }}</h3>
                    <span class="post-user-badge">User {{ item.userId }}</span>
                </div>
                <p class="post-body">{{ item.body }}</p>
                <div class="post-footer">
                    <button @on:click="showComments" class="btn btn-link">
                        💬 View Comments
                    </button>
                </div>
            </div>
        </div>
        
        <div class="empty-state" @if="filteredPosts.length === 0">
            <p>No posts found</p>
        </div>
    </div>
    
    <app-modal @prop:modal="modalState">
        <div @if="modalType === 'post'">
            <p class="post-author">By: <strong>{{ modalPostAuthor }}</strong></p>
            <p class="post-content">{{ modalPostBody }}</p>
        </div>
        <div @if="modalType === 'comments'" class="comments-list">
            <div class="comment" @for="modalComments">
                <div class="comment-header">
                    <strong>{{ item.name }}</strong>
                    <span class="comment-email">{{ item.email }}</span>
                </div>
                <p class="comment-body">{{ item.body }}</p>
            </div>
        </div>
    </app-modal>
</div>`;

class State {
    loading: boolean = true;
    loadingMessage: string = '';
    error: any = null;
    posts: Post[] = [];
    filteredPosts: Post[] = [];
    users: User[] = [];
    selectedUserId: string = '';
    
    // Modal state
    modalState: any = null;
    modalType: 'post' | 'comments' = 'post';
    modalPostAuthor: string = '';
    modalPostBody: string = '';
    modalComments: any[] = [];

    handleUserFilter: (event: Event) => void = (event) => {
        const target = event.target as HTMLSelectElement;
        this.selectedUserId = target.value;
        this.filterPosts();
    };

    isSelectedUser: (user: User) => boolean = (user: User) => {
        return this.selectedUserId === user.id.toString();
    }

    filterPosts() {
        if (!this.selectedUserId) {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(p => 
                p.userId === parseInt(this.selectedUserId)
            );
        }
    }

    refresh: () => void = () => {};
    showPostDetail: (ev: Event, item: Post) => void = () => {};
    showComments: (ev: Event, item: Post) => void = () => {};
}

@Register('posts-page')
export class PostsPage extends AppView {
    private postService!: PostService;
    private userService!: UserService;
    private unsubscribe?: () => void;

    template(): string {
        return template;
    }

    state() {
        const state = new State();

        // Set up handlers
        state.refresh = () => this.loadData();
        state.showPostDetail = (ev: Event, item: Post) => this.showPostDetail(item);
        state.showComments = (ev: Event, item: Post) => this.showComments(item);

        return state;
    }

    async onMounted() {
        // Get services
        this.postService = container.resolve<PostService>('PostService');
        this.userService = container.resolve<UserService>('UserService');

        // Subscribe to state
        this.unsubscribe = appState.subscribe((appStateValue) => {
            this.setState('loading', appStateValue.loading);
            if (appStateValue.loading) {
                this.setState('loadingMessage', 'Loading posts...');
            }
        });

        await this.loadData();

        // Check URL params for post ID
        const postId = this.params?.id;
        if (postId) {
            const post = this.viewState.posts.find((p: Post) => p.id === parseInt(postId));
            if (post) {
                setTimeout(() => this.showComments(post), 500);
            }
        }
    }

    async stackViewHidden() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    private async loadData() {
        try {
            appState.setState({ loading: true });

            const [posts, users] = await Promise.all([
                this.postService.getPosts(),
                this.userService.getUsers()
            ]);

            
            this.setStates({
                posts: posts,
                users: users
            });
            this.viewState.filterPosts();
            this.update();

            appState.setState({ loading: false });
        } catch (error: any) {
            appState.setState({ loading: false });
            this.setState('error', {
                message: error.message || 'Failed to load posts',
                title: 'Posts Error',
                dismissible: true
            });
        }
    }

    private showPostDetail(post: Post) {
        const user = this.viewState.users.find((u: User) => u.id === post.userId);
        const userName = user?.name || `User ${post.userId}`;

        // Update state for modal
        this.setStates({
            modalState: {
                isOpen: true,
                title: post.title,
                closeable: true,
                showFooter: true,
                confirmText: '',
                cancelText: 'Close'
            },
            modalType: 'post',
            modalPostAuthor: userName,
            modalPostBody: post.body
        });
    }

    private async showComments(post: Post) {
        try {
            this.setStates({
                loading: true,
                loadingMessage: 'Loading comments...'
            });
            
            const comments = await this.postService.getComments(post.id);
            
            this.setStates({
                loading: false,
                modalState: {
                    isOpen: true,
                    title: `Comments (${comments.length})`,
                    closeable: true,
                    showFooter: true,
                    confirmText: '',
                    cancelText: 'Close'
                },
                modalType: 'comments',
                modalComments: comments
            });
        } catch (error: any) {
            this.setStates({
                loading: false,
                error: {
                    message: error.message || 'Failed to load comments',
                    title: 'Comments Error',
                    dismissible: true
                }
            });
        }
    }
}
