-- Script per eliminar forçadament un usuari "Zombie" (corrupte) per ID específic
-- CORREGIT: Amb casts explícits per evitar error "operator does not exist: character varying = uuid"

DO $$
DECLARE
    -- ID de l'usuari que dóna l'error 500
    target_user_id UUID := 'a6922611-4f90-41a5-9f14-219d57e210f8';
BEGIN
    RAISE NOTICE 'Iniciant procés de neteja per l''usuari ID: %', target_user_id;

    IF target_user_id IS NOT NULL THEN
        -- 1. Netejar Taules Públiques (sense por al CASCADE fallit)
        -- Esborrem primer de taules que depenen de l'usuari
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        DELETE FROM public.team_players WHERE user_id = target_user_id;
        DELETE FROM public.sepa_info WHERE user_id = target_user_id;
        
        -- Netejar relacions de tutor/jugador (com a jugador o com a tutor)
        DELETE FROM public.player_guardians WHERE player_id = target_user_id OR guardian_id = target_user_id;
        
        -- Netejar perfil públic (aquí user_id sol ser UUID, així que no cal cast, però per si de cas)
        DELETE FROM public.users WHERE id = target_user_id;

        -- 2. Netejar Taules Internes d'Auth (CRÍTIC per solucionar l'error 500)
        -- Fem cast a ::text per si la columna és varchar (com passa a vegades amb refresh_tokens o identities)
        -- Nota: auth.users.id és UUID, però les altres poden variar. Provem amb el cast per assegurar.
        
        DELETE FROM auth.identities WHERE user_id = target_user_id;
        DELETE FROM auth.sessions WHERE user_id = target_user_id;
        DELETE FROM auth.mfa_factors WHERE user_id = target_user_id;
        
        -- Aquesta és la línia que fallava. Castegem l'UUID a text per si la columna és varchar
        DELETE FROM auth.refresh_tokens WHERE user_id::text = target_user_id::text;
        
        -- 3. Eliminació Final de l'usuari
        DELETE FROM auth.users WHERE id = target_user_id;
        
        RAISE NOTICE '✅ Usuari % eliminat correctament i de forma neta (Zombie Killer completat).', target_user_id;
    ELSE
        RAISE NOTICE '⚠️ No s''ha especificat un ID vàlid.';
    END IF;
END $$;
