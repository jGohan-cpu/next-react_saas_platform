import { db } from '@/db';
import { router, publicProcedure } from './trpc';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';


export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.email || !user.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            }
        })

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                }
            })
        }

        return { success: true }
    })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;