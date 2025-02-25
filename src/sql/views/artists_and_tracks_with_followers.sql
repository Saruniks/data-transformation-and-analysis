CREATE MATERIALIZED VIEW artists_and_tracks_with_followers AS
SELECT 
    staging_artists.artist_id,
    staging_artists.name as artist_name, 
    staging_tracks.id as track_id,
    staging_tracks.name as track_name
FROM staging_artists
INNER JOIN track_artists
ON staging_artists.artist_id = track_artists.artist_id
INNER JOIN staging_tracks 
ON staging_tracks.id = track_artists.track_id
WHERE NOT staging_artists.popularity = 0;
