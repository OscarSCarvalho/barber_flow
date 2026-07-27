import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { api } from './api'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      accessToken: string
    }
  }
  interface User {
    id?: string
    role: string
    accessToken: string
    refreshToken: string
  }
}

const loginSchema = z.object({
  tenantId: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
})

const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? 'tenant-dubarber-001'

export const { handlers, auth, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          tenantId: DEFAULT_TENANT_ID,
          email: credentials.email,
          password: credentials.password,
        })
        if (!parsed.success) return null

        const result = await api
          .post<{ accessToken: string; refreshToken: string; role: string; userId: string }>(
            '/auth/login',
            parsed.data,
          )
          .catch(() => null)

        if (!result) return null

        return {
          id: result.userId,
          email: credentials.email as string,
          role: result.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token['role'] = user.role
        token['accessToken'] = user.accessToken
        token['refreshToken'] = user.refreshToken
      }
      return token
    },
    session({ session, token }) {
      session.user.id = (token.sub ?? '') as string
      session.user.role = (token['role'] ?? '') as string
      session.user.accessToken = (token['accessToken'] ?? '') as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
})
