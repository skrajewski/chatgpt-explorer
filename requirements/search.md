# Search Function Requirements

## Overview

The search functionality in ChatGPT Explorer provides real-time search capabilities across all imported conversation data with enhanced matching, highlighting, and navigation features.

## Core Search Requirements

### 1. Search Input & Processing

#### 1.1 Search Interface

- **Real-time search**: Search results update as the user types
- **Search input field**: Located in the conversation list sidebar
- **Auto-focus**: Search input receives focus when conversations are loaded
- **Placeholder text**: "Search conversations..."
- **Clear visual indicators**: Search icon in input field

#### 1.2 Query Processing

- **Case-insensitive matching**: All searches ignore case differences
- **Whitespace handling**: Leading/trailing whitespace is trimmed
- **Empty query handling**: Empty queries return all conversations
- **Multi-word support**: Queries can contain multiple words separated by spaces

### 2. Matching Algorithm

#### 2.1 Matching Types

1. **Exact Phrase Matching** (Highest Priority)
   - First attempts to find the complete query as a substring
   - Example: `"Jan Kowal"` matches `"Jan Kowalski"` as substring
   - Highlighted in **yellow** (`bg-yellow-200`)

2. **Individual Word Matching** (Fallback)
   - If no phrase matches found, searches for individual words
   - Each word in the query must be found somewhere in the conversation
   - Substring matching within words (e.g., `"newsl"` matches `"newsletter"`)
   - Highlighted in **orange** (`bg-orange-200`)

#### 2.2 Matching Scope

- **Conversation titles**: Weighted 2x higher than message content
- **Message content**: All message parts are searched
- **All message roles**: Searches user, assistant, and system messages
- **No file content**: Does not search file attachments or media

#### 2.3 Excluded Approaches

- **No Levenshtein distance**: Fuzzy matching based on edit distance is explicitly disabled
- **No phonetic matching**: No soundex or similar algorithms
- **No stemming**: No word root matching

### 3. Search Results & Ranking

#### 3.1 Result Filtering

- **AND logic**: All search terms must be present in a conversation
- **No partial term matching**: Each complete search term must be found
- **Score-based ranking**: Results sorted by relevance score then creation date

#### 3.2 Scoring Algorithm

```
Title Match Score = (match_score * 2.0)
Content Match Score = (match_score * 1.0)
Total Score = (Title Score + Content Score) / number_of_terms
```

#### 3.3 Result Ordering

1. **Primary**: Relevance score (highest first)
2. **Secondary**: Creation date (newest first)

### 4. Smart Previews

#### 4.1 Preview Generation

- **Context-aware**: Shows text snippets containing search matches
- **Length limit**: Maximum 150 characters
- **Smart truncation**: Adjusts to word boundaries when possible
- **Ellipsis indicators**: Shows "..." for truncated content

#### 4.2 Preview Priority

1. **Title matches**: If query matches conversation title
2. **First content match**: First message part containing the query
3. **Fallback**: Original conversation preview (first 100 chars)

#### 4.3 Context Radius

- **Balanced context**: Shows text before and after match
- **Contextual adjustment**: Adapts context size based on match length
- **Word boundary respect**: Avoids cutting words when possible

### 5. Visual Highlighting

#### 5.1 Highlight Types

- **Exact matches**: Yellow background (`bg-yellow-200`)
- **Substring matches**: Orange background (`bg-orange-200`)
- **Styling**: Rounded corners (`rounded`), padding (`px-1`)

#### 5.2 Highlight Locations

- **Conversation titles**: In sidebar list
- **Conversation previews**: In sidebar list
- **Message content**: In message viewer
- **Header title**: In message viewer header

#### 5.3 Highlight Behavior

- **Multiple matches**: All occurrences highlighted
- **Overlapping prevention**: Non-overlapping highlight regions
- **Accessibility**: High contrast ratios maintained

### 6. Search Statistics

#### 6.1 Match Counter

- **Display format**: "X matches in Y conversations"
- **Location**: Sidebar footer only
- **No matches state**: "No matches for 'query'"
- **Statistics only**: Shows count information without navigation capabilities

#### 6.2 Auto-scroll Behavior

- **Simple scroll**: Auto-scroll to bottom when conversation opened
- **No match navigation**: No automatic scrolling to specific matches
- **Standard behavior**: Maintains normal conversation viewing experience

### 7. Search State Management

#### 7.1 Application State

```typescript
interface AppState {
	searchQuery: string; // Current search input
	searchMetadata: SearchResultMetadata; // Search statistics
	searchResults: ProcessedConversation[]; // Filtered conversation list
}
```

#### 7.2 Search Metadata

```typescript
interface SearchResultMetadata {
	totalMatches: number; // Total matches across all conversations
	query: string; // Search query used
	matchingConversations: number; // Number of conversations with matches
}
```

### 8. Performance Requirements

#### 8.1 Search Performance

- **Real-time response**: Results update within 100ms of typing
- **Large datasets**: Support for 1000+ conversations
- **Memory efficiency**: Reasonable memory usage for search indexing
- **No blocking**: UI remains responsive during search operations

#### 8.2 Indexing Strategy

- **Word-based index**: Pre-built index of words to conversation IDs
- **Lazy evaluation**: Full text search performed on-demand
- **Memory trade-off**: Balances index size vs. search speed

### 9. User Experience Requirements

#### 9.1 Visual Feedback

- **Loading states**: No explicit loading states (fast enough)
- **Result counts**: Always show number of results
- **Empty states**: Clear messaging when no matches found
- **Match indicators**: Visual highlighting of all matches

#### 9.2 Interaction Patterns

- **Immediate feedback**: Results update as user types
- **Simple interaction**: Focus on search and highlighting only
- **Consistent behavior**: Predictable search results

#### 9.3 Accessibility

- **Screen reader support**: Proper semantic markup for search results
- **Keyboard accessibility**: Standard keyboard interaction for search input
- **High contrast**: Sufficient color contrast for highlights
- **Focus management**: Focus on search input when loaded

### 10. Integration Requirements

#### 10.1 Component Architecture

- **SearchService**: Core search logic and indexing
- **FuzzyMatcher**: Text matching utilities
- **SafeHighlight**: Text highlighting component
- **MatchCounter**: Search statistics display

#### 10.2 Data Flow

1. User types in search input
2. App.svelte calls SearchService.searchWithMetadata()
3. SearchService performs text matching using FuzzyMatcher
4. Results and metadata updated in app state
5. UI components re-render with new data
6. Text highlighting applied to visible matches

#### 10.3 State Synchronization

- **Search query**: Synchronized across all components
- **Search results**: Updated when query changes
- **Result consistency**: All components show consistent search state

### 11. Error Handling

#### 11.1 Invalid Queries

- **Empty queries**: Return all conversations
- **Special characters**: Handled gracefully (escaped in regex contexts)
- **Very long queries**: No explicit limits, handled by browser

#### 11.2 Edge Cases

- **No results**: Show "No matches" message
- **Single result**: Display single result appropriately
- **Search during load**: Graceful handling of search before data ready

### 12. Future Considerations

#### 12.1 Potential Enhancements

- **Search history**: Remember recent searches
- **Saved searches**: Allow users to save frequent queries
- **Advanced syntax**: Support for quoted phrases, exclusions
- **Search within conversation**: Limit search to current conversation

#### 12.2 Performance Optimizations

- **Virtual scrolling**: Already implemented for large result sets
- **Debounced search**: Could add debouncing for very large datasets
- **Web Workers**: Could move search to background thread if needed

## Implementation Notes

### File Structure

- `src/lib/services/searchService.ts` - Core search logic
- `src/lib/utils/fuzzyMatch.ts` - Text matching utilities
- `src/lib/components/SafeHighlight.svelte` - Text highlighting
- `src/lib/components/MatchCounter.svelte` - Search statistics
- `src/lib/types.ts` - TypeScript interfaces

### Dependencies

- No external search libraries required
- Uses built-in JavaScript string methods
- Integrates with existing Svelte 5 reactive system

### Testing Strategy

- Unit tests for FuzzyMatcher matching logic
- Integration tests for SearchService
- Component tests for UI behavior
- End-to-end tests for complete search workflows
