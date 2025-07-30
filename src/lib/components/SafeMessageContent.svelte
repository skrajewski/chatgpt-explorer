<script lang="ts">
	import SafeHighlight from './SafeHighlight.svelte';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	interface Props {
		content: string;
		searchQuery: string;
		class?: string;
	}

	let { content, searchQuery, class: className = '' }: Props = $props();

	// Parse and format message content safely
	let formattedContent = $derived.by(() => {
		// Split content by code blocks first - handle both with and without language
		const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
		const parts = [];
		let lastIndex = 0;
		let match;

		while ((match = codeBlockRegex.exec(content)) !== null) {
			// Add text before code block
			if (match.index > lastIndex) {
				const textPart = content.slice(lastIndex, match.index);
				parts.push({ type: 'text', content: textPart });
			}

			// Add code block with language detection
			const language = match[1] || '';
			const code = match[2].trim();
			parts.push({ type: 'codeblock', content: code, language });
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < content.length) {
			parts.push({ type: 'text', content: content.slice(lastIndex) });
		}

		// If no code blocks found, treat entire content as text
		if (parts.length === 0) {
			parts.push({ type: 'text', content });
		}

		return parts;
	});

	type TableContent = { headers: string[]; rows: string[][]; alignments: string[] };
	type ParsedContent = { type: 'text'; content: string } | { type: 'table'; content: TableContent };

	// Parse markdown tables
	function parseMarkdownTable(text: string): ParsedContent[] {
		const parts: ParsedContent[] = [];
		const tableRegex = /^(\|.*\|)\s*\n(\|[-:|\s]+\|)\s*\n((?:\|.*\|\s*\n?)*)/gm;
		let lastIndex = 0;
		let match;

		while ((match = tableRegex.exec(text)) !== null) {
			// Add text before table
			if (match.index > lastIndex) {
				const textPart = text.slice(lastIndex, match.index);
				parts.push({ type: 'text', content: textPart });
			}

			// Parse table
			const headerRow = match[1];
			const separatorRow = match[2];
			const bodyRows = match[3];

			// Parse header
			const headers = headerRow
				.split('|')
				.map((cell) => cell.trim())
				.filter((cell) => cell !== '');

			// Parse alignment from separator row
			const alignments = separatorRow
				.split('|')
				.map((cell) => cell.trim())
				.filter((cell) => cell !== '')
				.map((cell) => {
					if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
					if (cell.endsWith(':')) return 'right';
					return 'left';
				});

			// Parse body rows
			const rows = bodyRows
				.trim()
				.split('\n')
				.filter((row) => row.trim() !== '')
				.map((row) =>
					row
						.split('|')
						.map((cell) => cell.trim())
						.filter((cell) => cell !== '')
				);

			parts.push({
				type: 'table',
				content: { headers, rows, alignments }
			});
			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < text.length) {
			parts.push({ type: 'text', content: text.slice(lastIndex) });
		}

		// If no tables found, treat entire text as regular text
		if (parts.length === 0) {
			parts.push({ type: 'text', content: text });
		}

		return parts;
	}

	// Function to highlight code with highlight.js
	function highlightCode(code: string, language: string): string {
		if (language && hljs.getLanguage(language)) {
			try {
				return hljs.highlight(code, { language }).value;
			} catch (error) {
				console.warn('Failed to highlight code:', error);
			}
		}

		// Auto-detect language if not specified
		try {
			const result = hljs.highlightAuto(code);
			return result.value;
		} catch (error) {
			console.warn('Failed to auto-highlight code:', error);
			return code;
		}
	}

	type InlineContent = ParsedContent | { type: 'inlinecode'; content: string };

	// Format inline text with basic markdown
	function formatInlineText(text: string): InlineContent[] {
		// First parse tables, then inline code
		const tableParts = parseMarkdownTable(text);
		const result: InlineContent[] = [];

		for (const part of tableParts) {
			if (part.type === 'table') {
				result.push(part);
			} else {
				// Handle inline code in text parts
				const inlineCodeRegex = /`([^`]+)`/g;
				const parts: InlineContent[] = [];
				let lastIndex = 0;
				let match;

				while ((match = inlineCodeRegex.exec(part.content)) !== null) {
					// Add text before inline code
					if (match.index > lastIndex) {
						const textPart = part.content.slice(lastIndex, match.index);
						parts.push({ type: 'text', content: textPart });
					}

					// Add inline code
					parts.push({ type: 'inlinecode', content: match[1] });
					lastIndex = match.index + match[0].length;
				}

				// Add remaining text
				if (lastIndex < part.content.length) {
					parts.push({ type: 'text', content: part.content.slice(lastIndex) });
				}

				// If no inline code found, treat entire text as regular text
				if (parts.length === 0) {
					parts.push({ type: 'text', content: part.content });
				}

				result.push(...parts);
			}
		}

		return result;
	}

	// Format regular text with bold/italic
	function formatRegularText(text: string): { type: string; content: string; format?: string }[] {
		// Handle bold and italic
		const formattingRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
		const parts = [];
		let lastIndex = 0;
		let match;

		while ((match = formattingRegex.exec(text)) !== null) {
			// Add text before formatting
			if (match.index > lastIndex) {
				const textPart = text.slice(lastIndex, match.index);
				parts.push({ type: 'text', content: textPart });
			}

			// Add formatted text
			if (match[2]) {
				// Bold (**text**)
				parts.push({ type: 'text', content: match[2], format: 'bold' });
			} else if (match[3]) {
				// Italic (*text*)
				parts.push({ type: 'text', content: match[3], format: 'italic' });
			}

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < text.length) {
			parts.push({ type: 'text', content: text.slice(lastIndex) });
		}

		// If no formatting found, treat entire text as regular text
		if (parts.length === 0) {
			parts.push({ type: 'text', content: text });
		}

		return parts;
	}
</script>

<div class="message-content {className}">
	{#each formattedContent as part, partIndex (partIndex)}
		{#if part.type === 'codeblock'}
			<pre class="code-block"><code class="code-block-content"
					><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html highlightCode(
						part.content,
						part.language || ''
					)}</code
				></pre>
		{:else if part.type === 'text'}
			{#each formatInlineText(part.content) as inlinePart, inlineIndex (inlineIndex)}
				{#if inlinePart.type === 'table'}
					<div class="table-container">
						<table class="markdown-table">
							<thead>
								<tr>
									{#each inlinePart.content.headers as header, headerIndex (headerIndex)}
										<th
											class="table-header"
											style="text-align: {inlinePart.content.alignments[headerIndex] || 'left'}"
										>
											<SafeHighlight text={header} query={searchQuery} />
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each inlinePart.content.rows as row, rowIndex (rowIndex)}
									<tr class="table-row">
										{#each row as cell, cellIndex (cellIndex)}
											<td
												class="table-cell"
												style="text-align: {inlinePart.content.alignments[cellIndex] || 'left'}"
											>
												<SafeHighlight text={cell} query={searchQuery} />
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if inlinePart.type === 'inlinecode'}
					<code class="inline-code">{inlinePart.content}</code>
				{:else}
					{#each formatRegularText(inlinePart.content) as textPart, textIndex (textIndex)}
						{#if textPart.format === 'bold'}
							<strong><SafeHighlight text={textPart.content} query={searchQuery} /></strong>
						{:else if textPart.format === 'italic'}
							<em><SafeHighlight text={textPart.content} query={searchQuery} /></em>
						{:else}
							{#each textPart.content.split('\n') as line, lineIndex (lineIndex)}
								{#if lineIndex > 0}<br />{/if}
								<SafeHighlight text={line} query={searchQuery} />
							{/each}
						{/if}
					{/each}
				{/if}
			{/each}
		{/if}
	{/each}
</div>

<style>
	/* Base message content styles */
	.message-content {
		word-wrap: break-word;
		overflow-wrap: break-word;
		max-width: 100%;
		line-height: 1.6;
	}

	/* Code font family - centralized for consistency */
	:root {
		--font-mono:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	/* Code block styles */
	.code-block {
		background-color: #f3f4f6;
		padding: 0.75rem;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin: 0.5rem 0;
		font-family: var(--font-mono);
	}

	.code-block-content {
		font-size: 0.875rem;
		font-family: var(--font-mono);
		white-space: break-spaces;
		word-wrap: break-word;
		overflow-wrap: break-word;
		display: block;
		width: 100%;
	}

	/* Inline code styles */
	.inline-code {
		background-color: #f3f4f6;
		padding: 0.25rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-family: var(--font-mono);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* Global word breaking for all nested content */
	.message-content :global(*) {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* Typography improvements */
	.message-content strong {
		font-weight: 600;
	}

	.message-content em {
		font-style: italic;
	}

	/* Responsive styles using Tailwind breakpoints */
	@media (max-width: 640px) {
		.code-block {
			padding: 0.5rem;
		}

		.code-block-content,
		.inline-code {
			font-size: 0.75rem;
		}

		.inline-code {
			padding: 0.125rem 0.25rem;
		}
	}

	/* Table styles */
	.table-container {
		overflow-x: auto;
		margin: 1rem 0;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
	}

	.markdown-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		background-color: #ffffff;
	}

	.table-header {
		background-color: #f9fafb;
		font-weight: 600;
		padding: 0.75rem 1rem;
		border-bottom: 2px solid #e5e7eb;
		border-right: 1px solid #e5e7eb;
		text-align: left;
	}

	.table-header:last-child {
		border-right: none;
	}

	.table-row:nth-child(even) {
		background-color: #f9fafb;
	}

	.table-cell {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
		border-right: 1px solid #e5e7eb;
		vertical-align: top;
	}

	.table-cell:last-child {
		border-right: none;
	}

	.table-row:last-child .table-cell {
		border-bottom: none;
	}

	/* Responsive table styles */
	@media (max-width: 640px) {
		.table-container {
			margin: 0.5rem 0;
		}

		.table-header,
		.table-cell {
			padding: 0.5rem;
			font-size: 0.75rem;
		}
	}

	/* Dark mode support preparation */
	@media (prefers-color-scheme: dark) {
		.code-block,
		.inline-code {
			background-color: #1f2937;
			color: #f3f4f6;
		}

		.table-container {
			border-color: #4b5563;
		}

		.markdown-table {
			background-color: #111827;
		}

		.table-header {
			background-color: #1f2937;
			border-color: #4b5563;
		}

		.table-row:nth-child(even) {
			background-color: #1f2937;
		}

		.table-cell {
			border-color: #4b5563;
		}
	}
</style>
