-- Habilitem l'extensió pgcrypto per poder encriptar contrasenyes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Funció RPC per registrar membres (Tutor + Jugador) de cop
CREATE OR REPLACE FUNCTION register_family_pack(
    guardian_data JSONB,
    player_data JSONB,
    sepa_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- S'executa amb permisos d'admin
AS $$
DECLARE
    new_guardian_id UUID;
    new_player_id UUID;
    guardian_email TEXT;
    player_email TEXT;
    encrypted_pw TEXT;
    guardian_role_id INT := 7; -- ID del rol GUARDIAN
    player_role_id INT := 6;   -- ID del rol PLAYER
BEGIN
    -- 1. Preparar dades
    guardian_email := guardian_data->>'email';
    -- Ajustem el cost a 10 (estàndard Supabase)
    encrypted_pw := crypt('tempPassword123!', gen_salt('bf', 10));
    
    -- Validar si el tutor ja existeix
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = guardian_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Aquest email de tutor ja està registrat.');
    END IF;

    -- 2. Crear Usuari TUTOR a auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', guardian_email, encrypted_pw, now(),
        jsonb_build_object(
            'full_name', (guardian_data->>'name') || ' ' || (guardian_data->>'surname'),
            'dni', guardian_data->>'dni',
            'phone', guardian_data->>'phone'
        ),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), -- CRÍTIC: App Metadata
        now(), now()
    ) RETURNING id INTO new_guardian_id;

    -- CRÍTIC: Crear Identitat per al Tutor (Necessari per GoTrue)
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), new_guardian_id, 
        jsonb_build_object('sub', new_guardian_id, 'email', guardian_email, 'email_verified', true, 'phone_verified', false), 
        'email', new_guardian_id::text, now(), now(), now()
    );

    -- CORRECCIÓ: Inserir manualment a public.users immediatament per evitar error de Foreign Key
    INSERT INTO public.users (id, email, full_name, dni, phone_number, created_at)
    VALUES (
        new_guardian_id,
        guardian_email,
        (guardian_data->>'name') || ' ' || (guardian_data->>'surname'),
        guardian_data->>'dni',
        guardian_data->>'phone',
        now()
    ) ON CONFLICT (id) DO UPDATE SET 
        dni = EXCLUDED.dni, 
        phone_number = EXCLUDED.phone_number;

    -- Ara sí, assignar rol Tutor (segur que l'usuari existeix a public.users)
    INSERT INTO public.user_roles (user_id, role_id) VALUES (new_guardian_id, guardian_role_id);

    -- 3. Crear Usuari JUGADOR
    IF (guardian_data->>'isSameAsPlayer')::BOOLEAN THEN
        new_player_id := new_guardian_id;
        
        -- Afegir rol de Jugador
        INSERT INTO public.user_roles (user_id, role_id) VALUES (new_guardian_id, player_role_id)
        ON CONFLICT DO NOTHING; -- Per si de cas ja el tingués
        
        -- Actualitzar perfil amb dades de jugador
        UPDATE public.users SET
            birth_date = (player_data->>'birthDate')::DATE,
            address = player_data->>'address',
            city = player_data->>'city',
            postal_code = player_data->>'postalCode',
            shirt_size = player_data->>'shirtSize',
            allergies = player_data->>'allergies'
        WHERE id = new_player_id;

    ELSE
        -- Si és un usuari diferent (Fill)
        IF (player_data->>'email') IS NULL OR (player_data->>'email') = '' THEN
            player_email := split_part(guardian_email, '@', 1) || '+' || lower(regexp_replace(player_data->>'name', '\s+', '', 'g')) || '@santpedorfc.placeholder';
        ELSE
            player_email := player_data->>'email';
        END IF;

        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', player_email, encrypted_pw, now(),
            jsonb_build_object(
                'full_name', (player_data->>'name') || ' ' || (player_data->>'surname'),
                'dni', player_data->>'dni',
                'birth_date', player_data->>'birthDate'
            ),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), -- CRÍTIC: App Metadata
            now(), now()
        ) RETURNING id INTO new_player_id;

        -- CRÍTIC: Crear Identitat per al Jugador
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), new_player_id, 
            jsonb_build_object('sub', new_player_id, 'email', player_email, 'email_verified', true, 'phone_verified', false), 
            'email', new_player_id::text, now(), now(), now()
        );

        -- CORRECCIÓ: Inserir manualment el JUGADOR a public.users
        INSERT INTO public.users (id, email, full_name, dni, birth_date, address, city, postal_code, shirt_size, allergies, created_at)
        VALUES (
            new_player_id,
            player_email,
            (player_data->>'name') || ' ' || (player_data->>'surname'),
            player_data->>'dni',
            (player_data->>'birthDate')::DATE,
            player_data->>'address',
            player_data->>'city',
            player_data->>'postalCode',
            player_data->>'shirtSize',
            player_data->>'allergies',
            now()
        ) ON CONFLICT (id) DO NOTHING;

        -- Assignar rol Jugador
        INSERT INTO public.user_roles (user_id, role_id) VALUES (new_player_id, player_role_id);

        -- Crear vincle Tutor-Jugador
        INSERT INTO public.player_guardians (player_id, guardian_id, relationship_type, is_primary)
        VALUES (new_player_id, new_guardian_id, guardian_data->>'relationship', true);
    END IF;

    -- 4. Guardar SEPA (Vinculat al Tutor)
    INSERT INTO public.sepa_info (user_id, iban, account_holder, swift_bic)
    VALUES (
        new_guardian_id, 
        sepa_data->>'iban', 
        sepa_data->>'holderName', 
        sepa_data->>'swift'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'guardianId', new_guardian_id,
        'playerId', new_player_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;