<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();
	let modalElement: HTMLDivElement | undefined;

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	// Focus the modal when it opens to ensure keyboard events work
	$effect(() => {
		if (isOpen && modalElement) {
			modalElement.focus();
		}
	});
</script>

{#if isOpen}
	<!-- Modal overlay -->
	<div
		bind:this={modalElement}
		class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="help-title"
		tabindex="-1"
	>
		<!-- Modal content -->
		<div
			class="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-200 p-6">
				<h2 id="help-title" class="text-xl font-semibold text-gray-900">Help & Instructions</h2>
				<button
					type="button"
					onclick={onClose}
					class="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Close help modal"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="space-y-6 p-6">
				<section>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Getting Started</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<p>
							<strong>1. Load your ChatGPT data:</strong> Upload a ZIP file exported from ChatGPT or
							use sample data to explore the interface.
						</p>
						<p>
							<strong>2. Search conversations:</strong> Use the search bar in the sidebar to find specific
							conversations or messages.
						</p>
						<p>
							<strong>3. Browse conversations:</strong> Click on any conversation in the sidebar to view
							its messages.
						</p>
						<p>
							<strong>4. View media:</strong> Click "View Media Library" to see all images from your
							conversations.
						</p>
					</div>
				</section>

				<section>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Search Features</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<p>
							<strong>Full-text search:</strong> Search through all conversation titles and message content.
						</p>
						<p><strong>Real-time results:</strong> See search results as you type.</p>
						<p>
							<strong>Highlighted matches:</strong> Search terms are highlighted in results and message
							content.
						</p>
					</div>
				</section>

				<section>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Navigation</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<p>
							<strong>Conversations view:</strong> Browse and search through all your conversations.
						</p>
						<p>
							<strong>Media Library:</strong> View all images from your conversations in a grid layout.
						</p>
						<p>
							<strong>Virtual scrolling:</strong> Efficiently handles large numbers of conversations.
						</p>
					</div>
				</section>

				<section>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Data Management</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<p>
							<strong>Clear Data:</strong> Use the "Clear Data" button to remove all loaded conversations
							and start fresh.
						</p>
						<p>
							<strong>Privacy:</strong> All data processing happens locally in your browser - nothing
							is sent to external servers.
						</p>
						<p>
							<strong>File Support:</strong> Supports ChatGPT export ZIP files with conversations and
							media attachments.
						</p>
					</div>
				</section>

				<section>
					<h3 class="mb-3 text-lg font-medium text-gray-900">Tips</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<p>• Use the search bar to quickly find specific topics or conversations</p>
						<p>• Click on conversation titles to jump between different discussions</p>
						<p>• The media library is great for reviewing shared images and attachments</p>
						<p>• All search results show match counts and preview snippets</p>
					</div>
				</section>
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
				<div class="flex justify-end">
					<button
						type="button"
						onclick={onClose}
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						Got it
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		background-color: rgba(0, 0, 0, 0.7);
	}
</style>
