import type { User, Category, Tag, Article, DashboardStats } from '@/types';

export const dummyUsers: User[] = [
  {
    _id: 'u1',
    name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    _id: 'u2',
    name: 'James Carter',
    email: 'james@example.com',
    role: 'author',
    avatar: 'https://i.pravatar.cc/150?u=james',
    createdAt: '2025-02-20T10:00:00Z',
  },
  {
    _id: 'u3',
    name: 'Lina Park',
    email: 'lina@example.com',
    role: 'author',
    avatar: 'https://i.pravatar.cc/150?u=lina',
    createdAt: '2025-03-10T10:00:00Z',
  },
];

export const dummyCategories: Category[] = [
  { _id: 'c1', name: 'Technology', slug: 'technology', description: 'Latest in tech', articleCount: 5, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'c2', name: 'Design', slug: 'design', description: 'UI/UX and visual design', articleCount: 3, createdAt: '2025-01-05T00:00:00Z' },
  { _id: 'c3', name: 'Business', slug: 'business', description: 'Business and startups', articleCount: 4, createdAt: '2025-01-10T00:00:00Z' },
  { _id: 'c4', name: 'Development', slug: 'development', description: 'Software development', articleCount: 6, createdAt: '2025-02-01T00:00:00Z' },
];

export const dummyTags: Tag[] = [
  { _id: 't1', name: 'React', slug: 'react', articleCount: 4, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't2', name: 'TypeScript', slug: 'typescript', articleCount: 3, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't3', name: 'Node.js', slug: 'nodejs', articleCount: 2, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't4', name: 'CSS', slug: 'css', articleCount: 3, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't5', name: 'Startup', slug: 'startup', articleCount: 2, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't6', name: 'AI', slug: 'ai', articleCount: 2, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't7', name: 'DevOps', slug: 'devops', articleCount: 1, createdAt: '2025-01-01T00:00:00Z' },
  { _id: 't8', name: 'MongoDB', slug: 'mongodb', articleCount: 2, createdAt: '2025-01-01T00:00:00Z' },
];

const articleContent = `
<h2>Introduction</h2>
<p>In the ever-evolving landscape of web development, staying current with the latest tools and best practices is essential. This article explores key concepts that every developer should understand to build modern, scalable applications.</p>
<p>Whether you're just starting out or you've been in the field for years, there's always something new to learn. Let's dive into the details.</p>

<h2>Getting Started</h2>
<p>The first step in any successful project is setting up a solid foundation. This means choosing the right tools, establishing coding conventions, and planning your architecture before writing a single line of code.</p>
<p>A well-structured project makes it easier to onboard new team members, debug issues, and add features over time. Consider using a monorepo structure for larger projects, and always keep your dependencies up to date.</p>

<h3>Key Considerations</h3>
<ul>
  <li>Choose a framework that fits your team's expertise</li>
  <li>Set up CI/CD pipelines early in the project</li>
  <li>Write tests from day one</li>
  <li>Document your architecture decisions</li>
</ul>

<h2>Best Practices</h2>
<p>Following established best practices helps maintain code quality and consistency across your team. Here are some principles that have stood the test of time:</p>
<ol>
  <li><strong>Keep it simple:</strong> Don't over-engineer solutions. Start with the simplest approach that works.</li>
  <li><strong>DRY principle:</strong> Don't repeat yourself. Extract common logic into reusable functions and components.</li>
  <li><strong>Code reviews:</strong> Every pull request should be reviewed by at least one other developer.</li>
</ol>

<h2>Conclusion</h2>
<p>Building great software is a continuous journey. By staying curious, following best practices, and collaborating with your team, you can create applications that are both powerful and maintainable.</p>
`;

export const dummyArticles: Article[] = [
  {
    _id: 'a1',
    title: 'Building Scalable React Applications in 2025',
    slug: 'building-scalable-react-applications-2025',
    excerpt: 'A comprehensive guide to building production-ready React applications with modern patterns and best practices.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    category: dummyCategories[3],
    tags: [dummyTags[0], dummyTags[1]],
    author: dummyUsers[0],
    status: 'published',
    views: 1243,
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
  },
  {
    _id: 'a2',
    title: 'The Complete Guide to TypeScript for Backend Development',
    slug: 'complete-guide-typescript-backend',
    excerpt: 'Learn how TypeScript can improve your Node.js backend with type safety and better developer experience.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    category: dummyCategories[3],
    tags: [dummyTags[1], dummyTags[2]],
    author: dummyUsers[1],
    status: 'published',
    views: 982,
    createdAt: '2025-11-18T10:00:00Z',
    updatedAt: '2025-11-18T10:00:00Z',
  },
  {
    _id: 'a3',
    title: 'Modern CSS Techniques Every Developer Should Know',
    slug: 'modern-css-techniques',
    excerpt: 'Explore the latest CSS features including container queries, cascade layers, and the new color functions.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
    category: dummyCategories[1],
    tags: [dummyTags[3]],
    author: dummyUsers[2],
    status: 'published',
    views: 756,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z',
  },
  {
    _id: 'a4',
    title: 'How AI Is Changing the Tech Startup Landscape',
    slug: 'ai-changing-tech-startup-landscape',
    excerpt: 'An analysis of how artificial intelligence is reshaping how startups build products and compete in the market.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    category: dummyCategories[2],
    tags: [dummyTags[4], dummyTags[5]],
    author: dummyUsers[0],
    status: 'published',
    views: 2105,
    createdAt: '2025-11-12T10:00:00Z',
    updatedAt: '2025-11-12T10:00:00Z',
  },
  {
    _id: 'a5',
    title: 'Setting Up a Production-Ready MongoDB Cluster',
    slug: 'production-ready-mongodb-cluster',
    excerpt: 'Step-by-step guide to deploying and managing MongoDB in production with replication and sharding.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    category: dummyCategories[0],
    tags: [dummyTags[7], dummyTags[6]],
    author: dummyUsers[1],
    status: 'published',
    views: 645,
    createdAt: '2025-11-10T10:00:00Z',
    updatedAt: '2025-11-10T10:00:00Z',
  },
  {
    _id: 'a6',
    title: 'Design Systems: From Concept to Implementation',
    slug: 'design-systems-concept-to-implementation',
    excerpt: 'How to build and maintain a design system that scales across products and teams.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    category: dummyCategories[1],
    tags: [dummyTags[3], dummyTags[0]],
    author: dummyUsers[2],
    status: 'published',
    views: 890,
    createdAt: '2025-11-08T10:00:00Z',
    updatedAt: '2025-11-08T10:00:00Z',
  },
  {
    _id: 'a7',
    title: 'DevOps Best Practices for Small Teams',
    slug: 'devops-best-practices-small-teams',
    excerpt: 'Practical DevOps strategies that work for small teams without enterprise-level budgets.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
    category: dummyCategories[0],
    tags: [dummyTags[6], dummyTags[2]],
    author: dummyUsers[0],
    status: 'published',
    views: 534,
    createdAt: '2025-11-05T10:00:00Z',
    updatedAt: '2025-11-05T10:00:00Z',
  },
  {
    _id: 'a8',
    title: 'Building a SaaS Product: Lessons Learned',
    slug: 'building-saas-product-lessons',
    excerpt: 'Real-world lessons from building and launching a SaaS product from scratch.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    category: dummyCategories[2],
    tags: [dummyTags[4]],
    author: dummyUsers[1],
    status: 'draft',
    views: 0,
    createdAt: '2025-11-03T10:00:00Z',
    updatedAt: '2025-11-03T10:00:00Z',
  },
  {
    _id: 'a9',
    title: 'React Server Components: A Practical Guide',
    slug: 'react-server-components-practical-guide',
    excerpt: 'Understanding React Server Components and how to use them effectively in your projects.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: dummyCategories[3],
    tags: [dummyTags[0], dummyTags[1]],
    author: dummyUsers[2],
    status: 'pending',
    views: 0,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
  },
  {
    _id: 'a10',
    title: 'The Future of AI-Powered Development Tools',
    slug: 'future-ai-powered-development-tools',
    excerpt: 'How AI assistants and tools are transforming the way developers write and maintain code.',
    content: articleContent,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    category: dummyCategories[0],
    tags: [dummyTags[5]],
    author: dummyUsers[0],
    status: 'published',
    views: 1876,
    createdAt: '2025-10-28T10:00:00Z',
    updatedAt: '2025-10-28T10:00:00Z',
  },
];

export const dummyStats: DashboardStats = {
  totalArticles: dummyArticles.length,
  totalViews: dummyArticles.reduce((sum, a) => sum + a.views, 0),
  totalCategories: dummyCategories.length,
  totalUsers: dummyUsers.length,
  recentArticles: dummyArticles.slice(0, 5),
};
