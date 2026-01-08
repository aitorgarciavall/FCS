-- 1. Crear la taula de Notícies
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    media_url TEXT, -- URL de la imatge o vídeo
    media_type VARCHAR(20) DEFAULT 'image', -- 'image' o 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_id UUID REFERENCES auth.users(id)
);

-- 2. Habilitar seguretat (RLS) a la taula
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Política de LECTURA: Tothom pot veure les notícies (públic)
CREATE POLICY "Public news access" ON news
    FOR SELECT USING (true);

-- Política d'ESCRIPTURA: Només Rols 1 i 2 poden inserir/editar/esborrar
CREATE POLICY "Admin write access" ON news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2) -- 1=SUPER_ADMIN, 2=COORDINATOR
        )
    );

-- 3. Crear el Bucket d'Emmagatzematge (Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-media', 'news-media', true);

-- 4. Polítiques d'Emmagatzematge (Storage Policies)
-- Permetre veure imatges a tothom
CREATE POLICY "Public media access" ON storage.objects
    FOR SELECT USING ( bucket_id = 'news-media' );

-- Permetre pujar fitxers només a Admins (Rols 1 i 2)
CREATE POLICY "Admin upload access" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'news-media' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2)
        )
    );

-- Permetre esborrar fitxers només a Admins
CREATE POLICY "Admin delete access" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'news-media' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2)
        )
    );
