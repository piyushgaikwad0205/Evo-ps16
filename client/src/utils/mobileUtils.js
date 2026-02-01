/**
 * Mobile Utilities for Enhanced Touch Handling and Gesture Recognition
 * Optimizes the mobile experience for the hybrid app
 */

class MobileUtils {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
    this.isInWebView = this.detectWebView();
    
    this.touchStartTime = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.lastTouchEnd = 0;
    
    this.init();
  }

  /**
   * Initialize mobile utilities
   */
  init() {
    if (this.isMobile) {
      this.setupTouchHandlers();
      this.setupGestureHandlers();
      this.setupMobileOptimizations();
      this.setupPushRegistration();
    }
  }

  /**
   * Detect mobile device
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  /**
   * Detect iOS device
   */
  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Detect Android device
   */
  detectAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Detect WebView environment
   */
  detectWebView() {
    return window.ReactNativeWebView || 
           window.webkit?.messageHandlers ||
           /wv/.test(navigator.userAgent) ||
           window.Median;
  }

  /**
   * Setup touch event handlers
   */
  setupTouchHandlers() {
    // Prevent double-tap zoom
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Handle touch start for gesture recognition
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    
    // Handle touch move for gesture recognition
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    
    // Handle touch end for gesture recognition
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  /**
   * Setup gesture handlers
   */
  setupGestureHandlers() {
    // Swipe gestures
    this.setupSwipeGestures();
    
    // Pinch gestures
    this.setupPinchGestures();
    
    // Long press gestures
    this.setupLongPressGestures();
  }

  /**
   * Setup mobile-specific optimizations
   */
  setupMobileOptimizations() {
    // Prevent pull-to-refresh on iOS
    if (this.isIOS) {
      this.preventPullToRefresh();
    }
    
    // Optimize scrolling
    this.optimizeScrolling();
    
    // Handle viewport changes
    this.setupViewportHandling();
    
    // Optimize touch feedback
    this.optimizeTouchFeedback();
  }

  /**
   * Setup push token registration bridge (hybrid wrapper should provide token)
   */
  setupPushRegistration() {
    // Listen for token messages from native wrapper
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'FCM_TOKEN' && data.token) {
          this.registerToken(data.token);
        }
      } catch {}
    });

    // iOS WKWebView message handler can call window.mobileUtils.registerToken
    this.registerToken = async (token) => {
      try {
        const stored = localStorage.getItem('profile');
        if (!stored) return;
        const { accessToken } = JSON.parse(stored);
        if (!accessToken) return;
        await fetch((process.env.REACT_APP_API_URL || "") + "/users/me/fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token }),
        });
      } catch {}
    };
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(event) {
    this.touchStartTime = Date.now();
    this.touchStartY = event.touches[0].clientY;
    this.touchStartX = event.touches[0].clientX;
  }

  /**
   * Handle touch move events
   */
  handleTouchMove(event) {
    // Prevent default for specific gestures
    if (this.shouldPreventDefault(event)) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event) {
    const now = Date.now();
    const timeDiff = now - this.lastTouchEnd;
    
    // Prevent double-tap zoom
    if (timeDiff < 300) {
      event.preventDefault();
    }
    
    this.lastTouchEnd = now;
    
    // Process gestures
    this.processTouchGesture(event);
  }

  /**
   * Handle context menu (long press)
   */
  handleContextMenu(event) {
    event.preventDefault();
    return false;
  }

  /**
   * Determine if default should be prevented
   */
  shouldPreventDefault(event) {
    const touch = event.touches[0];
    const deltaY = Math.abs(touch.clientY - this.touchStartY);
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    
    // Prevent horizontal scrolling on vertical scroll containers
    if (deltaY < deltaX && deltaX > 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Process touch gestures
   */
  processTouchGesture(event) {
    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - this.touchStartY;
    const deltaX = touch.clientX - this.touchStartX;
    const timeDiff = Date.now() - this.touchStartTime;
    
    // Detect swipe gestures
    if (timeDiff < 300) {
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.handleSwipeDown();
        } else {
          this.handleSwipeUp();
        }
      }
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      }
    }
  }

  /**
   * Setup swipe gesture handlers
   */
  setupSwipeGestures() {
    // Swipe up from bottom (reveal navigation bar on Android)
    this.onSwipeUp = () => {
      if (this.isAndroid && this.isInWebView) {
        this.revealNavigationBar();
      }
    };
    
    // Swipe down from top (hide navigation bar on Android)
    this.onSwipeDown = () => {
      if (this.isAndroid && this.isInWebView) {
        this.hideNavigationBar();
      }
    };
    
    // Swipe left/right (navigation)
    this.onSwipeLeft = () => {
      // Handle back navigation
      if (this.isInWebView) {
        this.requestBackNavigation();
      }
    };
    
    this.onSwipeRight = () => {
      // Handle forward navigation
      if (this.isInWebView) {
        this.requestForwardNavigation();
      }
    };
  }

  /**
   * Setup pinch gesture handlers
   */
  setupPinchGestures() {
    let initialDistance = 0;
    
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length === 2) {
        initialDistance = this.getDistance(event.touches[0], event.touches[1]);
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length === 2) {
        const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
        const scale = currentDistance / initialDistance;
        
        // Prevent zooming
        if (scale !== 1) {
          event.preventDefault();
        }
      }
    });
  }

  /**
   * Setup long press gesture handlers
   */
  setupLongPressGestures() {
    let longPressTimer = null;
    
    document.addEventListener('touchstart', (event) => {
      longPressTimer = setTimeout(() => {
        this.handleLongPress(event);
      }, 500);
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });
  }

  /**
   * Calculate distance between two touch points
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle swipe up gesture
   */
  handleSwipeUp() {
    if (this.onSwipeUp) {
      this.onSwipeUp();
    }
  }

  /**
   * Handle swipe down gesture
   */
  handleSwipeDown() {
    if (this.onSwipeDown) {
      this.onSwipeDown();
    }
  }

  /**
   * Handle swipe left gesture
   */
  handleSwipeLeft() {
    if (this.onSwipeLeft) {
      this.onSwipeLeft();
    }
  }

  /**
   * Handle swipe right gesture
   */
  handleSwipeRight() {
    if (this.onSwipeRight) {
      this.onSwipeRight();
    }
  }

  /**
   * Handle long press gesture
   */
  handleLongPress(event) {
    // Custom long press behavior
    console.log('Long press detected');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('longpress', {
      detail: { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      }
    }));
  }

  /**
   * Prevent pull-to-refresh on iOS
   */
  preventPullToRefresh() {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Optimize scrolling performance
   */
  optimizeScrolling() {
    // Enable hardware acceleration
    document.body.style.webkitTransform = 'translateZ(0)';
    document.body.style.transform = 'translateZ(0)';
    
    // Optimize scroll containers
    const scrollContainers = document.querySelectorAll('.scroll-container, [data-scroll]');
    scrollContainers.forEach(container => {
      container.style.webkitOverflowScrolling = 'touch';
      container.style.overflowScrolling = 'touch';
    });
  }

  /**
   * Setup viewport handling
   */
  setupViewportHandling() {
    // Handle viewport height changes
    this.updateViewportHeight();
    
    window.addEventListener('resize', () => {
      this.updateViewportHeight();
    });
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateViewportHeight();
      }, 100);
    });
    
    // Handle virtual keyboard
    if (this.isIOS) {
      this.setupVirtualKeyboardHandling();
    }
  }

  /**
   * Update viewport height
   */
  updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    
    // Update body height
    document.body.style.height = `${window.innerHeight}px`;
  }

  /**
   * Setup virtual keyboard handling for iOS
   */
  setupVirtualKeyboardHandling() {
    // Listen for visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.updateViewportHeight();
      });
    }
  }

  /**
   * Optimize touch feedback
   */
  optimizeTouchFeedback() {
    // Remove tap highlight
    document.body.style.webkitTapHighlightColor = 'transparent';
    
    // Optimize touch targets
    const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        target.style.minWidth = '44px';
        target.style.minHeight = '44px';
      }
    });
  }

  /**
   * Reveal navigation bar on Android
   */
  revealNavigationBar() {
    if (this.isAndroid && this.isInWebView) {
      const message = {
        type: 'NAVIGATION_BAR',
        action: 'reveal',
        duration: 3000
      };
      
      this.sendMessageToNative(message);
    }
  }

  /**
   * Hide navigation bar on Android
   */
  hideNavigationBar() {
    if (this.isAndroid && this.isInWebView) {
      const message = {
        type: 'NAVIGATION_BAR',
        action: 'hide'
      };
      
      this.sendMessageToNative(message);
    }
  }

  /**
   * Request back navigation
   */
  requestBackNavigation() {
    if (this.isInWebView) {
      const message = {
        type: 'NAVIGATION',
        action: 'back'
      };
      
      this.sendMessageToNative(message);
    }
  }

  /**
   * Request forward navigation
   */
  requestForwardNavigation() {
    if (this.isInWebView) {
      const message = {
        type: 'NAVIGATION',
        action: 'forward'
      };
      
      this.sendMessageToNative(message);
    }
  }

  /**
   * Send message to native app
   */
  sendMessageToNative(message) {
    // React Native WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    
    // WKWebView (iOS)
    else if (window.webkit?.messageHandlers?.mobileUtils) {
      window.webkit.messageHandlers.mobileUtils.postMessage(message);
    }
    
    // PostMessage fallback
    else if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }

  /**
   * Get mobile device information
   */
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isInWebView: this.isInWebView,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    };
  }

  /**
   * Check if device supports specific features
   */
  supportsFeature(feature) {
    const features = {
      touch: 'ontouchstart' in window,
      gesture: 'ongesturestart' in window,
      orientation: 'onorientationchange' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      webkitFullscreen: 'webkitRequestFullscreen' in document.documentElement,
      visualViewport: 'visualViewport' in window,
      safeArea: 'CSS' in window && 'supports' in CSS && CSS.supports('padding-top: env(safe-area-inset-top)')
    };
    
    return features[feature] || false;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
  }
}

// Create global instance
const mobileUtils = new MobileUtils();

// Export for use in components
export default mobileUtils;

// Also expose globally for debugging
window.mobileUtils = mobileUtils;