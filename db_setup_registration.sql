-- 1. Taula de Dades Bancàries (SEPA)
-- Vinculada al Tutor (o usuari pagador)
CREATE TABLE sepa_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    iban VARCHAR(34) NOT NULL, -- IBAN té max 34 caracters
    account_holder VARCHAR(255) NOT NULL,
    swift_bic VARCHAR(11),
    mandate_date DATE DEFAULT CURRENT_DATE, -- Data de la firma del mandat
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Un usuari només hauria de tenir un compte actiu principal normalment, però permetem varis per si de cas
    CONSTRAINT unique_active_iban_per_user UNIQUE (user_id, iban) 
);

-- Seguretat SEPA: Només el propi usuari o admins (staff) poden veure-ho
ALTER TABLE sepa_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own SEPA" ON sepa_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all SEPA" ON sepa_info
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role_id IN (1, 3) -- SuperAdmin, AdminStaff
        )
    );

-- 2. Taula de Relacions Tutor-Jugador (N:N)
CREATE TABLE player_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'Parent', -- 'Father', 'Mother', 'Legal Guardian', 'Self'
    is_primary BOOLEAN DEFAULT FALSE, -- Si és el contacte principal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, guardian_id)
);

ALTER TABLE player_guardians ENABLE ROW LEVEL SECURITY;

-- 3. Ampliació de dades a la taula 'users' (si calgués)
-- Com que users és una taula pública que replica auth.users, assegurem-nos que té els camps necessaris
-- Aquests camps sovint ja estan al perfil, però afegim els específics d'inscripció si falten.
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS dni VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(20),
ADD COLUMN IF NOT EXISTS shirt_size VARCHAR(10), -- Talles S, M, L...
ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Comentaris
COMMENT ON TABLE sepa_info IS 'Dades bancàries per a la domiciliació de rebuts';
COMMENT ON TABLE player_guardians IS 'Relació entre jugadors i els seus tutors legals';
