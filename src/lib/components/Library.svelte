<script lang="ts">
	import type { ProcessedConversation } from '../types.js';
	import { FileProcessor } from '../services/fileProcessor.js';

	interface Props {
		conversations: ProcessedConversation[];
		fileProcessor: FileProcessor;
		onClose: () => void;
	}

	let { conversations, fileProcessor, onClose }: Props = $props();

	interface MediaFile {
		filename: string;
		url: string;
		type: 'image' | 'audio' | 'video';
		size?: number;
		conversationTitle?: string;
	}

	let mediaFiles = $state<MediaFile[]>([]);
	let filteredFiles = $state<MediaFile[]>([]);
	let filterType = $state<'all' | 'image' | 'audio' | 'video'>('all');
	let searchQuery = $state('');
	let isLoading = $state(true);

	// Process media files when component mounts
	$effect(() => {
		loadMediaFiles();
	});

	// Filter files when search query or filter type changes
	$effect(() => {
		filterFiles();
	});

	async function loadMediaFiles() {
		isLoading = true;
		const files: MediaFile[] = [];

		// Get all media files that were processed by fileProcessor
		const mediaMap = fileProcessor.getAllMediaFiles();

		for (const [filename, url] of mediaMap.entries()) {
			const type = getMediaType(filename);
			if (type) {
				files.push({
					filename: extractDisplayName(filename),
					url,
					type,
					conversationTitle: findAssociatedConversation(filename)
				});
			}
		}

		mediaFiles = files.sort((a, b) => a.filename.localeCompare(b.filename));
		isLoading = false;
	}

	function getMediaType(filename: string): 'image' | 'audio' | 'video' | null {
		const ext = filename.toLowerCase().split('.').pop();
		if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return 'image';
		if (['wav', 'mp3', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
		if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
		return null;
	}

	function extractDisplayName(filepath: string): string {
		// Extract meaningful name from file paths like "dalle-generations/file-xyz.webp" or "audio/file-abc.wav"
		const parts = filepath.split('/');
		let filename = parts[parts.length - 1];

		// Clean up ChatGPT export naming patterns
		if (filename.startsWith('file-')) {
			// For DALL-E images, keep the middle part of the filename
			if (filepath.includes('dalle-generations')) {
				const match = filename.match(/file-([^-]+)-/);
				if (match) {
					return `dalle-${match[1].substring(0, 8)}.${filename.split('.').pop()}`;
				}
			}
			// For other files, create shorter names
			const ext = filename.split('.').pop();
			const hash = filename.substring(5, 13); // Take 8 chars after "file-"
			return `${hash}.${ext}`;
		}

		return filename;
	}

	function findAssociatedConversation(filepath: string): string | undefined {
		// Try to find which conversation this media file belongs to
		// This is a best-effort approach based on the dump structure
		const pathParts = filepath.split('/');

		if (pathParts.length > 1) {
			const conversationId = pathParts[0];

			// First try exact match on conversation ID
			let conversation = conversations.find((c) => c.id === conversationId);

			return conversation?.title || 'Conversation not found';
		}

		return undefined;
	}

	function filterFiles() {
		let filtered = mediaFiles;

		// Filter by type
		if (filterType !== 'all') {
			filtered = filtered.filter((file) => file.type === filterType);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(file) =>
					file.filename.toLowerCase().includes(query) ||
					file.conversationTitle?.toLowerCase().includes(query)
			);
		}

		filteredFiles = filtered;
	}

	function downloadFile(file: MediaFile) {
		const link = document.createElement('a');
		link.href = file.url;
		link.download = file.filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function getFileIcon(type: string): string {
		switch (type) {
			case 'image':
				return '🖼️';
			case 'audio':
				return '🎵';
			case 'video':
				return '🎥';
			default:
				return '📄';
		}
	}

	function formatFileCount(count: number, type: string): string {
		if (count === 0) return `No ${type}s`;
		if (count === 1) return `1 ${type}`;
		return `${count} ${type}s`;
	}
</script>

<div class="flex h-screen bg-gray-100">
	<!-- Header -->
	<div class="flex w-full flex-col">
		<header class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
			<div class="flex items-center space-x-4">
				<button
					onclick={onClose}
					class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
					title="Back to conversations"
					aria-label="Back to conversations"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<h1 class="text-xl font-semibold text-gray-900">Media Library</h1>
				<span class="text-sm text-gray-500">
					{formatFileCount(filteredFiles.length, 'file')}
					{filterType !== 'all' ? `(${filterType})` : ''}
				</span>
			</div>
		</header>

		<!-- Filters and Search -->
		<div class="border-b border-gray-200 bg-white px-6 py-4">
			<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
				<!-- Type Filters -->
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => (filterType = 'all')}
						class="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {filterType ===
						'all'
							? 'border-blue-600 bg-blue-600 text-white shadow-md'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
					>
						All ({mediaFiles.length})
					</button>
					<button
						onclick={() => (filterType = 'image')}
						class="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {filterType ===
						'image'
							? 'border-blue-600 bg-blue-600 text-white shadow-md'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
					>
						🖼️ Images ({mediaFiles.filter((f) => f.type === 'image').length})
					</button>
					<button
						onclick={() => (filterType = 'audio')}
						class="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {filterType ===
						'audio'
							? 'border-blue-600 bg-blue-600 text-white shadow-md'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
					>
						🎵 Audio ({mediaFiles.filter((f) => f.type === 'audio').length})
					</button>
					<button
						onclick={() => (filterType = 'video')}
						class="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {filterType ===
						'video'
							? 'border-blue-600 bg-blue-600 text-white shadow-md'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
					>
						🎥 Video ({mediaFiles.filter((f) => f.type === 'video').length})
					</button>
				</div>

				<!-- Search -->
				<div class="max-w-md flex-1">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search media files..."
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Media Grid -->
		<div class="flex-1 overflow-auto p-6">
			{#if isLoading}
				<div class="flex h-64 items-center justify-center">
					<div class="text-center">
						<div
							class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
						></div>
						<p class="text-gray-600">Loading media files...</p>
					</div>
				</div>
			{:else if filteredFiles.length === 0}
				<div class="flex h-64 items-center justify-center">
					<div class="text-center">
						<div class="mb-4 text-6xl">📁</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No media files found</h3>
						<p class="text-gray-600">
							{searchQuery || filterType !== 'all'
								? 'Try adjusting your filters or search query'
								: "This ChatGPT export doesn't contain any media files"}
						</p>
					</div>
				</div>
			{:else}
				<div
					class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					{#each filteredFiles as file (file.filename)}
						<div
							class="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
						>
							<div class="relative aspect-square bg-gray-100">
								{#if file.type === 'image'}
									<img
										src={file.url}
										alt={file.filename}
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								{:else if file.type === 'audio'}
									<div
										class="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200"
									>
										<div class="text-center">
											<div class="mb-2 text-2xl">🎵</div>
											<audio controls class="w-full max-w-xs">
												<source src={file.url} type="audio/wav" />
												Your browser does not support the audio element.
											</audio>
										</div>
									</div>
								{:else if file.type === 'video'}
									<video
										src={file.url}
										class="h-full w-full object-cover"
										controls
										preload="metadata"
									>
										Your browser does not support the video element.
									</video>
								{/if}

								<!-- Dedicated download icon positioned in corner -->
								<button
									onclick={() => downloadFile(file)}
									class="absolute top-2 right-2 transform rounded-full bg-white p-2 text-gray-700 opacity-80 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:opacity-100 hover:shadow-xl"
									title="Download file"
									aria-label="Download {file.filename}"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 10v6m0 0l-4-4m4 4l4-4m-4-8v2"
										/>
									</svg>
								</button>
							</div>

							<div class="p-3">
								<p class="truncate text-sm font-medium text-gray-900" title={file.filename}>
									{file.filename}
								</p>
								{#if file.conversationTitle}
									<p class="mt-1 truncate text-xs text-gray-500" title={file.conversationTitle}>
										from: {file.conversationTitle}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
