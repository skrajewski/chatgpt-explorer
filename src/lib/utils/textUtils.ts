/**
 * Safely escapes HTML content to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Safely highlights search matches in text
 */
export function highlightMatches(text: string, query: string): string {
	if (!query.trim()) {
		return escapeHtml(text);
	}

	// Escape the text first
	const escapedText = escapeHtml(text);

	const searchTerms = query
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 0);

	let highlightedText = escapedText;

	// Sort terms by length (longest first) to avoid partial matches
	searchTerms.sort((a, b) => b.length - a.length);

	searchTerms.forEach((term) => {
		const escapedTerm = escapeRegex(term);
		const regex = new RegExp(`(${escapedTerm})`, 'gi');
		highlightedText = highlightedText.replace(
			regex,
			'<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
		);
	});

	return highlightedText;
}

/**
 * Escapes regex special characters
 */
function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats message content with basic markdown-like formatting (safely)
 */
export function formatMessageContent(content: string): string {
	// Escape HTML first
	let formatted = escapeHtml(content);

	// Apply safe formatting
	formatted = formatted
		// Bold
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		// Italic
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		// Inline code
		.replace(
			/`(.*?)`/g,
			'<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
		)
		// Line breaks
		.replace(/\n/g, '<br>');

	// Handle code blocks
	formatted = formatted.replace(
		/```([\s\S]*?)```/g,
		(match, code) =>
			`<pre class="bg-gray-100 p-3 rounded-md overflow-x-auto"><code class="text-sm font-mono whitespace-pre">${code.trim()}</code></pre>`
	);

	return formatted;
}
