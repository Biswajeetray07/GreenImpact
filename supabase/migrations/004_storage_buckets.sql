-- Create 'winner-proofs' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('winner-proofs', 'winner-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own winner-proofs folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'winner-proofs' AND 
  (storage.foldername(name))[1] = 'winners' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Allow users to view their own uploaded proofs
CREATE POLICY "Users can view their own proofs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'winner-proofs' AND 
  (storage.foldername(name))[1] = 'winners' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Admin can read all files
CREATE POLICY "Admins can view all proofs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'winner-proofs' AND 
  (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'admin'
);

-- Ensure public can read (since bucket is public, this may be optional, but good to be explicit for signed URLs)
CREATE POLICY "Public access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'winner-proofs');
