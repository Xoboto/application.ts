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
    private basePath: string = '';
    private _currentPath: string = '/';
    private _currentParams: RouteParams = {};
    private _currentMeta?: Record<string, any>;

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
     * Set the base path for all routes
     * @param base - Base path (e.g., '/basic', '/app')
     * @returns The router instance for chaining
     */
    setBasePath(base: string): this {
        // Normalize: ensure starts with / and no trailing /
        this.basePath = base.replace(/\/$/, '').replace(/^(?!\/)/, '/');
        return this;
    }

    /**
     * Get the current base path
     */
    getBasePath(): string {
        return this.basePath;
    }

    /**
     * Initialize the router and handle the current path
     */
    start(): void {
        if (this.isInitialized) {
            console.warn('Router is already initialized');
            return;
        }
        
        // Auto-detect base path from <base> tag if not set
        if (!this.basePath) {
            const baseTag = document.querySelector('base[href]') as HTMLBaseElement;
            if (baseTag) {
                const baseHref = baseTag.getAttribute('href') || '';
                // Extract path from href (could be full URL or relative path)
                try {
                    const url = new URL(baseHref, window.location.origin);
                    this.basePath = url.pathname.replace(/\/$/, '');
                } catch {
                    this.basePath = baseHref.replace(/\/$/, '');
                }
            }
        }
        
        this.isInitialized = true;
        this.handleRouteChange();
    }

    /**
     * Navigate to a specific path
     * @param path - The path to navigate to (relative to basePath)
     * @param replaceState - If true, replaces current history entry instead of pushing
     */
    async navigate(path: string, replaceState: boolean = false): Promise<void> {
        // Strip basePath if present to get route path
        const routePath = this.stripBasePath(path);
        
        // Find matching route
        const match = this.findRoute(routePath);

        if (!match) {
            this.emitNotFound(routePath);
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

        // Add basePath to create full URL
        const fullPath = this.addBasePath(routePath);
        
        // Update browser history
        if (replaceState) {
            window.history.replaceState({ path: fullPath }, '', fullPath);
        } else {
            window.history.pushState({ path: fullPath }, '', fullPath);
        }

        // Emit navigation event for App.ts to handle
        this.emitNavigation(routePath, params, handler, route.options.meta);
    }

    /**
     * Get the current path (route pattern)
     */
    get currentPath(): string {
        return this._currentPath;
    }

    /**
     * Get the current route parameters
     */
    get currentParams(): RouteParams {
        return this._currentParams;
    }

    /**
     * Get the current route metadata
     */
    get currentMeta(): Record<string, any> | undefined {
        return this._currentMeta;
    }

    /**
     * Find a route that matches the given path
     */
    private findRoute(path: string): { route: Route; handler: RouteHandler; params: RouteParams } | null {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        const routePath = this.stripBasePath(window.location.pathname);
        await this.navigate(routePath, true);
    }

    /**
     * Strip base path from a full path
     */
    private stripBasePath(fullPath: string): string {
        if (!this.basePath) {
            return fullPath;
        }
        
        if (fullPath.startsWith(this.basePath)) {
            const stripped = fullPath.slice(this.basePath.length);
            return stripped || '/';
        }
        
        return fullPath;
    }

    /**
     * Add base path to a route path
     */
    private addBasePath(routePath: string): string {
        if (!this.basePath) {
            return routePath;
        }
        
        // Ensure route path starts with /
        const normalizedPath = routePath.startsWith('/') ? routePath : '/' + routePath;
        return this.basePath + normalizedPath;
    }

    /**
     * Emit navigation event
     */
    private emitNavigation(path: string, params: RouteParams, handler: RouteHandler, meta?: Record<string, any>): void {
        // Store current navigation state
        this._currentPath = path;
        this._currentParams = params;
        this._currentMeta = meta;

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
            // Store current navigation state
            this._currentPath = path;
            this._currentParams = {};
            this._currentMeta = undefined;

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
     * @returns The generated URL (with basePath) or null if route not found
     */
    generateUrl(path: string, params: RouteParams = {}): string | null {
        const routeEntry = this.routes.get(path);
        if (!routeEntry) {
            return null;
        }

        const routePath = routeEntry.route.generate(params);
        return this.addBasePath(routePath);
    }
}
