/**
 * Route parameters extracted from URL path
 */
export type RouteParams = Record<string, string>;

/**
 * Navigation guard function that can prevent navigation
 * @returns true to allow navigation, false to prevent, or string path to redirect
 */
export type RouteGuard = (params: RouteParams) => boolean | string | Promise<boolean | string>;

/**
 * Route configuration options
 */
export interface RouteOptions {
    /**
     * Guard function to check if navigation is allowed
     */
    canEnter?: RouteGuard;
    
    /**
     * Additional metadata for the route
     */
    meta?: Record<string, any>;
}

/**
 * Route handler - reference to view class constructor or string identifier
 */
export type RouteHandler<T = any> = (new () => T) | string;

/**
 * Route definition
 */
export interface RouteDefinition {
    path: string;
    handler: RouteHandler;
    options?: RouteOptions;
}

/**
 * Navigation event detail
 */
export interface NavigationEventDetail {
    /**
     * The path being navigated to
     */
    path: string;
    
    /**
     * Route parameters extracted from the path
     */
    params: RouteParams;
    
    /**
     * The route handler (view identifier)
     */
    handler: RouteHandler;
    
    /**
     * Route metadata
     */
    meta?: Record<string, any>;
}

/**
 * Navigation events
 */
export const NavigationEvents = {
    BEFORE_NAVIGATE: 'navigation:before',
    NAVIGATE: 'navigation:navigate',
    NOT_FOUND: 'navigation:notfound'
} as const;
