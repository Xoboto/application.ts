/**
 * User API Service
 * Handles all user-related API calls
 */

import { HttpClient } from './http.service';
import type { User } from '../models';

export class UserService {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    /**
     * Get all users
     */
    async getUsers(): Promise<User[]> {
        return this.http.get<User[]>('/users');
    }

    /**
     * Get user by ID
     */
    async getUser(id: number): Promise<User> {
        return this.http.get<User>(`/users/${id}`);
    }

    /**
     * Create new user
     */
    async createUser(user: Partial<User>): Promise<User> {
        return this.http.post<User>('/users', user);
    }

    /**
     * Update existing user
     */
    async updateUser(id: number, user: Partial<User>): Promise<User> {
        return this.http.put<User>(`/users/${id}`, user);
    }

    /**
     * Delete user
     */
    async deleteUser(id: number): Promise<void> {
        return this.http.delete<void>(`/users/${id}`);
    }
}
