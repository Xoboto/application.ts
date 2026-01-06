/**
 * State Management Service
 * Simple reactive state management for global app state
 */

type StateListener<T> = (state: T) => void;

export class StateService<T extends Record<string, any>> {
    private state: T;
    private listeners: Set<StateListener<T>> = new Set();

    constructor(initialState: T) {
        this.state = { ...initialState };
    }

    /**
     * Get current state
     */
    getState(): T {
        return { ...this.state };
    }

    /**
     * Update state and notify listeners
     */
    setState(updates: Partial<T>): void {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: StateListener<T>): () => void {
        this.listeners.add(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    /**
     * Reset state to initial values
     */
    reset(initialState: T): void {
        this.state = { ...initialState };
        this.notifyListeners();
    }
}

// App-wide state interface
export interface AppState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: number;
    loading: boolean;
}

// Create global app state instance
export const appState = new StateService<AppState>({
    theme: 'light',
    sidebarOpen: true,
    notifications: 0,
    loading: false,
});
