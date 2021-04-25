export interface PlaybackTrackAlbum {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
}

interface PlaybackTrackArtist {
  name: string;
  abbr: string;
  url: string;
}

export interface PlaybackTrack {
  id: string;
  uniqueId: string;
  name: string;
  trackNameSuffix: string;
  firstTimePlayedText: string;
  notes: string;
  duration: string;
  url: string;
  album: PlaybackTrackAlbum;
  artist: PlaybackTrackArtist;
}
