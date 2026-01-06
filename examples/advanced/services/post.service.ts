/**
 * Post API Service
 * Handles all post-related API calls
 */

import { HttpClient } from './http.service';
import type { Post, Comment } from '../models';

export class PostService {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    /**
     * Get all posts
     */
    async getPosts(userId?: number): Promise<Post[]> {
        const endpoint = userId ? `/posts?userId=${userId}` : '/posts';
        return this.http.get<Post[]>(endpoint);
    }

    /**
     * Get post by ID
     */
    async getPost(id: number): Promise<Post> {
        return this.http.get<Post>(`/posts/${id}`);
    }

    /**
     * Get comments for a post
     */
    async getComments(postId: number): Promise<Comment[]> {
        return this.http.get<Comment[]>(`/posts/${postId}/comments`);
    }

    /**
     * Create new post
     */
    async createPost(post: Partial<Post>): Promise<Post> {
        return this.http.post<Post>('/posts', post);
    }

    /**
     * Update existing post
     */
    async updatePost(id: number, post: Partial<Post>): Promise<Post> {
        return this.http.put<Post>(`/posts/${id}`, post);
    }

    /**
     * Delete post
     */
    async deletePost(id: number): Promise<void> {
        return this.http.delete<void>(`/posts/${id}`);
    }
}
