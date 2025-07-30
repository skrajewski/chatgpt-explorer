<script lang="ts">
	import type { ProcessedConversation } from '../types.js';
	import type { FileProcessor } from '../services/fileProcessor.js';
	import { ExportService } from '../services/exportService.js';
	import SafeHighlight from './SafeHighlight.svelte';
	import SafeMessageContent from './SafeMessageContent.svelte';

	interface Props {
		conversation: ProcessedConversation | null;
		searchQuery: string;
		fileProcessor: FileProcessor;
	}

	let { conversation, searchQuery, fileProcessor }: Props = $props();

	let messagesContainer = $state<HTMLDivElement>();
	let isExporting = $state(false);

	const exportService = new ExportService();

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	// Auto-scroll to top when conversation changes
	$effect(() => {
		if (messagesContainer && conversation) {
			messagesContainer.scrollTop = 0;
		}
	});

	// Export functions
	async function handleExportMarkdown() {
		if (!conversation) return;
		
		isExporting = true;
		try {
			await exportService.exportToMarkdown(conversation);
		} catch (error) {
			console.error('Error exporting to Markdown:', error);
		} finally {
			isExporting = false;
		}
	}

	async function handleExportPDF() {
		if (!conversation) return;
		
		isExporting = true;
		try {
			// Try to export with styling using the messages container
			const exportElement = messagesContainer?.parentElement || undefined;
			await exportService.exportToPDF(conversation, exportElement);
		} catch (error) {
			console.error('Error exporting to PDF:', error);
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="flex h-full flex-col bg-white">
	{#if conversation}
		<!-- Header -->
		<header class="border-b border-gray-200 bg-white px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="min-w-0 flex-1">
					<h1 class="truncate text-lg font-semibold text-gray-900">
						<SafeHighlight text={conversation.title} query={searchQuery} />
					</h1>
					<p class="mt-1 text-sm text-gray-500">
						{formatTimestamp(conversation.create_time)} • {conversation.messages.length} messages
					</p>
				</div>
				
				<!-- Export Actions -->
				<div class="flex items-center gap-2 ml-4">
					<button
						type="button"
						onclick={handleExportMarkdown}
						disabled={isExporting}
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						title="Export conversation to Markdown"
					>
						{#if isExporting}
							<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
							</svg>
						{:else}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
							</svg>
						{/if}
						Markdown
					</button>
					
					<button
						type="button"
						onclick={handleExportPDF}
						disabled={isExporting}
						class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						title="Export conversation to PDF"
					>
						{#if isExporting}
							<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
							</svg>
						{:else}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
							</svg>
						{/if}
						PDF
					</button>
				</div>
			</div>
		</header>

		<!-- Messages -->
		<div bind:this={messagesContainer} class="messages-container">
			<div class="messages-list">
				{#each conversation.messages as message (message.id)}
					<div class="message-wrapper" class:user-message={message.author.role === 'user'}>
						<div
							class="message-content-wrapper"
							class:user-content={message.author.role === 'user'}
						>
							<!-- Avatar -->
							<div class="message-avatar">
								<div class="avatar-circle" class:user-avatar={message.author.role === 'user'}>
									<span class="avatar-text">
										{message.author.role === 'user' ? 'U' : 'A'}
									</span>
								</div>
							</div>

							<!-- Message Content -->
							<div class="message-container" class:user-container={message.author.role === 'user'}>
								<div class="message-meta" class:user-meta={message.author.role === 'user'}>
									<span class="author-name">
										{message.author.role === 'user' ? 'You' : 'Assistant'}
									</span>
									<span class="message-timestamp">
										{formatTimestamp(message.create_time)}
									</span>
								</div>
								<div class="message-bubble" class:user-bubble={message.author.role === 'user'}>
									{#each message.content.parts as part, partIndex (partIndex)}
										{#if typeof part === 'string'}
											<SafeMessageContent
												content={part}
												{searchQuery}
												class="message-prose {message.author.role === 'user'
													? 'message-prose-invert'
													: ''}"
											/>
										{:else if part && typeof part === 'object'}
											{#if part.text}
												<SafeMessageContent
													content={part.text}
													{searchQuery}
													class="message-prose {message.author.role === 'user'
														? 'message-prose-invert'
														: ''}"
												/>
											{/if}
											{#if part.image_url?.url}
												<div class="image-container">
													<img 
														src={part.image_url.url} 
														alt=""
														class="message-image"
														loading="lazy"
													/>
												</div>
											{:else if part.image_url && typeof part.image_url === 'string'}
												{#if fileProcessor.getMediaUrl(part.image_url)}
													<div class="image-container">
														<img 
															src={fileProcessor.getMediaUrl(part.image_url)} 
															alt=""
															class="message-image"
															loading="lazy"
														/>
													</div>
												{:else}
													<div class="image-container">
														<div class="image-placeholder">
															<span class="image-placeholder-text">[Image: {part.image_url}]</span>
														</div>
													</div>
												{/if}
											{:else if part.asset_pointer}
												{#if fileProcessor.getMediaUrl(part.asset_pointer)}
													<div class="image-container">
														<img 
															src={fileProcessor.getMediaUrl(part.asset_pointer)} 
															alt=""
															class="message-image"
															loading="lazy"
														/>
													</div>
												{:else}
													<div class="image-container">
														<div class="image-placeholder">
															<span class="image-placeholder-text">[Image: {part.asset_pointer}]</span>
														</div>
													</div>
												{/if}
											{/if}
										{/if}
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Empty State -->
		<div class="flex h-full items-center justify-center p-6">
			<div class="text-center">
				<div class="mb-4">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900">Select a conversation</h3>
				<p class="mt-2 text-sm text-gray-500">
					Choose a conversation from the sidebar to view its messages
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Messages container */
	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.messages-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Message layout */
	.message-wrapper {
		display: flex;
		justify-content: flex-start;
	}

	.message-wrapper.user-message {
		justify-content: flex-end;
	}

	.message-content-wrapper {
		display: flex;
		max-width: 48rem;
		gap: 0.75rem;
	}

	.message-content-wrapper.user-content {
		flex-direction: row-reverse;
	}

	/* Avatar styles */
	.message-avatar {
		flex-shrink: 0;
	}

	.avatar-circle {
		display: flex;
		height: 2rem;
		width: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background-color: #059669;
	}

	.avatar-circle.user-avatar {
		background-color: #2563eb;
	}

	.avatar-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: #ffffff;
	}

	/* Message content */
	.message-container {
		flex: 1;
		margin-left: 0.75rem;
	}

	.message-container.user-container {
		margin-left: 0;
		margin-right: 0.75rem;
	}

	.message-meta {
		display: flex;
		align-items: center;
		margin-bottom: 0.25rem;
		justify-content: flex-start;
	}

	.message-meta.user-meta {
		justify-content: flex-end;
	}

	.author-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}

	.message-timestamp {
		margin-left: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	/* Message bubble */
	.message-bubble {
		border-radius: 0.5rem;
		padding: 1rem 1rem;
		background-color: #f3f4f6;
		color: #111827;
	}

	.message-bubble.user-bubble {
		background-color: #2563eb;
		color: #ffffff;
	}

	/* Image styles */
	.image-container {
		margin: 0.5rem 0;
	}

	.message-image {
		max-width: 100%;
		height: auto;
		border-radius: 0.375rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
	}

	.image-placeholder {
		background-color: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.375rem;
		padding: 1rem;
		text-align: center;
	}

	.image-placeholder-text {
		color: #6b7280;
		font-style: italic;
		font-size: 0.875rem;
	}

	/* Prose styling improvements */
	:global(.message-prose) {
		font-size: 0.875rem;
		max-width: none;
	}

	:global(.message-prose code) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	:global(.message-prose pre) {
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.75rem;
		border-radius: 0.375rem;
		overflow-x: auto;
	}

	:global(.message-prose pre code) {
		background-color: transparent;
		padding: 0;
		border-radius: 0;
		font-size: 0.875rem;
		white-space: pre;
	}

	/* Inverted prose for user messages */
	:global(.message-prose-invert code) {
		background-color: rgba(255, 255, 255, 0.2);
		color: #333;
	}

	:global(.message-prose-invert pre) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	:global(.message-prose-invert pre code) {
		color: #333;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.messages-container {
			padding: 1rem;
		}

		.messages-list {
			gap: 1rem;
		}

		.message-content-wrapper {
			max-width: 100%;
		}

		.avatar-circle {
			height: 1.5rem;
			width: 1.5rem;
		}

		.avatar-text {
			font-size: 0.75rem;
		}

		.message-bubble {
			padding: 0.75rem;
		}
	}
</style>
