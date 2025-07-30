import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ProcessedConversation } from '../types.js';

export class ExportService {
	/**
	 * Export conversation to Markdown format
	 */
	async exportToMarkdown(conversation: ProcessedConversation): Promise<void> {
		const markdown = this.generateMarkdown(conversation);
		this.downloadFile(markdown, `${this.sanitizeFilename(conversation.title)}.md`, 'text/markdown');
	}

	/**
	 * Export conversation to PDF format
	 */
	async exportToPDF(conversation: ProcessedConversation, element?: HTMLElement): Promise<void> {
		if (element) {
			// Export using HTML element (with styling)
			await this.exportElementToPDF(conversation, element);
		} else {
			// Export using plain text formatting
			await this.exportTextToPDF(conversation);
		}
	}

	/**
	 * Generate Markdown content from conversation
	 */
	private generateMarkdown(conversation: ProcessedConversation): string {
		const lines: string[] = [];

		// Header
		lines.push(`# ${conversation.title}`);
		lines.push('');
		lines.push(`**Created:** ${this.formatTimestamp(conversation.create_time)}`);
		lines.push(`**Messages:** ${conversation.messages.length}`);
		lines.push('');
		lines.push('---');
		lines.push('');

		// Messages
		conversation.messages.forEach((message, index) => {
			const role = message.author.role === 'user' ? 'You' : 'Assistant';
			const timestamp = this.formatTimestamp(message.create_time);

			lines.push(`## ${role} (${timestamp})`);
			lines.push('');

			// Process message content
			message.content.parts.forEach((part) => {
				if (typeof part === 'string') {
					lines.push(this.processTextForMarkdown(part));
				} else if (part && typeof part === 'object') {
					if (part.text) {
						lines.push(this.processTextForMarkdown(part.text));
					}
					if (part.image_url?.url || part.image_url) {
						const imageUrl =
							typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
						lines.push(`![Image](${imageUrl})`);
					}
					if (part.asset_pointer) {
						lines.push(`![Image](${part.asset_pointer})`);
					}
				}
			});

			lines.push('');
			if (index < conversation.messages.length - 1) {
				lines.push('---');
				lines.push('');
			}
		});

		return lines.join('\n');
	}

	/**
	 * Process text content for Markdown (handle code blocks, etc.)
	 */
	private processTextForMarkdown(text: string): string {
		// Basic cleanup and formatting
		// Handle common markdown patterns that might be in the text
		return text
			.replace(/\n\n+/g, '\n\n') // Normalize multiple newlines
			.trim();
	}

	/**
	 * Export HTML element to PDF using html2canvas and jsPDF
	 */
	private async exportElementToPDF(
		conversation: ProcessedConversation,
		element: HTMLElement
	): Promise<void> {
		try {
			// Create a clone of the element for PDF export
			const clone = element.cloneNode(true) as HTMLElement;

			// Apply print-friendly styles
			this.applyPrintStyles(clone);

			// Temporarily add to document for canvas generation
			clone.style.position = 'absolute';
			clone.style.left = '-9999px';
			clone.style.top = '0';
			clone.style.width = '800px'; // Standard width for PDF
			document.body.appendChild(clone);

			// Generate canvas from the element
			const canvas = await html2canvas(clone, {
				width: 800,
				height: clone.scrollHeight,
				scale: 2, // Higher resolution
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff'
			});

			// Remove the clone
			document.body.removeChild(clone);

			// Create PDF
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 295; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			const pdf = new jsPDF('p', 'mm', 'a4');
			let position = 0;

			// Add image to PDF (handle multiple pages if needed)
			pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Download the PDF
			pdf.save(`${this.sanitizeFilename(conversation.title)}.pdf`);
		} catch (error) {
			console.error('Error exporting to PDF:', error);
			// Fallback to text-based PDF
			await this.exportTextToPDF(conversation);
		}
	}

	/**
	 * Export conversation to PDF using text-based approach
	 */
	private async exportTextToPDF(conversation: ProcessedConversation): Promise<void> {
		const pdf = new jsPDF();

		let yPosition = 20;
		const pageHeight = pdf.internal.pageSize.height;
		const lineHeight = 6;
		const marginLeft = 20;
		const marginRight = 20;
		const maxWidth = pdf.internal.pageSize.width - marginLeft - marginRight;

		// Helper function to add new page if needed
		const checkPageBreak = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - 20) {
				pdf.addPage();
				yPosition = 20;
			}
		};

		// Helper function to add wrapped text
		const addWrappedText = (
			text: string,
			fontSize: number = 10,
			style: 'normal' | 'bold' = 'normal'
		) => {
			pdf.setFontSize(fontSize);

			if (style === 'bold') {
				pdf.setFont('helvetica', 'bold');
			} else {
				pdf.setFont('helvetica', 'normal');
			}

			const lines = pdf.splitTextToSize(text, maxWidth);
			const textHeight = lines.length * lineHeight;

			checkPageBreak(textHeight);

			pdf.text(lines, marginLeft, yPosition);
			yPosition += textHeight + 2;
		};

		// Title
		addWrappedText(conversation.title, 16, 'bold');
		yPosition += 5;

		// Metadata
		addWrappedText(`Created: ${this.formatTimestamp(conversation.create_time)}`, 10);
		addWrappedText(`Messages: ${conversation.messages.length}`, 10);
		yPosition += 10;

		// Messages
		conversation.messages.forEach((message, index) => {
			const role = message.author.role === 'user' ? 'You' : 'Assistant';
			const timestamp = this.formatTimestamp(message.create_time);

			// Message header
			addWrappedText(`${role} (${timestamp})`, 12, 'bold');
			yPosition += 2;

			// Message content
			message.content.parts.forEach((part) => {
				if (typeof part === 'string') {
					addWrappedText(part, 10);
				} else if (part && typeof part === 'object') {
					if (part.text) {
						addWrappedText(part.text, 10);
					}
					if (part.image_url?.url || part.image_url || part.asset_pointer) {
						const imageRef = part.image_url?.url || part.image_url || part.asset_pointer;
						addWrappedText(`[Image: ${imageRef}]`, 10);
					}
				}
			});

			if (index < conversation.messages.length - 1) {
				yPosition += 5;
				checkPageBreak(5);
				pdf.setDrawColor(200, 200, 200);
				pdf.line(marginLeft, yPosition, pdf.internal.pageSize.width - marginRight, yPosition);
				yPosition += 10;
			}
		});

		// Download the PDF
		pdf.save(`${this.sanitizeFilename(conversation.title)}.pdf`);
	}

	/**
	 * Apply print-friendly styles to an element
	 */
	private applyPrintStyles(element: HTMLElement): void {
		// Set print-friendly styles
		element.style.backgroundColor = '#ffffff';
		element.style.color = '#000000';
		element.style.fontFamily = 'Arial, sans-serif';
		element.style.fontSize = '12px';
		element.style.lineHeight = '1.4';
		element.style.padding = '20px';

		// Remove shadows and border effects
		const allElements = element.querySelectorAll('*');
		allElements.forEach((el) => {
			if (el instanceof HTMLElement) {
				el.style.boxShadow = 'none';
				el.style.textShadow = 'none';
				el.style.filter = 'none';
			}
		});

		// Style message bubbles for print
		const messageBubbles = element.querySelectorAll('.message-bubble');
		messageBubbles.forEach((bubble) => {
			if (bubble instanceof HTMLElement) {
				bubble.style.border = '1px solid #ccc';
				bubble.style.backgroundColor = '#f9f9f9';
				bubble.style.color = '#000000';
				bubble.style.borderRadius = '4px';
				bubble.style.padding = '12px';
				bubble.style.marginBottom = '10px';
			}
		});

		// Style user messages differently
		const userBubbles = element.querySelectorAll('.user-bubble');
		userBubbles.forEach((bubble) => {
			if (bubble instanceof HTMLElement) {
				bubble.style.backgroundColor = '#e3f2fd';
				bubble.style.color = '#000000';
			}
		});
	}

	/**
	 * Format timestamp for display
	 */
	private formatTimestamp(timestamp: number): string {
		return new Date(timestamp).toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	/**
	 * Sanitize filename for download
	 */
	private sanitizeFilename(filename: string): string {
		return (
			filename
				.replace(/[^a-z0-9]/gi, '_')
				.replace(/_+/g, '_')
				.replace(/^_|_$/g, '')
				.toLowerCase()
				.substring(0, 50) || 'conversation'
		);
	}

	/**
	 * Download file with given content
	 */
	private downloadFile(content: string, filename: string, mimeType: string): void {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}
}
