import { Route } from './route';
import type { RouteParams, RouteOptions, RouteHandler, NavigationEventDetail } from './types';
import { NavigationEvents } from './types';

/**
 * Router class for managing navigation and route mapping
 * Emits events for App.ts to handle view rendering via StackView
 */
export class Router extends EventTarget {
    private routes: Map<string, { route: Route; handler: RouteHandler }> = new Map();
    private notFoundHandler?: RouteHandler;
    private isInitialized: boolean = false;

    constructor() {
        super();
        
        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });

        // Intercept link clicks for client-side navigation
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (link && link.href.startsWith(window.location.origin) && !link.hasAttribute('target')) {
                e.preventDefault();
                this.navigate(link.pathname);
            }
        });
    }

    /**
     * Map a route path to a handler (view identifier)
     * @param path - The route path (e.g., '/', '/user/:id')
     * @param handler - The view identifier/handler
     * @param options - Optional route configuration
     * @returns The router instance for chaining
     */
    map(path: string, handler: RouteHandler, options?: RouteOptions): this {
        const route = new Route(path, options);
        this.routes.set(path, { route, handler });
        return this;
    }

    /**
     * Set the 404 not found handler
     * @param handler - The view identifier to use for 404
     * @returns The router instance for chaining
     */
    notFound(handler: RouteHandler): this {
        this.notFoundHandler = handler;
        return this;
    }

    /**
     * Initialize the router and handle the current path
     */
    start(): void {
        if (this.isInitialized) {
            console.warn('Router is already initialized');
            return;
        }
        
        this.isInitialized = true;
        this.handleRouteChange();
    }

    /**
     * Navigate to a specific path
     * @param path - The path to navigate to
     * @param replaceState - If true, replaces current history entry instead of pushing
     */
    async navigate(path: string, replaceState: boolean = false): Promise<void> {
        // Find matching route
        const match = this.findRoute(path);

        if (!match) {
            this.emitNotFound(path);
            return;
        }

        const { route, handler, params } = match;

        // Check route guard
        const guardResult = await route.canEnter(params);

        if (guardResult === false) {
            // Navigation denied
            console.warn(`Navigation to ${path} was denied by route guard`);
            return;
        }

        if (typeof guardResult === 'string') {
            // Redirect to another path
            await this.navigate(guardResult, replaceState);
            return;
        }

        // Update browser history
        if (replaceState) {
            window.history.replaceState({ path }, '', path);
        } else {
            window.history.pushState({ path }, '', path);
        }

        // Emit navigation event for App.ts to handle
        this.emitNavigation(path, params, handler, route.options.meta);
    }

    /**
     * Get the current path
     */
    get currentPath(): string {
        return window.location.pathname;
    }

    /**
     * Find a route that matches the given path
     */
    private findRoute(path: string): { route: Route; handler: RouteHandler; params: RouteParams } | null {
        for (const [_, { route, handler }] of this.routes) {
            const params = route.match(path);
            if (params !== null) {
                return { route, handler, params };
            }
        }
        return null;
    }

    /**
     * Handle route change (from popstate or initial load)
     */
    private async handleRouteChange(): Promise<void> {
        await this.navigate(this.currentPath, true);
    }

    /**
     * Emit navigation event
     */
    private emitNavigation(path: string, params: RouteParams, handler: RouteHandler, meta?: Record<string, any>): void {
        const detail: NavigationEventDetail = {
            path,
            params,
            handler,
            meta
        };

        this.dispatchEvent(new CustomEvent(NavigationEvents.NAVIGATE, { detail }));
        window.dispatchEvent(new CustomEvent(NavigationEvents.NAVIGATE, { detail }));
    }

    /**
     * Emit not found event
     */
    private emitNotFound(path: string): void {
        if (this.notFoundHandler) {
            const detail: NavigationEventDetail = {
                path,
                params: {},
                handler: this.notFoundHandler
            };
            this.dispatchEvent(new CustomEvent(NavigationEvents.NOT_FOUND, { detail }));
            window.dispatchEvent(new CustomEvent(NavigationEvents.NOT_FOUND, { detail }));
        } else {
            console.error(`404: No route found for ${path} and no notFound handler configured`);
        }
    }

    /**
     * Generate a URL for a route with parameters
     * @param path - The route path pattern
     * @param params - Parameters to inject
     * @returns The generated URL or null if route not found
     */
    generateUrl(path: string, params: RouteParams = {}): string | null {
        const routeEntry = this.routes.get(path);
        if (!routeEntry) {
            return null;
        }

        return routeEntry.route.generate(params);
    }
}
