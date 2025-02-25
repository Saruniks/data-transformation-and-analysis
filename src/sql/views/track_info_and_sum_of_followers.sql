CREATE MATERIALIZED VIEW track_info_and_sum_of_followers AS
SELECT 
    staging_tracks.id as track_id,
    staging_tracks.name,
    staging_tracks.popularity,
    staging_tracks.energy,
    staging_tracks.danceability,
    SUM(staging_artists.followers) as artists_followers_sum
FROM staging_tracks
JOIN track_artists ON staging_tracks.id = track_artists.track_id
JOIN staging_artists ON staging_artists.artist_id = track_artists.artist_id
GROUP BY staging_tracks.id;
