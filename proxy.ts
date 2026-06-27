import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/pemasukan",
  "/pengeluaran",
  "/transfer",
  "/tabungan",
  "/investasi",
  "/utang",
  "/budget",
  "/tujuan-keuangan",
  "/laporan",
  "/kalkulator",
  "/ai-assistant",
  "/pengingat",
  "/pengaturan",
];

const AUTH_PATH = "/auth";
const DEVICE_COOKIE_NAME = "device-type";

type DeviceType = "mobile" | "desktop";

function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";
  const mobilePattern = /Android|iPhone|iPod|Mobile(?!.*iPad)/i;
  return mobilePattern.test(userAgent) ? "mobile" : "desktop";
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = pathname.startsWith(AUTH_PATH);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!request.cookies.has(DEVICE_COOKIE_NAME)) {
    const deviceType = detectDeviceType(request.headers.get("user-agent"));
    supabaseResponse.cookies.set(DEVICE_COOKIE_NAME, deviceType, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
