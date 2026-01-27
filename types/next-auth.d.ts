import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string | null
      logo?: string | null
    }
  }

  interface User {
    role: string
    id: string
    image?: string | null
    logo?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    id: string
    image?: string | null
    logo?: string | null
    roleRefreshedAt?: number
  }
}
