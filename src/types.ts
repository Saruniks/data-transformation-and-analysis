export const TRANSFORMED_TRACKS_FILE_NAME = "transformedTracks.csv";
export const TRANSFORMED_ARTISTS_FILE_NAME = "transformedArtists.csv";


export interface Artist {
    id: string;
    // [key: string]: unknown;
}

export interface Track {
    name: string;
    duration_ms: number;
    id_artists: string;
    release_date: string;
    danceability: number;
    // [key: string]: unknown;
}
