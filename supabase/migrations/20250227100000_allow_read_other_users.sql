-- Allow authenticated users to read other users' profiles (for suggested connections)
create policy "Users can read other users for connections"
  on public.users for select
  using (
    auth.uid() is not null
    and id != auth.uid()
  );
