import type { ProcessedConversation } from '../types.js';

/**
 * Sample conversations for testing the app functionality
 */
export const sampleConversations: ProcessedConversation[] = [
	{
		id: 'sample-1',
		title: 'Getting Started with TypeScript',
		create_time: Date.now() - 86400000, // 1 day ago
		preview: 'I need help understanding TypeScript basics and how to set up a new project...',
		messages: [
			{
				id: 'msg-1-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['I need help understanding TypeScript basics and how to set up a new project. Can you guide me through the fundamentals?']
				},
				create_time: Date.now() - 86400000
			},
			{
				id: 'msg-1-2',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['I\'d be happy to help you get started with TypeScript! TypeScript is a strongly typed programming language that builds on JavaScript by adding static type definitions.\n\nHere are the key concepts:\n\n**1. Installation & Setup**\n```bash\nnpm install -g typescript\ntsc --init\n```\n\n**2. Basic Types**\n- `string`, `number`, `boolean`\n- `Array<T>` or `T[]`\n- `object` and custom interfaces\n\n**3. Interfaces**\n```typescript\ninterface User {\n  name: string;\n  age: number;\n  email?: string; // optional property\n}\n```\n\nWould you like me to explain any of these concepts in more detail?']
				},
				create_time: Date.now() - 86390000
			},
			{
				id: 'msg-1-3',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['Yes, can you show me how to create a simple project structure and explain interfaces more?']
				},
				create_time: Date.now() - 86380000
			},
			{
				id: 'msg-1-4',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Absolutely! Let me show you a practical project structure and dive deeper into interfaces.\n\n**Project Structure:**\n```\nmy-typescript-project/\n├── src/\n│   ├── types/\n│   │   └── index.ts\n│   ├── utils/\n│   │   └── helpers.ts\n│   └── index.ts\n├── dist/\n├── package.json\n└── tsconfig.json\n```\n\n**Interface Examples:**\n```typescript\n// Basic interface\ninterface Product {\n  id: number;\n  name: string;\n  price: number;\n  category: string;\n}\n\n// Interface with optional and readonly properties\ninterface User {\n  readonly id: number;\n  name: string;\n  email?: string;\n  preferences?: {\n    theme: \'light\' | \'dark\';\n    notifications: boolean;\n  };\n}\n\n// Interface inheritance\ninterface AdminUser extends User {\n  role: \'admin\';\n  permissions: string[];\n}\n```\n\nInterfaces define the shape of objects and provide compile-time type checking. They\'re purely for development - they don\'t exist in the compiled JavaScript.']
				},
				create_time: Date.now() - 86370000
			}
		]
	},
	{
		id: 'sample-2',
		title: 'React Components Best Practices',
		create_time: Date.now() - 172800000, // 2 days ago
		preview: 'What are the best practices for writing reusable React components? I want to improve my code quality...',
		messages: [
			{
				id: 'msg-2-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['What are the best practices for writing reusable React components? I want to improve my code quality and make components that are easy to maintain.']
				},
				create_time: Date.now() - 172800000
			},
			{
				id: 'msg-2-2',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Great question! Here are the key best practices for writing reusable React components:\n\n**1. Single Responsibility Principle**\nEach component should do one thing well:\n```jsx\n// Good - focused on displaying user info\nfunction UserProfile({ user }) {\n  return (\n    <div className="user-profile">\n      <img src={user.avatar} alt={user.name} />\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n    </div>\n  );\n}\n```\n\n**2. Use TypeScript/PropTypes for Type Safety**\n```tsx\ninterface ButtonProps {\n  variant?: \"primary\" | \"secondary\";\n  size?: \"small\" | \"medium\" | \"large\";\n  onClick?: () => void;\n  disabled?: boolean;\n  children: React.ReactNode;\n}\n\nfunction Button({ variant = \"primary\", size = \"medium\", ...props }: ButtonProps) {\n  return <button className={`btn btn-${variant} btn-${size}`} {...props} />;\n}\n```\n\n**3. Composition over Inheritance**\nUse children and render props for flexibility:\n```jsx\nfunction Modal({ isOpen, onClose, children }) {\n  if (!isOpen) return null;\n  \n  return (\n    <div className="modal-overlay" onClick={onClose}>\n      <div className="modal-content">\n        {children}\n      </div>\n    </div>\n  );\n}\n```']
				},
				create_time: Date.now() - 172790000
			}
		]
	},
	{
		id: 'sample-3',
		title: 'JavaScript Array Methods',
		create_time: Date.now() - 259200000, // 3 days ago
		preview: 'Can you explain the different JavaScript array methods like map, filter, reduce? I get confused about when to use each one...',
		messages: [
			{
				id: 'msg-3-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['Can you explain the different JavaScript array methods like map, filter, reduce? I get confused about when to use each one.']
				},
				create_time: Date.now() - 259200000
			},
			{
				id: 'msg-3-2',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Perfect question! Let me break down the most important array methods with practical examples:\n\n**1. map() - Transform each element**\nUse when you want to transform every element and return a new array of the same length.\n\n```javascript\nconst numbers = [1, 2, 3, 4];\nconst doubled = numbers.map(num => num * 2);\n// Result: [2, 4, 6, 8]\n\nconst users = [{name: \"Alice\", age: 25}, {name: \"Bob\", age: 30}];\nconst names = users.map(user => user.name);\n// Result: [\"Alice\", \"Bob\"]\n```\n\n**2. filter() - Select elements that match criteria**\nUse when you want to keep only elements that pass a test.\n\n```javascript\nconst numbers = [1, 2, 3, 4, 5, 6];\nconst evenNumbers = numbers.filter(num => num % 2 === 0);\n// Result: [2, 4, 6]\n\nconst users = [{name: \"Alice\", age: 25}, {name: \"Bob\", age: 17}];\nconst adults = users.filter(user => user.age >= 18);\n// Result: [{name: \"Alice\", age: 25}]\n```\n\n**3. reduce() - Combine all elements into a single value**\nUse when you want to calculate a single result from all elements.\n\n```javascript\nconst numbers = [1, 2, 3, 4];\nconst sum = numbers.reduce((total, num) => total + num, 0);\n// Result: 10\n\nconst items = [{price: 10}, {price: 20}, {price: 30}];\nconst totalPrice = items.reduce((total, item) => total + item.price, 0);\n// Result: 60\n```']
				},
				create_time: Date.now() - 259190000
			},
			{
				id: 'msg-3-3',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['This is helpful! Can you show me how to chain these methods together?']
				},
				create_time: Date.now() - 259180000
			},
			{
				id: 'msg-3-4',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Absolutely! Chaining array methods is one of the most powerful features. Here are some practical examples:\n\n**Example 1: E-commerce data processing**\n```javascript\nconst products = [\n  { name: \"Laptop\", price: 1000, category: \"electronics\", inStock: true },\n  { name: \"Phone\", price: 500, category: \"electronics\", inStock: false },\n  { name: \"Book\", price: 15, category: \"books\", inStock: true },\n  { name: \"Headphones\", price: 100, category: \"electronics\", inStock: true }\n];\n\n// Get total value of electronics in stock\nconst electronicsValue = products\n  .filter(product => product.category === \"electronics\")\n  .filter(product => product.inStock)\n  .map(product => product.price)\n  .reduce((total, price) => total + price, 0);\n\nconsole.log(electronicsValue); // 1100\n```\n\n**Example 2: User data analysis**\n```javascript\nconst users = [\n  { name: \"Alice\", age: 25, city: \"NYC\", purchases: [50, 30, 100] },\n  { name: \"Bob\", age: 30, city: \"LA\", purchases: [25, 75] },\n  { name: \"Charlie\", age: 35, city: \"NYC\", purchases: [200, 150] }\n];\n\n// Get average purchase amount for NYC users over 20\nconst nycUsersAverage = users\n  .filter(user => user.city === \"NYC\" && user.age > 20)\n  .map(user => user.purchases.reduce((sum, purchase) => sum + purchase, 0))\n  .reduce((total, userTotal, _, array) => total + userTotal / array.length, 0);\n\nconsole.log(nycUsersAverage); // 225\n```\n\n**Pro tip:** The order matters! Always filter first to reduce the number of items, then map, then reduce.']
				},
				create_time: Date.now() - 259170000
			}
		]
	},
	{
		id: 'sample-4',
		title: 'CSS Grid vs Flexbox',
		create_time: Date.now() - 345600000, // 4 days ago
		preview: 'When should I use CSS Grid versus Flexbox? I\'m building a responsive layout and not sure which approach is better...',
		messages: [
			{
				id: 'msg-4-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['When should I use CSS Grid versus Flexbox? I\'m building a responsive layout and not sure which approach is better.']
				},
				create_time: Date.now() - 345600000
			},
			{
				id: 'msg-4-2',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Great question! Both are powerful layout tools, but they excel in different scenarios. Here\'s when to use each:\n\n**Use Flexbox for:**\n- One-dimensional layouts (row OR column)\n- Component-level layouts\n- Centering content\n- Distributing space between items\n- Navigation bars, button groups\n\n```css\n/* Flexbox example - navigation bar */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.nav-links {\n  display: flex;\n  gap: 2rem;\n}\n```\n\n**Use CSS Grid for:**\n- Two-dimensional layouts (rows AND columns)\n- Page-level layouts\n- Complex grid systems\n- Overlapping elements\n- Card layouts, dashboards\n\n```css\n/* Grid example - page layout */\n.page-layout {\n  display: grid;\n  grid-template-areas:\n    \"header header header\"\n    \"sidebar main aside\"\n    \"footer footer footer\";\n  grid-template-columns: 250px 1fr 200px;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100vh;\n}\n\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main { grid-area: main; }\n.aside { grid-area: aside; }\n.footer { grid-area: footer; }\n```\n\n**They work great together!** Use Grid for page structure, Flexbox for component alignment.']
				},
				create_time: Date.now() - 345590000
			}
		]
	},
	{
		id: 'sample-5',
		title: 'API Error Handling Strategies',
		create_time: Date.now() - 432000000, // 5 days ago
		preview: 'What are the best practices for handling errors when making API calls in JavaScript? I want to create a robust error handling system...',
		messages: [
			{
				id: 'msg-5-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['What are the best practices for handling errors when making API calls in JavaScript? I want to create a robust error handling system.']
				},
				create_time: Date.now() - 432000000
			},
			{
				id: 'msg-5-2',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Excellent question! Robust error handling is crucial for good user experience. Here\'s a comprehensive approach:\n\n**1. Create a Custom Error Class**\n```javascript\nclass APIError extends Error {\n  constructor(message, status, endpoint) {\n    super(message);\n    this.name = \"APIError\";\n    this.status = status;\n    this.endpoint = endpoint;\n  }\n}\n```\n\n**2. Centralized API Client**\n```javascript\nclass APIClient {\n  constructor(baseURL) {\n    this.baseURL = baseURL;\n  }\n\n  async request(endpoint, options = {}) {\n    try {\n      const response = await fetch(`${this.baseURL}${endpoint}`, {\n        headers: {\n          \"Content-Type\": \"application/json\",\n          ...options.headers\n        },\n        ...options\n      });\n\n      if (!response.ok) {\n        const errorData = await response.json().catch(() => ({}));\n        throw new APIError(\n          errorData.message || `HTTP ${response.status}`,\n          response.status,\n          endpoint\n        );\n      }\n\n      return await response.json();\n    } catch (error) {\n      if (error instanceof APIError) {\n        throw error;\n      }\n      \n      // Network or other errors\n      throw new APIError(\n        \"Network error or request failed\",\n        0,\n        endpoint\n      );\n    }\n  }\n}\n```\n\n**3. Error Handling Strategies**\n```javascript\n// Retry logic\nasync function withRetry(fn, maxRetries = 3, delay = 1000) {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await fn();\n    } catch (error) {\n      if (i === maxRetries - 1 || error.status < 500) {\n        throw error;\n      }\n      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));\n    }\n  }\n}\n```']
				},
				create_time: Date.now() - 431990000
			}
		]
	},
	{
		id: 'sample-6',
		title: 'Logo Design Discussion',
		create_time: Date.now() - 518400000, // 6 days ago
		preview: 'I need feedback on this logo design I created. What do you think about the color scheme and typography?',
		messages: [
			{
				id: 'msg-6-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['I need feedback on this logo design I created. What do you think about the color scheme and typography?']
				},
				create_time: Date.now() - 518400000
			},
			{
				id: 'msg-6-2',
				author: { role: 'user' },
				content: {
					content_type: 'multimodal_text',
					parts: [
						{
							asset_pointer: 'file-sample-logo-design-1'
						}
					]
				},
				create_time: Date.now() - 518390000
			},
			{
				id: 'msg-6-3',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['This is a great start for your logo design! I really like several aspects:\n\n**Strengths:**\n- The color palette is modern and professional\n- The typography is clean and readable\n- Good balance between text and graphic elements\n- The overall composition feels well-structured\n\n**Suggestions for improvement:**\n- Consider increasing the contrast slightly for better accessibility\n- The logo might benefit from a simplified version for smaller applications\n- Test how it looks in grayscale to ensure it works in single-color applications\n\nWhat industry or company is this logo for? That context would help me provide more specific feedback on whether the style matches your brand identity.']
				},
				create_time: Date.now() - 518380000
			},
			{
				id: 'msg-6-4',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['This is for a tech startup focused on sustainable energy solutions. They want something modern but also conveying trust and environmental consciousness.']
				},
				create_time: Date.now() - 518370000
			},
			{
				id: 'msg-6-5',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Perfect! For a sustainable energy tech startup, your design choices make even more sense now:\n\n**Aligned with brand goals:**\n- The green tones naturally convey environmental consciousness\n- The clean, modern typography suggests innovation and forward-thinking\n- The professional appearance builds trust\n\n**Additional recommendations for this sector:**\n- Consider incorporating subtle geometric elements that could represent solar panels, wind patterns, or energy flow\n- The logo should work well on both light and dark backgrounds (important for tech presentations)\n- Make sure it scales down well for mobile app icons and social media profiles\n- Test it alongside other sustainable tech companies to ensure it stands out\n\n**Technical considerations:**\n- Ensure you have vector versions (.SVG, .AI) for scalability\n- Create variations: full logo, icon only, horizontal layout\n- Consider how it looks when embossed or printed in single color\n\nThis logo has strong potential for your target market! The balance of professionalism and environmental awareness is exactly what sustainable tech companies need.']
				},
				create_time: Date.now() - 518360000
			}
		]
	},
	{
		id: 'sample-7',
		title: 'Website Mockup Review',
		create_time: Date.now() - 604800000, // 7 days ago
		preview: 'Here\'s the homepage mockup for the new e-commerce site. I\'d love your thoughts on the layout and user experience flow.',
		messages: [
			{
				id: 'msg-7-1',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['Here\'s the homepage mockup for the new e-commerce site. I\'d love your thoughts on the layout and user experience flow.']
				},
				create_time: Date.now() - 604800000
			},
			{
				id: 'msg-7-2',
				author: { role: 'user' },
				content: {
					content_type: 'multimodal_text',
					parts: [
						{
							asset_pointer: 'file-sample-homepage-mockup-2'
						}
					]
				},
				create_time: Date.now() - 604790000
			},
			{
				id: 'msg-7-3',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['This is an excellent homepage mockup! You\'ve created a clean, modern design that follows e-commerce best practices. Here\'s my detailed analysis:\n\n**Strong Points:**\n✅ Clear hierarchy with prominent hero section\n✅ Good use of whitespace - doesn\'t feel cluttered\n✅ Trust indicators well-positioned (reviews, security badges)\n✅ Mobile-first design approach is evident\n✅ Call-to-action buttons are prominent and well-contrasted\n\n**User Experience Flow:**\n- The navigation is intuitive and follows expected patterns\n- Product categories are clearly visible\n- Search functionality is prominently placed\n- The flow from hero → categories → featured products works well\n\n**Suggestions for Enhancement:**\n1. **Above the fold:** Consider adding a value proposition headline in the hero section\n2. **Social proof:** The testimonials section could benefit from photos\n3. **Loading performance:** Optimize hero image for faster loading\n4. **Accessibility:** Ensure color contrast ratios meet WCAG guidelines\n5. **Trust signals:** Add more payment method icons near checkout areas\n\n**Conversion Optimization Ideas:**\n- A/B test the CTA button colors\n- Consider adding urgency elements (limited time offers)\n- Add a live chat widget for customer support\n\nOverall, this mockup shows a strong understanding of e-commerce UX principles. The layout is professional and user-friendly!']
				},
				create_time: Date.now() - 604780000
			},
			{
				id: 'msg-7-4',
				author: { role: 'user' },
				content: {
					content_type: 'text',
					parts: ['Thank you! This is really helpful feedback. What specific color combinations would you recommend for the CTA buttons to test?']
				},
				create_time: Date.now() - 604770000
			},
			{
				id: 'msg-7-5',
				author: { role: 'assistant' },
				content: {
					content_type: 'text',
					parts: ['Great question! Here are some high-converting CTA button color combinations to A/B test:\n\n**Primary Recommendations:**\n1. **Orange (#FF6B35)** - Creates urgency, high visibility\n2. **Green (#28A745)** - Associated with "go" and positive action\n3. **Red (#DC3545)** - High contrast, attention-grabbing\n4. **Purple (#6F42C1)** - Modern, premium feel\n\n**Testing Strategy:**\n- **Current vs. Orange:** Your current blue vs. bright orange\n- **Warm vs. Cool:** Orange vs. your current blue\n- **Bold vs. Subtle:** High contrast red vs. muted green\n\n**Background Context Matters:**\n- On white backgrounds: Orange and red perform well\n- On light gray: Purple and green stand out\n- With your current color scheme: Orange would create the highest contrast\n\n**Additional Testing Variables:**\n- Button size (try 20% larger)\n- Text: "Shop Now" vs. "Browse Products" vs. "Get Started"\n- Shape: Rounded corners vs. sharp edges\n- Drop shadow vs. flat design\n\n**Pro Tip:** Test one variable at a time for clean data. Start with the orange (#FF6B35) against your current blue - this typically shows a 15-25% improvement in click-through rates for e-commerce sites.\n\nRemember to run tests for at least 2 weeks to account for different shopping patterns!']
				},
				create_time: Date.now() - 604760000
			}
		]
	}
];

/**
 * Creates sample media files for testing the Media Library
 */
async function createSampleMediaFiles(): Promise<Map<string, string>> {
	const mediaFiles = new Map<string, string>();
	
	// Create sample images as colored canvases
	const canvas1 = document.createElement('canvas');
	canvas1.width = 800;
	canvas1.height = 600;
	const ctx1 = canvas1.getContext('2d')!;
	
	// Logo design mockup - gradient background with geometric shapes
	const gradient1 = ctx1.createLinearGradient(0, 0, 800, 600);
	gradient1.addColorStop(0, '#4CAF50');
	gradient1.addColorStop(1, '#2E7D32');
	ctx1.fillStyle = gradient1;
	ctx1.fillRect(0, 0, 800, 600);
	
	// Add some geometric shapes to simulate a logo
	ctx1.fillStyle = '#FFFFFF';
	ctx1.fillRect(300, 200, 200, 100);
	ctx1.beginPath();
	ctx1.arc(400, 350, 50, 0, 2 * Math.PI);
	ctx1.fill();
	
	// Add text
	ctx1.fillStyle = '#1B5E20';
	ctx1.font = 'bold 24px Arial';
	ctx1.textAlign = 'center';
	ctx1.fillText('SAMPLE LOGO DESIGN', 400, 250);
	ctx1.fillText('EcoTech Solutions', 400, 280);
	
	// Convert first canvas to blob URL
	const blob1 = await new Promise<Blob | null>((resolve) => {
		canvas1.toBlob(resolve);
	});
	if (blob1) {
		const url1 = URL.createObjectURL(blob1);
		mediaFiles.set('sample-6/file-sample-logo-design-1.png', url1);
	}
	
	// Create second sample image
	const canvas2 = document.createElement('canvas');
	canvas2.width = 1200;
	canvas2.height = 1800;
	const ctx2 = canvas2.getContext('2d')!;
	
	// Website mockup - simulate a webpage layout
	ctx2.fillStyle = '#F5F5F5';
	ctx2.fillRect(0, 0, 1200, 1800);
	
	// Header
	ctx2.fillStyle = '#FFFFFF';
	ctx2.fillRect(0, 0, 1200, 80);
	ctx2.fillStyle = '#333333';
	ctx2.font = 'bold 20px Arial';
	ctx2.fillText('E-Commerce Store', 50, 50);
	
	// Hero section
	ctx2.fillStyle = '#2196F3';
	ctx2.fillRect(0, 80, 1200, 400);
	ctx2.fillStyle = '#FFFFFF';
	ctx2.font = 'bold 36px Arial';
	ctx2.textAlign = 'center';
	ctx2.fillText('Welcome to Our Store', 600, 250);
	ctx2.font = '18px Arial';
	ctx2.fillText('Find the best products at amazing prices', 600, 300);
	
	// CTA Button
	ctx2.fillStyle = '#FF6B35';
	ctx2.fillRect(500, 320, 200, 50);
	ctx2.fillStyle = '#FFFFFF';
	ctx2.font = 'bold 16px Arial';
	ctx2.fillText('Shop Now', 600, 350);
	
	// Product grid simulation
	ctx2.fillStyle = '#FFFFFF';
	for (let i = 0; i < 6; i++) {
		const x = (i % 3) * 380 + 60;
		const y = Math.floor(i / 3) * 300 + 520;
		ctx2.fillRect(x, y, 300, 250);
		ctx2.strokeStyle = '#E0E0E0';
		ctx2.strokeRect(x, y, 300, 250);
		
		// Simulate product image
		ctx2.fillStyle = '#EEEEEE';
		ctx2.fillRect(x + 10, y + 10, 280, 180);
		
		// Product title
		ctx2.fillStyle = '#333333';
		ctx2.font = '14px Arial';
		ctx2.textAlign = 'left';
		ctx2.fillText(`Product ${i + 1}`, x + 15, y + 210);
		ctx2.fillText(`$${(Math.random() * 100 + 20).toFixed(2)}`, x + 15, y + 230);
	}
	
	// Convert second canvas to blob URL
	const blob2 = await new Promise<Blob | null>((resolve) => {
		canvas2.toBlob(resolve);
	});
	if (blob2) {
		const url2 = URL.createObjectURL(blob2);
		mediaFiles.set('sample-7/file-sample-homepage-mockup-2.jpg', url2);
	}
	
	return mediaFiles;
}

/**
 * Generates sample data for testing the app
 */
export function getSampleData(): ProcessedConversation[] {
	return sampleConversations;
}

/**
 * Generates sample data with media files for testing the Media Library
 */
export async function getSampleDataWithMedia(): Promise<{ conversations: ProcessedConversation[], mediaFiles: Map<string, string> }> {
	return {
		conversations: sampleConversations,
		mediaFiles: await createSampleMediaFiles()
	};
}