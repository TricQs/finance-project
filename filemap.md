# Project Map — Uangku

> Struktur folder proyek ini, biar AI & developer gak pusing nyari file.

```
projek iseng/
├── .env.local                  # Environment variables (local)
├── .gitignore
├── AGENTS.md                   # Agent rules untuk AI
├── CLAUDE.md                   # Claude-specific rules
├── filemap.md                  # ← ini dia
├── next.config.ts              # Next.js configuration
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── proxy.ts                    # Dev proxy
├── tsconfig.json
├── components.json             # Shadcn/ui config
├── eslint.config.mjs
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (ThemeProvider, font)
│   ├── page.tsx                # Home page (UI test)
│   └── globals.css             # Global styles + theme vars
│   │
│   ├── (public)/               # Route group (public pages)
│   │   ├── layout.tsx
│   │   └── auth/
│   │       └── page.tsx        # Auth page
│   │
│   └── auth/
│       └── callback/
│           └── route.ts        # OAuth callback
│
├── components/
│   ├── ui/                     # Shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── input-group.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   │
│   ├── auth/                   # Auth page components
│   │   ├── auth-form.tsx
│   │   ├── auth-input.tsx
│   │   ├── auth-layout.tsx     # ← pake ThemeToggle
│   │   ├── mascot-celengan.tsx
│   │   └── tab-switcher.tsx
│   │
│   └── shared/                 # Shared components
│       ├── logo.tsx
│       └── theme-toggle.tsx    # Expanding circle dark mode
│
├── lib/
│   ├── motion.ts               # Framer-motion easings
│   ├── utils.ts                # Tailwind merge utility
│   ├── auth/
│   │   └── actions.ts          # Server actions (auth)
│   └── supabase/
│       ├── client.ts           # Supabase browser client
│       └── server.ts           # Supabase server client
│
├── public/                     # Static assets
│   └── images/
│       └── logo.png
│
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Tabel File (alphabetical)

| # | Path | Fungsi |
|---|------|--------|
| 1 | `.env.local` | Environment variables lokal |
| 2 | `.gitignore` | Git ignore rules |
| 3 | `AGENTS.md` | Petunjuk untuk AI agent |
| 4 | `CLAUDE.md` | Petunjuk khusus Claude |
| 5 | `app/(public)/auth/page.tsx` | Halaman auth (login/register) |
| 6 | `app/(public)/layout.tsx` | Layout untuk public route group |
| 7 | `app/auth/callback/route.ts` | OAuth callback handler (Supabase) |
| 8 | `app/globals.css` | Global CSS + CSS variables tema dark/light |
| 9 | `app/layout.tsx` | Root layout (font, ThemeProvider, Toaster) |
| 10 | `app/page.tsx` | Halaman utama (UI test sementara) |
| 11 | `components.json` | Konfigurasi shadcn/ui |
| 12 | `components/auth/auth-form.tsx` | Form login/register |
| 13 | `components/auth/auth-input.tsx` | Input field kustom untuk auth |
| 14 | `components/auth/auth-layout.tsx` | Layout halaman auth (mascot, features, ThemeToggle) |
| 15 | `components/auth/mascot-celengan.tsx` | Animasi celengan (Rive) |
| 16 | `components/auth/tab-switcher.tsx` | Tab switcher login ↔ register |
| 17 | `components/shared/logo.tsx` | Logo "Uangku" dengan ribbon |
| 18 | `components/shared/theme-toggle.tsx` | Tombol dark mode + expanding circle |
| 19 | `components/ui/*.tsx` | 23 komponen UI shadcn/ui |
| 20 | `eslint.config.mjs` | ESLint config |
| 21 | `filemap.md` | **Peta file ini** |
| 22 | `lib/auth/actions.ts` | Server actions autentikasi |
| 23 | `lib/motion.ts` | Easing curves & motion presets |
| 24 | `lib/supabase/client.ts` | Supabase client (browser) |
| 25 | `lib/supabase/server.ts` | Supabase client (server) |
| 26 | `lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| 27 | `next-env.d.ts` | TypeScript env types (auto) |
| 28 | `next.config.ts` | Next.js config |
| 29 | `package.json` | Dependencies & scripts |
| 30 | `postcss.config.mjs` | PostCSS (Tailwind v4) |
| 31 | `proxy.ts` | Dev proxy |
| 32 | `tsconfig.json` | TypeScript config |
| 33 | `types/index.ts` | Shared types |

---

> **Catatan:** Folder `.next/`, `node_modules/`, dan `public/images/` tidak masuk peta karena auto-generated / binary assets.
