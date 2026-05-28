import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export async function playSoundFromUrl(url: string): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        currentSound = null;
      }
    });
  } catch (err) {
    console.warn("Failed to play sound from URL:", err);
  }
}

export async function stopCurrentSound(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {});
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
