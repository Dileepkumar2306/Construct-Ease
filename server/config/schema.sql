-- PostgreSQL Database Schema for Construct Ease (Supabase)
-- Paste this script into the Supabase SQL Editor to create the required tables.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    "passwordHash" TEXT,
    role TEXT DEFAULT 'customer',
    "isVerified" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "lastLogin" TIMESTAMP WITH TIME ZONE
);

-- 2. Professionals Table
CREATE TABLE IF NOT EXISTS professionals (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    rating NUMERIC DEFAULT 4.8,
    experience TEXT,
    "contactEmail" TEXT,
    phone TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    description TEXT
);

-- 3. Templates Table
CREATE TABLE IF NOT EXISTS templates (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    area NUMERIC NOT NULL,
    style TEXT NOT NULL,
    image_url TEXT NOT NULL,
    bedrooms TEXT,
    duration TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    materials JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Estimates Table
CREATE TABLE IF NOT EXISTS estimates (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area NUMERIC NOT NULL,
    quality TEXT DEFAULT 'standard',
    "totalCost" NUMERIC NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "professionalId" UUID NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "projectArea" NUMERIC DEFAULT 0,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BHK Details Table
CREATE TABLE IF NOT EXISTS bhk_details (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "bhkType" TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    "areaRange" TEXT NOT NULL,
    duration TEXT NOT NULL,
    rooms JSONB DEFAULT '[]'::jsonb,
    materials JSONB DEFAULT '{}'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "projectArea" NUMERIC NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL,
    area NUMERIC NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Interior Estimates Table
CREATE TABLE IF NOT EXISTS interior_estimates (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area NUMERIC NOT NULL,
    style TEXT DEFAULT 'modern',
    quality TEXT DEFAULT 'standard',
    "totalCost" NUMERIC NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    "priceRating" TEXT NOT NULL,
    rating NUMERIC DEFAULT 4.5,
    description TEXT
);

-- 11. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    background_image TEXT,
    logo TEXT,
    posters JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    designs JSONB DEFAULT '[]'::jsonb,
    ratings JSONB DEFAULT '[]'::jsonb,
    "averageRating" NUMERIC DEFAULT 0
);

-- 12. Portfolio Items Table
CREATE TABLE IF NOT EXISTS portfolio_items (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    author TEXT DEFAULT 'Anonymous',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. AI Results Table
CREATE TABLE IF NOT EXISTS ai_results (
    _id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature TEXT NOT NULL,
    input JSONB NOT NULL,
    output JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
