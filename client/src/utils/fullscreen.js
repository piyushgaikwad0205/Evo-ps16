/**
 * Fullscreen and Immersive Mode Utilities for Hybrid Mobile Apps
 * Supports both Android (immersive sticky) and iOS (standalone fullscreen)
 */

class FullscreenManager {
  constructor() {
    this.isFullscreen = false;
    this.isMobile = this.detectMobile();
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
    this.isInWebView = this.detectWebView();
    
    this.init();
  }

  /**
   * Initialize fullscreen manager
   */
  init() {
    // Listen for fullscreen changes
    this.setupFullscreenListeners();
    
    // Auto-request fullscreen only when embedded in a WebView
    this.requestFullscreenOnLoad();
    
    // Setup mobile-specific behaviors
    if (this.isMobile) {
      this.setupMobileBehaviors();
    }
    
    // Setup WebView specific features
    if (this.isInWebView) {
      this.setupWebViewFeatures();
    }
  }

  /**
   * Detect if running on mobile device
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  /**
   * Detect if running on iOS
   */
  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Detect if running on Android
   */
  detectAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Detect if running inside WebView
   */
  detectWebView() {
    return window.ReactNativeWebView || 
           window.webkit?.messageHandlers ||
           /wv/.test(navigator.userAgent) ||
           window.Median;
  }

  /**
   * Setup fullscreen event listeners
   */
  setupFullscreenListeners() {
    // Fullscreen change events
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));

    // Orientation change
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Resize events
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Touch events for mobile
    if (this.isMobile) {
      this.setupTouchListeners();
    }
  }

  /**
   * Setup mobile-specific behaviors
   */
  setupMobileBehaviors() {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Do not lock body position or height to preserve scrolling
    // Handle viewport height changes (mobile keyboard, etc.)
    this.setupViewportHeightHandling();
  }

  /**
   * Setup WebView specific features
   */
  setupWebViewFeatures() {
    // Send message to native app to enable immersive mode
    this.requestImmersiveMode();
    
    // Listen for messages from native app
    window.addEventListener('message', this.handleNativeMessage.bind(this));
    
    // Setup postMessage for communication with native app
    if (window.ReactNativeWebView) {
      this.setupReactNativeWebView();
    } else if (window.webkit?.messageHandlers) {
      this.setupWKWebView();
    }
  }

  /**
   * Setup React Native WebView communication
   */
  setupReactNativeWebView() {
    // Send initial setup message
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'SETUP_IMMERSIVE',
      data: {
        platform: this.isIOS ? 'ios' : 'android',
        enableFullscreen: true,
        enableImmersive: true
      }
    }));
  }

  /**
   * Setup WKWebView communication (iOS)
   */
  setupWKWebView() {
    if (window.webkit?.messageHandlers?.immersiveMode) {
      window.webkit.messageHandlers.immersiveMode.postMessage({
        action: 'enable',
        style: 'black-translucent'
      });
    }
  }

  /**
   * Request immersive mode from native app
   */
  requestImmersiveMode() {
    const message = {
      type: 'IMMERSIVE_MODE',
      action: 'enable',
      platform: this.isIOS ? 'ios' : 'android',
      config: {
        android: {
          systemUiVisibility: 'SYSTEM_UI_FLAG_IMMERSIVE_STICKY',
          hideStatusBar: true,
          hideNavigationBar: true,
          allowNavigationBarReveal: true
        },
        ios: {
          statusBarStyle: 'black-translucent',
          hideStatusBar: true,
          standaloneMode: true
        }
      }
    };

    // Send via postMessage if available
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }

    // Send via ReactNativeWebView if available
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }

    // Send via WKWebView if available
    if (window.webkit?.messageHandlers?.immersiveMode) {
      window.webkit.messageHandlers.immersiveMode.postMessage(message);
    }
  }

  /**
   * Request fullscreen mode
   */
  async requestFullscreen() {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      
      this.isFullscreen = true;
      this.onFullscreenChange();
    } catch (error) {
      console.log('Fullscreen request failed:', error);
      // Fallback to immersive mode
      this.requestImmersiveMode();
    }
  }

  /**
   * Exit fullscreen mode
   */
  async exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      
      this.isFullscreen = false;
      this.onFullscreenChange();
    } catch (error) {}
  }

  /**
   * Toggle fullscreen mode
   */
  async toggleFullscreen() {
    if (this.isFullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
  }

  /**
   * Handle fullscreen change events
   */
  handleFullscreenChange() {
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    
    this.isFullscreen = isFullscreen;
    this.onFullscreenChange();
  }

  /**
   * Handle orientation changes
   */
  handleOrientationChange() {
    // Recalculate viewport heights
    this.updateViewportHeight();
    
    // Re-request immersive mode if needed
    setTimeout(() => {
      this.requestImmersiveMode();
    }, 100);
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.updateViewportHeight();
  }

  /**
   * Setup touch event listeners for mobile
   */
  setupTouchListeners() {
    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handle swipe gestures for Android navigation bar reveal
    if (this.isAndroid) {
      this.setupSwipeGestures();
    }
  }

  /**
   * Setup swipe gestures for Android navigation bar
   */
  setupSwipeGestures() {
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });

    document.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Detect swipe up from bottom (reveal navigation bar)
      if (deltaY < -50 && deltaTime < 300 && endY < window.innerHeight - 100) {
        this.revealNavigationBar();
      }
    });
  }

  /**
   * Reveal Android navigation bar
   */
  revealNavigationBar() {
    if (this.isAndroid && this.isInWebView) {
      const message = {
        type: 'NAVIGATION_BAR',
        action: 'reveal',
        duration: 3000 // Auto-hide after 3 seconds
      };

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }
  }

  /**
   * Setup viewport height handling for mobile
   */
  setupViewportHeightHandling() {
    // Set initial viewport vars
    this.updateViewportHeight();

    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateViewportHeight();
      }, 100);
    });

    // Update on resize
    window.addEventListener('resize', () => {
      this.updateViewportHeight();
    });
  }

  /**
   * Update viewport height CSS variables
   */
  updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    const vw = window.innerWidth * 0.01;
    
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    
    // Only lock body height when actually in fullscreen
    if (document.body.classList.contains('fullscreen')) {
      document.body.style.height = `${window.innerHeight}px`;
    } else {
      document.body.style.height = 'auto';
    }
  }

  /**
   * Handle native app messages
   */
  handleNativeMessage(event) {
    try {
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      switch (message.type) {
        case 'IMMERSIVE_MODE_ENABLED':
          console.log('Immersive mode enabled');
          this.onImmersiveModeEnabled();
          break;
          
        case 'FULLSCREEN_REQUESTED':
          this.requestFullscreen();
          break;
          
        case 'ORIENTATION_CHANGED':
          this.handleOrientationChange();
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.log('Error handling native message:', error);
    }
  }

  /**
   * Request fullscreen on app load
   */
  requestFullscreenOnLoad() {
    // Only auto-request fullscreen when embedded in a WebView
    if (!this.isInWebView) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          this.requestFullscreen();
        }, 1000);
      });
    } else {
      setTimeout(() => {
        this.requestFullscreen();
      }, 1000);
    }
  }

  /**
   * Callback when fullscreen changes
   */
  onFullscreenChange() {
    const body = document.body;
    
    if (this.isFullscreen) {
      body.classList.add('fullscreen-enabled');
      body.classList.add('fullscreen');
    } else {
      body.classList.remove('fullscreen-enabled');
      body.classList.remove('fullscreen');
    }
    
    // Ensure viewport values reflect state
    this.updateViewportHeight();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('fullscreenchange', {
      detail: { isFullscreen: this.isFullscreen }
    }));
  }

  /**
   * Callback when immersive mode is enabled
   */
  onImmersiveModeEnabled() {
    console.log('Immersive mode is now active');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('immersivemodechange', {
      detail: { enabled: true }
    }));
  }

  /**
   * Get current fullscreen state
   */
  getFullscreenState() {
    return {
      isFullscreen: this.isFullscreen,
      isMobile: this.isMobile,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isInWebView: this.isInWebView
    };
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Create global instance
const fullscreenManager = new FullscreenManager();

// Export for use in components
export default fullscreenManager;

// Also expose globally for debugging
window.fullscreenManager = fullscreenManager;