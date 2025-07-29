export interface MatchResult {
	word: string;
	score: number;
	matchType: 'exact' | 'substring';
	startIndex: number;
	endIndex: number;
}

export interface TextMatch {
	text: string;
	matches: MatchResult[];
	hasMatches: boolean;
}

export class FuzzyMatcher {
	/**
	 * Check if a query matches a word using substring matching
	 */
	static isMatch(query: string, word: string): MatchResult | null {
		const queryLower = query.toLowerCase();
		const wordLower = word.toLowerCase();

		// Exact match
		if (queryLower === wordLower) {
			return {
				word,
				score: 1.0,
				matchType: 'exact',
				startIndex: 0,
				endIndex: word.length
			};
		}

		// Substring match
		const substringIndex = wordLower.indexOf(queryLower);
		if (substringIndex !== -1) {
			const score = queryLower.length / wordLower.length;
			return {
				word,
				score: score * 0.9, // Slightly lower than exact match
				matchType: 'substring',
				startIndex: substringIndex,
				endIndex: substringIndex + queryLower.length
			};
		}

		return null;
	}

	/**
	 * Find all matches of query terms in a text
	 */
	static findMatches(text: string, query: string): TextMatch {
		if (!query.trim()) {
			return { text, matches: [], hasMatches: false };
		}

		const matches: MatchResult[] = [];
		const textLower = text.toLowerCase();
		const queryLower = query.toLowerCase().trim();

		// First, try to find exact matches of the full query
		let searchIndex = 0;
		while (true) {
			const index = textLower.indexOf(queryLower, searchIndex);
			if (index === -1) break;

			matches.push({
				word: text.substring(index, index + queryLower.length),
				score: 1.0,
				matchType: 'exact',
				startIndex: index,
				endIndex: index + queryLower.length
			});

			searchIndex = index + 1;
		}

		// If no exact matches found, try individual word matching
		if (matches.length === 0) {
			const queryTerms = this.tokenizeQuery(query);
			const words = this.tokenizeText(text);

			for (const { word, startIndex, endIndex } of words) {
				for (const queryTerm of queryTerms) {
					const match = this.isMatch(queryTerm, word);
					if (match) {
						matches.push({
							...match,
							startIndex,
							endIndex
						});
						break; // Only match each word once
					}
				}
			}
		}

		return {
			text,
			matches: matches.sort((a, b) => a.startIndex - b.startIndex),
			hasMatches: matches.length > 0
		};
	}

	/**
	 * Extract words with their positions from text
	 */
	private static tokenizeText(
		text: string
	): Array<{ word: string; startIndex: number; endIndex: number }> {
		const words: Array<{ word: string; startIndex: number; endIndex: number }> = [];
		const regex = /\b\w+\b/g;
		let match;

		while ((match = regex.exec(text)) !== null) {
			words.push({
				word: match[0],
				startIndex: match.index,
				endIndex: match.index + match[0].length
			});
		}

		return words;
	}

	/**
	 * Tokenize query into search terms
	 */
	private static tokenizeQuery(query: string): string[] {
		return query
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter((word) => word.length > 0);
	}

	/**
	 * Extract smart preview with context around matches
	 */
	static extractSmartPreview(text: string, query: string, maxLength = 150): string {
		const textMatch = this.findMatches(text, query);

		if (!textMatch.hasMatches || textMatch.matches.length === 0) {
			return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
		}

		// Find the first significant match
		const firstMatch = textMatch.matches[0];
		const contextRadius = Math.floor((maxLength - firstMatch.word.length) / 2);

		let start = Math.max(0, firstMatch.startIndex - contextRadius);
		let end = Math.min(text.length, firstMatch.endIndex + contextRadius);

		// Adjust to word boundaries
		if (start > 0) {
			const spaceIndex = text.lastIndexOf(' ', start);
			if (spaceIndex !== -1 && spaceIndex > start - 20) {
				start = spaceIndex + 1;
			}
		}

		if (end < text.length) {
			const spaceIndex = text.indexOf(' ', end);
			if (spaceIndex !== -1 && spaceIndex < end + 20) {
				end = spaceIndex;
			}
		}

		let preview = text.substring(start, end);

		if (start > 0) {
			preview = '...' + preview;
		}

		if (end < text.length) {
			preview = preview + '...';
		}

		return preview;
	}
}
