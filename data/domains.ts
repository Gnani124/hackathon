export interface Skill {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export interface Domain {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  skills: Skill[];
  timeToComplete: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const domains: Domain[] = [
  {
    id: '1',
    title: 'Web Development',
    description: 'Learn to build modern web applications with the latest technologies.',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    color: '#4F46E5',
    skills: [
      {
        id: '1-1',
        title: 'HTML & CSS',
        description: 'Learn the fundamentals of web structure and styling.',
        level: 'beginner',
        estimatedTime: '2 weeks',
      },
      {
        id: '1-2',
        title: 'JavaScript',
        description: 'Master the programming language of the web.',
        level: 'beginner',
        estimatedTime: '4 weeks',
      },
      {
        id: '1-3',
        title: 'React',
        description: 'Build user interfaces with the popular React library.',
        level: 'intermediate',
        estimatedTime: '6 weeks',
      },
      {
        id: '1-4',
        title: 'Node.js',
        description: 'Create server-side applications with JavaScript.',
        level: 'intermediate',
        estimatedTime: '4 weeks',
      },
      {
        id: '1-5',
        title: 'Database Management',
        description: 'Learn to work with SQL and NoSQL databases.',
        level: 'intermediate',
        estimatedTime: '3 weeks',
      },
    ],
    timeToComplete: '6 months',
    difficulty: 'Medium',
  },
  {
    id: '2',
    title: 'Data Science',
    description: 'Analyze data and build machine learning models to solve real-world problems.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    color: '#10B981',
    skills: [
      {
        id: '2-1',
        title: 'Python',
        description: 'Learn the programming language essential for data science.',
        level: 'beginner',
        estimatedTime: '4 weeks',
      },
      {
        id: '2-2',
        title: 'Statistics',
        description: 'Understand statistical concepts for data analysis.',
        level: 'intermediate',
        estimatedTime: '3 weeks',
      },
      {
        id: '2-3',
        title: 'Data Visualization',
        description: 'Create compelling visualizations to communicate insights.',
        level: 'intermediate',
        estimatedTime: '2 weeks',
      },
      {
        id: '2-4',
        title: 'Machine Learning',
        description: 'Build models that can learn from data and make predictions.',
        level: 'advanced',
        estimatedTime: '8 weeks',
      },
      {
        id: '2-5',
        title: 'Deep Learning',
        description: 'Explore neural networks and deep learning architectures.',
        level: 'advanced',
        estimatedTime: '6 weeks',
      },
    ],
    timeToComplete: '8 months',
    difficulty: 'Hard',
  },
  {
    id: '3',
    title: 'Mobile Development',
    description: 'Create mobile applications for iOS and Android platforms.',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    color: '#F59E0B',
    skills: [
      {
        id: '3-1',
        title: 'React Native',
        description: 'Build cross-platform mobile apps with JavaScript.',
        level: 'intermediate',
        estimatedTime: '6 weeks',
      },
      {
        id: '3-2',
        title: 'iOS Development',
        description: 'Create native iOS applications with Swift.',
        level: 'intermediate',
        estimatedTime: '8 weeks',
      },
      {
        id: '3-3',
        title: 'Android Development',
        description: 'Develop native Android apps with Kotlin.',
        level: 'intermediate',
        estimatedTime: '8 weeks',
      },
      {
        id: '3-4',
        title: 'UI/UX Design',
        description: 'Design intuitive and engaging mobile interfaces.',
        level: 'intermediate',
        estimatedTime: '4 weeks',
      },
      {
        id: '3-5',
        title: 'App Publishing',
        description: 'Learn to publish your apps to the App Store and Google Play.',
        level: 'beginner',
        estimatedTime: '2 weeks',
      },
    ],
    timeToComplete: '7 months',
    difficulty: 'Medium',
  },
]; 