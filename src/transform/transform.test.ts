import { filterTracks, transformTracks, filterArtists } from './transform';
import { Track, Artist } from '../types';

describe('filterTracks', () => {
    it('should filter out tracks with no name', () => {
        const tracks: Track[] = [
            {
                name: '',
                duration_ms: 120000,
                release_date: '2020-01-01',
                danceability: 0.5,
                id_artists: "['a1']",
            },
            {
                name: 'Valid Track',
                duration_ms: 120000,
                release_date: '2020-01-01',
                danceability: 0.5,
                id_artists: "['a1']",
            },
        ];
        const result = filterTracks(tracks);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Valid Track');
    });

    it('should filter out tracks with duration less than 60000ms', () => {
        const tracks: Track[] = [
            {
                name: 'Short Track',
                duration_ms: 30000,
                release_date: '2020-01-01',
                danceability: 0.5,
                id_artists: "['a1']",
            },
            {
                name: 'Exact Duration Track',
                duration_ms: 60000,
                release_date: '2020-01-01',
                danceability: 0.5,
                id_artists: "['a1']",
            },
        ];
        const result = filterTracks(tracks);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Exact Duration Track');
    });
});

describe('transformTracks', () => {
    it('should parse release_date correctly', () => {
        const tracks: Track[] = [
            {
                name: 'Date Test Track',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.5,
                id_artists: "['a1']",
            },
        ];
        const [transformed] = transformTracks(tracks);
        expect(transformed.release_year).toBe(2020);
        expect(transformed.release_month).toBe(1);
        expect(transformed.release_day).toBe(15);
        // Ensure the original release_date is not in the transformed output
        expect((transformed as any).release_date).toBeUndefined();
    });

    it('should map danceability correctly on interval boundaries', () => {
        // Test for danceability < 0.5 -> "Low"
        let tracks: Track[] = [
            {
                name: 'Low Danceability',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.4,
                id_artists: "['a1']",
            },
        ];
        let [result] = transformTracks(tracks);
        expect(result.danceability).toBe('Low');

        // Test for danceability exactly 0.5 -> "Medium"
        tracks = [
            {
                name: 'Medium Danceability Lower Bound',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.5,
                id_artists: "['a1']",
            },
        ];
        [result] = transformTracks(tracks);
        expect(result.danceability).toBe('Medium');

        // Test for danceability exactly 0.6 -> "Medium"
        tracks = [
            {
                name: 'Medium Danceability Upper Bound',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.6,
                id_artists: "['a1']",
            },
        ];
        [result] = transformTracks(tracks);
        expect(result.danceability).toBe('Medium');

        // Test for danceability > 0.6 and <= 1 -> "High"
        tracks = [
            {
                name: 'High Danceability',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.7,
                id_artists: "['a1']",
            },
        ];
        [result] = transformTracks(tracks);
        expect(result.danceability).toBe('High');
    });

    it('should throw an error if danceability is out of range', () => {
        const tracks: Track[] = [
            {
                name: 'Invalid Danceability',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 1.1,
                id_artists: "['a1']",
            },
        ];
        expect(() => transformTracks(tracks)).toThrow('Danceability is out of range');
    });
});

describe('filterArtists', () => {
    it('should parse id_artists and filter artists correctly', () => {
        const tracks: Track[] = [
            {
                name: 'Artist Test Track 1',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.5,
                id_artists: "['a1', 'a2']",
            },
            {
                name: 'Artist Test Track 2',
                duration_ms: 120000,
                release_date: '2020-01-15',
                danceability: 0.5,
                id_artists: "['a3']",
            },
        ];
        const artists: Artist[] = [
            { id: 'a1' },
            { id: 'a2' },
            { id: 'a3' },
            { id: 'a4' },
        ];
        const filtered = filterArtists(artists, tracks);
        // Only artists with ids a1, a2, and a3 should be included.
        expect(filtered).toHaveLength(3);
        expect(filtered).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 'a1' }),
                expect.objectContaining({ id: 'a2' }),
                expect.objectContaining({ id: 'a3' }),
            ])
        );
    });
});
