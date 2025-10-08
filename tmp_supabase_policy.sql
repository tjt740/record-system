DROP POLICY IF EXISTS "Allow anon select admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon insert admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon update admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon delete admins_table" ON public.admins_table;

CREATE POLICY "Allow anon select admins_table"
  ON public.admins_table
  FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "Allow anon insert admins_table"
  ON public.admins_table
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon update admins_table"
  ON public.admins_table
  FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon delete admins_table"
  ON public.admins_table
  FOR DELETE
  USING (auth.role() = 'anon');

DROP POLICY IF EXISTS "Allow anon select accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon insert accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon update accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon delete accounts_table" ON public.accounts_table;

CREATE POLICY "Allow anon select accounts_table"
  ON public.accounts_table
  FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "Allow anon insert accounts_table"
  ON public.accounts_table
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon update accounts_table"
  ON public.accounts_table
  FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon delete accounts_table"
  ON public.accounts_table
  FOR DELETE
  USING (auth.role() = 'anon');
