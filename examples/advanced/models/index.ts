/**
 * TypeScript Models for Advanced Example
 * Using JSONPlaceholder API: https://jsonplaceholder.typicode.com
 */

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    website: string;
    address: Address;
    company: Company;
}

export interface Address {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
        lat: string;
        lng: string;
    };
}

export interface Company {
    name: string;
    catchPhrase: string;
    bs: string;
}

export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

export interface Comment {
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}

export interface Todo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
}

export interface Album {
    id: number;
    userId: number;
    title: string;
}

export interface Photo {
    id: number;
    albumId: number;
    title: string;
    url: string;
    thumbnailUrl: string;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    token: string;
}

export interface ApiError {
    message: string;
    status: number;
    details?: any;
}
