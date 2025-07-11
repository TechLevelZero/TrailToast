class TrailToast {
    constructor(options = {}) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.toastCounter = 0;
        this.activeToasts = [];

        // Add a Map to track toasts by ID for easy lookup during updates
        this.toastMap = new Map();
        
        // Default options
        this.options = {
            moveDelay: 1000,                             // Time before moving to top-right (ms)
            fadeDelay: 5000,                             // Time before fading out (ms)
            fadeOutDuration: 500,                        // Fade out animation duration (ms)
            toastHeight: 60,                             // Height of each toast (px)
            toastWidth: 220,                             // Width of each toast (px)
            topOffset: 20,                               // Distance from top of screen (px)
            rightOffset: 20,                             // Distance from right of screen (px)
            padding: '16px 24px',                        // Default padding
            borderRadius: '12px',                        // Default border-radius
            spawnAtCursor: true,                         // Spawn at cursor position
            backgroundColor: '#fff',                     // Default background color
            textColor: '#333',                           // Default text color
            showProgress: true,                          // Show progress bar
            progressHeight: 3,                           // Progress bar height (px)
            progressColor: 'rgba(255, 255, 255, 0.8)', // Progress bar color
            stackDirection: 'vertical',                  // 'vertical' or 'horizontal'
            pauseOnHover: true,                          // Pause progress bar on hover
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
                overflow: hidden;
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

            .toast-content {
                position: relative;
                z-index: 1;
            }

            .toast-progress-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.8);
                width: 100%;
                transform-origin: left;
                transition: transform linear;
            }

            .toast-progress-bar.animate {
                transform: scaleX(0);
            }

            .toast-notification.paused .toast-progress-bar {
                animation-play-state: paused;
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
        const toastId = this.toastCounter;
        
        // Apply theme (default if not specified) then apply custom options
        const baseOptions = { ...this.options };
        const selectedTheme = TrailToast.themes[options.theme] || TrailToast.themes.default;
        const toastOptions = { ...baseOptions, ...selectedTheme, ...options };
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.dataset.toastId = toastId;
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'toast-content';
        contentWrapper.textContent = message || `Toast Notification #${this.toastCounter}`;
        toast.appendChild(contentWrapper);
        
        // Store reference to content wrapper for updates
        toast.contentWrapper = contentWrapper;
        
        // Store original options for updates
        toast.originalOptions = toastOptions;
        
        this.applyToastStyles(toast, toastOptions);
    
        
        // Add pause on hover functionality
        if (toastOptions.pauseOnHover) {
            this.addHoverFunctionality(toast, toastOptions);
        }
        
        // Add progress bar if enabled
        if (toastOptions.showProgress) {
            this.addProgressBar(toast, toastOptions);
        }
        
        // Position toast
        this.positionToast(toast, toastOptions);
        
        // Add to DOM and tracking arrays
        document.body.appendChild(toast);
        this.activeToasts.push(toast);
        
        // Create toast instance object with update method
        const toastInstance = {
            id: toastId,
            element: toast,
            fadeTimeout: null,
            options: toastOptions,
            update: (newMessage, newOptions = {}) => {
                this.updateToast(toastId, newMessage, newOptions);
            },
            hide: () => this.hide(toastId)
        };
        
        // Store in map for easy lookup
        this.toastMap.set(toastId, toastInstance);
        
        // Show toast with animation
        this.showToastWithAnimation(toast, toastInstance, toastOptions);
        
        return toastInstance;
    }

    applyToastStyles(toast, options) {
        toast.style.background = options.backgroundColor;
        toast.style.color = options.textColor;
        toast.style.borderColor = options.borderColor;
        toast.style.padding = options.padding;
        toast.style.borderRadius = options.borderRadius;
    }

    addHoverFunctionality(toast, options) {
        toast.addEventListener('mouseenter', () => {
            toast.classList.add('paused');
            
            // Pause progress bar animation
            if (toast.progressBar && toast.progressStartTime) {
                // Get current transform value to calculate remaining time
                const computedStyle = window.getComputedStyle(toast.progressBar);
                const currentTransform = computedStyle.transform;
                
                // Extract scaleX value from matrix transform
                let currentScale = 1;
                if (currentTransform && currentTransform !== 'none') {
                    const matrix = currentTransform.match(/matrix\(([^)]+)\)/);
                    if (matrix && matrix[1]) {
                        const values = matrix[1].split(',');
                        currentScale = parseFloat(values[0]); // scaleX is the first value
                    }
                }
                
                // Calculate remaining time based on current scale
                const elapsed = Date.now() - toast.progressStartTime;
                const totalTime = options.fadeDelay - 50;
                toast.progressRemainingTime = Math.max(0, totalTime * currentScale);
                
                // Pause the animation by removing transition
                toast.progressBar.style.transitionDuration = '0ms';
            }
            
            // Clear any existing fade timeout
            const toastInstance = this.toastMap.get(parseInt(toast.dataset.toastId));
            if (toastInstance && toastInstance.fadeTimeout) {
                clearTimeout(toastInstance.fadeTimeout);
            }
        });
        
        toast.addEventListener('mouseleave', () => {
            toast.classList.remove('paused');
            
            // Resume progress bar animation
            if (toast.progressBar && toast.progressRemainingTime > 0) {
                toast.progressBar.style.transitionDuration = toast.progressRemainingTime + 'ms';
                toast.progressStartTime = Date.now();
                
                // Continue animation to scaleX(0)
                requestAnimationFrame(() => {
                    toast.progressBar.style.transform = 'scaleX(0)';
                });
            }
            
            // Resume fade timeout
            const toastInstance = this.toastMap.get(parseInt(toast.dataset.toastId));
            if (toastInstance && toast.progressRemainingTime > 0) {
                toastInstance.fadeTimeout = setTimeout(() => {
                    this.fadeOutToast(toast, options);
                }, toast.progressRemainingTime);
            }
        });
    }

    addProgressBar(toast, options) {
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress-bar';
        progressBar.style.height = options.progressHeight + 'px';
        progressBar.style.background = options.progressColor;
        toast.appendChild(progressBar);
        
        // Store reference to progress bar for animation
        toast.progressBar = progressBar;
    }

    positionToast(toast, options) {
        if (options.spawnAtCursor) {
            toast.style.left = this.mouseX + 'px';
            toast.style.top = this.mouseY + 'px';
        } else {
            // Stack at top right immediately
            toast.style.visibility = 'hidden'; // Hide while we measure
            
            requestAnimationFrame(() => {
                const actualWidth = toast.offsetWidth;
                const finalPosition = this.calculateToastPosition(this.activeToasts.length, options, toast);
                
                toast.style.left = (window.innerWidth - finalPosition.right - actualWidth) + 'px';
                toast.style.top = finalPosition.top + 'px';
                toast.style.visibility = 'visible';
            });
        }
    }

    showToastWithAnimation(toast, toastInstance, options) {
        setTimeout(() => {
            toast.classList.add('show');
            
            // Start progress bar animation after the toast appears
            if (options.showProgress && toast.progressBar) {
                const totalTime = options.fadeDelay - 50;
                toast.progressStartTime = Date.now();
                toast.progressRemainingTime = totalTime;
                
                setTimeout(() => {
                    toast.progressBar.style.transitionDuration = totalTime + 'ms';
                    toast.progressBar.classList.add('animate');
                }, 50);
            }
        }, 10);
        
        // After delay, move to top right
        setTimeout(() => {
            toast.classList.add('moving');
            setTimeout(() => {
                this.repositionToast(toast);
            }, 10);
        }, options.moveDelay);
        
        // Set up auto-fade timeout
        this.setupFadeTimeout(toast, toastInstance, options);
    }

    setupFadeTimeout(toast, toastInstance, options) {
        if (!options.pauseOnHover) {
            toastInstance.fadeTimeout = setTimeout(() => {
                this.fadeOutToast(toast, options);
            }, options.fadeDelay);
        } else {
            toastInstance.fadeTimeout = setTimeout(() => {
                this.fadeOutToast(toast, options);
            }, options.fadeDelay);
        }
    }

    fadeOutToast(toast, options) {
        toast.classList.add('fade-out');
        
        setTimeout(() => {
            this.removeToast(toast);
        }, options.fadeOutDuration);
    }

    removeToast(toast) {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Remove from arrays and map
        this.activeToasts = this.activeToasts.filter(t => t !== toast);
        const toastId = parseInt(toast.dataset.toastId);
        this.toastMap.delete(toastId);
        
        this.repositionToast();
    }

    /**
     * Updates an existing toast with new message and options.
     * @param {number} toastId - ID of the toast to update.
     * @param {string} newMessage - New message to display.
     * @param {Object} [newOptions={}] - Optional new options (e.g., theme, duration).
     */
    updateToast(toastId, newMessage, newOptions = {}) {
        // Find the toast instance by ID
        const toastInstance = this.toastMap.get(toastId);
        // If not found, log a warning and create a new toast
        if (!toastInstance) {
            console.warn(`Toast with ID ${toastId} not found`);
            this.show(newMessage, newOptions);
            return;
        }

        const toast = toastInstance.element;
        const currentOptions = toastInstance.options;
        
        // Clear existing fade timeout
        if (toastInstance.fadeTimeout) {
            clearTimeout(toastInstance.fadeTimeout);
        }
        
        // Merge new options with current options
        const updatedOptions = { ...currentOptions, ...newOptions };
        
        // Update message - Use contentWrapper instead of textContent to preserve other elements
        if (toast.contentWrapper) {
            toast.contentWrapper.textContent = newMessage;
        } else {
            // Fallback if contentWrapper doesn't exist (shouldn't happen with new structure)
            toast.textContent = newMessage;
        }
        
        // Apply new theme if specified
        if (newOptions.theme) {
            const newTheme = TrailToast.themes[newOptions.theme] || TrailToast.themes.default;
            const themeOptions = { ...updatedOptions, ...newTheme };
            this.applyToastStyles(toast, themeOptions);
            updatedOptions.backgroundColor = themeOptions.backgroundColor;
            updatedOptions.textColor = themeOptions.textColor;
            updatedOptions.borderColor = themeOptions.borderColor;
            updatedOptions.progressColor = themeOptions.progressColor;
            
            // Update progress bar color if it exists
            if (toast.progressBar) {
                toast.progressBar.style.background = themeOptions.progressColor;
            }
        }
        
        // Handle repositioning if spawnAtCursor changed
        if (newOptions.hasOwnProperty('spawnAtCursor')) {
            if (newOptions.spawnAtCursor === false && toast.style.transform) {
                // Move back to normal stack position if it was at cursor
                this.repositionToast(toast);
            }
        }
        
        // Reset progress bar if it exists
        if (toast.progressBar && updatedOptions.showProgress) {
            // Remove the animate class and reset transform
            toast.progressBar.classList.remove('animate');
            toast.progressBar.style.transitionDuration = '0ms';
            toast.progressBar.style.transform = 'scaleX(1)';
            
            // Force reflow by accessing offsetHeight
            toast.progressBar.offsetHeight;
            
            // Restart progress animation
            const totalTime = updatedOptions.fadeDelay - 50;
            toast.progressStartTime = Date.now();
            toast.progressRemainingTime = totalTime;
            
            // Set the transition duration and start animation
            toast.progressBar.style.transitionDuration = totalTime + 'ms';
            
            // Use requestAnimationFrame to start the animation
            requestAnimationFrame(() => {
                toast.progressBar.style.transform = 'scaleX(0)';
            });
        }
        
        // Update stored options
        toastInstance.options = updatedOptions;
        
        // Set new fade timeout
        toastInstance.fadeTimeout = setTimeout(() => {
            this.fadeOutToast(toast, updatedOptions);
        }, updatedOptions.fadeDelay);
    }

    // Method to manually hide a toast
    hide(toastId) {
        const toastInstance = this.toastMap.get(toastId);
        if (!toastInstance) return;

        const toast = toastInstance.element;
        
        // Clear timeout
        if (toastInstance.fadeTimeout) {
            clearTimeout(toastInstance.fadeTimeout);
        }
        
        // Fade out immediately
        this.fadeOutToast(toast, toastInstance.options);
    }

    // Calculate position for toast based on stacking direction and actual toast dimensions
    calculateToastPosition(index, options = this.options, targetToast = null) {
        const isHorizontal = options.stackDirection === 'horizontal';
        const gap = 10;
        const maxRowWidth = window.innerWidth - 2 * options.rightOffset;

        // Get all active toasts that are currently positioned
        const positionedToasts = this.activeToasts.filter(t => 
            t.classList.contains('moving') && !t.classList.contains('fade-out')
        );

        // If a target toast is specified, only consider toasts before it in the list
        const toastsToConsider = targetToast ? positionedToasts.slice(0, positionedToasts.indexOf(targetToast)) : positionedToasts;
    
        if (isHorizontal) {
            // Calculate dimensions of all toasts up to the current index
            const toastDimensions = toastsToConsider.map(toast => {
                const rect = toast.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });
    
            let width = 0;
            let height = 0;
            let rowHeights = [];
            let currentRowHeight = 0;
            let totalRowHeight = 0;
            let rightOffset = options.rightOffset;

            // Calculate the position for the toast at the given index
            for (let i = 0; i < index && i < toastsToConsider.length; i++) {
                const { width: toastWidth, height: toastHeight } = toastDimensions[i];
    
                if (width + toastWidth > maxRowWidth && width > 0) {
                    rowHeights.push(currentRowHeight);
                    currentRowHeight = toastHeight;
                    width = toastWidth + gap;
                    rightOffset = options.rightOffset + toastWidth + gap;
                } else {
                    currentRowHeight = Math.max(currentRowHeight, toastHeight);
                    width += (width > 0 ? gap : 0) + toastWidth;
                    rightOffset += toastWidth + gap;
                }
            }
    
            totalRowHeight = rowHeights.reduce((sum, h) => sum + h + gap, 0);
            const topOffset = options.topOffset + totalRowHeight;
    
            return { top: topOffset, right: rightOffset };
        } else {
            let totalHeight = 0;
            for (let i = 0; i < index && i < toastsToConsider.length; i++) {
                const rect = toastsToConsider[i].getBoundingClientRect();
                totalHeight += rect.height + gap;
            }
        
            return {
                top: options.topOffset + totalHeight,
                right: options.rightOffset
            };
        }
    }

    // Called after a toast disappears, to shift others up/left
    repositionToast() {
        const topRightToasts = this.activeToasts.filter(toast => 
            toast.classList.contains('moving') && !toast.classList.contains('fade-out')
        );
        
        topRightToasts.forEach((toast, index) => {
            const position = this.calculateToastPosition(index, this.options);
            const currentRect = toast.getBoundingClientRect();
            const currentLeft = parseFloat(toast.style.left);
            const currentTop = parseFloat(toast.style.top);
            
            // Calculate target position (offset from right edge)
            const targetRight = window.innerWidth - position.right - currentRect.width;
            const targetTop = position.top;
            
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
            borderColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'rgba(100, 100, 100, 0.6)',
        },
        success: {
            backgroundColor: 'linear-gradient(45deg,rgb(95, 179, 97),rgb(80, 153, 84))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'rgba(255, 255, 255, 0.8)',
        },
        error: {
            backgroundColor: 'linear-gradient(45deg,rgb(245, 116, 107),rgb(206, 76, 76))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'rgba(255, 255, 255, 0.8)',
        },
        warning: {
            backgroundColor: 'linear-gradient(45deg,rgb(255, 183, 76),rgb(255, 154, 53))',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'rgba(255, 255, 255, 0.8)',
        },
        info: {
            backgroundColor: 'linear-gradient(45deg,rgb(88, 180, 255), #1976D2)',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: 'rgba(255, 255, 255, 0.8)',
        },
        dark: {
            backgroundColor: 'linear-gradient(45deg, #424242, #212121)',
            textColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            progressColor: 'rgba(255, 255, 255, 0.6)',
        },
        light: {
            backgroundColor: 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
            textColor: '#333',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            progressColor: 'rgba(100, 100, 100, 0.6)',
        }
    };

    clearAll() {
        this.activeToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        this.activeToasts = [];
        this.toastMap.clear();
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