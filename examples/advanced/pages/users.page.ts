/**
 * Users List Page
 */

import { AppView, Register } from '../../../src';
import { container } from '../services/container.service';
import { UserService } from '../services/user.service';
import { appState } from '../services/state.service';
import type { User } from '../models';
import type { ErrorState } from '../components/error-message.component';
import '../components/loading-spinner.component';
import '../components/data-table.component';

const template = /*html*/`
<div class="users-page">
    <app-loading-spinner @prop:visible="loading" @prop:message="'Loading users...'"></app-loading-spinner>
    <app-error-message @prop:error="error"></app-error-message>
    
    <div class="page-content">
        <div class="page-header">
            <h1>Users</h1>
            <button @on:click="refresh" class="btn btn-primary">Refresh</button>
        </div>
        
        <app-data-table @prop:columns="columns" 
                        @prop:data="data"
                        @prop:searchable="true"
                        @prop:showFooter="true"
                        @prop:emptyMessage="'No users found'"
                        @on:rowclick="handleRowClick"></app-data-table>
    </div>
</div>`;

class State {
    loading: boolean = true;
    columns: any[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'company.name', label: 'Company' },
        { key: 'address.city', label: 'City' }
    ];
    data: User[] = [];
    error: ErrorState | null = null;
    handleRowClick: (event: CustomEvent) => void = () => {};
    refresh: () => void = () => {};
}

@Register('users-page')
export class UsersPage extends AppView {
    private userService!: UserService;
    private unsubscribe?: () => void;

    template(): string {
        return template;
    }

    state() {
        const state = new State();
        state.handleRowClick = (event: CustomEvent) => {
            const user = event.detail.row;
            this.navigate(`/user/${user.id}`);
        }
        state.refresh = () => this.loadData();
        return state;
    }

    async onMounted() {
        // Get services
        this.userService = container.resolve<UserService>('UserService');

        // Subscribe to state
        this.unsubscribe = appState.subscribe((state) => {
            this.setState('loading', state.loading);
        });

        await this.loadData();
    }

    async stackViewHidden() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    private async loadData() {
        this.setState('error', null);
        try {
            appState.setState({ loading: true });
            const users = await this.userService.getUsers();
            this.setState('data', users);
            appState.setState({ loading: false });
        } catch (error: any) {
            appState.setState({ loading: false });
            this.setState('error', {
                message: error.message || 'Failed to load users',
                title: 'Users Error',
                dismissible: true
            });
        }
    }
}
