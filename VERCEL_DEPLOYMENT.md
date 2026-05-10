# Vercel Deployment Guide

This project is now configured for deployment on Vercel. Follow these steps to deploy:

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your project pushed to GitHub, GitLab, or Bitbucket
- Your Supabase credentials

## Deployment Steps

### 1. Connect Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Select your Git provider and authorize it
4. Select this repository
5. Click "Import"

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable Name | Value | Source |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | From `.env` or Supabase dashboard |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anonymous key | From `.env` or Supabase dashboard |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | From `.env` or Supabase dashboard |

#### To find your Supabase credentials:
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the `Project URL` and `anon` public key

**Note:** Make sure these are your public/anonymous keys, not secret keys.

### 3. Deploy

Once environment variables are set:

1. Click "Deploy"
2. Vercel will automatically build and deploy your project
3. Your site will be live at `https://your-project-name.vercel.app`

## Build Configuration

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node.js Version:** 20 (recommended)

## Configuration Files

### `vercel.json`
Configures the build settings and environment variables. It includes:
- Build and output directory configuration
- Client-side routing rewrites (all routes point to `/index.html` for React Router)
- Environment variable definitions

### `.vercelignore`
Excludes files/folders from deployment:
- `supabase/` - Supabase Edge Functions are hosted on Supabase, not Vercel
- `.env.local` - Local environment files are not deployed

## Features Supported

✅ React + TypeScript  
✅ Vite for fast builds  
✅ Tailwind CSS  
✅ Shadcn UI components  
✅ Supabase integration  
✅ PWA manifest  
✅ Client-side routing with React Router  

## Post-Deployment

### 1. Update Supabase Auth URLs

If you're using Supabase authentication, update the Auth redirect URLs:

1. Go to your Supabase project → Authentication → URL Configuration
2. Add your Vercel deployment URL:
   - `https://your-project-name.vercel.app`
   - `https://your-project-name.vercel.app/auth/callback` (if applicable)

### 2. Enable Automatic Deployments

By default, Vercel automatically deploys on every push to your main branch. You can configure this in project settings.

### 3. Custom Domain (Optional)

To use a custom domain:
1. In Vercel project settings, go to "Domains"
2. Add your domain and follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Verify the build passes locally: `npm run build`
- Check Vercel build logs for specific errors

### Authentication Issues
- Ensure Supabase Auth redirect URLs include your Vercel domain
- Verify environment variables are correctly named (case-sensitive)

### PWA Not Working
- Service workers are supported on Vercel
- Ensure you're accessing the site over HTTPS (automatic with Vercel)

## Supabase Functions

If you need serverless functions, consider:
- **Supabase Edge Functions** - For functions that interact with your database (hosted on Supabase)
- **Vercel Functions** - For other serverless needs (create `api/` folder in root)

Currently, your Supabase functions are configured to run on Supabase, which is recommended.

## Next Steps

- Set up continuous deployment via GitHub/GitLab/Bitbucket
- Configure custom domain (optional)
- Enable analytics in Vercel dashboard
- Monitor performance in Vercel Analytics

For more information, see the [Vercel documentation](https://vercel.com/docs).
