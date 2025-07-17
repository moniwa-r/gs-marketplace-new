This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### RPC Call Issues (e.g., 400 Bad Request)

When making RPC calls to Supabase, ensure the `Prefer` header is correctly set. If you encounter `400 Bad Request` errors, especially with messages like `query has no destination for result data`, check the following:

1.  **DevTools Network Tab:** Open your browser's developer tools (F12) and go to the "Network" tab.
2.  **Inspect RPC Request:** Find the `POST` request to `/rest/v1/rpc/your_function_name`.
3.  **Check Request Headers:** In the "Headers" tab of the request, look for the `Prefer` header.
4.  **Verify `Prefer` Header Value:** Ensure it does NOT contain `undefinedreturn=representation`.
    *   If it does, it indicates that `.select()` was called with `undefined` or a non-string value. Always use `.select('*')` or omit `.select()` if no return value is needed.