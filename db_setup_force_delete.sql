-- Funció per forçar l'eliminació d'un usuari i totes les seves dependències
-- Útil quan l'API estàndard falla amb error 500 (Zombie User)
-- ATENCIÓ: Executar a l'Editor SQL de Supabase

CREATE OR REPLACE FUNCTION force_delete_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- S'executa amb permisos de superusuari (pot tocar schema auth)
AS $$
BEGIN
    -- 1. Netejar Taules Públiques (Dependències)
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.team_players WHERE user_id = target_user_id;
    DELETE FROM public.sepa_info WHERE user_id = target_user_id;
    DELETE FROM public.player_guardians WHERE player_id = target_user_id OR guardian_id = target_user_id;
    
    -- Esborrem el perfil públic
    DELETE FROM public.users WHERE id = target_user_id;

    -- 2. Netejar Taules Internes d'Auth (Neteja profunda)
    DELETE FROM auth.identities WHERE user_id = target_user_id;
    DELETE FROM auth.sessions WHERE user_id = target_user_id;
    DELETE FROM auth.mfa_factors WHERE user_id = target_user_id;
    
    -- Casting explícit per evitar errors de tipus
    DELETE FROM auth.refresh_tokens WHERE user_id::text = target_user_id::text;
    
    -- 3. Eliminació Final de l'usuari a Auth
    DELETE FROM auth.users WHERE id = target_user_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Usuari eliminat forçosament.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
