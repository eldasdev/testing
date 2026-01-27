import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateSlug } from '../lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      password: hashedPassword,
      name: 'Ahmad Karimov',
      role: 'STUDENT',
      profile: {
        create: {
          education: 'Bachelor',
          university: 'Tashkent State University',
          graduationYear: 2025,
          interests: ['Software Development', 'Web Development'],
          languages: ['Uzbek', 'English', 'Russian'],
        },
      },
      skills: {
        create: [
          { name: 'JavaScript', proficiency: 'SENIOR', category: 'Technical' },
          { name: 'React', proficiency: 'MIDDLE', category: 'Technical' },
          { name: 'Node.js', proficiency: 'MIDDLE', category: 'Technical' },
          { name: 'Communication', proficiency: 'EXPERT', category: 'Soft Skills' },
        ],
      },
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      password: hashedPassword,
      name: 'Malika Yusupova',
      role: 'STUDENT',
      profile: {
        create: {
          education: 'Bachelor',
          university: 'Westminster International University',
          graduationYear: 2024,
          interests: ['Data Science', 'Machine Learning'],
          languages: ['Uzbek', 'English'],
        },
      },
      skills: {
        create: [
          { name: 'Python', proficiency: 'EXPERT', category: 'Technical' },
          { name: 'Data Analysis', proficiency: 'SENIOR', category: 'Technical' },
          { name: 'SQL', proficiency: 'SENIOR', category: 'Technical' },
        ],
      },
    },
  })

  const company1 = await prisma.user.upsert({
    where: { email: 'company@example.com' },
    update: {},
    create: {
      email: 'company@example.com',
      password: hashedPassword,
      name: 'Tech Solutions Uzbekistan',
      role: 'COMPANY',
    },
  })

  const mentor1 = await prisma.user.upsert({
    where: { email: 'mentor@example.com' },
    update: {},
    create: {
      email: 'mentor@example.com',
      password: hashedPassword,
      name: 'Dr. Alisher Navoi',
      role: 'MENTOR',
      bio: 'Experienced software engineer with 10+ years in the industry',
    },
  })

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@2024!', 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@studenthire.uz' },
    update: {},
    create: {
      email: 'admin@studenthire.uz',
      password: superAdminPassword,
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
      bio: 'Platform Super Administrator with full system access',
    },
  })

  // Create Regular Admin
  const admin1 = await prisma.user.upsert({
    where: { email: 'moderator@studenthire.uz' },
    update: {},
    create: {
      email: 'moderator@studenthire.uz',
      password: hashedPassword,
      name: 'Content Moderator',
      role: 'ADMIN',
      bio: 'Platform Content Moderator',
    },
  })

  console.log('✅ Created users (including Super Admin)')

  // Create job posts
  const job1 = await prisma.jobPost.create({
    data: {
      title: 'Frontend Developer',
      description: 'We are looking for a talented Frontend Developer to join our team. You will be responsible for building user interfaces and implementing responsive designs.',
      company: 'Tech Solutions Uzbekistan',
      location: 'Tashkent',
      type: 'FULL_TIME',
      experienceLevel: 'JUNIOR',
      salaryMin: 5000000,
      salaryMax: 8000000,
      currency: 'UZS',
      requirements: [
        'Strong knowledge of JavaScript and React',
        'Experience with HTML/CSS',
        'Understanding of responsive design',
        'Good communication skills',
      ],
      benefits: [
        'Health insurance',
        'Flexible working hours',
        'Professional development opportunities',
      ],
      postedById: company1.id,
      tags: {
        create: [
          { name: 'React' },
          { name: 'JavaScript' },
          { name: 'Frontend' },
        ],
      },
    },
  })

  const job2 = await prisma.jobPost.create({
    data: {
      title: 'Backend Developer',
      description: 'Join our backend team to build scalable APIs and services. Experience with Node.js and databases required.',
      company: 'Digital Innovations LLC',
      location: 'Tashkent',
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      salaryMin: 7000000,
      salaryMax: 12000000,
      currency: 'UZS',
      requirements: [
        'Experience with Node.js',
        'Knowledge of PostgreSQL or MongoDB',
        'Understanding of REST APIs',
        'Problem-solving skills',
      ],
      benefits: [
        'Competitive salary',
        'Remote work options',
        'Team building events',
      ],
      postedById: company1.id,
      tags: {
        create: [
          { name: 'Node.js' },
          { name: 'Backend' },
          { name: 'API' },
        ],
      },
    },
  })

  const job3 = await prisma.jobPost.create({
    data: {
      title: 'Data Analyst Intern',
      description: 'Great opportunity for students to gain real-world experience in data analysis. We provide mentorship and training.',
      company: 'Analytics Pro',
      location: 'Tashkent',
      type: 'INTERNSHIP',
      experienceLevel: 'ENTRY',
      salaryMin: 2000000,
      salaryMax: 3000000,
      currency: 'UZS',
      requirements: [
        'Basic knowledge of Python or R',
        'Interest in data analysis',
        'Currently enrolled in university',
      ],
      benefits: [
        'Mentorship program',
        'Certificate upon completion',
        'Potential full-time offer',
      ],
      postedById: company1.id,
      tags: {
        create: [
          { name: 'Data Analysis' },
          { name: 'Python' },
          { name: 'Internship' },
        ],
      },
    },
  })

  console.log('✅ Created job posts')

  // Create internships
  const internship1 = await prisma.internship.create({
    data: {
      title: 'Software Development Intern',
      description: '6-month internship program for aspiring software developers. Work on real projects with experienced mentors.',
      company: 'Tech Solutions Uzbekistan',
      location: 'Tashkent',
      duration: '6 months',
      stipend: 2500000,
      currency: 'UZS',
      requirements: [
        'Basic programming knowledge',
        'Eagerness to learn',
        'Currently a student',
      ],
      benefits: [
        'Hands-on experience',
        'Mentorship',
        'Certificate',
      ],
      postedById: company1.id,
      tags: {
        create: [
          { name: 'Software Development' },
          { name: 'Internship' },
        ],
      },
    },
  })

  console.log('✅ Created internships')

  // Create blog posts
  const blog1 = await prisma.blogPost.create({
    data: {
      title: 'How to Prepare for Your First Tech Interview',
      slug: generateSlug('How to Prepare for Your First Tech Interview'),
      content: `Preparing for your first tech interview can be nerve-wracking, but with the right preparation, you can succeed. Here are some key tips:

1. **Research the Company**: Understand their products, culture, and recent news
2. **Practice Coding**: Use platforms like LeetCode or HackerRank
3. **Review Fundamentals**: Brush up on data structures and algorithms
4. **Prepare Questions**: Have thoughtful questions ready to ask
5. **Mock Interviews**: Practice with friends or use online platforms

Remember, interviews are a two-way street - you're also evaluating if the company is right for you!`,
      excerpt: 'Essential tips for acing your first technical interview in the tech industry.',
      authorId: mentor1.id,
      isAIGenerated: false,
      tags: ['Interview Tips', 'Career Advice'],
      views: 150,
      likes: 25,
    },
  })

  const blog2 = await prisma.blogPost.create({
    data: {
      title: 'Building Your First Resume: A Step-by-Step Guide',
      slug: generateSlug('Building Your First Resume: A Step-by-Step Guide'),
      content: `Your resume is often the first impression employers have of you. Here's how to make it stand out:

1. **Choose the Right Format**: Use a clean, professional template
2. **Highlight Relevant Experience**: Focus on achievements, not just duties
3. **Use Action Verbs**: Start bullet points with strong action words
4. **Quantify Results**: Use numbers to show your impact
5. **Tailor for Each Job**: Customize your resume for each application
6. **Proofread**: Check for typos and grammatical errors

A well-crafted resume can open doors to opportunities!`,
      excerpt: 'Learn how to create a compelling resume that gets you noticed by employers.',
      authorId: mentor1.id,
      isAIGenerated: false,
      tags: ['Resume', 'Career Advice'],
      views: 200,
      likes: 35,
    },
  })

  console.log('✅ Created blog posts')

  // Create community threads
  const thread1 = await prisma.communityThread.create({
    data: {
      title: 'Best Programming Languages to Learn in 2024',
      slug: generateSlug('Best Programming Languages to Learn in 2024'),
      content: 'What programming languages do you think are most valuable to learn this year? I\'m a computer science student and want to focus on languages that will help me get a job after graduation.',
      category: 'Skills Development',
      authorId: student1.id,
      views: 120,
      likes: 15,
      posts: {
        create: [
          {
            content: 'I would recommend focusing on JavaScript and Python. Both are in high demand and versatile.',
            authorId: mentor1.id,
          },
          {
            content: 'Don\'t forget about TypeScript! It\'s becoming increasingly important in the JavaScript ecosystem.',
            authorId: student2.id,
          },
        ],
      },
    },
  })

  const thread2 = await prisma.communityThread.create({
    data: {
      title: 'How to Network as a Student',
      slug: generateSlug('How to Network as a Student'),
      content: 'I\'m finding it difficult to network with professionals in my field. Any tips on how to build meaningful connections as a student?',
      category: 'Networking',
      authorId: student2.id,
      views: 80,
      likes: 10,
      posts: {
        create: [
          {
            content: 'Attend industry events and meetups. Don\'t be afraid to introduce yourself and ask questions. Most professionals are happy to help students!',
            authorId: mentor1.id,
          },
        ],
      },
    },
  })

  console.log('✅ Created community threads')

  // Create career roadmaps
  await prisma.careerRoadmap.create({
    data: {
      userId: student1.id,
      title: 'Become a Full-Stack Developer',
      description: 'My path to becoming a full-stack developer',
      milestones: [
        { title: 'Learn HTML, CSS, and JavaScript basics', completed: true },
        { title: 'Master React framework', completed: true },
        { title: 'Learn Node.js and Express', completed: false },
        { title: 'Build 3 full-stack projects', completed: false },
        { title: 'Apply for junior developer positions', completed: false },
      ],
    },
  })

  await prisma.careerRoadmap.create({
    data: {
      userId: student2.id,
      title: 'Data Science Career Path',
      description: 'Steps to become a data scientist',
      milestones: [
        { title: 'Complete Python course', completed: true },
        { title: 'Learn pandas and numpy', completed: true },
        { title: 'Study machine learning basics', completed: false },
        { title: 'Complete data science project', completed: false },
        { title: 'Apply for data analyst internships', completed: false },
      ],
    },
  })

  console.log('✅ Created career roadmaps')

  // Create applications
  await prisma.application.create({
    data: {
      userId: student1.id,
      jobPostId: job1.id,
      status: 'PENDING',
      coverLetter: 'I am very interested in this position and believe my skills align well with your requirements.',
    },
  })

  console.log('✅ Created applications')

  // Create performance metrics
  await prisma.performanceMetrics.upsert({
    where: { userId: student1.id },
    update: {
      careerReadinessScore: 65,
      skillsCount: 4,
      applicationsCount: 1,
      acceptedCount: 0,
      practiceScore: 2,
      communityEngagement: 1,
    },
    create: {
      userId: student1.id,
      careerReadinessScore: 65,
      skillsCount: 4,
      applicationsCount: 1,
      acceptedCount: 0,
      practiceScore: 2,
      communityEngagement: 1,
    },
  })

  await prisma.performanceMetrics.upsert({
    where: { userId: student2.id },
    update: {
      careerReadinessScore: 55,
      skillsCount: 3,
      applicationsCount: 0,
      acceptedCount: 0,
      practiceScore: 1,
      communityEngagement: 2,
    },
    create: {
      userId: student2.id,
      careerReadinessScore: 55,
      skillsCount: 3,
      applicationsCount: 0,
      acceptedCount: 0,
      practiceScore: 1,
      communityEngagement: 2,
    },
  })

  console.log('✅ Created performance metrics')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
