<script lang="ts">
	import type { ProcessedConversation, SearchResultMetadata } from '../types.js';
	import SafeHighlight from './SafeHighlight.svelte';
	import MatchCounter from './MatchCounter.svelte';
	import { SearchService } from '../services/searchService.js';

	interface Props {
		conversations: ProcessedConversation[];
		selectedConversation: ProcessedConversation | null;
		searchQuery: string;
		searchMetadata: SearchResultMetadata | null;
		searchService: SearchService;
		onConversationSelect: (conversation: ProcessedConversation) => void;
		onSearchQueryChange: (query: string) => void;
		onShowLibrary?: () => void;
	}

	let {
		conversations,
		selectedConversation,
		searchQuery,
		searchMetadata,
		searchService,
		onConversationSelect,
		onSearchQueryChange,
		onShowLibrary
	}: Props = $props();

	let searchInput: HTMLInputElement;
	let listContainer: HTMLDivElement;

	// Virtual scrolling parameters
	const ITEM_HEIGHT = 120;
	const BUFFER_SIZE = 5;

	let scrollTop = $state(0);
	let containerHeight = $state(600);

	// Keyboard navigation state
	let selectedIndex = $state(-1);
	let isListFocused = $state(false);
	let conversationRefs: (HTMLButtonElement | null)[] = $state([]);

	// Platform detection for keyboard shortcut display
	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const shortcutText = isMac ? '⌘K' : 'Ctrl+K';

	$effect(() => {
		if (listContainer) {
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					containerHeight = entry.contentRect.height;
				}
			});
			observer.observe(listContainer);
			return () => observer.disconnect();
		}
	});

	// Calculate visible range
	let visibleItems = $derived.by(() => {
		const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
		const endIndex = Math.min(
			conversations.length - 1,
			Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
		);
		return { startIndex, endIndex };
	});

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function handleScroll(event: Event) {
		const target = event.target as HTMLDivElement;
		scrollTop = target.scrollTop;
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		onSearchQueryChange(target.value);
	}

	function handleSearchKeyDown(event: KeyboardEvent) {
		// Search input should not handle arrow keys - they should only work when list is focused
		// This prevents arrow key navigation when search input is focused
		return;
	}

	// Focus search input when component mounts
	$effect(() => {
		if (searchInput) {
			searchInput.focus();
		}
	});

	// Global keyboard shortcut handler for Cmd/Ctrl + K
	$effect(() => {
		function handleGlobalKeyDown(event: KeyboardEvent) {
			// Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
			if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				if (searchInput) {
					searchInput.focus();
					searchInput.select(); // Select all text for easy replacement
				}
			}
		}

		document.addEventListener('keydown', handleGlobalKeyDown);
		return () => document.removeEventListener('keydown', handleGlobalKeyDown);
	});

	// Generate smart preview for each conversation
	function getConversationPreview(conversation: ProcessedConversation): string {
		return searchService.generateSmartPreview(conversation, searchQuery);
	}

	// Update selectedIndex when selectedConversation changes externally
	$effect(() => {
		if (selectedConversation) {
			const index = conversations.findIndex(conv => conv.id === selectedConversation.id);
			selectedIndex = index;
			// Only focus the conversation item if the list is focused AND the search input is not focused
			// This prevents stealing focus from the search input when typing
			if (isListFocused && index >= 0 && document.activeElement !== searchInput) {
				focusConversationItem(index);
			}
		} else {
			selectedIndex = -1;
		}
	});

	// Reset conversation refs when visible items change
	$effect(() => {
		conversationRefs = new Array(visibleItems.endIndex - visibleItems.startIndex + 1).fill(null);
	});

	// List focus handlers
	function handleListFocus() {
		isListFocused = true;
	}

	function handleListBlur() {
		isListFocused = false;
	}

	// Keyboard navigation handlers - only works when list is focused
	function handleListKeyDown(event: KeyboardEvent) {
		// Only handle keyboard events when the list container is focused
		if (!isListFocused || conversations.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				navigateDown();
				break;
			case 'ArrowUp':
				event.preventDefault();
				navigateUp();
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < conversations.length) {
					onConversationSelect(conversations[selectedIndex]);
				}
				break;
			case 'Escape':
				// Return focus to search input
				event.preventDefault();
				isListFocused = false;
				if (searchInput) {
					searchInput.focus();
				}
				break;
		}
	}

	function navigateDown() {
		if (conversations.length === 0) return;
		
		let newIndex;
		if (selectedIndex === -1) {
			// No conversation selected, select the first one
			newIndex = 0;
		} else {
			// Move to next conversation, wrap to beginning if at end
			newIndex = selectedIndex < conversations.length - 1 ? selectedIndex + 1 : 0;
		}
		
		selectedIndex = newIndex;
		onConversationSelect(conversations[newIndex]);
		ensureItemVisible(newIndex);
		focusConversationItem(newIndex);
	}

	function navigateUp() {
		if (conversations.length === 0) return;
		
		let newIndex;
		if (selectedIndex === -1) {
			// No conversation selected, select the last one
			newIndex = conversations.length - 1;
		} else {
			// Move to previous conversation, wrap to end if at beginning
			newIndex = selectedIndex > 0 ? selectedIndex - 1 : conversations.length - 1;
		}
		
		selectedIndex = newIndex;
		onConversationSelect(conversations[newIndex]);
		ensureItemVisible(newIndex);
		focusConversationItem(newIndex);
	}

	// Focus the conversation item at the given index
	function focusConversationItem(index: number) {
		// Find the actual rendered item in the virtual list
		const visibleRange = visibleItems;
		if (index >= visibleRange.startIndex && index <= visibleRange.endIndex) {
			const visibleIndex = index - visibleRange.startIndex;
			const button = conversationRefs[visibleIndex];
			if (button) {
				// Use setTimeout to ensure the DOM is updated before focusing
				setTimeout(() => {
					button.focus();
				}, 0);
			}
		}
	}

	function ensureItemVisible(index: number) {
		if (!listContainer) return;

		const itemTop = index * ITEM_HEIGHT;
		const itemBottom = itemTop + ITEM_HEIGHT;
		const containerTop = scrollTop;
		const containerBottom = scrollTop + containerHeight;

		if (itemTop < containerTop) {
			// Item is above visible area, scroll up
			listContainer.scrollTop = itemTop;
		} else if (itemBottom > containerBottom) {
			// Item is below visible area, scroll down
			listContainer.scrollTop = itemBottom - containerHeight;
		}
	}
</script>

<div 
	class="flex h-full flex-col border-r border-gray-200 bg-gray-50" 
	onkeydown={handleListKeyDown}
	onfocus={handleListFocus}
	onblur={handleListBlur}
	tabindex="-1"
	role="application"
	aria-label="Conversation list navigation"
>
	<!-- Search Header -->
	<div class="border-b border-gray-200 bg-white p-4">
		<div class="relative mb-3">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			<input
				bind:this={searchInput}
				type="text"
				placeholder="Search conversations... ({shortcutText})"
				value={searchQuery}
				oninput={handleSearchInput}
				onkeydown={handleSearchKeyDown}
				class="block w-full rounded-md border border-gray-400 py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
		
		{#if onShowLibrary}
			<button
				type="button"
				onclick={onShowLibrary}
				class="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
				</svg>
				View Media Library
			</button>
		{/if}
	</div>

	<!-- Conversation List -->
	<div
		bind:this={listContainer}
		class="flex-1 overflow-y-auto"
		onscroll={handleScroll}
		style="height: {containerHeight}px;"
		tabindex="0"
		role="listbox"
		aria-label="Conversation list"
		onclick={() => {
			// When clicking on the list area, focus it to enable keyboard navigation
			if (listContainer) {
				listContainer.focus();
			}
		}}
		onkeydown={(event) => {
			// Handle keyboard activation for the click handler
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				if (listContainer) {
					listContainer.focus();
				}
			}
		}}
	>
		<!-- Virtual container -->
		<div style="height: {conversations.length * ITEM_HEIGHT}px; position: relative;">
			{#each conversations.slice(visibleItems.startIndex, visibleItems.endIndex + 1) as conversation, index (conversation.id)}
				{@const actualIndex = visibleItems.startIndex + index}
				<button
					bind:this={conversationRefs[index]}
					type="button"
					class="absolute w-full border-b border-gray-200 px-4 py-3 text-left transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset {selectedConversation?.id ===
					conversation.id
						? 'bg-blue-100 border-blue-300 border-l-4 border-l-blue-600 shadow-sm'
						: 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-gray-300'}"
					style="top: {actualIndex * ITEM_HEIGHT}px; height: {ITEM_HEIGHT}px;"
					onclick={() => onConversationSelect(conversation)}
					onfocus={() => {
						isListFocused = true;
						selectedIndex = actualIndex;
						onConversationSelect(conversation);
					}}
				>
					<div class="flex h-full flex-col justify-between">
						<div class="mb-2">
							<h3 class="truncate text-sm font-medium {selectedConversation?.id === conversation.id ? 'text-blue-900' : 'text-gray-900'}">
								<SafeHighlight text={conversation.title} query={searchQuery} />
							</h3>
						</div>
						<div class="flex-1">
							<p class="line-clamp-2 text-xs {selectedConversation?.id === conversation.id ? 'text-blue-700' : 'text-gray-600'}">
								<SafeHighlight text={getConversationPreview(conversation)} query={searchQuery} />
							</p>
						</div>
						<div class="mt-2">
							<span class="text-xs {selectedConversation?.id === conversation.id ? 'text-blue-600' : 'text-gray-500'}">
								{formatDate(conversation.create_time)}
							</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Stats Footer -->
	<div class="border-t border-gray-200 bg-white px-4 py-2">
		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-500">
				{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
			</p>
			<MatchCounter
				{searchMetadata}
				currentMatchIndex={-1}
				totalMatchPositions={searchMetadata?.totalMatches || 0}
				class="text-xs"
			/>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
