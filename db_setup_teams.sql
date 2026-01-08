-- 1. Crear la taula d'Equips
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age VARCHAR(100) NOT NULL,
    image_url TEXT,
    tag VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_id UUID REFERENCES auth.users(id)
);

-- 2. Habilitar seguretat (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Política de LECTURA: Públic
CREATE POLICY "Public teams access" ON teams
    FOR SELECT USING (true);

-- Política d'ESCRIPTURA: Admins (Rols 1 i 2)
CREATE POLICY "Admin write access for teams" ON teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2)
        )
    );

-- 3. Crear el Bucket d'Emmagatzematge si no existeix (tot i que normalment es fa un per tot el media)
-- Usarem el mateix bucket 'news-media' o en crearem un de genèric 'club-media'
-- De moment, per simplicitat, podem usar el de news-media o crear 'teams-media'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teams-media', 'teams-media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Polítiques d'Emmagatzematge per teams-media
CREATE POLICY "Public teams media access" ON storage.objects
    FOR SELECT USING ( bucket_id = 'teams-media' );

CREATE POLICY "Admin upload teams media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'teams-media' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2)
        )
    );

CREATE POLICY "Admin delete teams media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'teams-media' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2)
        )
    );
