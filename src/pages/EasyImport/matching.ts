import type { IAlbum, IArtist, ITrack } from "../../types";

export const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

const normalizeName = (name: string) => name.toLocaleUpperCase().replace(symbolRegex, '');

// Bracketed suffixes and " - " qualifiers are where Spotify/Tidal titles diverge most
// ("Song (feat. X)" vs "Song", "Song - Remastered 2011" vs "Song"). Stripped as a last-resort
// tier only, since it can occasionally over-strip a title that legitimately contains " - ".
const coreName = (name: string) => normalizeName(
  name.replace(/[([][^)\]]*[)\]]/g, '').replace(/\s+-\s+.*$/, '')
).replace(/\s+/g, '');

// Higher tiers are weighted well outside the 0-1 range of artistOverlapScore, so artist overlap
// only ever breaks ties *within* a title tier - it can't make a weaker title match win outright.
const titleScore = (spotifyName: string, candidateName: string) => {
  if (spotifyName === candidateName) return 40;
  if (spotifyName.toLocaleUpperCase() === candidateName.toLocaleUpperCase()) return 30;
  if (normalizeName(spotifyName) === normalizeName(candidateName)) return 20;
  if (coreName(spotifyName) === coreName(candidateName)) return 10;
  return 0;
};

// Fraction of the Spotify item's artists also present on the candidate, so "same title,
// different artist" collisions (e.g. cover songs, common titles like "Intro") lose to the
// candidate that actually shares artists, instead of whichever came first in Tidal's results.
const artistOverlapScore = (spotifyArtists: string[], candidateArtists: string[] = []) => {
  if (!spotifyArtists.length || !candidateArtists.length) return 0;

  const normalizedCandidates = candidateArtists.map(normalizeName);
  const matchingArtists = spotifyArtists.filter(artist => normalizedCandidates.includes(normalizeName(artist)));

  return matchingArtists.length / spotifyArtists.length;
};

const findBestMatch = <T>(
  spotifyName: string,
  spotifyArtists: string[],
  items: T[],
  getName: (item: T) => string,
  getArtists: (item: T) => string[] = () => [],
): T | undefined => {
  let best: T | undefined;
  let bestScore = 0;

  for (const item of items) {
    const score = titleScore(spotifyName, getName(item));
    if (score === 0) continue;

    const totalScore = score + artistOverlapScore(spotifyArtists, getArtists(item));
    if (totalScore > bestScore) {
      bestScore = totalScore;
      best = item;
    }
  }

  return best;
};

export const matchTrack = (spotifyTrack: ITrack, tidalTracks: ITrack[]) => {
  // Guard against empty-string ISRCs on both sides being treated as a match
  const isrcTrack = spotifyTrack.isrc && tidalTracks.find(t => t.isrc === spotifyTrack.isrc);
  if (isrcTrack) return isrcTrack;
  return findBestMatch(spotifyTrack.trackName, spotifyTrack.artists, tidalTracks, tidalTrack => tidalTrack.trackName, tidalTrack => tidalTrack.artists);
};

export const matchAlbum = (spotifyAlbum: IAlbum, tidalAlbums: IAlbum[]) => {
  // Guard against empty-string barcodes on both sides being treated as a match
  const barcodeAlbum = spotifyAlbum.barcode && tidalAlbums.find(t => t.barcode === spotifyAlbum.barcode);
  if (barcodeAlbum) return barcodeAlbum;
  return findBestMatch(spotifyAlbum.albumName, spotifyAlbum.artists, tidalAlbums, tidalAlbum => tidalAlbum.albumName, tidalAlbum => tidalAlbum.artists);
};

export const matchArtist = (spotifyName: string, tidalArtists: IArtist[]) => {
  return findBestMatch(spotifyName, [], tidalArtists, tidalArtist => tidalArtist.artistName);
};
