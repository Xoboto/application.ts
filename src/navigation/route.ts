import type { RouteParams, RouteOptions } from './types';

/**
 * Represents a route with path pattern matching and parameter extraction
 */
export class Route {
    public readonly path: string;
    public readonly pattern: RegExp;
    public readonly paramNames: string[];
    public readonly options: RouteOptions;

    constructor(path: string, options: RouteOptions = {}) {
        this.path = path;
        this.options = options;
        this.paramNames = [];

        // Convert path pattern to RegExp and extract parameter names
        this.pattern = this.pathToRegExp(path);
    }

    /**
     * Convert a path pattern like '/user/:id' to a RegExp
     * Extracts parameter names like 'id'
     */
    private pathToRegExp(path: string): RegExp {
        // Escape special characters except for :param patterns
        const escapedPath = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace :param with capture groups and extract param names
        const pattern = escapedPath.replace(/:([^/]+)/g, (match, paramName) => {
            this.paramNames.push(paramName);
            return '([^/]+)';
        });

        // Match exact path or with trailing slash
        return new RegExp(`^${pattern}/?$`);
    }

    /**
     * Check if the given path matches this route
     * @param path - The path to test
     * @returns The extracted parameters if match, null otherwise
     */
    match(path: string): RouteParams | null {
        const match = this.pattern.exec(path);
        
        if (!match) {
            return null;
        }

        // Extract parameters from capture groups
        const params: RouteParams = {};
        this.paramNames.forEach((name, index) => {
            params[name] = decodeURIComponent(match[index + 1]);
        });

        return params;
    }

    /**
     * Check if navigation is allowed via the route guard
     * @param params - Route parameters
     * @returns true if allowed, false if denied, or redirect path
     */
    async canEnter(params: RouteParams): Promise<boolean | string> {
        if (!this.options.canEnter) {
            return true;
        }

        return await this.options.canEnter(params);
    }

    /**
     * Generate a path from this route pattern with given parameters
     * @param params - Parameters to inject into the path
     * @returns The generated path
     */
    generate(params: RouteParams = {}): string {
        let path = this.path;

        for (const [key, value] of Object.entries(params)) {
            path = path.replace(`:${key}`, encodeURIComponent(value));
        }

        return path;
    }
}
