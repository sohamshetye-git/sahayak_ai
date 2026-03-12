#!/bin/bash

# Set environment variables for sahayak-two project on Vercel
# Run this from the frontend directory

echo "Setting up Vercel environment variables..."

# Set primary backend (Vercel)
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://sahayak-ai-backend.vercel.app

# Set fallback backend (Render)
vercel env add NEXT_PUBLIC_FALLBACK_API_URL production
# When prompted, enter: https://sahayak-ai-mvny.onrender.com

# Set Node environment
vercel env add NODE_ENV production
# When prompted, enter: production

echo "Environment variables set! Now redeploy the project:"
echo "vercel --prod"