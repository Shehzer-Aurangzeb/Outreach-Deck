-- Outreach Deck: Row Level Security Policies
-- Run this in the Supabase SQL Editor after Prisma has created the tables

-- ============================================
-- Company table RLS
-- ============================================
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own company rows
CREATE POLICY "Users can view own companies" ON "Company"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own companies" ON "Company"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own companies" ON "Company"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own companies" ON "Company"
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================
-- Contact table RLS
-- ============================================
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own contact rows
CREATE POLICY "Users can view own contacts" ON "Contact"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own contacts" ON "Contact"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own contacts" ON "Contact"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own contacts" ON "Contact"
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================
-- Message table RLS
-- ============================================
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access messages for contacts they own
-- This requires a join to the Contact table to verify ownership
CREATE POLICY "Users can view own messages" ON "Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact".id = "Message"."contactId"
        AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own messages" ON "Message"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact".id = "Message"."contactId"
        AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own messages" ON "Message"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact".id = "Message"."contactId"
        AND "Contact"."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact".id = "Message"."contactId"
        AND "Contact"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own messages" ON "Message"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Contact"
      WHERE "Contact".id = "Message"."contactId"
        AND "Contact"."userId" = auth.uid()::text
    )
  );

-- ============================================
-- Profile table RLS
-- ============================================
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profile (one per user)
CREATE POLICY "Users can view own profile" ON "Profile"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own profile" ON "Profile"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own profile" ON "Profile"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own profile" ON "Profile"
  FOR DELETE
  USING (auth.uid()::text = "userId");
