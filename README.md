# StudentHire - Career Platform for Students in Uzbekistan

A comprehensive full-stack web application built with Next.js, PostgreSQL, Prisma, and TailwindCSS. This platform helps students in Uzbekistan overcome challenges in starting their careers by providing job vacancies, internships, mentoring, community forums, and AI-powered career advice.

## Features

- **Job Vacancies Feed**: Personalized job listings with advanced filtering
- **Resume Builder**: Interactive tool to create professional resumes with PDF export
- **Practice Playground**: Coding challenges, mock interviews, and skill-building exercises
- **AI-Based Blog**: Get AI-powered career advice and answers to your questions
- **Community Forum**: Connect with peers, mentors, and professionals
- **Career Roadmap**: Plan your career path with personalized milestones
- **Performance Calculator**: Track your career readiness score
- **User Authentication**: Secure authentication with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Icons**: React Icons
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studenthire
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/studenthire?schema=public"
NEXT_PUBLIC_YANDEX_MAPS_API_KEY="your-yandex-maps-api-key-here"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
studenthire/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── blog/              # Blog pages
│   ├── community/         # Community forum pages
│   ├── jobs/              # Job listing pages
│   ├── practice/          # Practice playground pages
│   ├── roadmap/           # Career roadmap pages
│   └── ...
├── components/            # React components
│   ├── blog/              # Blog components
│   ├── community/         # Community components
│   ├── dashboard/         # Dashboard components
│   ├── jobs/              # Job-related components
│   ├── layout/             # Layout components
│   ├── practice/          # Practice components
│   ├── resume/            # Resume builder components
│   └── roadmap/           # Roadmap components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: Students, companies, mentors, and admins
- **JobPost**: Job vacancies posted by companies
- **Internship**: Internship opportunities
- **Application**: Job/internship applications
- **Resume**: User-generated resumes
- **BlogPost**: Blog posts and AI-generated content
- **CommunityThread/Post**: Forum discussions
- **CareerRoadmap**: User career planning
- **PracticeSubmission**: Practice challenge submissions
- **PerformanceMetrics**: Career readiness tracking

## Default Accounts

After seeding, you can log in with:

- **Student 1**: `student1@example.com` / `password123`
- **Student 2**: `student2@example.com` / `password123`
- **Company**: `company@example.com` / `password123`
- **Mentor**: `mentor@example.com` / `password123`

## Features in Detail

### Job Vacancies
- Browse and filter job listings by location, type, experience level
- Apply for positions directly from the platform
- View detailed job descriptions and requirements

### Resume Builder
- Interactive form-based resume creation
- Multiple templates
- PDF export functionality
- Save and manage multiple resumes

### Practice Playground
- Coding challenges with different difficulty levels
- Mock interview questions
- Skill-building quizzes
- Track your progress and scores

### AI Blog
- Ask career-related questions
- Get AI-generated responses and advice
- Browse community questions and answers

### Community Forum
- Create discussion threads
- Reply to posts
- Categorize discussions
- Connect with peers and mentors

### Career Roadmap
- Create personalized career paths
- Set milestones and track progress
- Visual progress indicators

### Performance Calculator
- Automatic career readiness scoring
- Based on skills, applications, practice, and engagement
- Track improvement over time

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS
- DigitalOcean

Make sure to:
- Set up PostgreSQL database
- Configure environment variables
- Run database migrations
- Seed initial data if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@studenthire.uz or open an issue in the repository.

## Acknowledgments

- Built for students in Uzbekistan
- Designed to help bridge the gap between education and career
- Inspired by the need for better career resources in the region
