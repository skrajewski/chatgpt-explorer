<script lang="ts">
	interface Props {
		onFileSelected: (file: File) => void;
		onSampleDataSelected: () => void;
		isLoading?: boolean;
	}

	let { onFileSelected, onSampleDataSelected, isLoading = false }: Props = $props();

	let fileInput: HTMLInputElement;
	let isDragOver = $state(false);

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
				onFileSelected(file);
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function handleFileInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			onFileSelected(files[0]);
		}
	}
</script>

<!-- Main Content Container -->
<div class="flex h-full flex-col bg-gray-50">
	<!-- Content Area -->
	<div class="flex-1 p-8">
		<div class="mx-auto max-w-6xl">
			<div class="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Left Box: Title, Info, Privacy notes -->
				<div class="flex flex-col justify-center rounded-lg border-2 border-gray-300 bg-white p-8">
					<div class="space-y-6 text-center">
						<h1 class="text-3xl font-bold text-gray-900">ChatGPT Explorer</h1>
						<div class="space-y-4">
							<p class="text-lg text-gray-700">
								Browse and search your ChatGPT conversations offline
							</p>
							<div class="space-y-2 text-sm text-gray-600">
								<div class="flex items-center justify-center space-x-2">
									<svg
										class="h-4 w-4 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
										/>
									</svg>
									<span>100% Private - Your data never leaves your device</span>
								</div>
								<div class="flex items-center justify-center space-x-2">
									<svg
										class="h-4 w-4 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
									<span>Fast search across all conversations</span>
								</div>
								<div class="flex items-center justify-center space-x-2">
									<svg
										class="h-4 w-4 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
									<span>Export to PDF & Markdown</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Box: File Upload -->
				<div class="flex flex-col justify-center">
					<div
						role="button"
						tabindex="0"
						class="upload-area flex h-full min-h-[300px] w-full flex-col justify-center rounded-lg border-2 border-dashed p-8 text-center {isDragOver
							? 'border-blue-400 bg-blue-50'
							: 'border-gray-300 bg-gray-50'} {isLoading ? 'pointer-events-none opacity-50' : ''}"
						ondrop={handleDrop}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
					>
						{#if isLoading}
							<div class="mb-6">
								<div
									class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
								></div>
							</div>
							<div class="mb-4">
								<p class="mb-2 text-lg font-medium text-gray-900">
									Processing your ChatGPT export...
								</p>
								<div class="progress-bar-container">
									<div class="progress-bar-fill"></div>
								</div>
							</div>
							<div class="status-list">
								<div class="status-item">
									<div class="status-indicator active"></div>
									<span>Extracting ZIP file contents</span>
								</div>
								<div class="status-item">
									<div class="status-indicator active"></div>
									<span>Processing conversations and media files</span>
								</div>
								<div class="status-item">
									<div class="status-indicator inactive"></div>
									<span>Building search index</span>
								</div>
							</div>
						{:else}
							<div class="mb-4">
								<svg
									class="mx-auto h-12 w-12 text-gray-400"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
								>
									<path
										d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
							<p class="mb-2 text-lg font-medium text-gray-900">Select ZIP file or drag & drop</p>
							<p class="mb-4 text-sm text-gray-600">
								Drop your ChatGPT export file to browse conversations
							</p>

							<div class="button-group">
								<button
									type="button"
									onclick={() => fileInput.click()}
									class="upload-button primary"
								>
									Choose File
								</button>
								<button
									type="button"
									onclick={onSampleDataSelected}
									class="upload-button secondary"
								>
									Try Sample Data
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="border-t border-gray-200 bg-white py-6 text-center">
		<p class="text-sm text-gray-600">
			Built by <a
				href="https://szymonkrajewski.pl"
				class="text-blue-600 underline hover:text-blue-800"
				target="_blank">skrajewski</a
			>
		</p>
	</div>
</div>

<input bind:this={fileInput} type="file" accept=".zip" onchange={handleFileInput} class="hidden" />

<style>
	/* Progress bar styles */
	.progress-bar-container {
		width: 100%;
		background-color: #e5e7eb;
		border-radius: 9999px;
		height: 0.5rem;
	}

	.progress-bar-fill {
		background-color: #2563eb;
		height: 0.5rem;
		border-radius: 9999px;
		width: 60%;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	/* Enhanced focus and hover states */
	.upload-area {
		transition: all 0.2s ease-in-out;
	}

	.upload-area:hover {
		border-color: #60a5fa;
		background-color: #eff6ff;
	}

	.upload-area:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Loading state improvements - status indicators */
	.status-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.status-item {
		display: flex;
		align-items: center;
	}

	.status-indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		margin-right: 0.5rem;
	}

	.status-indicator.active {
		background-color: #3b82f6;
	}

	.status-indicator.inactive {
		background-color: #d1d5db;
	}

	/* Button improvements */
	.button-group {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
	}

	.upload-button {
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		min-width: 120px;
	}

	.upload-button.primary {
		background-color: #2563eb;
		color: #ffffff;
	}

	.upload-button.primary:hover {
		background-color: #1d4ed8;
	}

	.upload-button.secondary {
		background-color: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.upload-button.secondary:hover {
		background-color: #e5e7eb;
		border-color: #9ca3af;
	}

	.upload-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Responsive design */
	@media (max-width: 1024px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.upload-area {
			padding: 1.5rem;
			min-height: 200px;
		}

		.button-group {
			flex-direction: column;
			gap: 0.5rem;
		}

		.upload-button {
			min-width: auto;
			width: 100%;
		}
	}
</style>
