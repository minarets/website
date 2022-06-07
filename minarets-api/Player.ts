import { Howl } from 'howler';

import type { PlaybackTrack } from './types';

export enum RepeatMode {
  noRepeat = 0,
  repeatOnce = 1,
  repeatFull = 2,
}

interface PlayerState<Track extends PlaybackTrack = PlaybackTrack> {
  volume: number;
  isPaused: boolean;
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  currentTrack?: Track;
  // Priority tracks are not affected by shuffle
  priorityTracks: Track[];
  // Tracks next up in the queue
  nextTracks: Track[];
  // Tracks previously played or skipped due to play index
  previousTracks: Track[];
}

interface PlayerError<Track extends PlaybackTrack = PlaybackTrack> {
  message: string;
  track?: Track;
}

interface PlayerParams<Track extends PlaybackTrack = PlaybackTrack> {
  volume: number;
  onTrackStart?: (track: Track) => void;
  onTrackEnd?: (track: Track) => void;
  onStateChanged?: (state: PlayerState<Track>) => void;
  onError?: (error: PlayerError<Track>) => void;
  // Optionally override default shuffle logic
  shuffle?: (nonShuffledNextTracks: Track[], state: PlayerState<Track>) => Track[];
}

interface AudioPlayer {
  player: Howl;
  metadata: PlaybackTrack;
}

export function getTimeDisplay(seconds: number): string {
  let remainingTime = seconds;
  if (!Number.isFinite(seconds)) {
    remainingTime = 0;
  }

  let result = '';
  if (seconds >= 3600) {
    remainingTime %= 3600;
    result += `${Math.floor(seconds / 3600)}:`;
  }

  const minutes = Math.floor(remainingTime / 60);
  remainingTime %= 60;
  if (result && minutes < 10) {
    result += '0';
  }

  result += `${minutes}:`;

  if (remainingTime < 10) {
    result += '0';
  }

  result += Math.floor(remainingTime);

  return result;
}

export class Player<Track extends PlaybackTrack = PlaybackTrack> {
  private readonly state: PlayerState<Track>;

  private readonly onTrackStart?: (track: Track) => void;

  private readonly onTrackEnd?: (track: Track) => void;

  private readonly onStateChanged?: (state: PlayerState<Track>) => void;

  private readonly onError?: (error: PlayerError<Track>) => void;

  private readonly shuffle?: (nonShuffledNextTracks: Track[], state: PlayerState<Track>) => Track[];

  private isAudio1Active = false;

  private isGaplessTransition = false;

  private audio1: AudioPlayer | null;

  private audio2: AudioPlayer | null;

  private nonShuffledNextTracks: Track[] = [];

  public constructor({ volume, onTrackStart, onTrackEnd, onStateChanged, onError, shuffle }: PlayerParams<Track>) {
    this.audio1 = null;
    this.audio2 = null;

    this.state = {
      volume,
      isPaused: true,
      position: 0,
      duration: 0,
      repeatMode: RepeatMode.noRepeat,
      isShuffled: false,
      priorityTracks: [],
      nextTracks: [],
      previousTracks: [],
    };

    this.onTrackStart = onTrackStart;
    this.onTrackEnd = onTrackEnd;
    this.onStateChanged = onStateChanged;
    this.onError = onError;

    this.shuffle = shuffle;
  }

  public setVolume(volumePercent: number, triggerStateChange?: boolean): void {
    try {
      this.state.volume = volumePercent;
      const volume = volumePercent / 100;
      Howler.volume(volume);
      if (this.audio1) {
        this.audio1.player.volume(volume);
      }

      if (this.audio2) {
        this.audio2.player.volume(volume);
      }

      if (triggerStateChange) {
        this.triggerOnStateChange();
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public setRepeatMode(repeatMode: RepeatMode): void {
    try {
      this.state.repeatMode = repeatMode;
      const audio = this.activeAudioPlayer;

      if (audio) {
        audio.player.loop(repeatMode !== RepeatMode.noRepeat);
      }

      this.triggerOnStateChange();
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public enableShuffle(): void {
    this.state.isShuffled = true;
    if (this.shuffle) {
      this.state.nextTracks = this.shuffle(this.nonShuffledNextTracks.slice(), { ...this.state });
    } else {
      this.state.nextTracks = this.defaultShuffle(this.nonShuffledNextTracks);
    }

    this.triggerOnStateChange();
  }

  public disableShuffle(): void {
    this.state.isShuffled = false;
    this.state.nextTracks = this.nonShuffledNextTracks;

    this.triggerOnStateChange();
  }

  public pause(): void {
    try {
      const audio = this.activeAudioPlayer;
      if (audio) {
        audio.player.pause();
      }

      if (!this.state.isPaused) {
        this.state.isPaused = true;
        this.triggerOnStateChange();
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public play(): void {
    try {
      const audio = this.activeAudioPlayer;
      if (audio) {
        audio.player.play();
        this.state.isPaused = false;

        this.triggerOnStateChange();
      } else {
        this.playNextTrack(this.state.currentTrack);
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public togglePlay(): void {
    if (this.state.isPaused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(position: number): number {
    try {
      const audio = this.activeAudioPlayer;
      if (audio) {
        const newPosition = Math.max(0, Math.min(audio.player.duration(), position));
        audio.player.seek(newPosition);

        this.triggerOnStateChange();

        return newPosition;
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }

    return 0;
  }

  public seekBy(amount: number): number {
    try {
      console.log(`seekBy ${amount}`);
      const audio = this.activeAudioPlayer;
      if (audio) {
        const position = Math.min(audio.player.duration(), Math.max(0, audio.player.seek() + amount));

        audio.player.seek(position);

        this.triggerOnStateChange();

        return position;
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }

    return 0;
  }

  public previousTrack(): void {
    try {
      this.isGaplessTransition = false;
      const audio = this.activeAudioPlayer;
      if (audio) {
        audio.player.pause();

        // If the current song has played for more than 3 seconds, rewind it to the beginning
        // If there are no previously played tracks, rewind the current track
        if (audio.player.seek() >= 3 || !this.state.previousTracks.length) {
          audio.player.seek(0);

          if (this.state.currentTrack) {
            this.triggerOnTrackStart();
          }

          this.play();
          return;
        }
      }

      if (this.state.previousTracks.length) {
        // If a song was playing, prepend it back to nextTracks
        if (this.state.currentTrack) {
          this.state.nextTracks = [this.state.currentTrack, ...this.state.nextTracks];

          this.triggerOnTrackEnd(this.state.currentTrack);
        }

        // Pop last played track and make it the current track
        // NOTE: saving to currentTrack to prevent playNextTrack from re-adding to previousTracks
        this.state.currentTrack = this.state.previousTracks.shift();
        this.playNextTrack(this.state.currentTrack);
      }
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public nextTrack(): void {
    try {
      this.isGaplessTransition = false;
      const audio = this.activeAudioPlayer;
      if (audio) {
        audio.player.pause();
        this.state.isPaused = true;
      }

      this.playNextTrack();
    } catch (ex) {
      if (this.onError) {
        this.onError(ex as Error);
      }
    }
  }

  public queuePriorityTracks(tracks: Track[]): void {
    const hadPriorityTracks = !!this.state.priorityTracks.length;
    this.state.priorityTracks = [...this.state.priorityTracks, ...tracks];

    // If there were no previous priority tracks, replace buffer with first priority track
    if (!hadPriorityTracks) {
      if ((this.isAudio1Active && this.audio2) || (!this.isAudio1Active && this.audio1)) {
        this.bufferNextTrack();
      }
    }

    this.triggerOnStateChange();
  }

  public removePriorityTrack(uniqueId: string): void {
    this.state.priorityTracks = this.state.priorityTracks.filter((track: Track): boolean => track.uniqueId !== uniqueId);
    this.triggerOnStateChange();
  }

  public clearPriorityTracks(): void {
    this.state.priorityTracks = [];
    this.triggerOnStateChange();
  }

  /**
   * NOTE: This will clear priorityTracks and previousTracks. If playIndex is specified, tracks before playIndex
   * will be assigned to previousTracks.
   * @param {object[]} tracks
   * @param {number} [playIndex=0]
   */
  public playTracks(tracks: Track[], playIndex = 0): void {
    if (this.audio1) {
      this.audio1.player.pause();
      this.audio1.player.unload();
      this.audio1 = null;
    }

    if (this.audio2) {
      this.audio2.player.pause();
      this.audio2.player.unload();
      this.audio2 = null;
    }

    this.isGaplessTransition = false;
    this.isAudio1Active = true;
    this.state.currentTrack = undefined;

    this.state.priorityTracks = [];
    if (playIndex > 0 && playIndex < tracks.length) {
      this.state.previousTracks = tracks.slice(0, playIndex - 1);
    } else {
      this.state.previousTracks = [];
    }

    this.state.nextTracks = tracks.slice(playIndex);

    this.play();
  }

  private get activeAudioPlayer(): AudioPlayer | null {
    if (this.isAudio1Active) {
      return this.audio1;
    }

    return this.audio2;
  }

  /**
   * Update progress from player
   * @param {boolean} updateLoop - Continually loop to update progress. Should be true when called from play event; otherwise false
   * @private
   */
  private onPlayerProgress(updateLoop: boolean): void {
    const audio = this.activeAudioPlayer;
    if (audio) {
      this.state.position = Math.round((audio.player.seek() || 0) * 100) / 100;
      this.state.duration = audio.player.duration();

      // If not currently in a gapless transition and there's less than 0.3s left of the current song, start the next
      // song as a 'gapless transition"
      if (!this.isGaplessTransition && audio.player.state() === 'loaded') {
        const diff = this.state.duration - this.state.position;
        // NOTE: 0.3 is a magic number that I guessed at. Maybe this should be configurable or better calculated?
        if (diff < 0.3 && this.state.repeatMode === RepeatMode.noRepeat) {
          this.isGaplessTransition = true;
          this.playNextTrack();
          return;
        }
      }
    } else {
      this.state.position = 0;
      this.state.duration = 0;
    }

    this.triggerOnStateChange();

    if (updateLoop && !this.state.isPaused) {
      requestAnimationFrame(() => {
        this.onPlayerProgress(updateLoop);
      });
    }
  }

  private onPlayerTrackEnd(): void {
    switch (this.state.repeatMode) {
      case RepeatMode.repeatOnce:
        this.setRepeatMode(RepeatMode.noRepeat);
        break;
      case RepeatMode.noRepeat:
        if (this.isGaplessTransition) {
          this.isGaplessTransition = false;
        } else {
          this.playNextTrack();
        }
        break;
      case RepeatMode.repeatFull:
      default:
        break;
    }
  }

  private playNextTrack(manualNextTrack?: Track): void {
    let nextTrack = manualNextTrack;

    if (!nextTrack) {
      if (this.state.priorityTracks.length) {
        nextTrack = this.state.priorityTracks.shift();
      } else if (this.state.nextTracks.length) {
        nextTrack = this.state.nextTracks.shift();

        if (!this.state.isShuffled) {
          this.nonShuffledNextTracks = this.state.nextTracks;
        }
      }
    }

    if (this.state.currentTrack && (!nextTrack || this.state.currentTrack.uniqueId !== nextTrack.uniqueId)) {
      this.state.previousTracks = [this.state.currentTrack, ...this.state.previousTracks];

      this.triggerOnTrackEnd(this.state.currentTrack);
    }

    if (nextTrack) {
      if (manualNextTrack) {
        this.activeAudioPlayer?.player.pause();
      }

      this.state.currentTrack = nextTrack;
      this.isAudio1Active = !this.isAudio1Active;

      let audio: AudioPlayer['player'];
      // Create the audio element if it was not previously buffered
      if (this.isAudio1Active) {
        if (this.audio1?.metadata.url !== nextTrack.url) {
          this.audio1?.player.unload();

          this.audio1 = this.createAudioPlayer(nextTrack);
        }

        audio = this.audio1.player;
      } else {
        if (this.audio2?.metadata.url !== nextTrack.url) {
          this.audio2?.player.unload();

          this.audio2 = this.createAudioPlayer(nextTrack);
        }

        audio = this.audio2.player;
      }

      audio.volume(this.state.volume / 100);
      audio.seek(0);
      this.state.duration = audio.duration();

      this.triggerOnTrackStart();

      this.play();
    } else if (this.state.currentTrack) {
      this.state.currentTrack = undefined;
      this.triggerOnStateChange();
    }
  }

  private bufferNextTrack(): void {
    let nextTrack: Track | undefined;
    if (this.state.priorityTracks.length) {
      [nextTrack] = this.state.priorityTracks.slice(0, 1);
    } else if (this.state.nextTracks.length) {
      [nextTrack] = this.state.nextTracks.slice(0, 1);
    }

    if (nextTrack) {
      if (this.isAudio1Active) {
        // Destroy previous buffer if it's not buffering the correct track
        if (this.audio2 && this.audio2.metadata.url !== nextTrack.url) {
          this.audio2.player.unload();
          this.audio2 = null;
        }

        if (!this.audio2) {
          this.audio2 = this.createAudioPlayer(nextTrack);
        }
      } else {
        // Destroy previous buffer if it's not buffering the correct track
        if (this.audio1 && this.audio1.metadata.url !== nextTrack.url) {
          this.audio1 = null;
        }

        if (!this.audio1) {
          this.audio1 = this.createAudioPlayer(nextTrack);
        }
      }
    }
  }

  private defaultShuffle(nonShuffledNextTracks: Track[]): Track[] {
    const shuffledTrackList = nonShuffledNextTracks.slice();
    let currentIndex = shuffledTrackList.length;

    // From: https://stackoverflow.com/a/2450976/3085
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      const tempValue = shuffledTrackList[currentIndex];
      shuffledTrackList[currentIndex] = shuffledTrackList[randomIndex];
      shuffledTrackList[randomIndex] = tempValue;
    }

    return shuffledTrackList;
  }

  private triggerOnTrackStart(): void {
    if (this.onTrackStart && this.state.currentTrack) {
      this.onTrackStart(this.state.currentTrack);
    }
  }

  private triggerOnTrackEnd(track: Track): void {
    if (this.onTrackEnd) {
      this.onTrackEnd(track);
    }
  }

  private triggerOnStateChange(): void {
    if (this.onStateChanged) {
      this.onStateChanged({ ...this.state });
    }
  }

  private createAudioPlayer(track: Track): AudioPlayer {
    const audioPlayer = {
      metadata: track,
      player: new Howl({
        src: track.url,
        format: 'mp3',
        html5: true,
        volume: this.state.volume / 100,
        onplay: () => {
          this.onPlayerProgress(true);
        },
        onseek: () => {
          this.onPlayerProgress(false);
        },
        onload: () => {
          this.bufferNextTrack();
        },
        onend: () => {
          this.onPlayerTrackEnd();
        },
        onloaderror: (_id, code) => {
          if (this.onError) {
            switch (code) {
              case MediaError.MEDIA_ERR_NETWORK:
                this.onError(new Error('A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.'));
                break;
              case MediaError.MEDIA_ERR_DECODE:
                this.onError(new Error('An error of some description occurred while decod        ing the media resource, after the resource was established to be usable.'));
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                this.onError(new Error('The media resource indicated by the src attribute or assigned media provider object was not suitable.'));
                break;
              default:
                // Ignore
                break;
            }
          }
        },
      }),
    };

    return audioPlayer;
  }
}
