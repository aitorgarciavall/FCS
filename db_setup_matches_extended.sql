-- Ampliar la taula de partits amb resultats, golejadors i crònica
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS result_home INTEGER,
ADD COLUMN IF NOT EXISTS result_away INTEGER,
ADD COLUMN IF NOT EXISTS scorers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS report TEXT;

-- Comentaris per a les noves columnes
COMMENT ON COLUMN matches.result_home IS 'Gols marcats pel CF Santpedor';
COMMENT ON COLUMN matches.result_away IS 'Gols marcats per l''equip rival';
COMMENT ON COLUMN matches.scorers IS 'Llista de golejadors: [{"name": "Nom", "minute": 15, "team": "home/away"}]';
COMMENT ON COLUMN matches.report IS 'Crònica detallada del partit';
