/**
 * Simple Dependency Injection Container
 * Manages service instances and dependencies
 */

type ServiceConstructor<T> = new (...args: any[]) => T;

export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any> = new Map();
    private singletons: Map<string, any> = new Map();

    private constructor() {}

    /**
     * Get singleton instance of container
     */
    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    /**
     * Register a service as singleton
     */
    registerSingleton<T>(key: string, ServiceClass: ServiceConstructor<T>, ...args: any[]): void {
        if (!this.singletons.has(key)) {
            this.singletons.set(key, new ServiceClass(...args));
        }
    }

    /**
     * Register a service factory
     */
    register<T>(key: string, ServiceClass: ServiceConstructor<T>): void {
        this.services.set(key, ServiceClass);
    }

    /**
     * Resolve a service instance
     */
    resolve<T>(key: string): T {
        // Check for singleton first
        if (this.singletons.has(key)) {
            return this.singletons.get(key) as T;
        }

        // Create new instance from factory
        const ServiceClass = this.services.get(key);
        if (!ServiceClass) {
            throw new Error(`Service '${key}' not registered`);
        }

        return new ServiceClass() as T;
    }

    /**
     * Check if service is registered
     */
    has(key: string): boolean {
        return this.services.has(key) || this.singletons.has(key);
    }

    /**
     * Clear all services
     */
    clear(): void {
        this.services.clear();
        this.singletons.clear();
    }
}

// Export singleton instance
export const container = ServiceContainer.getInstance();
