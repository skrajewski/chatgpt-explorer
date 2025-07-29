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
	}
];

/**
 * Generates sample data for testing the app
 */
export function getSampleData(): ProcessedConversation[] {
	return sampleConversations;
}