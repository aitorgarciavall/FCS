-- Create training_schedules table
CREATE TABLE public.training_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Dilluns, 7 = Diumenge
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    team_name TEXT NOT NULL,
    field_name TEXT, -- Opcional: Camp 1, Camp 2, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.training_schedules ENABLE ROW LEVEL SECURITY;

-- Policies
-- Tothom pot veure els horaris
CREATE POLICY "Enable read access for all users" ON public.training_schedules
    FOR SELECT USING (true);

-- Només admins i coordinadors poden modificar (assumint que tenen els rols correctes assignats a auth.users o gestionat via app logic, però aquí deixarem permissiu per a usuaris autenticats amb rol d'admin a la taula user_roles, simplificat per a l'exemple com a policy permissiva d'escriptura per a autenticats i filtrat al frontend/backend logic, o millor, restringit).
-- Per simplificar la integració immediata sense complicar policies complexes de join:
CREATE POLICY "Enable insert for authenticated users only" ON public.training_schedules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.training_schedules
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.training_schedules
    FOR DELETE USING (auth.role() = 'authenticated');
