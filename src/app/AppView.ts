import { TemplateBinder } from 'template.ts';
import type { RouteParams } from '../navigation/types';
import { App } from './App';
import type { 
    AppViewLifecycle,
    AppViewOptions,
    AppViewState
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
    protected _options: AppViewOptions;
    protected _root: HTMLElement | ShadowRoot;
    private _isInitialized: boolean = false;

    constructor(options?: AppViewOptions) {
        super();
        
        this._options = {
            transitionClass: 'transition-fade',
            autoUpdate: true,
            useShadowDOM: false,
            ...options
        };

        // Create shadow root if enabled
        if (this._options.useShadowDOM) {
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = this.template();
            if (!shadow.firstElementChild || !(shadow.firstElementChild instanceof HTMLElement)) {
                throw new Error('AppView template must have a single root element');
            }
            this._root = shadow.firstElementChild as HTMLElement;
        } else {
            this.innerHTML = this.template();
            if (!this.firstElementChild || !(this.firstElementChild instanceof HTMLElement)) {
                throw new Error('AppView template must have a single root element');
            }
            this._root = this.firstElementChild as HTMLElement;
        }

        // Eager initialization in constructor
        this.initialize();
    }

    /**
     * Render the view with route parameters
     * Initializes the template and binds state
     * @param params - Route parameters from the router
     */
    initialize(): void {
        if (this._isInitialized) {
            return;
        }

        // Add app-view class
        this.classList.add('app-view');
        
        // Initialize state
        this._state = this.state();

        // Bind template using container
        this.binder = new TemplateBinder(
            this._root,
            this._state,
            this._options.transitionClass
        );
        this.binder.autoUpdate = this._options.autoUpdate ?? true;

        this.binder.bind();

        this._isInitialized = true;
    }

    /**
     * Get the custom element tag name for this class
     * Uses explicit tagName property or falls back to class name conversion
     * To prevent minification issues, define static tagName property in your class
     */
    static getTagName(): string {
        // Use explicit tagName if provided (prevents minification issues)
        if ((this as any).tagName && typeof (this as any).tagName === 'string') {
            return (this as any).tagName;
        }
        
        // Fallback to class name conversion (may break with minification)
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
        return this.app?.router?.currentParams || {};
    }

    /**
     * Get the App instance by traversing up the DOM tree
     */
    protected get app(): App | null {
        return App.fromElement(this);
    }

    /**
     * Navigate to a specific path using the app's router
     * @param path - The path to navigate to
     */
    protected navigate(path: string): void {
        const appInstance = this.app;
        if (appInstance) {
            appInstance.navigate(path);
        } else {
            console.warn('Cannot navigate: App instance not found');
        }
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
     * Update route parameters and re-trigger initialization logic
     * Used when navigating to the same view with different parameters
     * @param params - New route parameters
     */
    async updateParams(params: RouteParams = {}): Promise<void> {
        // Call the parameter changed hook with old and new params
        if (this.onParamsChanged) {
            await this.onParamsChanged(params, this.params);
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
        // Call before mount hook
        if (this.onBeforeMount) {
            await this.onBeforeMount();
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

/**
 * Decorator to register a view as a custom element
 * Supports both @Register and @Register('tag-name') syntax
 * 
 * @example
 * @Register // Auto-generates tag name from class name
 * @Register() // Same as above
 * @Register('my-component') // Explicit tag name (recommended for production)
 */
export function Register(tagNameOrTarget?: string | any) : any {
    // Helper function to do the actual registration
    const registerClass = (target: any, customTagName?: string) => {
        if (!target) {
            console.warn('Register decorator: target is undefined');
            return target;
        }
        
        // Use provided tag name or generate from class name
        if (customTagName) {
            target.tagName = customTagName;
        } else if (!target.tagName) {
            // Fallback to class name conversion (may fail with minification)
            target.tagName = target.name
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .toLowerCase();
        }
        
        // Check if register method exists (for safety with inheritance)
        if (typeof target.register === 'function') {
            try {
                target.register();
            } catch (error) {
                console.warn('Register decorator: failed to call register method', error);
            }
        } else {
            // Fallback: manually register the element
            try {
                const elementTagName = target.tagName || target.name
                    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                    .toLowerCase();
                if (!customElements.get(elementTagName)) {
                    customElements.define(elementTagName, target);
                }
            } catch (error) {
                console.warn('Register decorator: failed to register custom element', error);
            }
        }
        
        return target;
    };
    
    // Check if used as @Register (without parentheses) - target is passed directly
    if (typeof tagNameOrTarget === 'function') {
        return registerClass(tagNameOrTarget);
    }
    
    // Used as @Register() or @Register('tag-name') - return decorator function
    return function(target: any) {
        return registerClass(target, tagNameOrTarget);
    };
}
