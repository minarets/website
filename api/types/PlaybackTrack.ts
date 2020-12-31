interface PlaybackTrackAlbum {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
}

interface PlaybackTrackArtist {
  name: string;
  url: string;
}

export interface PlaybackTrack {
  id: string;
  uniqueId: string;
  name: string;
  url: string;
  album: PlaybackTrackAlbum;
  artist: PlaybackTrackArtist;
}
