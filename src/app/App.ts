import StackView from 'stackview.ts';
import { Router } from '../navigation/router';
import { NavigationEvents, type NavigationEventDetail } from '../navigation/types';
import type { AppView } from './AppView';

// Force StackView to be included in the bundle by using it
// This ensures the custom element is registered when the module loads

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _stackView = StackView;

/**
 * View constructor type
 */
type ViewConstructor = new () => AppView<any>;

/**
 * Main App class that manages routing and view rendering
 * Integrates Router with StackView.Ts for navigation
 * 
 * @example
 * ```typescript
 * import { App } from 'application.ts';
 * import { HomeView, AboutView, NotFoundView } from './views';
 * 
 * const app = new App('#root');
 * 
 * app.router
 *     .map('/', HomeView)
 *     .map('/about', AboutView)
 *     .notFound(NotFoundView);
 * 
 * app.start();
 * ```
 */
export class App {
    public readonly router: Router;
    private stackView: any = null;
    private rootElement: HTMLElement | null = null;
    private viewRegistry: Map<string, ViewConstructor> = new Map();
    private layoutRegistry: Map<string, ViewConstructor> = new Map();
    private currentViewInstance: AppView<any> | null = null;
    private currentLayoutInstance: AppView<any> | null = null;
    private currentRoutePath: string | null = null;
    private defaultLayout: string | null = null;

    /**
     * Get the App instance from any element by traversing up the DOM tree
     * @param element - Any HTMLElement in the app
     * @returns App instance or null if not found
     */
    static fromElement(element: HTMLElement | null): App | null {
        let current = element;
        
        while (current) {
            if ((current as any).__app__) {
                return (current as any).__app__;
            }
            current = current.parentElement;
        }
        
        return null;
    }

    constructor(rootSelector?: string) {
        this.router = new Router();

        // Listen to navigation events
        this.router.addEventListener(NavigationEvents.NAVIGATE, ((e: CustomEvent<NavigationEventDetail>) => {
            this.handleNavigation(e);
        }) as EventListener);
        
        this.router.addEventListener(NavigationEvents.NOT_FOUND, ((e: CustomEvent<NavigationEventDetail>) => {
            this.handleNotFound(e);
        }) as EventListener);

        // If root selector provided, initialize immediately
        if (rootSelector) {
            this.initializeRoot(rootSelector);
        }
    }

    /**
     * Register a view class with a handler name
     * @param handler - The view handler/identifier used in router.map()
     * @param viewClass - The AppView class constructor
     */
    registerView(handler: string, viewClass: ViewConstructor): this {
        // Auto-register the custom element if register method exists
        if (typeof (viewClass as any).register === 'function') {
            (viewClass as any).register();
        }
        this.viewRegistry.set(handler, viewClass);
        return this;
    }

    /**
     * Register multiple views at once
     * @param views - Object mapping handler names to view classes
     */
    registerViews(views: Record<string, ViewConstructor>): this {
        for (const [handler, viewClass] of Object.entries(views)) {
            this.registerView(handler, viewClass);
        }
        return this;
    }

    /**
     * Register a layout class with a handler name
     * @param handler - The layout handler/identifier
     * @param layoutClass - The AppView layout class constructor
     */
    registerLayout(handler: string, layoutClass: ViewConstructor): this {
        // Auto-register the custom element if register method exists
        if (typeof (layoutClass as any).register === 'function') {
            (layoutClass as any).register();
        }
        this.layoutRegistry.set(handler, layoutClass);
        return this;
    }

    /**
     * Register multiple layouts at once
     * @param layouts - Object mapping handler names to layout classes
     */
    registerLayouts(layouts: Record<string, ViewConstructor>): this {
        for (const [handler, layoutClass] of Object.entries(layouts)) {
            this.registerLayout(handler, layoutClass);
        }
        return this;
    }

    /**
     * Set the default layout for all routes
     * @param handler - The layout handler name, or null for no layout
     */
    setDefaultLayout(handler: string | null): this {
        this.defaultLayout = handler;
        return this;
    }

    /**
     * Initialize the root element and StackView
     * @param selector - CSS selector for the root element
     */
    private initializeRoot(selector: string): void {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Root element not found: ${selector}`);
        }

        this.rootElement = element as HTMLElement;

        // Attach app instance to root element
        (this.rootElement as any).__app__ = this;

        // Create StackView if it doesn't exist
        if (!this.stackView) {
            // Create or use existing stack-view element
            let stackViewElement = this.rootElement.querySelector('stack-view') as StackView;
            
            if (!stackViewElement) {
                stackViewElement = new StackView();
                stackViewElement.effect = 'fade';
                stackViewElement.backButton = false;
                this.rootElement.appendChild(stackViewElement);
            }

            this.stackView = stackViewElement;
        }
    }

    /**
     * Start the application
     * @param rootSelector - Optional root selector if not provided in constructor
     */
    start(rootSelector?: string): void {
        if (rootSelector) {
            this.initializeRoot(rootSelector);
        }

        if (!this.rootElement || !this.stackView) {
            throw new Error('Root element not initialized. Provide selector in constructor or start()');
        }

        // Start the router
        this.router.start();
    }

    /**
     * Resolve view class from handler (supports both class constructor and string lookup)
     * @param handler - View class constructor or string identifier
     * @returns View class constructor or null
     */
    private resolveViewClass(handler: any): ViewConstructor | null {
        // If handler is already a class constructor, use it directly
        if (typeof handler === 'function') {
            // Auto-register the custom element
            (handler as any).register?.();
            return handler as ViewConstructor;
        }
        
        // If handler is a string, look it up in the registry (backward compatibility)
        if (typeof handler === 'string') {
            return this.viewRegistry.get(handler) || null;
        }
        
        return null;
    }

    /**
     * Handle navigation event from router
     */
    private async handleNavigation(event: CustomEvent<NavigationEventDetail>): Promise<void> {
        const { handler, params, meta, path } = event.detail;

        // Store the current route path pattern
        this.currentRoutePath = this.getRoutePattern(path);

        // Resolve view class from handler (can be class constructor or string)
        const ViewClass = this.resolveViewClass(handler);
        
        if (!ViewClass) {
            console.error(`View not found or registered: ${handler}`);
            return;
        }

        // Check if we're navigating to the same view instance with different params
        if (this.currentViewInstance && this.currentViewInstance.constructor === ViewClass) {
            // Same view, just update parameters
            await this.currentViewInstance.updateParams(params);
            return;
        }

        // Determine which layout to use
        const layoutHandler = meta?.layout !== undefined ? meta.layout : this.defaultLayout;

        // Create view instance
        const viewInstance = new ViewClass();

        // Store current view instance
        this.currentViewInstance = viewInstance;

        // If layout is specified, wrap view in layout
        if (layoutHandler) {
            await this.renderWithLayout(viewInstance, layoutHandler, meta);
        } else {
            await this.renderWithoutLayout(viewInstance, meta);
        }
    }

    /**
     * Render view wrapped in a layout
     */
    private async renderWithLayout(viewInstance: AppView<any>, layoutHandler: string, meta?: any): Promise<void> {
        const LayoutClass = this.layoutRegistry.get(layoutHandler);
        
        if (!LayoutClass) {
            console.error(`Layout not registered: ${layoutHandler}`);
            // Fallback to no layout
            await this.renderWithoutLayout(viewInstance, meta);
            return;
        }

        // Create or reuse layout instance
        if (!this.currentLayoutInstance || this.currentLayoutInstance.constructor !== LayoutClass) {
            // Create new layout instance
            const layoutInstance = new LayoutClass();
            this.currentLayoutInstance = layoutInstance;

            // Show layout in StackView
            if (this.stackView) {
                await this.stackView.begin(layoutInstance, meta?.effect);
            }
        }

        // Find content outlet in layout (should be a <stack-view> element)
        const outlet = this.currentLayoutInstance.querySelector('[data-outlet="content"]') as StackView;
        
        if (!outlet) {
            console.error('Layout does not have a content outlet [data-outlet="content"]');
            return;
        }

        // Check if outlet is a stack-view, if not create one
        let stackViewElement: StackView;
        
        if (outlet.tagName.toLowerCase() === 'stack-view') {
            stackViewElement = outlet;
        } else {
            // Outlet is not a stack-view, create one inside it
            let existingStackView = outlet.querySelector('stack-view') as StackView;
            
            if (!existingStackView) {
                existingStackView = new StackView();
                existingStackView.effect = 'fade';
                existingStackView.backButton = false;
                outlet.appendChild(existingStackView);
            }
            
            stackViewElement = existingStackView;
        }

        // Use stack-view's begin method for smooth transitions
        await stackViewElement.begin(viewInstance, meta?.effect);

        // Trigger view lifecycle
        if (viewInstance.onMounted) {
            await viewInstance.onMounted();
        }
    }

    /**
     * Render view without layout
     */
    private async renderWithoutLayout(viewInstance: AppView<any>, meta?: any): Promise<void> {
        // Clear current layout if exists
        this.currentLayoutInstance = null;

        // Show view using StackView
        if (this.stackView) {
            await this.stackView.begin(viewInstance, meta?.effect);
        }
    }

    /**
     * Handle not found event from router
     */
    private async handleNotFound(event: CustomEvent<NavigationEventDetail>): Promise<void> {
        const { handler } = event.detail;

        // Resolve view class from handler (can be class constructor or string)
        const ViewClass = this.resolveViewClass(handler);
        
        if (!ViewClass) {
            console.error(`404 View not found or registered: ${handler}`);
            return;
        }

        // Create view instance
        const viewInstance = new ViewClass();

        // Store current view instance
        this.currentViewInstance = viewInstance;

        // 404 pages typically don't use layouts, render directly
        await this.renderWithoutLayout(viewInstance);
    }

    /**
     * Get the route pattern that matches the given path
     */
    public getRoutePattern(path: string): string | null {
        // Iterate through all registered routes to find the matching pattern
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [pattern, _] of (this.router as any).routes) {
            const route = (this.router as any).routes.get(pattern).route;
            if (route.match(path) !== null) {
                return pattern;
            }
        }
        return null;
    }

    /**
     * Get the current view instance
     */
    get currentView(): AppView<any> | null {
        return this.currentViewInstance;
    }

    /**
     * Get the current route pattern (e.g., '/user/:id')
     */
    get currentRoute(): string | null {
        return this.currentRoutePath;
    }

    /**
     * Navigate to a specific path
     * @param path - The path to navigate to
     */
    navigate(path: string): void {
        this.router.navigate(path);
    }

    /**
     * Go back in navigation history
     */
    async goBack(): Promise<void> {
        if (this.stackView && this.stackView.canGoBack()) {
            await this.stackView.complete();
        }
    }
}
