import { Audio } from "expo-av";
import type { AudioKey } from "./moneyReader";

const SOUND_ASSETS: Record<AudioKey, ReturnType<typeof require>> = {
  first:  require("../assets/sounds/first.wav"),
  "0":    require("../assets/sounds/0.wav"),
  "1":    require("../assets/sounds/1.wav"),
  "2":    require("../assets/sounds/2.wav"),
  "3":    require("../assets/sounds/3.wav"),
  "4":    require("../assets/sounds/4.wav"),
  "5":    require("../assets/sounds/5.wav"),
  "6":    require("../assets/sounds/6.wav"),
  "7":    require("../assets/sounds/7.wav"),
  "8":    require("../assets/sounds/8.wav"),
  "9":    require("../assets/sounds/9.wav"),
  "10":   require("../assets/sounds/10.wav"),
  muoi:   require("../assets/sounds/muoi.wav"),
  lam:    require("../assets/sounds/lam.wav"),
  mot:    require("../assets/sounds/mot.wav"),
  tram:   require("../assets/sounds/tram.wav"),
  nghin:  require("../assets/sounds/nghin.wav"),
  trieu:  require("../assets/sounds/trieu.wav"),
  ty:     require("../assets/sounds/ty.wav"),
  dong:   require("../assets/sounds/dong.wav"),
};

let isPlaying = false;
let stopRequested = false;

async function playSingle(key: AudioKey): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      const asset = SOUND_ASSETS[key];
      if (!asset) {
        resolve();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: true,
        volume: 1.0,
      });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          resolve();
        }
      });
    } catch {
      resolve();
    }
  });
}

export async function playMoneySequence(keys: AudioKey[]): Promise<void> {
  if (isPlaying) stopRequested = true;
  await new Promise<void>((r) => setTimeout(r, 100));

  isPlaying = true;
  stopRequested = false;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    for (const key of keys) {
      if (stopRequested) break;
      await playSingle(key);
    }
  } finally {
    isPlaying = false;
  }
}

export async function playWarningSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sounds/war.wav"),
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    console.warn("Failed to play warning sound:", err);
  }
}

export async function playSoundFromUrl(url: string): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    console.warn("Failed to play sound from URL:", err);
  }
}
