-- MarketingPilot AI - Initial Database Schema

-- Users & Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'free'
);

CREATE TABLE workspace_users (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- Module 1: Business Profile
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    target_audience TEXT,
    location VARCHAR(255),
    website_url VARCHAR(255),
    monthly_budget DECIMAL,
    brand_colors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Module 2: AI Analysis
CREATE TABLE business_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    swot_analysis JSONB,
    customer_personas JSONB,
    content_pillars JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic Content Store
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    content_type VARCHAR(50), -- 'post', 'blog', 'email', 'image'
    platform VARCHAR(50), -- 'instagram', 'linkedin', etc.
    content JSONB,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'scheduled', 'published', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
