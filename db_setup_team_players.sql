-- Taula de relació entre Equips i Jugadors (Usuaris)
CREATE TABLE team_players (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- Habilitar RLS
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Polítiques
-- Tothom pot veure qui juga a on (públic)
CREATE POLICY "Public team_players access" ON team_players
    FOR SELECT USING (true);

-- Només admins poden gestionar plantilles
CREATE POLICY "Admin manage team_players" ON team_players
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (
                SELECT id FROM roles WHERE code IN ('SUPER_ADMIN', 'ADMIN', 'COORDINATOR')
            )
        )
    );
