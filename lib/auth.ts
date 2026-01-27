import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { logActivity } from './activity-log'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Log failed login attempt
          await logActivity({
            action: 'login_failed',
            actionType: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            userId: user.id,
            description: `Failed login attempt for ${credentials.email}`,
            metadata: { email: credentials.email },
          })
          return null
        }

        // Log successful login
        await logActivity({
          action: 'login_success',
          actionType: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          userId: user.id,
          description: `${user.name} (${user.email}) logged in`,
          metadata: { email: user.email, role: user.role },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          logo: user.logo,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial login, set role and image/logo from user object
      if (user) {
        token.role = user.role
        token.id = user.id
        token.image = (user as any).image
        token.logo = (user as any).logo
        token.roleRefreshedAt = Date.now()
        return token
      }
      
      // Refresh role and image/logo from database periodically (every 5 minutes) or when explicitly updated
      // This allows role changes and image updates to take effect without requiring re-login
      const roleRefreshInterval = 5 * 60 * 1000 // 5 minutes
      const lastRefresh = (token.roleRefreshedAt as number) || 0
      const shouldRefresh = Date.now() - lastRefresh > roleRefreshInterval
      const isExplicitUpdate = trigger === 'update'
      
      // Refresh if: explicit update OR (periodic refresh AND not already updating)
      if (token.id && (isExplicitUpdate || shouldRefresh)) {
        try {
          // Try to fetch user with logo field (may fail if Prisma client not regenerated)
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              role: true, 
              image: true, 
              // @ts-ignore - logo field exists in schema but may not be in generated client yet
              logo: true 
            },
          })
          
          if (dbUser) {
            token.role = dbUser.role
            token.image = dbUser.image
            // @ts-ignore - logo may not exist in generated client yet
            token.logo = (dbUser as any).logo
            token.roleRefreshedAt = Date.now()
          }
        } catch (error: any) {
          // If database query fails (e.g., Prisma client not regenerated), try without logo
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, image: true },
            })
            
            if (dbUser) {
              token.role = dbUser.role
              token.image = dbUser.image
              // logo will remain as cached value or null
              token.roleRefreshedAt = Date.now()
            }
          } catch (fallbackError) {
            // If even the fallback fails, keep existing token data
            token.roleRefreshedAt = Date.now()
            if (process.env.NODE_ENV === 'development') {
              console.debug('Could not refresh user data from database (using cached data):', fallbackError instanceof Error ? fallbackError.message : 'Unknown error')
            }
          }
        }
        
        // If this was an explicit update, always refresh immediately (don't wait for interval)
        if (isExplicitUpdate) {
          token.roleRefreshedAt = Date.now()
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Safely assign role, id, image, and logo with fallbacks
        session.user.role = (token.role as string) || 'STUDENT'
        session.user.id = (token.id as string) || ''
        session.user.image = (token.image as string) || null
        session.user.logo = (token.logo as string) || null
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      // Log logout
      if (token?.id) {
        await logActivity({
          action: 'logout',
          actionType: 'LOGOUT',
          entityType: 'User',
          entityId: token.id as string,
          userId: token.id as string,
          description: `User logged out`,
        })
      }
    },
  },
}
