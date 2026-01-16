-- Taula de Partits
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    opponent VARCHAR(255) NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    lineup JSONB, -- Aquí guardarem la posició dels jugadors: { "1": { id, name... }, "2": ... }
    formation VARCHAR(10) DEFAULT 'F11', -- 'F7' o 'F11'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Polítiques RLS (Seguretat)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Tothom pot veure els partits
CREATE POLICY "Public matches access" ON matches
    FOR SELECT USING (true);

-- Només admins poden gestionar partits
CREATE POLICY "Admin manage matches" ON matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 2, 3) -- SuperAdmin, Admin, Coordinator
        )
    );
