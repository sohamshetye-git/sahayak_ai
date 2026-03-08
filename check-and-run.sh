#!/bin/bash

echo "========================================"
echo "  Sahayak AI - Pre-Flight Check"
echo "========================================"
echo ""

# Step 1: Check TypeScript errors
echo "Step 1: Checking TypeScript errors..."
cd frontend
npx tsc --noEmit --skipLibCheck 2>&1
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ TypeScript errors found! Fix them before running."
    echo ""
    echo "To fix:"
    echo "  1. Read the error messages above"
    echo "  2. Open the files mentioned in the errors"
    echo "  3. Fix the issues (duplicate keys, type mismatches, etc.)"
    echo "  4. Run this script again"
    exit 1
fi
echo "✅ TypeScript check passed!"
echo ""

# Step 2: Clear Next.js cache (prevents stale builds)
echo "Step 2: Clearing Next.js cache..."
cd ..
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    echo "✅ Cache cleared!"
else
    echo "ℹ️  No cache to clear."
fi
echo ""

# Step 3: Start backend
echo "Step 3: Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
cd ..

# Step 4: Wait for backend to be ready
echo "Step 4: Waiting for backend to initialize..."
sleep 5

# Step 5: Start frontend
echo "Step 5: Starting frontend server..."
cd frontend
npm run dev
