import { clerkMiddleware, clerkClient, auth, currentUser, createRouteMatcher } from '@clerk/nextjs/server'


const isPublicRoute = createRouteMatcher(["/" , "/api/webhook/register", "/sign-up", "/sign-in"])

export default clerkMiddleware(async(auth, request) => {
  if ( !isPublicRoute(request)) {
    await auth.protect();
  }
  
});
const { userId } = await auth()

  if (!userId) {
    currentUser.name.
  }


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};