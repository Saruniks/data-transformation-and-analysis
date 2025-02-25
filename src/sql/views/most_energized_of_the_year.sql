CREATE MATERIALIZED VIEW most_energized_of_the_year AS
SELECT
    release_year,
    id,
    name,
    energy
FROM
    (
    SELECT
        release_year,
        id,
        name,
        energy,
        rank() OVER (
            PARTITION BY release_year
            ORDER BY energy DESC 
        ) as rank_number
    FROM staging_tracks
) ranked
WHERE rank_number = 1;
