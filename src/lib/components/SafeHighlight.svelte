<script lang="ts">
	import { FuzzyMatcher } from '../utils/fuzzyMatch.js';

	interface Props {
		text: string;
		query: string;
		class?: string;
	}

	let { text, query, class: className = '' }: Props = $props();

	// Enhanced text parts with fuzzy matching support
	let textParts = $derived.by(() => {
		if (!query.trim()) {
			return [{ text, highlight: false, matchType: 'none' as const }];
		}

		const matchResult = FuzzyMatcher.findMatches(text, query);

		if (!matchResult.hasMatches) {
			return [{ text, highlight: false, matchType: 'none' as const }];
		}

		// Sort matches by start index
		const sortedMatches = [...matchResult.matches].sort((a, b) => a.startIndex - b.startIndex);

		const parts: Array<{
			text: string;
			highlight: boolean;
			matchType: 'exact' | 'substring' | 'fuzzy' | 'none';
		}> = [];
		let currentIndex = 0;

		for (const match of sortedMatches) {
			// Add non-highlighted text before this match
			if (currentIndex < match.startIndex) {
				parts.push({
					text: text.substring(currentIndex, match.startIndex),
					highlight: false,
					matchType: 'none'
				});
			}

			// Add the highlighted match
			parts.push({
				text: text.substring(match.startIndex, match.endIndex),
				highlight: true,
				matchType: match.matchType
			});

			currentIndex = match.endIndex;
		}

		// Add remaining non-highlighted text
		if (currentIndex < text.length) {
			parts.push({
				text: text.substring(currentIndex),
				highlight: false,
				matchType: 'none'
			});
		}

		return parts;
	});
</script>

<span class={className}>
	{#each textParts as part, partIndex (partIndex)}
		{#if part.highlight}
			<mark class="highlight-mark {part.matchType === 'exact' ? 'exact-match' : 'fuzzy-match'}">
				{part.text}
			</mark>
		{:else}
			{part.text}
		{/if}
	{/each}
</span>

<style>
	.highlight-mark {
		padding: 0 0.25rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.exact-match {
		background-color: #fef3c7;
		color: #92400e;
	}

	.fuzzy-match {
		background-color: #fed7aa;
		color: #c2410c;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.exact-match {
			background-color: #d97706;
			color: #fef3c7;
		}

		.fuzzy-match {
			background-color: #ea580c;
			color: #fed7aa;
		}
	}
</style>
