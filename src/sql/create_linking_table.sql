CREATE MATERIALIZED VIEW track_artists AS
SELECT
    t.id as track_id,
    json_array_elements_text(replace(t.id_artists, '''', '"')::json) AS artist_id
FROM staging_tracks t
WHERE t.id IS NOT NULL 
AND t.id_artists IS NOT NULL;
