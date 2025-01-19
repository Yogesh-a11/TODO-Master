

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}


// "use client"
// import { NextRequest, NextResponse } from "next/server";
// import { useAuth } from "@clerk/nextjs";

// const publicRoutes = ["/", "/api/webhook/register", "/sign-in", "/sign-up"];

// export async function middleware(req: NextRequest) {
//   const { userId } = useAuth();
//   const { pathname } = req.nextUrl;

//   // Handle unauthenticated users accessing protected routes
//   if (!userId && !publicRoutes.includes(pathname)) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   if (userId) {
//     try {
//       // Use the Clerk API to fetch user data
//       const response = await fetch(
//         `https://api.clerk.dev/v1/users/${userId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch user data: ${response.statusText}`);
//       }

//       const user = await response.json();
//       const role = user.public_metadata?.role;

//       // Redirect admin users to the admin dashboard
//       if (role === "admin" && pathname === "/dashboard") {
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//       }

//       // Prevent non-admin users from accessing admin routes
//       if (role !== "admin" && pathname.startsWith("/admin")) {
//         return NextResponse.redirect(new URL("/dashboard", req.url));
//       }

//       // Redirect authenticated users trying to access public routes
//       if (publicRoutes.includes(pathname)) {
//         const dashboardRoute = role === "admin" ? "/admin/dashboard" : "/dashboard";
//         return NextResponse.redirect(new URL(dashboardRoute, req.url));
//       }
//     } catch (error) {
//       console.error("Error fetching user data from Clerk:", error);
//       return NextResponse.redirect(new URL("/error", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!.*\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
