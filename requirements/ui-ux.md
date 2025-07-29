# UI/UX Requirements

## Privacy and Security Information

### Requirements

- Add clear information on the Homepage that the app works locally and does not upload any data
- Emphasize that uploaded data is not stored and everything is processed locally
- Provide reassurance about data privacy to users
- Make this information prominent and easily visible

### Implementation

- Update FileUpload.svelte to include privacy notice in the upload area
- Add icons and clear messaging about local processing
- Position information where users can easily see it before uploading

## Loading States and Progress Indication

### Requirements

- When file is processing, show progress bar with clear visual feedback
- UI should be in loading state during file processing
- Disable user interactions to prevent errors during processing
- Show meaningful loading messages

### Implementation

- Add progress bar component to FileUpload.svelte
- Update App.svelte to handle loading states consistently
- Add loading overlays to prevent user interaction during processing
- Show processing status messages

## Code Block Syntax Highlighting

### Requirements

- When conversation renders code blocks, content must be visible and properly highlighted
- Use proper syntax highlighting according to the detected programming language
- Support common programming languages (JavaScript, Python, HTML, CSS, etc.)
- Ensure code is readable with proper contrast

### Implementation

- Use highlight.js library for syntax highlighting
- Update SafeMessageContent.svelte to detect language from code blocks
- Apply appropriate highlighting and styling
- Ensure both light and dark themes work properly

## Text Wrapping and Responsive Design

### Requirements

- Use word wrap CSS to break long lines in conversations
- Prevent UI from expanding wider than screen width
- Ensure proper text wrapping in message content
- Maintain readability on all screen sizes

### Implementation

- Add word-wrap, overflow-wrap, and text-wrap CSS properties
- Update MessageViewer.svelte and SafeMessageContent.svelte
- Test on various screen sizes to ensure proper wrapping
- Handle long URLs and technical content appropriately

## Markdown Table Rendering

### Requirements

- Tables in markdown must be properly rendered with borders and structure
- Support standard markdown table syntax
- Ensure tables are responsive and scroll horizontally if needed
- Apply consistent styling with the rest of the application

### Implementation

- Extend SafeMessageContent.svelte to parse markdown tables
- Add table parsing logic to detect markdown table syntax
- Apply proper CSS styling for tables with borders and spacing
- Handle table alignment and ensure mobile responsiveness

## Technical Implementation Notes

### Dependencies

- Add highlight.js to package.json for syntax highlighting
- Consider table parsing libraries if needed for complex tables

### Components to Update

- FileUpload.svelte - Privacy information and progress bar
- App.svelte - Loading state management
- SafeMessageContent.svelte - Code highlighting and table rendering
- MessageViewer.svelte - Text wrapping and responsive design

### CSS Considerations

- Word wrapping: `word-wrap: break-word`, `overflow-wrap: break-word`
- Table styling: Borders, padding, responsive scrolling
- Code block styling: Background colors, syntax highlighting themes
- Loading states: Overlay styles, spinner animations

### Testing Requirements

- Test on mobile and desktop devices
- Verify code highlighting works for common languages
- Ensure tables render properly in various sizes
- Test loading states with different file sizes
- Verify privacy information is clearly visible
