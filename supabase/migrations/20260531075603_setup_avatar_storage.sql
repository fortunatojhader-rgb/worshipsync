-- 1. Cria o bucket de avatares se não existir
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Políticas para objetos no bucket de avatares
-- Permite leitura pública (bucket é público, mas garantimos aqui)
create policy "Avatar public access" on storage.objects
for select using (bucket_id = 'avatars');

-- Permite upload apenas para usuários autenticados
create policy "Avatar authenticated upload" on storage.objects
for insert with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
);

-- Permite atualizar/deletar apenas o próprio avatar
-- Nota: O caminho do arquivo será 'userId/avatar.jpg' para facilitar
create policy "Avatar owner management" on storage.objects
for all using (
  bucket_id = 'avatars' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
