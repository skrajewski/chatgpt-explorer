<script lang="ts">
	import FileUpload from './FileUpload.svelte';
	import ConversationList from './ConversationList.svelte';
	import MessageViewer from './MessageViewer.svelte';
	import Library from './Library.svelte';
	import TopActionBar from './TopActionBar.svelte';
	import HelpModal from './HelpModal.svelte';
	import { FileProcessor } from '../services/fileProcessor.js';
	import { SearchService } from '../services/searchService.js';
	import { getSampleDataWithMedia } from '../services/sampleData.js';
	import { offlineService } from '../services/offlineService.js';
	import type { ProcessedConversation, AppState } from '../types.js';

	let appState = $state<AppState>({
		conversations: [],
		searchResults: [],
		selectedConversation: null,
		searchQuery: '',
		searchMetadata: null,
		isLoading: false,
		error: null
	});

	let currentView = $state<'conversations' | 'library'>('conversations');
	let showHelpModal = $state(false);

	const fileProcessor = new FileProcessor();
	const searchService = new SearchService();

	// Initialize offline capabilities
	let isOfflineReady = $state(false);
	let isOnline = $state(true);

	$effect(() => {
		// Initialize online/offline status
		if (typeof navigator !== 'undefined') {
			isOnline = navigator.onLine;
			
			const handleOnline = () => {
				isOnline = true;
				offlineService.showOnlineNotification();
			};
			
			const handleOffline = () => {
				isOnline = false;
				offlineService.showOfflineNotification();
			};
			
			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);
			
			// Cleanup
			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			};
		}
	});

	$effect(() => {
		// Preload critical assets for offline use after component mounts
		setTimeout(async () => {
			await offlineService.preloadCriticalAssets();
			isOfflineReady = await offlineService.isOfflineReady();
		}, 1000); // Delay to let the app load first
	});

	async function handleFileSelected(file: File) {
		appState.isLoading = true;
		appState.error = null;

		try {
			const conversations = await fileProcessor.processZipFile(file);
			appState.conversations = conversations.sort((a, b) => b.create_time - a.create_time);

			// Build search index
			searchService.buildIndex(appState.conversations);
			const searchResult = searchService.searchWithMetadata('');
			appState.searchResults = searchResult.conversations;
			appState.searchMetadata = searchResult.metadata;

			appState.isLoading = false;
		} catch (error) {
			console.error('Error processing file:', error);
			appState.error = error instanceof Error ? error.message : 'Failed to process file';
			appState.isLoading = false;
		}
	}

	async function handleSampleDataSelected() {
		appState.isLoading = true;
		appState.error = null;

		try {
			const sampleData = await getSampleDataWithMedia();
			appState.conversations = sampleData.conversations.sort(
				(a, b) => b.create_time - a.create_time
			);

			// Load media files into the file processor
			for (const [path, url] of sampleData.mediaFiles.entries()) {
				fileProcessor.addMediaFile(path, url);
			}

			// Cache sample data for offline access
			await offlineService.cacheSampleData(sampleData.mediaFiles);

			// Build search index
			searchService.buildIndex(appState.conversations);
			const searchResult = searchService.searchWithMetadata('');
			appState.searchResults = searchResult.conversations;
			appState.searchMetadata = searchResult.metadata;

			appState.isLoading = false;
		} catch (error) {
			console.error('Error loading sample data:', error);
			appState.error = error instanceof Error ? error.message : 'Failed to load sample data';
			appState.isLoading = false;
		}
	}

	function handleConversationSelect(conversation: ProcessedConversation) {
		appState.selectedConversation = conversation;
	}

	function handleSearchQueryChange(query: string) {
		appState.searchQuery = query;
		const searchResult = searchService.searchWithMetadata(query);
		appState.searchResults = searchResult.conversations;
		appState.searchMetadata = searchResult.metadata;
	}

	function handleLoadNew() {
		// Reset state to show file upload again
		appState.conversations = [];
		appState.searchResults = [];
		appState.selectedConversation = null;
		appState.searchQuery = '';
		appState.searchMetadata = null;
		appState.error = null;
		currentView = 'conversations';
		fileProcessor.cleanup();
	}

	function handleShowLibrary() {
		currentView = 'library';
	}

	function handleCloseLibrary() {
		currentView = 'conversations';
	}

	function handleShowHelp() {
		showHelpModal = true;
	}

	function handleCloseHelp() {
		showHelpModal = false;
	}

	// Determine if we should show the upload interface
	let showUpload = $derived(appState.conversations.length === 0 && !appState.isLoading);
	let hasData = $derived(appState.conversations.length > 0);
</script>

<!-- Top Action Bar - Always visible -->
<TopActionBar onClearData={handleLoadNew} onShowHelp={handleShowHelp} {hasData} />

<!-- Help Modal -->
<HelpModal isOpen={showHelpModal} onClose={handleCloseHelp} />

<!-- Main Content -->
<div class="h-[calc(100vh-4rem)]">
	{#if appState.error}
		<div class="flex h-full items-center justify-center bg-red-50">
			<div class="text-center">
				<div class="mb-4">
					<svg
						class="mx-auto h-12 w-12 text-red-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h2 class="text-lg font-semibold text-gray-900">Error Processing File</h2>
				<p class="mt-2 text-sm text-gray-600">{appState.error}</p>
				<button
					onclick={handleLoadNew}
					class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					Try Again
				</button>
			</div>
		</div>
	{:else if showUpload}
		<FileUpload
			onFileSelected={handleFileSelected}
			onSampleDataSelected={handleSampleDataSelected}
			isLoading={appState.isLoading}
		/>
	{:else if currentView === 'library'}
		<Library conversations={appState.conversations} {fileProcessor} onClose={handleCloseLibrary} />
	{:else}
		<!-- Main App Layout -->
		<div class="flex h-full bg-gray-100">
			<!-- Sidebar -->
			<div class="w-80 flex-shrink-0">
				<ConversationList
					conversations={appState.searchResults}
					selectedConversation={appState.selectedConversation}
					searchQuery={appState.searchQuery}
					searchMetadata={appState.searchMetadata}
					{searchService}
					onConversationSelect={handleConversationSelect}
					onSearchQueryChange={handleSearchQueryChange}
					onShowLibrary={handleShowLibrary}
				/>
			</div>

			<!-- Main Content -->
			<div class="flex-1">
				<MessageViewer
					conversation={appState.selectedConversation}
					searchQuery={appState.searchQuery}
					{fileProcessor}
				/>
			</div>
		</div>
	{/if}
</div>
