CREATE TABLE staging_artists (
    artist_id VARCHAR(255) PRIMARY KEY,
    followers NUMERIC,
    genres VARCHAR(1000) NOT NULL,
    name VARCHAR(255) NOT NULL,
    popularity NUMERIC NOT NULL
);

CREATE TABLE staging_tracks (
    id                 VARCHAR(255) PRIMARY KEY,
    name               VARCHAR(1000) NOT NULL,
    popularity         NUMERIC NOT NULL,
    duration_ms        NUMERIC NOT NULL,
    explicit           NUMERIC NOT NULL,
    artists            VARCHAR(2000) NOT NULL,
    id_artists         VARCHAR(2000) NOT NULL,
    danceability       VARCHAR(255) NOT NULL,
    energy             NUMERIC NOT NULL,
    key                NUMERIC NOT NULL,
    loudness           NUMERIC NOT NULL,
    mode               NUMERIC NOT NULL,
    speechiness        NUMERIC NOT NULL,
    acousticness       NUMERIC NOT NULL,
    instrumentalness   NUMERIC NOT NULL,
    liveness           NUMERIC NOT NULL,
    valence            NUMERIC NOT NULL,
    tempo              NUMERIC NOT NULL,
    time_signature     NUMERIC NOT NULL,
    release_year       NUMERIC NOT NULL,
    release_month      NUMERIC,
    release_day        NUMERIC
);
