<script lang="ts">
	import type { SearchResultMetadata } from '../types.js';

	interface Props {
		searchMetadata: SearchResultMetadata | null;
		currentMatchIndex: number;
		totalMatchPositions: number;
		class?: string;
	}

	let {
		searchMetadata,
		currentMatchIndex,
		totalMatchPositions,
		class: className = ''
	}: Props = $props();

	let displayText = $derived.by(() => {
		if (!searchMetadata || !searchMetadata.query.trim()) {
			return '';
		}

		if (totalMatchPositions === 0) {
			return `No matches for "${searchMetadata.query}"`;
		}

		if (totalMatchPositions === 1) {
			return `1 match in ${searchMetadata.matchingConversations} conversation${searchMetadata.matchingConversations !== 1 ? 's' : ''}`;
		}

		const currentDisplay =
			currentMatchIndex >= 0 ? ` (${currentMatchIndex + 1} of ${totalMatchPositions})` : '';
		return `${totalMatchPositions} matches in ${searchMetadata.matchingConversations} conversation${searchMetadata.matchingConversations !== 1 ? 's' : ''}${currentDisplay}`;
	});

	let hasMatches = $derived(searchMetadata && searchMetadata.totalMatches > 0);
</script>

<div class={`flex items-center text-sm ${className}`}>
	{#if searchMetadata && searchMetadata.query.trim()}
		<div class="flex items-center space-x-2">
			{#if hasMatches}
				<div class="flex items-center space-x-1">
					<svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="font-medium text-green-700">
						{displayText}
					</span>
				</div>
			{:else}
				<div class="flex items-center space-x-1">
					<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<span class="text-gray-500">
						{displayText}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>
