// useTTS.tsx
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export function useTTS() {
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);
	const [voiceError, setVoiceError] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	const audioRef = useRef<HTMLAudioElement | null>(null);

	const speak = useCallback(async (text: string, voice: string = 'verse') => {
		try {
			setIsVoiceLoading(true);
			setVoiceError(null);

			const response = await axios.post(
				`${import.meta.env.VITE_SERVER_URL}/tts`,
				{ text, voice },
				{ responseType: 'blob' }
			);

			const blob = response.data;
			const url = URL.createObjectURL(blob);

			// stop previous audio if still playing
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}

			// Play audio in browser
			const audio = new Audio(url);
			audioRef.current = audio;

			audio.onended = () => {
				setIsPlaying(false);
				setIsPaused(false);
			};

			await audio.play();
			setIsPlaying(true);
			setIsPaused(false);
		} catch (err: any) {
			setVoiceError(err.message || 'Something went wrong with TTS');
		} finally {
			setIsVoiceLoading(false);
		}
	}, []);

	const togglePauseResume = useCallback(() => {
		if (!audioRef.current) return;

		if (audioRef.current.paused) {
			audioRef.current.play();
			setIsPaused(false);
			setIsPlaying(true);
		} else {
			audioRef.current.pause();
			setIsPaused(true);
			setIsPlaying(false);
		}
	}, []);

	const cancel = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0; // reset
			setIsPlaying(false);
			setIsPaused(false);
		}
	}, []);

	return { speak, isVoiceLoading, voiceError, togglePauseResume, cancel, isPlaying, isPaused };
}
