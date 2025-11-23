import { TemplateBinder } from 'template.ts';
import type { RouteParams } from '../navigation/types';
import type { 
    AppViewLifecycle, 
    AppViewOptions, 
    AppViewState, 
    TemplateFunction 
} from './types';

/**
 * Abstract base class for creating views with Template.Ts
 * Extends HTMLElement as a Web Component for seamless integration with StackView.Ts
 * Custom elements are automatically registered when views are registered with App
 * 
 * @example
 * ```typescript
 * const template: `
 *  <div>
 *      <h1>Count: {{ count }}</h1>
 *      <button @on:click="increment">Increment</button>
 *  </div>`;
 * 
 * class State {
 *     count: number = 0;
 *     increment: () => { this.count += 1; };
 * }
 * 
 * @Register
 * class HomeView extends AppView<{ count: number }> {
 *     template(): string {
 *         return template;
 *     }
 * 
 *     state() {
 *         return new State();
 *     }
 * }
 * 
 * // Register with app - automatically registers as <home-view>
 * app.registerView('HomeView', HomeView);
 * ```
 */
export abstract class AppView<TState extends AppViewState = AppViewState> extends HTMLElement implements AppViewLifecycle {
    protected binder: TemplateBinder | null = null;
    protected _state: TState | null = null;
    protected _params: RouteParams = {};
    protected _options: AppViewOptions;
    private _isInitialized: boolean = false;

    constructor(options?: AppViewOptions) {
        super();
        
        this._options = {
            transitionClass: 'transition-fade',
            autoUpdate: true,
            ...options
        };
    }

    /**
     * Get the custom element tag name for this class
     * Converts class name to kebab-case (e.g., HomeView -> home-view)
     */
    static getTagName(): string {
        return this.name
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    /**
     * Register this class as a custom element
     * Should be called before instantiation
     */
    static register(): void {
        const tagName = this.getTagName();
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this as any);
        }
    }

    /**
     * Define the HTML template for this view
     * Use Template.Ts syntax for data binding
     * @returns HTML template string
     */
    protected abstract template(): string;

    /**
     * Define the initial state for this view
     * State should include data and methods
     * @returns Initial state object
     */
    protected abstract state(): TState;

    /**
     * Get the current state
     */
    protected get viewState(): TState {
        if (!this._state) {
            throw new Error('State not initialized. Call render() first.');
        }
        return this._state;
    }

    /**
     * Get the route parameters passed to this view
     */
    protected get params(): RouteParams {
        return this._params;
    }

    /**
     * Update a single state value
     * @param key - The state key to update
     * @param value - The new value
     */
    protected setState<K extends keyof TState>(key: K, value: TState[K]): void {
        if (!this._state) {
            console.warn('Cannot set state before initialization');
            return;
        }

        this._state[key] = value;

        // Call lifecycle hook
        if (this.onStateChanged) {
            this.onStateChanged(key as string, value);
        }

        // Auto-update if enabled
        if (this._options.autoUpdate && this.binder) {
            this.update();
        }
    }

    /**
     * Update multiple state values at once
     * @param updates - Object with state updates
     */
    protected setStates(updates: Partial<TState>): void {
        if (!this._state) {
            console.warn('Cannot set state before initialization');
            return;
        }

        Object.assign(this._state, updates);

        // Call lifecycle hooks for each update
        if (this.onStateChanged) {
            for (const [key, value] of Object.entries(updates)) {
                this.onStateChanged(key, value);
            }
        }

        // Auto-update if enabled
        if (this._options.autoUpdate && this.binder) {
            this.update();
        }
    }

    /**
     * Manually trigger a view update
     * @param withAnimation - Whether to apply transition animation
     */
    public update(withAnimation: boolean = true): void {
        if (this.binder) {
            this.binder.update(withAnimation);
        }
    }

    /**
     * Render the view with route parameters
     * Initializes the template and binds state
     * @param params - Route parameters from the router
     */
    async initialize(params: RouteParams = {}): Promise<void> {
        if (this._isInitialized) {
            return;
        }

        this._params = params;

        // Add app-view class
        this.classList.add('app-view');
        
        // Set template HTML
        this.innerHTML = this.template();

        // Initialize state
        this._state = this.state();

        // Bind template using this element as container
        this.binder = new TemplateBinder(
            this,
            this._state,
            this._options.transitionClass
        );
        this.binder.autoUpdate = this._options.autoUpdate ?? true;

        // Call before mount hook
        if (this.onBeforeMount) {
            await this.onBeforeMount();
        }

        this.binder.bind();

        this._isInitialized = true;
    }

    /**
     * Update route parameters and re-trigger initialization logic
     * Used when navigating to the same view with different parameters
     * @param params - New route parameters
     */
    async updateParams(params: RouteParams = {}): Promise<void> {
        const oldParams = { ...this._params };
        this._params = params;

        // Call the parameter changed hook with old and new params
        if (this.onParamsChanged) {
            await this.onParamsChanged(params, oldParams);
        }

        // Update the view if needed
        if (this.binder && this._options.autoUpdate) {
            this.update();
        }
    }

    /**
     * StackView lifecycle: called when view is about to be shown
     */
    async stackViewShowing(): Promise<void> {
        // Initialize if not already done
        if (!this._isInitialized) {
            await this.initialize();
        }
    }

    /**
     * StackView lifecycle: called when view is about to be hidden
     */
    async stackViewHiding(): Promise<void> {
        if (this.onBeforeUnmount) {
            await this.onBeforeUnmount();
        }
    }

    /**
     * StackView lifecycle: called after view is hidden
     */
    async stackViewHidden(): Promise<void> {
        // Destroy binder
        if (this.binder) {
            this.binder.destroy();
            this.binder = null;
        }

        this._isInitialized = false;

        if (this.onUnmounted) {
            await this.onUnmounted();
        }
    }

    /**
     * Web Component lifecycle: called when connected to DOM
     */
    async connectedCallback(): Promise<void> {
        // Initialize if not already done
        if (!this._isInitialized) {
            await this.initialize();
        }

        if (this.onMounted) {
            await this.onMounted();
        }
    }

    /**
     * Web Component lifecycle: called when disconnected from DOM
     */
    disconnectedCallback(): void {
        // Cleanup is handled by stackViewHidden
    }

    /**
     * Check if the view is initialized
     */
    get isInitialized(): boolean {
        return this._isInitialized;
    }

    // Lifecycle hooks (can be overridden by subclasses)
    onBeforeMount?(): void | Promise<void>;
    onMounted?(): void | Promise<void>;
    onBeforeUnmount?(): void | Promise<void>;
    onUnmounted?(): void | Promise<void>;
    onStateChanged?(key: string, value: any): void;
    onParamsChanged?(newParams: RouteParams, oldParams: RouteParams): void | Promise<void>;
}

export function Register(target: any) {
    target.register();
    return target;
}
