/**
 * Modal Component
 * Reusable dialog component
 */

import { AppView, Register } from '../../../src';

const template = /*html*/`
<div class="modal-root">
    <style>
    :host {
        display: contents;
    }

    .modal-root {
        display: contents;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex !important;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes popIn {
        0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .modal-container {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        animation: popIn 0.3s ease-out;
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h2 {
        font-size: 1.25rem;
        margin: 0;
        color: #212529;
    }

    .modal-close {
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6c757d;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-close:hover {
        color: #212529;
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-primary:hover {
        background: #0056b3;
    }

    .btn-secondary {
        background: #e9ecef;
        color: #212529;
    }

    .btn-secondary:hover {
        background: #dee2e6;
    }
    </style>
    <div class="modal-overlay" @if="modalState?.isOpen" @on:click="handleOverlayClick">
        <div class="modal-container" @on:click.stop="">
            <div class="modal-header">
                <h2>{{ modalState?.title }}</h2>
                <button class="modal-close" @on:click="close" @if="modalState?.closeable">×</button>
            </div>
            <div class="modal-body">
                <slot></slot>
            </div>
            <div class="modal-footer" @if="modalState?.showFooter">
                <button @on:click="handleCancel" class="btn btn-secondary" @if="modalState?.cancelText">{{ modalState?.cancelText }}</button>
                <button @on:click="handleConfirm" class="btn btn-primary" @if="modalState?.confirmText">{{ modalState?.confirmText }}</button>
            </div>
        </div>
    </div>
</div>`;

export interface ModalState {
    isOpen: boolean
    title: string;
    closeable: boolean;
    showFooter: boolean;
    confirmText: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    onDismiss?: () => void;
}

class State {
    modalState: ModalState | null = null;
    get onConfirm() { return this.modalState?.onConfirm || null; }
    get onCancel() { return this.modalState?.onCancel || null; }

    handleOverlayClick: () => void = () => {
        if (this.modalState?.closeable && this.modalState) {
            this.modalState.isOpen = false;
        }
    };

    handleConfirm: () => void = () => {
        if (this.onConfirm) {
            this.onConfirm();
        }
        if (this.modalState) {
            this.modalState.isOpen = false;
        }
    };

    handleCancel: () => void = () => {
        if (this.onCancel) {
            this.onCancel();
        }
        if (this.modalState) {
            this.modalState.isOpen = false;
        }
    };

    close: () => void = () => {
        if (this.modalState) {
            this.modalState.isOpen = false;
        }
    };
}

@Register('app-modal')
export class AppModal extends AppView {
    constructor() {
        super({ useShadowDOM: true });
    }

    template(): string {
        return template;
    }

    state() {
        return new State();
    }

    open(options: {
        title: string;
        closeable?: boolean;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    }) {
        this.setStates({
            isOpen: true,
            title: options.title,
            closeable: options.closeable !== false,
            confirmText: options.confirmText || '',
            cancelText: options.cancelText || '',
            showFooter: !!(options.confirmText || options.cancelText),
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        });
    }

    close() {
        this.setState('isOpen', false);
    }

    get modal(): ModalState | null {
        return this.viewState.modalState;
    }
    set modal(value: ModalState | null) {
        this.setState('modalState', value);
    }
}
