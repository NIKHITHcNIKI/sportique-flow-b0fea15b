DROP POLICY IF EXISTS "Anyone authenticated can view items" ON public.items;
CREATE POLICY "Admins and students can view items" ON public.items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'student'));

DROP POLICY IF EXISTS "Authenticated can view scrap items" ON public.scrap_items;

DROP POLICY IF EXISTS "Anyone can view borrow photos" ON storage.objects;
CREATE POLICY "Owners and admins can view borrow photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'borrow-photos' AND ((storage.foldername(name))[1] = (select auth.uid()::text) OR public.has_role(auth.uid(), 'admin')));

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Users upload photos to own folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'borrow-photos' AND (storage.foldername(name))[1] = (select auth.uid()::text));