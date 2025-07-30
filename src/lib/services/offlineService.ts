/**
 * Service for managing offline functionality and service worker communication
 */
export class OfflineService {
	private registration: ServiceWorkerRegistration | null = null;
	private _onlineStatus: boolean = true;
	private cacheStatusCallbacks: Set<(status: CacheStatus) => void> = new Set();

	constructor() {
		// Only initialize in browser environment
		if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
			this._onlineStatus = navigator.onLine;
			
			// Listen for online/offline events
			window.addEventListener('online', () => {
				this._onlineStatus = true;
			});
			
			window.addEventListener('offline', () => {
				this._onlineStatus = false;
			});
			
			// Initialize service worker if available
			this.initializeServiceWorker();
		}
	}

	private async initializeServiceWorker() {
		if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
			try {
				this.registration = await navigator.serviceWorker.ready;
				console.log('[OfflineService] Service worker ready');
			} catch (error) {
				console.error('[OfflineService] Service worker initialization failed:', error);
			}
		}
	}

	/**
	 * Get current online status
	 */
	isOnline(): boolean {
		return this._onlineStatus;
	}

	/**
	 * Cache URLs for offline access
	 * Useful for preloading sample data and media files
	 */
	async cacheUrls(urls: string[]): Promise<boolean> {
		if (typeof navigator === 'undefined' || !this.registration || !navigator.serviceWorker.controller) {
			console.warn('[OfflineService] Service worker not available for caching');
			return false;
		}

		return new Promise((resolve) => {
			const messageChannel = new MessageChannel();
			
			messageChannel.port1.onmessage = (event) => {
				resolve(event.data.success);
			};

			navigator.serviceWorker.controller!.postMessage(
				{ type: 'CACHE_URLS', urls },
				[messageChannel.port2]
			);
		});
	}

	/**
	 * Cache sample data and media files for offline access
	 */
	async cacheSampleData(mediaFiles: Map<string, string>): Promise<void> {
		if (!this.isOnline()) {
			console.log('[OfflineService] Offline - skipping sample data caching');
			return;
		}

		// Extract blob URLs for caching
		const urls = Array.from(mediaFiles.values());
		
		try {
			const success = await this.cacheUrls(urls);
			if (success) {
				console.log('[OfflineService] Sample data cached successfully');
			} else {
				console.warn('[OfflineService] Failed to cache sample data');
			}
		} catch (error) {
			console.error('[OfflineService] Error caching sample data:', error);
		}
	}

	/**
	 * Preload critical app assets for offline use
	 */
	async preloadCriticalAssets(): Promise<void> {
		if (typeof window === 'undefined') {
			return;
		}

		try {
			// Get all assets loaded by the current page
			const criticalAssets: string[] = [];
			
			// Get CSS files
			const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
			linkTags.forEach(link => {
				const href = (link as HTMLLinkElement).href;
				if (href && href.startsWith(window.location.origin)) {
					criticalAssets.push(href);
				}
			});
			
			// Get JavaScript files (including SvelteKit bundles)
			const scriptTags = document.querySelectorAll('script[src]');
			scriptTags.forEach(script => {
				const src = (script as HTMLScriptElement).src;
				if (src && src.startsWith(window.location.origin)) {
					criticalAssets.push(src);
				}
			});

			// Add known SvelteKit runtime files
			const svelteKitAssets = [
				'/_app/env.js',
				'/_app/version.json'
			];
			
			for (const asset of svelteKitAssets) {
				try {
					const response = await fetch(asset, { method: 'HEAD' });
					if (response.ok) {
						criticalAssets.push(asset);
					}
				} catch (error) {
					// Asset not available, skip
				}
			}

			if (criticalAssets.length > 0) {
				const success = await this.cacheUrls(criticalAssets);
				if (success) {
					console.log('[OfflineService] Preloaded critical assets:', criticalAssets.length);
				}
			}

			// Force immediate caching of app shell resources
			await this.ensureAppShellCached();
		} catch (error) {
			console.error('[OfflineService] Error preloading critical assets:', error);
		}
	}

	/**
	 * Ensure the app shell (core HTML, CSS, JS) is cached for offline use
	 */
	private async ensureAppShellCached(): Promise<void> {
		if (typeof window === 'undefined' || !('caches' in window)) {
			return;
		}

		try {
			const cache = await caches.open('static-v1.2.0');
			
			// Ensure root document is cached
			const rootUrl = window.location.origin + '/';
			const cached = await cache.match(rootUrl);
			if (!cached) {
				const response = await fetch(rootUrl);
				if (response.ok) {
					await cache.put(rootUrl, response);
					console.log('[OfflineService] Cached app shell root document');
				}
			}
		} catch (error) {
			console.error('[OfflineService] Error ensuring app shell cached:', error);
		}
	}

	/**
	 * Check if the app is ready for offline use
	 */
	async isOfflineReady(): Promise<boolean> {
		if (typeof window === 'undefined' || !('caches' in window)) {
			return false;
		}

		try {
			const cacheNames = await caches.keys();
			return cacheNames.length > 0;
		} catch (error) {
			console.error('[OfflineService] Error checking cache status:', error);
			return false;
		}
	}

	/**
	 * Get cache usage information
	 */
	async getCacheInfo(): Promise<CacheInfo> {
		if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('caches' in window) || !('storage' in navigator)) {
			return {
				isSupported: false,
				totalCaches: 0,
				estimatedSize: 0,
				usage: 0,
				quota: 0
			};
		}

		try {
			const cacheNames = await caches.keys();
			const estimate = await navigator.storage.estimate();
			
			return {
				isSupported: true,
				totalCaches: cacheNames.length,
				estimatedSize: estimate.usage || 0,
				usage: estimate.usage || 0,
				quota: estimate.quota || 0
			};
		} catch (error) {
			console.error('[OfflineService] Error getting cache info:', error);
			return {
				isSupported: true,
				totalCaches: 0,
				estimatedSize: 0,
				usage: 0,
				quota: 0
			};
		}
	}

	/**
	 * Clear all caches (useful for troubleshooting)
	 */
	async clearCaches(): Promise<boolean> {
		if (typeof window === 'undefined' || !('caches' in window)) {
			return false;
		}

		try {
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.map(name => caches.delete(name)));
			console.log('[OfflineService] All caches cleared');
			return true;
		} catch (error) {
			console.error('[OfflineService] Error clearing caches:', error);
			return false;
		}
	}

	/**
	 * Force service worker update
	 */
	async updateServiceWorker(): Promise<boolean> {
		if (!this.registration) {
			return false;
		}

		try {
			await this.registration.update();
			return true;
		} catch (error) {
			console.error('[OfflineService] Error updating service worker:', error);
			return false;
		}
	}

	/**
	 * Show offline notification to user
	 */
	showOfflineNotification(): void {
		// This could be integrated with a toast notification system
		console.log('[OfflineService] App is now offline - cached content will be served');
	}

	/**
	 * Show online notification to user
	 */
	showOnlineNotification(): void {
		// This could be integrated with a toast notification system
		console.log('[OfflineService] App is back online - fresh content will be loaded');
	}
}

export interface CacheInfo {
	isSupported: boolean;
	totalCaches: number;
	estimatedSize: number;
	usage: number;
	quota: number;
}

export interface CacheStatus {
	isOnline: boolean;
	isOfflineReady: boolean;
	cacheInfo: CacheInfo;
}

// Global instance
export const offlineService = new OfflineService();