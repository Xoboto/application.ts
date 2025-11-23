import type { RouteParams } from '../navigation/types';

/**
 * AppView lifecycle hooks
 */
export interface AppViewLifecycle {
    /**
     * Called before the view is shown
     * Use this to initialize data, fetch from APIs, etc.
     */
    onBeforeMount?(): void | Promise<void>;

    /**
     * Called after the view is mounted to the DOM
     * Use this to set up event listeners, third-party libraries, etc.
     */
    onMounted?(): void | Promise<void>;

    /**
     * Called before the view is unmounted
     * Use this to clean up resources, save state, etc.
     */
    onBeforeUnmount?(): void | Promise<void>;

    /**
     * Called after the view is unmounted from the DOM
     * Final cleanup
     */
    onUnmounted?(): void | Promise<void>;

    /**
     * Called when the state is updated
     * Use this to react to state changes
     */
    onStateChanged?(key: string, value: any): void;

    /**
     * Called when route parameters change while staying on the same view
     * Use this to reload data based on new parameters (e.g., /user/1 -> /user/2)
     * @param newParams - The new route parameters
     * @param oldParams - The previous route parameters
     */
    onParamsChanged?(newParams: RouteParams, oldParams: RouteParams): void | Promise<void>;
}

/**
 * AppView configuration options
 */
export interface AppViewOptions {
    /**
     * Custom transition class for Template.Ts animations
     * Default: 'transition-fade'
     */
    transitionClass?: string;

    /**
     * Whether to automatically update the view on state changes
     * Default: true
     */
    autoUpdate?: boolean;
}

/**
 * AppView state object - can be any shape defined by the developer
 */
export type AppViewState = Record<string, any>;

/**
 * Template function that returns HTML string
 */
export type TemplateFunction<T extends AppViewState = AppViewState> = (this: T) => string;
