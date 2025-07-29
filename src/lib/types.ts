export interface MessagePart {
	type?: string;
	text?: string;
	image_url?: {
		url: string;
		detail?: string;
	};
	asset_pointer?: string;
}

export interface Message {
	id: string;
	author: {
		role: 'user' | 'assistant' | 'system';
		name?: string;
		metadata?: Record<string, unknown>;
	};
	content: {
		content_type: string;
		parts: (string | MessagePart)[];
	};
	create_time: number;
	status?: string;
	end_turn?: boolean;
	weight?: number;
	metadata?: Record<string, unknown>;
}

export interface ConversationNode {
	id: string;
	message?: Message;
	parent?: string;
	children: string[];
}

export interface Conversation {
	id: string;
	title: string;
	create_time: number;
	update_time: number;
	mapping: Record<string, ConversationNode>;
	conversation_id?: string;
	current_node?: string;
	gizmo_id?: string;
	is_archived?: boolean;
}

export interface ProcessedConversation {
	id: string;
	title: string;
	create_time: number;
	messages: Message[];
	preview: string;
}

export interface SearchResultMetadata {
	totalMatches: number;
	query: string;
	matchingConversations: number;
}

export interface AppState {
	conversations: ProcessedConversation[];
	searchResults: ProcessedConversation[];
	selectedConversation: ProcessedConversation | null;
	searchQuery: string;
	searchMetadata: SearchResultMetadata | null;
	isLoading: boolean;
	error: string | null;
}
