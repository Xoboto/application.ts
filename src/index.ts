/**
 * Main entry point for the application
 * Export all public APIs
 */

export { App } from './app/App';
export { AppView, Register } from './app/AppView';
export { Router } from './navigation/router';
export { Route } from './navigation/route';

// Export types
export type {
    AppViewLifecycle,
    AppViewOptions,
    AppViewState,
    TemplateFunction
} from './app/types';

export type {
    RouteParams,
    RouteGuard,
    RouteOptions,
    RouteHandler,
    RouteDefinition,
    NavigationEventDetail
} from './navigation/types';

export { NavigationEvents } from './navigation/types';
