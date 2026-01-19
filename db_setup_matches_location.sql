-- Afegir columnes per a coordenades geogràfiques a la taula matches
ALTER TABLE matches 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Opcional: Afegir un comentari
COMMENT ON COLUMN matches.latitude IS 'Latitud geogràfica de la ubicació del partit';
COMMENT ON COLUMN matches.longitude IS 'Longitud geogràfica de la ubicació del partit';