/**
 * HTTP Client Service
 * Handles all HTTP requests with proper error handling
 */

import type { ApiError } from '../models';

export class HttpClient {
    private baseURL: string;

    constructor(baseURL: string = 'https://jsonplaceholder.typicode.com') {
        this.baseURL = baseURL;
    }

    /**
     * Generic GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            
            if (!response.ok) {
                throw this.handleError(response);
            }
            
            return await response.json();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Generic POST request
     */
    async post<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw this.handleError(response);
            }
            
            return await response.json();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Generic PUT request
     */
    async put<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw this.handleError(response);
            }
            
            return await response.json();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Generic DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw this.handleError(response);
            }
            
            return await response.json();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle and format errors
     */
    private handleError(error: any): ApiError {
        if (error instanceof Response) {
            return {
                message: `HTTP Error ${error.status}: ${error.statusText}`,
                status: error.status,
            };
        }
        
        if (error instanceof Error) {
            return {
                message: error.message,
                status: 0,
                details: error,
            };
        }
        
        return {
            message: 'Unknown error occurred',
            status: 0,
            details: error,
        };
    }
}
