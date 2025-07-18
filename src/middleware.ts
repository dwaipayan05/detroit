import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/chat(.*)',
    '/user/profile/(.*)',
]);

const isAdminRoute = createRouteMatcher([
    '/admin(.*)'
]);

export default clerkMiddleware(async(auth, req) => {
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        // Print session metadata
        console.error('Unauthorized access attempt to admin route:', {
            sessionClaims: (await auth()).sessionClaims,
        });
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
    }
    if (isProtectedRoute(req)) await auth.protect();

});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}