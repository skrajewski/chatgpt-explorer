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
			const conversation = conversations.find(c => 
				c.id === conversationId || filepath.includes(conversationId)
			);
			return conversation?.title;
		}
		
		return undefined;
	}

	function filterFiles() {
		let filtered = mediaFiles;

		// Filter by type
		if (filterType !== 'all') {
			filtered = filtered.filter(file => file.type === filterType);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(file => 
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
			case 'image': return '🖼️';
			case 'audio': return '🎵';
			case 'video': return '🎥';
			default: return '📄';
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
	<div class="w-full flex flex-col">
		<header class="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<button 
					onclick={onClose}
					class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
					title="Back to conversations"
					aria-label="Back to conversations"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
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
			<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
				<!-- Type Filters -->
				<div class="flex flex-wrap gap-2">
					<button 
						onclick={() => filterType = 'all'}
						class="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {filterType === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'}"
					>
						All ({mediaFiles.length})
					</button>
					<button 
						onclick={() => filterType = 'image'}
						class="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {filterType === 'image' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'}"
					>
						🖼️ Images ({mediaFiles.filter(f => f.type === 'image').length})
					</button>
					<button 
						onclick={() => filterType = 'audio'}
						class="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {filterType === 'audio' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'}"
					>
						🎵 Audio ({mediaFiles.filter(f => f.type === 'audio').length})
					</button>
					<button 
						onclick={() => filterType = 'video'}
						class="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {filterType === 'video' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'}"
					>
						🎥 Video ({mediaFiles.filter(f => f.type === 'video').length})
					</button>
				</div>

				<!-- Search -->
				<div class="flex-1 max-w-md">
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Search media files..."
						class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Media Grid -->
		<div class="flex-1 overflow-auto p-6">
			{#if isLoading}
				<div class="flex items-center justify-center h-64">
					<div class="text-center">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p class="text-gray-600">Loading media files...</p>
					</div>
				</div>
			{:else if filteredFiles.length === 0}
				<div class="flex items-center justify-center h-64">
					<div class="text-center">
						<div class="text-6xl mb-4">📁</div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
						<p class="text-gray-600">
							{searchQuery || filterType !== 'all' 
								? 'Try adjusting your filters or search query' 
								: 'This ChatGPT export doesn\'t contain any media files'}
						</p>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{#each filteredFiles as file (file.filename)}
						<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
							<div class="relative aspect-square bg-gray-100">
								{#if file.type === 'image'}
									<img 
										src={file.url} 
										alt={file.filename}
										class="w-full h-full object-cover"
										loading="lazy"
									/>
								{:else if file.type === 'audio'}
									<div class="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
										<div class="text-center">
											<div class="text-2xl mb-2">🎵</div>
											<audio controls class="w-full max-w-xs">
												<source src={file.url} type="audio/wav">
												Your browser does not support the audio element.
											</audio>
										</div>
									</div>
								{:else if file.type === 'video'}
									<video 
										src={file.url} 
										class="w-full h-full object-cover"
										controls
										preload="metadata"
									>
										Your browser does not support the video element.
									</video>
								{/if}
								
								<!-- Overlay with actions -->
								<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
									<button 
										onclick={() => downloadFile(file)}
										class="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
										title="Download file"
										aria-label="Download {file.filename}"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-4-8v2"/>
										</svg>
									</button>
								</div>
							</div>
							
							<div class="p-3">
								<p class="text-sm font-medium text-gray-900 truncate" title={file.filename}>
									{file.filename}
								</p>
								{#if file.conversationTitle}
									<p class="text-xs text-gray-500 truncate mt-1" title={file.conversationTitle}>
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

