// Error Handling Utility Module

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
            event.preventDefault();
        });

        // Catch global errors
        window.addEventListener('error', (event) => {
            this.logError('Global Error', event.error || event.message);
        });
    }

    logError(context, error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context: context,
            message: error?.message || String(error),
            stack: error?.stack || 'No stack trace available'
        };

        this.errorLog.push(errorEntry);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Log to console in development
        console.error(`[${context}]`, error);
    }

    showUserError(title, message, details = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-card-bg w-full max-w-md p-8 rounded-[2.5rem] border-2 border-red-500/30 shadow-2xl">
                <div class="flex items-center gap-3 mb-4">
                    <span class="text-3xl">⚠️</span>
                    <h3 class="text-xl font-black uppercase text-red-500">${this.escapeHtml(title)}</h3>
                </div>
                <p class="text-txt-main mb-6">${this.escapeHtml(message)}</p>
                ${details ? `<details class="mb-6 p-4 bg-app-bg rounded-xl text-xs">
                    <summary class="cursor-pointer font-bold mb-2">Technical Details</summary>
                    <pre class="text-txt-muted overflow-auto max-h-40">${this.escapeHtml(details)}</pre>
                </details>` : ''}
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-600 transition">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[300] font-black text-sm animate-slide-in';
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-xl">✓</span>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slide-out 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async handleAsyncOperation(operation, errorContext) {
        try {
            return await operation();
        } catch (error) {
            this.logError(errorContext, error);
            throw error;
        }
    }

    validateQuestionBank(data) {
        const errors = [];

        if (!data) {
            errors.push('No data provided');
            return { valid: false, errors };
        }

        // Check for questions array
        const questions = data.questions || (Array.isArray(data) ? data : null);
        if (!questions || !Array.isArray(questions)) {
            errors.push('Invalid format: questions must be an array');
            return { valid: false, errors };
        }

        if (questions.length === 0) {
            errors.push('Question bank is empty');
            return { valid: false, errors };
        }

        // Validate each question
        questions.forEach((q, index) => {
            if (!q.text) errors.push(`Question ${index + 1}: Missing question text`);
            if (!q.options || typeof q.options !== 'object') {
                errors.push(`Question ${index + 1}: Missing or invalid options`);
            }
            if (!q.answer) errors.push(`Question ${index + 1}: Missing answer`);
            if (!q.answer_type) errors.push(`Question ${index + 1}: Missing answer_type`);
        });

        return {
            valid: errors.length === 0,
            errors: errors,
            questionCount: questions.length
        };
    }

    getErrorLog() {
        return [...this.errorLog];
    }

    clearErrorLog() {
        this.errorLog = [];
    }

    exportErrorLog() {
        const blob = new Blob([JSON.stringify(this.errorLog, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slide-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Made with Bob
