# Modern Web App Boilerplate

A production-ready boilerplate for building modern web applications with Next.js, TypeScript, and best practices.

## Features

- ⚡️ Next.js 14 with App Router
- 🔐 Authentication with NextAuth.js
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🔍 SEO optimized
- 🚀 Performance optimized
- 📊 TypeScript for type safety
- 🗃️ Prisma for database management
- 🧪 Testing setup with Jest and Cypress
- 📚 Storybook for component documentation
- 🔄 State management with Zustand
- 📡 tRPC for type-safe APIs
- 🎯 ESLint and Prettier for code quality
- 🔨 Husky and lint-staged for Git hooks
- 📝 Conventional commits with Commitlint
- 📦 pnpm for fast, disk-efficient package management

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (or your preferred database)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/modern-web-boilerplate.git
   cd modern-web-boilerplate
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up your environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Initialize the database:
   \`\`\`bash
   pnpm prisma generate
   pnpm prisma db push
   \`\`\`

5. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

### Available Scripts

- \`pnpm dev\`: Start development server
- \`pnpm build\`: Build for production
- \`pnpm start\`: Start production server
- \`pnpm test\`: Run Jest tests
- \`pnpm test:e2e\`: Run Cypress tests
- \`pnpm storybook\`: Start Storybook
- \`pnpm lint\`: Run ESLint
- \`pnpm format\`: Format code with Prettier
- \`pnpm type-check\`: Run TypeScript checks
- \`pnpm commit\`: Create a conventional commit

## Project Structure

\`\`\`
├── app/ # Next.js app directory
├── components/ # React components
├── hooks/ # Custom React hooks
├── lib/ # Utility functions and configurations
├── prisma/ # Database schema and migrations
├── public/ # Static assets
├── server/ # tRPC router definitions
├── styles/ # Global styles
├── types/ # TypeScript type definitions
└── tests/ # Test files
\`\`\`

## Best Practices

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
- Write tests for new features
- Document components in Storybook
- Keep components small and focused
- Use TypeScript strictly
- Follow the [Next.js App Router patterns](https://nextjs.org/docs/app)

## Contributing

1. Create a feature branch
2. Commit changes using conventional commits
3. Push your branch
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
