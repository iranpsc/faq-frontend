import { Category, Question, User } from './types';

// Fallback data for when the backend is not available
export const fallbackCategories: Category[] = [
  // Parent categories
  { id: '1', name: 'برنامه نویسی', slug: 'programming', questions_count: 0, children_count: 4, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'طراحی وب', slug: 'web-design', questions_count: 0, children_count: 3, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'هوش مصنوعی', slug: 'artificial-intelligence', questions_count: 28, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'دیتابیس', slug: 'database', questions_count: 25, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'شبکه', slug: 'networking', questions_count: 22, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '6', name: 'امنیت', slug: 'security', questions_count: 18, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '7', name: 'موبایل', slug: 'mobile', questions_count: 0, children_count: 2, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '8', name: 'DevOps', slug: 'devops', questions_count: 12, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  
  // Subcategories of Programming
  { id: '9', name: 'Python', slug: 'python', questions_count: 35, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '10', name: 'JavaScript', slug: 'javascript', questions_count: 42, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '11', name: 'PHP', slug: 'php', questions_count: 25, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '12', name: 'Java', slug: 'java', questions_count: 30, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  
  // Subcategories of Web Design
  { id: '13', name: 'React', slug: 'react', questions_count: 38, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '14', name: 'Vue.js', slug: 'vuejs', questions_count: 28, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '15', name: 'Node.js', slug: 'nodejs', questions_count: 31, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  
  // Subcategories of Mobile
  { id: '16', name: 'Android', slug: 'android', questions_count: 20, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '17', name: 'iOS', slug: 'ios', questions_count: 18, children_count: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

export const fallbackQuestions: Question[] = [
  {
    id: '1',
    title: 'چگونه در React از useState استفاده کنم؟',
    content: 'من تازه شروع به یادگیری React کرده‌ام و می‌خواهم بدانم چگونه از useState hook استفاده کنم...',
    slug: 'how-to-use-usestate-in-react',
    user: {
      id: '1',
      name: 'علی احمدی',
      image_url: undefined
    },
    category: {
      id: '11',
      name: 'React',
      slug: 'react'
    },
    tags: [
      { id: '1', name: 'react', slug: 'react', questions_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'javascript', slug: 'javascript', questions_count: 25, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ],
    answers_count: 5,
    views_count: 120,
    votes_count: 8,
    is_solved: false,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'تفاوت بین let و const در JavaScript چیست؟',
    content: 'می‌خواهم تفاوت بین let و const در JavaScript را بدانم و چه زمانی از هر کدام استفاده کنم...',
    slug: 'difference-between-let-and-const-in-javascript',
    user: {
      id: '2',
      name: 'مریم رضایی',
      image_url: undefined
    },
    category: {
      id: '10',
      name: 'JavaScript',
      slug: 'javascript'
    },
    tags: [
      { id: '3', name: 'javascript', slug: 'javascript', questions_count: 25, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'es6', slug: 'es6', questions_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ],
    answers_count: 3,
    views_count: 89,
    votes_count: 12,
    is_solved: true,
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    title: 'بهترین زبان برنامه نویسی برای شروع چیست؟',
    content: 'من تازه شروع به یادگیری برنامه نویسی کرده‌ام و می‌خواهم بدانم کدام زبان را انتخاب کنم...',
    slug: 'best-programming-language-for-beginners',
    user: {
      id: '3',
      name: 'احمد کریمی',
      image_url: undefined
    },
    category: {
      id: '1',
      name: 'برنامه نویسی',
      slug: 'programming'
    },
    tags: [
      { id: '5', name: 'programming', slug: 'programming', questions_count: 45, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'beginner', slug: 'beginner', questions_count: 20, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ],
    answers_count: 7,
    views_count: 156,
    votes_count: 15,
    is_solved: false,
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    title: 'چگونه یک پروژه برنامه نویسی را شروع کنم؟',
    content: 'من اصول برنامه نویسی را یاد گرفته‌ام و حالا می‌خواهم اولین پروژه خود را شروع کنم...',
    slug: 'how-to-start-programming-project',
    user: {
      id: '4',
      name: 'زهرا احمدی',
      image_url: undefined
    },
    category: {
      id: '1',
      name: 'برنامه نویسی',
      slug: 'programming'
    },
    tags: [
      { id: '5', name: 'programming', slug: 'programming', questions_count: 45, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'project', slug: 'project', questions_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ],
    answers_count: 4,
    views_count: 98,
    votes_count: 8,
    is_solved: true,
    created_at: '2024-01-12T16:30:00Z',
    updated_at: '2024-01-12T16:30:00Z'
  },
  {
    id: '5',
    title: 'تفاوت بین Frontend و Backend چیست؟',
    content: 'می‌خواهم تفاوت بین Frontend و Backend را بدانم و کدام یک را انتخاب کنم...',
    slug: 'difference-between-frontend-and-backend',
    user: {
      id: '5',
      name: 'محمد رضایی',
      image_url: undefined
    },
    category: {
      id: '2',
      name: 'طراحی وب',
      slug: 'web-design'
    },
    tags: [
      { id: '8', name: 'frontend', slug: 'frontend', questions_count: 30, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '9', name: 'backend', slug: 'backend', questions_count: 25, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ],
    answers_count: 6,
    views_count: 134,
    votes_count: 11,
    is_solved: false,
    created_at: '2024-01-11T11:45:00Z',
    updated_at: '2024-01-11T11:45:00Z'
  }
];

export const fallbackUsers: User[] = [
  {
    id: '1',
    name: 'علی احمدی',
    score: 1250,
    level_name: 'کارشناس',
    questions_count: 15,
    answers_count: 45,
    online: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'مریم رضایی',
    score: 980,
    level_name: 'متوسط',
    questions_count: 8,
    answers_count: 32,
    online: false,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'حسن محمدی',
    score: 2100,
    level_name: 'حرفه‌ای',
    questions_count: 25,
    answers_count: 78,
    online: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];
