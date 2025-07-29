import type { ProcessedConversation, SearchResultMetadata, MessagePart } from '../types.js';
import { FuzzyMatcher } from '../utils/fuzzyMatch.js';

export class SearchService {
	private searchIndex = new Map<string, Set<string>>();

	private extractTextFromPart(part: string | MessagePart): string {
		if (typeof part === 'string') {
			return part;
		} else if (part && typeof part === 'object' && part.text) {
			return part.text;
		}
		return '';
	}
	private conversations: ProcessedConversation[] = [];

	buildIndex(conversations: ProcessedConversation[]) {
		this.conversations = conversations;
		this.searchIndex.clear();

		conversations.forEach((conversation) => {
			const words = this.extractWords(conversation);
			words.forEach((word) => {
				if (!this.searchIndex.has(word)) {
					this.searchIndex.set(word, new Set());
				}
				this.searchIndex.get(word)!.add(conversation.id);
			});
		});
	}

	search(query: string): ProcessedConversation[] {
		if (!query.trim()) {
			return this.conversations;
		}

		const searchResult = this.searchWithMetadata(query);
		return searchResult.conversations;
	}

	searchWithMetadata(query: string): {
		conversations: ProcessedConversation[];
		metadata: SearchResultMetadata;
	} {
		if (!query.trim()) {
			return {
				conversations: this.conversations,
				metadata: {
					totalMatches: 0,
					query: '',
					matchingConversations: 0
				}
			};
		}

		const searchTerms = this.tokenizeQuery(query);
		if (searchTerms.length === 0) {
			return {
				conversations: this.conversations,
				metadata: {
					totalMatches: 0,
					query: '',
					matchingConversations: 0
				}
			};
		}

		// Enhanced search with fuzzy matching
		const matchedConversations = this.findMatchingConversations(searchTerms);

		// Sort by relevance score (highest first), then by creation time
		const sortedResults = matchedConversations.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return b.conversation.create_time - a.conversation.create_time;
		});

		const conversations = sortedResults.map((result) => result.conversation);
		const totalMatches = sortedResults.reduce((sum, result) => sum + result.matchCount, 0);

		return {
			conversations,
			metadata: {
				totalMatches,
				query,
				matchingConversations: conversations.length
			}
		};
	}

	private findMatchingConversations(searchTerms: string[]): Array<{
		conversation: ProcessedConversation;
		score: number;
		matchCount: number;
	}> {
		const conversationMatches = new Map<
			string,
			{
				conversation: ProcessedConversation;
				scores: number[];
				matchCount: number;
			}
		>();

		// For each search term, find conversations that contain it
		for (const term of searchTerms) {
			// Direct text search in all conversations
			for (const conversation of this.conversations) {
				const matchResult = this.calculateConversationMatch(conversation, term);

				if (matchResult.score > 0) {
					if (!conversationMatches.has(conversation.id)) {
						conversationMatches.set(conversation.id, {
							conversation,
							scores: [],
							matchCount: 0
						});
					}

					const entry = conversationMatches.get(conversation.id)!;
					entry.scores.push(matchResult.score);
					entry.matchCount += matchResult.matchCount;
				}
			}
		}

		// Only return conversations that match ALL search terms
		const validMatches = Array.from(conversationMatches.values()).filter(
			(entry) => entry.scores.length === searchTerms.length
		);

		// Convert to final format with combined scores
		return validMatches.map((entry) => ({
			conversation: entry.conversation,
			score: entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length,
			matchCount: entry.matchCount
		}));
	}

	private calculateConversationMatch(
		conversation: ProcessedConversation,
		query: string
	): {
		score: number;
		matchCount: number;
	} {
		let totalScore = 0;
		let matchCount = 0;

		// Check title matches (higher weight)
		const titleMatch = FuzzyMatcher.findMatches(conversation.title, query);
		if (titleMatch.hasMatches) {
			const titleScore = titleMatch.matches.reduce((sum, match) => sum + match.score, 0);
			totalScore += titleScore * 2; // Title matches are more important
			matchCount += titleMatch.matches.length;
		}

		// Check message content matches
		for (const message of conversation.messages) {
			for (const part of message.content.parts) {
				const text = this.extractTextFromPart(part);
				if (text) {
					const contentMatch = FuzzyMatcher.findMatches(text, query);
					if (contentMatch.hasMatches) {
						const contentScore = contentMatch.matches.reduce((sum, match) => sum + match.score, 0);
						totalScore += contentScore;
						matchCount += contentMatch.matches.length;
					}
				}
			}
		}

		return {
			score: totalScore,
			matchCount
		};
	}

	/**
	 * Generate smart preview for conversation based on search query
	 */
	generateSmartPreview(conversation: ProcessedConversation, query: string): string {
		if (!query.trim()) {
			return conversation.preview;
		}

		// Try to find matches in title first
		const titleMatch = FuzzyMatcher.findMatches(conversation.title, query);
		if (titleMatch.hasMatches) {
			return FuzzyMatcher.extractSmartPreview(conversation.title, query, 150);
		}

		// Look for matches in message content
		for (const message of conversation.messages) {
			for (const part of message.content.parts) {
				const text = this.extractTextFromPart(part);
				if (text) {
					const contentMatch = FuzzyMatcher.findMatches(text, query);
					if (contentMatch.hasMatches) {
						return FuzzyMatcher.extractSmartPreview(text, query, 150);
					}
				}
			}
		}

		// Fallback to original preview
		return conversation.preview;
	}

	highlightMatches(text: string): string {
		// This method is deprecated - use FuzzyMatcher.findMatches instead
		return text;
	}

	private extractWords(conversation: ProcessedConversation): string[] {
		const words = new Set<string>();

		// Add words from title
		this.tokenize(conversation.title).forEach((word) => words.add(word));

		// Add words from messages
		conversation.messages.forEach((message) => {
			message.content.parts.forEach((part) => {
				const text = this.extractTextFromPart(part);
				if (text) {
					this.tokenize(text).forEach((word) => words.add(word));
				}
			});
		});

		return Array.from(words);
	}

	private tokenize(text: string): string[] {
		return text
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter((word) => word.length > 2); // Filter out very short words
	}

	private tokenizeQuery(query: string): string[] {
		return query
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter((word) => word.length > 0);
	}

	private escapeRegex(text: string): string {
		return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
