import JSZip from 'jszip';
import type { Conversation, ProcessedConversation, Message, ConversationNode, MessagePart } from '../types.js';

export class FileProcessor {
	private mediaFiles = new Map<string, string>();

	async processZipFile(file: File): Promise<ProcessedConversation[]> {
		const zip = new JSZip();
		const zipContent = await zip.loadAsync(file);

		// Extract conversations.json
		const conversationsFile = zipContent.file('conversations.json');
		if (!conversationsFile) {
			throw new Error('conversations.json not found in ZIP file');
		}

		const conversationsText = await conversationsFile.async('text');
		const conversations: Conversation[] = JSON.parse(conversationsText);

		// Process media files
		await this.processMediaFiles(zipContent);

		// Process conversations
		return conversations
			.map((conv) => this.processConversation(conv))
			.filter((conv) => conv !== null) as ProcessedConversation[];
	}

	private async processMediaFiles(zipContent: JSZip) {
		// Process all files for media references
		zipContent.forEach(async (relativePath, file) => {
			if (!file.dir && this.isMediaFile(relativePath)) {
				try {
					const blob = await file.async('blob');
					const url = URL.createObjectURL(blob);
					this.mediaFiles.set(relativePath, url);
				} catch (error) {
					console.warn(`Failed to process media file ${relativePath}:`, error);
				}
			}
		});
	}

	private isMediaFile(path: string): boolean {
		const mediaExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.wav', '.mp3', '.mp4'];
		return mediaExtensions.some((ext) => path.toLowerCase().endsWith(ext));
	}

	private processConversation(conversation: Conversation): ProcessedConversation | null {
		try {
			const messages = this.extractMessages(conversation);
			if (messages.length === 0) {
				return null;
			}

			const preview = this.generatePreview(messages);

			return {
				id: conversation.id,
				title: conversation.title || 'Untitled Conversation',
				create_time: conversation.create_time,
				messages,
				preview
			};
		} catch (error) {
			console.warn(`Failed to process conversation ${conversation.id}:`, error);
			return null;
		}
	}

	private extractMessages(conversation: Conversation): Message[] {
		const messages: Message[] = [];
		const visited = new Set<string>();

		// Find the root message (one without a parent or with null parent)
		const nodes = Object.values(conversation.mapping);
		const rootNode = nodes.find((node) => !node.parent || node.parent === null);

		if (!rootNode) {
			return messages;
		}

		// Traverse the conversation tree depth-first
		this.traverseConversation(rootNode, conversation.mapping, messages, visited);

		return messages.filter(
			(msg) =>
				msg &&
				msg.content &&
				msg.content.parts &&
				Array.isArray(msg.content.parts) &&
				msg.content.parts.length > 0 &&
				this.hasValidContent(msg.content.parts) &&
				msg.author &&
				msg.author.role !== 'system'
		);
	}

	private traverseConversation(
		node: ConversationNode,
		mapping: Record<string, ConversationNode>,
		messages: Message[],
		visited: Set<string>
	) {
		if (visited.has(node.id)) {
			return;
		}

		visited.add(node.id);

		if (node.message) {
			messages.push(node.message);
		}

		// Process children in order
		for (const childId of node.children) {
			const childNode = mapping[childId];
			if (childNode) {
				this.traverseConversation(childNode, mapping, messages, visited);
			}
		}
	}

	private hasValidContent(parts: (string | MessagePart)[]): boolean {
		return parts.some(part => {
			if (typeof part === 'string') {
				return part.trim() !== '';
			} else if (part && typeof part === 'object') {
				return part.text?.trim() !== '' || part.image_url || part.asset_pointer;
			}
			return false;
		});
	}

	private extractTextFromParts(parts: (string | MessagePart)[]): string {
		for (const part of parts) {
			if (typeof part === 'string' && part.trim() !== '') {
				return part;
			} else if (part && typeof part === 'object' && part.text?.trim() !== '') {
				return part.text!;
			}
		}
		
		// If no text found, check if there are images
		const hasImage = parts.some(part => 
			part && typeof part === 'object' && (part.image_url || part.asset_pointer)
		);
		
		return hasImage ? '[Image]' : '';
	}

	private generatePreview(messages: Message[]): string {
		const firstUserMessage = messages.find((msg) => 
			msg && 
			msg.author && 
			msg.author.role === 'user'
		);
		if (
			firstUserMessage &&
			firstUserMessage.content &&
			firstUserMessage.content.parts &&
			Array.isArray(firstUserMessage.content.parts) &&
			firstUserMessage.content.parts.length > 0
		) {
			const text = this.extractTextFromParts(firstUserMessage.content.parts);
			if (text && text.length > 0) {
				return text.length > 100 ? text.substring(0, 100) + '...' : text;
			}
		}
		return 'No preview available';
	}

	getMediaUrl(filename: string): string | null {
		// First try direct lookup
		let url = this.mediaFiles.get(filename);
		if (url) {
			return url;
		}
		
		// Handle file-service:// URL format - extract the actual file ID
		let searchId = filename;
		if (filename.startsWith('file-service://file-')) {
			searchId = filename.replace('file-service://file-', 'file-');
		}
		
		// If not found, try to find by asset pointer pattern
		// Asset pointers are in format like "file-RJiWp9Hf7HoSUkwrarjCia"
		// Actual files are named like "file-RJiWp9Hf7HoSUkwrarjCia-WhatsApp Image 2025-03-11 at 11.56.16.jpeg"
		for (const [filepath, blobUrl] of this.mediaFiles.entries()) {
			// Extract the base filename to compare with asset pointer
			const baseName = filepath.split('/').pop() || '';
			if (baseName.startsWith(searchId + '-')) {
				return blobUrl;
			}
		}
		
		return null;
	}

	getAllMediaFiles(): Map<string, string> {
		return new Map(this.mediaFiles);
	}

	addMediaFile(path: string, url: string) {
		this.mediaFiles.set(path, url);
	}

	cleanup() {
		// Cleanup blob URLs to free memory
		for (const url of this.mediaFiles.values()) {
			URL.revokeObjectURL(url);
		}
		this.mediaFiles.clear();
	}
}
