/**
 * DataTable Component
 * Generic reusable table component with sorting and filtering
 */

import { AppView, Register } from '../../../src';

const template = /*html*/`
<div class="data-table">
    <div class="table-header">
        <input 
            type="text" 
            placeholder="Search..." 
            @on:input="handleSearch"
            class="search-input"
            @if="searchable"
        />
        <slot name="actions"></slot>
    </div>
    
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th @for="columns" @on:click="handleSort">
                        {{ item.label }}
                        <span class="sort-indicator" @if="sortColumn === item.key">
                            {{ sortDirection === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr @for="filteredData" @on:click="handleRowClick">
                    <td @for="columns">
                        {{ getValue(parent, item.key) }}
                    </td>
                </tr>
                <tr @if="filteredData.length === 0">
                    <td @att:colspan="columns.length" class="no-data">
                        {{ emptyMessage }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="table-footer" @if="showFooter">
        <span>Showing {{ filteredData.length }} of {{ data.length }} items</span>
    </div>
</div>`;

interface Column {
    key: string;
    label: string;
}

class State {
    columns: Column[] = [];
    data: any[] = [];
    filteredData: any[] = [];
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchTerm: string = '';
    searchable: boolean = true;
    showFooter: boolean = true;
    emptyMessage: string = 'No data available';

    handleSearch: (event: Event) => void = (event) => {
        const target = event.target as HTMLInputElement;
        this.searchTerm = target.value.toLowerCase();
        this.filterData();
    };

    handleSort: (event: Event, column: Column) => void = (event, column) => {
        if (this.sortColumn === column.key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column.key;
            this.sortDirection = 'asc';
        }
        this.sortData();
    };

    handleRowClick: ((event: Event, row: any) => void) | null = null;

    getValue: (row: any, key: string) => string = (row, key) => {
        const value = key.split('.').reduce((obj, k) => obj?.[k], row);
        return value !== undefined && value !== null ? String(value) : '';
    };

    filterData() {
        if (!this.searchTerm) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(row =>
                this.columns.some(col => {
                    const value = this.getValue(row, col.key);
                    return value.toLowerCase().includes(this.searchTerm);
                })
            );
        }
        this.sortData();
    }

    sortData() {
        if (!this.sortColumn) return;

        this.filteredData.sort((a, b) => {
            const aVal = this.getValue(a, this.sortColumn);
            const bVal = this.getValue(b, this.sortColumn);
            
            const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }
}

@Register
export class AppDataTable extends AppView {
    template(): string {
        return template;
    }

    state() {
        const state = new State();
        state.handleRowClick = (event: Event, row: any) => {
            // Dispatch custom event that bubbles up
            const customEvent = new CustomEvent('rowclick', {
                detail: { row, originalEvent: event },
                bubbles: true,
                cancelable: true
            });
            this.dispatchEvent(customEvent);
        }
        return state;
    }

    get columns(): Column[] {
        return this.viewState.columns;
    }
    set columns(columns: Column[]) {
        this.setState('columns', columns);
    }

    get data(): any[] {
        return this.viewState.data;
    }
    set data(data: any[]) {
        this.setState('data', data);
        this.setState('filteredData', [...data]);
        this.viewState.sortData();
        this.update();
    }

    get onrowclick(): ((event: CustomEvent) => void) | null {
        return (this as any)._onrowclick || null;
    }
    set onrowclick(callback: ((event: CustomEvent) => void) | null) {
        // Remove old listener if exists
        if ((this as any)._onrowclick) {
            this.removeEventListener('rowclick', (this as any)._onrowclick);
        }
        // Add new listener
        if (callback) {
            const listener = (event: Event) => callback(event as CustomEvent);
            this.addEventListener('rowclick', listener);
            (this as any)._onrowclick = listener;
        } else {
            (this as any)._onrowclick = null;
        }
    }

    get searchable(): boolean {
        return this.viewState.searchable;
    }
    set searchable(searchable: boolean) {
        this.setState('searchable', searchable);
    }

    get showFooter(): boolean {
        return this.viewState.showFooter;
    }
    set showFooter(show: boolean) {
        this.setState('showFooter', show);
    }

    get emptyMessage(): string {
        return this.viewState.emptyMessage;
    }
    set emptyMessage(message: string) {
        this.setState('emptyMessage', message);
    }

    refresh() {
        this.viewState.sortData();
        this.update();
    }
}
