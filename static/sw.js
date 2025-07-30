// Service Worker for ChatGPT Explorer - Offline-First PWA
const CACHE_NAME = 'chatgpt-explorer-v1.2.0';
const STATIC_CACHE = 'static-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-v1.2.0';

// Critical assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.svg'
];

// SvelteKit build assets that will be cached dynamically
const DYNAMIC_CACHE_PATTERNS = [
  // SvelteKit immutable assets (JS chunks, CSS, etc.)
  /\/_app\/immutable\/.*\.(js|css)$/,
  /\/_app\/immutable\/assets\/.*$/,
  /\/_app\/immutable\/chunks\/.*\.js$/,
  /\/_app\/immutable\/entry\/.*\.js$/,
  /\/_app\/immutable\/nodes\/.*\.js$/,
  // SvelteKit runtime files
  /\/_app\/env\.js$/,
  /\/_app\/version\.json$/,
  // Media and fonts
  /\.woff2?$/,
  /\.ttf$/,
  /\.otf$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.webp$/,
  /\.gif$/,
  /\.ico$/,
  // Audio/video files
  /\.wav$/,
  /\.mp3$/,
  /\.mp4$/,
  /\.webm$/,
  /\.ogg$/
];

// Network-first resources (external scripts, APIs) - Will fail gracefully offline
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/a\.szymonkrajewski\.pl\//,
  /^https:\/\/api\./
];

// Skip these requests entirely (optional external resources)
const SKIP_PATTERNS = [
  /^https:\/\/a\.szymonkrajewski\.pl\/js\/script\.js$/
];

self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then(cache => {
          console.log('[SW] Precaching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // Discover and cache SvelteKit build assets
      discoverAndCacheAppAssets()
    ])
    .then(() => {
      console.log('[SW] All assets cached successfully');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[SW] Failed to cache assets:', error);
      // Still proceed even if some assets fail
      return self.skipWaiting();
    })
  );
});

// Discover and cache SvelteKit build assets
async function discoverAndCacheAppAssets() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Essential SvelteKit runtime files
    const criticalAssets = [
      '/_app/env.js',
      '/_app/version.json'
    ];
    
    // Cache critical assets first
    for (const path of criticalAssets) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          await cache.put(path, response);
          console.log('[SW] Cached critical asset:', path);
        }
      } catch (error) {
        console.log('[SW] Critical asset not available during install:', path);
      }
    }
    
    // Try to cache the root HTML document with full SvelteKit assets
    try {
      const rootResponse = await fetch('/');
      if (rootResponse.ok) {
        const html = await rootResponse.text();
        
        // Extract script and link references from HTML
        const scriptMatches = html.match(/\/_app\/immutable\/[^"'\s>]+\.(js|css)/g) || [];
        const linkMatches = html.match(/href="(\/_app\/[^"]+\.(css|js))"/g) || [];
        
        const discoveredAssets = [
          ...scriptMatches,
          ...linkMatches.map(match => match.match(/href="([^"]+)"/)?.[1]).filter(Boolean)
        ];
        
        // Cache discovered assets
        for (const assetPath of discoveredAssets) {
          try {
            const response = await fetch(assetPath);
            if (response.ok) {
              await cache.put(assetPath, response);
              console.log('[SW] Cached discovered asset:', assetPath);
            }
          } catch (error) {
            console.log('[SW] Failed to cache discovered asset:', assetPath);
          }
        }
        
        console.log('[SW] Discovered and cached', discoveredAssets.length, 'build assets');
      }
    } catch (error) {
      console.log('[SW] Failed to discover assets from root document:', error);
    }
    
    console.log('[SW] App assets discovery completed');
  } catch (error) {
    console.warn('[SW] Failed to discover app assets:', error);
  }
}

self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Clean up old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated and claiming clients');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip optional external resources (like analytics) - let them fail silently
  if (shouldSkipRequest(url)) {
    console.log('[SW] Skipping optional external resource:', request.url);
    return;
  }
  
  // Handle different types of requests with appropriate caching strategies
  if (isNetworkFirst(url)) {
    event.respondWith(networkFirstWithGracefulFail(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isDynamicAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Default: Cache-first for same-origin, network-first for cross-origin
    if (url.origin === location.origin) {
      event.respondWith(cacheFirst(request));
    } else {
      event.respondWith(networkFirstWithGracefulFail(request));
    }
  }
});

// Cache-first strategy: Check cache first, fallback to network
async function cacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }
    
    console.log('[SW] Cache miss, fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    
    // For navigation requests (HTML pages), try to serve cached root document
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      const cachedRoot = await cache.match('/');
      if (cachedRoot) {
        console.log('[SW] Serving cached root for navigation:', request.url);
        return cachedRoot;
      }
    }
    
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network-first strategy: Try network first, fallback to cache
async function networkFirst(request) {
  try {
    console.log('[SW] Network-first fetch:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    console.error('[SW] Network-first failed completely:', error);
    return new Response('Offline - Network unavailable', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network-first with graceful failure for external resources
async function networkFirstWithGracefulFail(request) {
  try {
    console.log('[SW] Network-first fetch (graceful):', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // For external resources, fail silently with an empty response
    console.log('[SW] External resource not available offline:', request.url);
    return new Response('', { 
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale-while-revalidate: Return cache immediately, update cache in background
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(error => {
      console.log('[SW] Background fetch failed:', error);
    });
    
    if (cached) {
      console.log('[SW] Serving stale cache while revalidating:', request.url);
      return cached;
    }
    
    // If not in cache, wait for network
    console.log('[SW] Not in cache, waiting for network:', request.url);
    return await fetchPromise;
  } catch (error) {
    console.error('[SW] Stale-while-revalidate failed:', error);
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Helper functions to determine caching strategy
function shouldSkipRequest(url) {
  return SKIP_PATTERNS.some(pattern => pattern.test(url.href));
}

function isNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

function isStaticAsset(url) {
  return url.pathname === '/' || 
         url.pathname.endsWith('.svg') || 
         url.pathname.endsWith('.png') || 
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.html') ||
         url.pathname === '/manifest.json';
}

function isDynamicAsset(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    cacheUrls(urls).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});

// Cache multiple URLs (useful for preloading sample data)
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = urls.map(url => new Request(url));
  
  await Promise.allSettled(
    requests.map(async request => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
          console.log('[SW] Cached URL:', request.url);
        }
      } catch (error) {
        console.warn('[SW] Failed to cache URL:', request.url, error);
      }
    })
  );
}

console.log('[SW] Service worker script loaded');