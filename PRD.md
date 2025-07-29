# ChatGPT Conversation Explorer - Product Requirements Document

## 1. Product Overview

### 1.1 Product Vision

Create a fast, offline-first Progressive Web Application (PWA) that allows users to browse, search, and explore their ChatGPT conversation export files in an intuitive, chat-like interface.

### 1.2 Problem Statement

- ChatGPT users want to browse their exported conversation history locally
- The native export format (conversations.json) is not user-friendly
- Users need fast search capabilities across large conversation datasets
- Privacy-conscious users want offline-only processing
- Mobile and desktop users need a responsive interface

### 1.3 Target Users

- **Primary**: ChatGPT users who have exported their conversation history
- **Secondary**: Privacy-conscious users who prefer local data processing
- **Tertiary**: Researchers analyzing ChatGPT conversation patterns

## 2. Core Features

### 2.1 File Import System

**Requirements**:

- Drag & drop ZIP file upload interface
- File browser fallback for ZIP selection
- Support for ChatGPT export ZIP format
- Validation of conversations.json presence
- Visual feedback during file processing
- Error handling for invalid files

**Technical Implementation**:

- JSZip library for ZIP file parsing
- Blob URL creation for image assets
- Async file processing with progress indication

### 2.2 Conversation Data Processing

**Requirements**:

- Parse conversations.json structure
- Extract conversation metadata (title, date, ID)
- Reconstruct message threads from mapping structure
- Filter out empty messages and system messages
- Handle message threading and conversation flow
- Support for message timestamps

**ChatGPT Export Format Understanding**:
The export is a ZIP file containing:

- `conversations.json` - Array of conversation objects
- `file-*` pattern image files (PNG, JPEG, WebP)
- `dalle-generations/` folder with AI-generated images
- `audio/` folders with WAV files from voice conversations
- `user-*/` folders with user-uploaded files

```json
{
  "id": "conversation-id",
  "title": "Conversation Title",
  "create_time": 1753641678.494878,
  "mapping": {
    "message-id": {
      "id": "message-id",
      "message": {
        "author": {"role": "user|assistant|system", "name": null, "metadata": {}},
        "create_time": 1753641677.545,
        "content": {"content_type": "text", "parts": ["message content"]},
        "status": "finished_successfully",
        "end_turn": true,
        "weight": 1.0,
        "metadata": {...}
      },
      "parent": "parent-message-id",
      "children": ["child-message-id"]
    }
  },
  "conversation_id": "alternative-id-field",
  "update_time": 1753711592.1373,
  "current_node": "node-id",
  "gizmo_id": null,
  "is_archived": false
}
```

### 2.3 Search Functionality

**Requirements**:

- Real-time search across all conversations
- Search indexing for performance
- Keyword highlighting in results
- Search in conversation titles and message content
- Case-insensitive search
- Multi-word search support

**Technical Implementation**:

- Pre-built search index using Map data structure
- Word tokenization and intersection algorithms
- Highlight rendering with HTML spans

### 2.4 Conversation List Interface

**Requirements**:

- Sidebar with scrollable conversation list
- Conversation preview (first 100 chars of messages)
- Creation date display
- Click-to-select functionality
- Search result highlighting
- Virtual scrolling for large datasets (100+ items)

**Performance Features**:

- Virtual scrolling with 120px item height
- 5-item buffer for smooth scrolling
- Absolute positioning for performance

### 2.5 Message Viewer

**Requirements**:

- Chat-like conversation interface
- User/Assistant message distinction
- Message timestamps
- Content formatting (markdown-like)
- Image support for attachments
- Scrollable message history
- Message role indicators (avatars)

**Formatting Support**:

- Bold text (`**text**`)
- Italic text (`*text*`)
- Inline code (`code`)
- Code blocks (`code`)
- Line breaks and paragraphs
- Image embedding
- You can use external library to parse Markdown syntax

### 2.6 Progressive Web App (PWA)

**Requirements**:

- Offline functionality
- App manifest for installation
- Service worker for caching
- Responsive design for mobile/desktop
- Fast loading times
- No network dependencies after initial load

**Technical Implementation**:

- Service Worker with cache-first strategy
- Web App Manifest with app metadata
- Responsive CSS with Tailwind
- Local storage for processed data

### 2.7 Media Support

**Requirements**:

- Display images from ChatGPT conversations
- Support DALL-E generated images
- Play audio files from voice conversations
- Handle user-uploaded files
- Automatic file matching in message content

**Technical Implementation**:

- Blob URL creation for media files
- Pattern matching for `file-*` references
- Audio player controls for WAV files
- Image display with responsive sizing
- Support for PNG, JPEG, WebP formats

## 3. Technical Architecture

### 3.3 Data Flow

1. User drops ZIP file → JSZip processes file
2. Extract conversations.json → Parse conversation data
3. Build search index → Render conversation list
4. User searches → Filter and highlight results
5. User selects conversation → Render messages
6. Display formatted messages with images

### 3.4 Performance Optimizations

- **Search**: Pre-built word index for O(1) lookups
- **Memory**: Blob URL cleanup for images
- **Caching**: Service worker for offline access

## 4. User Experience

### 4.1 User Journey

1. **Landing**: User sees upload interface with instructions
2. **Import**: Drag/drop ZIP file with visual feedback
3. **Processing**: File parsing with loading indication
4. **Browse**: Conversation list appears with search box
5. **Search**: Real-time filtering as user types
6. **View**: Click conversation to see full chat history
7. **Navigate**: Switch between conversations seamlessly

### 4.2 Interface Design

- **Layout**: Split-pane with sidebar and main content
- **Colors**: Clean gray/blue theme with Tailwind CSS
- **Typography**: Readable fonts with proper contrast
- **Interactions**: Hover states, smooth transitions
- **Responsive**: Mobile-first design approach

Look at the wire frames located in wireframe.png

### 4.3 Accessibility

- Semantic HTML structure
- Keyboard navigation support
- High contrast ratios
- Focus indicators

## 5. Security & Privacy

### 5.1 Data Privacy

- **Local Processing**: All data stays in browser
- **No Network**: Zero external API calls
- **No Analytics**: No tracking or telemetry
- **Offline First**: Works without internet

### 5.2 Security Measures

- Client-side only processing
- No data persistence beyond session
- Safe HTML rendering (no XSS)
- File type validation

## 6. Browser Compatibility

### 6.1 Supported Browsers

- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 13+ ✅
- Edge 80+ ✅

### 6.2 Required APIs

- File API for drag/drop
- Service Worker for PWA
- IndexedDB for large data (future)
- Blob URLs for images

## 7. Known Limitations

### 7.1 Current Limitations

- Large exports (1000+ conversations) may be slow to process initially
- Some ChatGPT formatting may not be preserved perfectly
- No conversation editing capabilities
- No data export functionality
- Audio file matching relies on filename references in text

### 7.2 Export Format Support

- ✅ Full support for current ChatGPT export format (2024-2025)
- ✅ Images from `file-*` pattern and `dalle-generations/` folder
- ✅ Audio files from conversation folders
- ✅ User-uploaded files from `user-*/` directories
- ⚠️ Complex message threading reconstructed using parent-child relationships
- ⚠️ Some metadata from older conversations may be missing

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-28  
**Status**: MVP Complete, Ready for Iteration
