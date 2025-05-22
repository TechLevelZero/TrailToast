class TrailToast {
    constructor(options = {}) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.toastCounter = 0;
        this.activeToasts = [];
        
        // Default options
        this.options = {
            moveDelay: 1000,        // Time before moving to top-right (ms)
            fadeDelay: 5000,        // Time before fading out (ms)
            fadeOutDuration: 500,   // Fade out animation duration (ms)
            toastHeight: 60,        // Spacing between stacked toasts (px)
            topOffset: 20,          // Distance from top of screen (px)
            rightOffset: 20,        // Distance from right of screen (px)
            padding: '16px 24px',          // Default padding
            borderRadius: '12px',          // Default border-radius
            spawnAtCursor: true,  // Spawn at cursor position
            backgroundColor: '#fff', // Default background color
            textColor: '#333',     // Default text color
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Track mouse position globally
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Inject CSS styles
        this.injectStyles();
    }
    
    injectStyles() {
        const styleId = 'toast-notification-styles';
        if (document.getElementById(styleId)) return; // Don't inject twice
        
        const styles = `
            .toast-notification {
                position: fixed;
                border-radius: 12px;
                background: linear-gradient(45deg,rgb(245, 245, 245), #e0e0e0);
                color: #333;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                font-size: 16px;
                font-weight: 500;
                backdrop-filter: blur(10px);
                min-width: 200px;
                text-align: center;
                transform: scale(0);
                transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: inherit;
            }

            .toast-notification.show {
                transform: scale(1);
            }

            .toast-notification.moving {
                transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .toast-notification.fade-out {
                opacity: 0;
                transform: scale(0.8) translateY(-10px);
                transition: all 0.5s ease-out;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

  /**
   * Show a toast message. Will start at mouse or stack at top-right.
   * 
   * @param {string} message The text to show inside the toast.
   * @param {Object} [options={}] Optional overrides for appearance and timing.
   */
    show(message, options = {}) {
        this.toastCounter++;
        
        // Apply theme (default if not specified) then apply custom options
        const baseOptions = { ...this.options };
        const selectedTheme = TrailToast.themes[options.theme] || TrailToast.themes.default;
        const toastOptions = { ...baseOptions, ...selectedTheme, ...options };
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message || `Toast Notification #${this.toastCounter}`;
        toast.dataset.toastId = this.toastCounter;
        
        toast.style.background = toastOptions.backgroundColor;
        toast.style.color = toastOptions.textColor;
        toast.style.borderColor = toastOptions.borderColor;
        toast.style.padding = toastOptions.padding;
        toast.style.borderRadius = toastOptions.borderRadius;
        
        // Position at mouse location
        if (toastOptions.spawnAtCursor) {
            toast.style.left = this.mouseX + 'px';
            toast.style.top = this.mouseY + 'px';
        } else {
            // Stack at top right immediately
            const index = this.activeToasts.length;
            const targetTop = toastOptions.topOffset + (index * toastOptions.toastHeight);
            const targetRight = toastOptions.rightOffset;
        
            // Temporarily place it right without animation
            document.body.appendChild(toast);
            requestAnimationFrame(() => {
                const actualWidth = toast.offsetWidth;
                toast.style.left = (window.innerWidth - targetRight - actualWidth) + 'px';
            });
            // toast.style.right = toastOptions.rightOffset + 'px';
            toast.style.top = targetTop + 'px';
        }
        
        // Add to DOM and active toasts array
        document.body.appendChild(toast);
        this.activeToasts.push(toast);
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // After delay, move to top right
        setTimeout(() => {
            toast.classList.add('moving');
            
            setTimeout(() => {
                this.moveToastToTopRight(toast);
            }, 10);
        }, toastOptions.moveDelay);
        
        // After fade delay, fade out
        setTimeout(() => {
            toast.classList.add('fade-out');
            
            // Remove from DOM after fade animation completes
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                    this.activeToasts = this.activeToasts.filter(t => t !== toast);
                    this.repositionRemainingToasts();
                }
            }, toastOptions.fadeOutDuration);
        }, toastOptions.fadeDelay);
        
        return toast; // Return toast element for further manipulation if needed
    }

    // Filter toasts that are moving and not fading out
    moveToastToTopRight(toast) {
        const topRightToasts = this.activeToasts.filter(t => 
            t.classList.contains('moving') && !t.classList.contains('fade-out')
        );
        const index = topRightToasts.indexOf(toast);
        const targetTop = this.options.topOffset + (index * this.options.toastHeight);
        
        // Get current position
        const currentRect = toast.getBoundingClientRect();
        const currentLeft = parseFloat(toast.style.left);
        const currentTop = parseFloat(toast.style.top);
        
        // Calculate target position (offset from right edge)
        const targetRight = window.innerWidth - this.options.rightOffset - currentRect.width;
        
        // Calculate the transform needed
        const deltaX = targetRight - currentLeft;
        const deltaY = targetTop - currentTop;
        
        // Apply transform to move to target position
        toast.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    // Called after a toast disappears, to shift others up
    repositionRemainingToasts() {
        const topRightToasts = this.activeToasts.filter(toast => 
            toast.classList.contains('moving') && !toast.classList.contains('fade-out')
        );
        
        topRightToasts.forEach((toast, index) => {
            const currentRect = toast.getBoundingClientRect();
            const currentLeft = parseFloat(toast.style.left);
            const currentTop = parseFloat(toast.style.top);
            const targetTop = this.options.topOffset + (index * this.options.toastHeight);
            
            // Calculate target position (offset from right edge)
            const targetRight = window.innerWidth - this.options.rightOffset - currentRect.width;
            
            // Calculate the transform needed
            const deltaX = targetRight - currentLeft;
            const deltaY = targetTop - currentTop;
            
            // Apply transform to move to target position
            toast.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
    }
    
    // Predefined color themes
    static themes = {
        default: {
            backgroundColor: 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
            textColor: '#333',
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        success: {
            backgroundColor: 'linear-gradient(45deg,rgb(95, 179, 97),rgb(80, 153, 84))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        error: {
            backgroundColor: 'linear-gradient(45deg,rgb(245, 116, 107),rgb(206, 76, 76))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        warning: {
            backgroundColor: 'linear-gradient(45deg,rgb(255, 183, 76),rgb(255, 154, 53))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        info: {
            backgroundColor: 'linear-gradient(45deg,rgb(88, 180, 255), #1976D2)',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        dark: {
            backgroundColor: 'linear-gradient(45deg, #424242, #212121)',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        light: {
            backgroundColor: 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
            textColor: '#333',
            borderColor: 'rgba(0, 0, 0, 0.1)'
        }
    };

    clearAll() {
        this.activeToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        this.activeToasts = [];
    }
    // Get count of active toasts
    getActiveCount() {
        return this.activeToasts.length;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS
    module.exports = TrailToast;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
        return TrailToast;
    });
} else {
    // Browser global
    window.TrailToast = TrailToast;
}