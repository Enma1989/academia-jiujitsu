import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 1. Get User (Refresh Session)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 2. Protect /professor route
    if (request.nextUrl.pathname.startsWith("/professor")) {
        // Not logged in -> Redirect to login
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Logged in -> Check Role in public.profiles
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const userRole = profile?.role;

        // If no role or not authorized -> Redirect to login with error
        if (!userRole || !["admin", "teacher", "professor"].includes(userRole)) {
            // Optional: Sign out is client-side usually, but we block access here.
            return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
