// useTTS.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export function useTTS() {
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);
	const [voiceError, setVoiceError] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

	const audioRef = useRef<HTMLAudioElement | null>(null);
	const currentUrlRef = useRef<string | null>(null);
	// const activeMessageIdRef = useRef<string | null>(null);

	useEffect(() => {
		// Create one persistent <audio> element and attach to DOM
		const audio = new Audio();
		audioRef.current = audio;
		audioRef.current.preload = 'auto';
		audioRef.current.hidden = true; // optional
		document.body.appendChild(audio);

		audio.onended = () => {
			setIsPlaying(false);
			setIsPaused(false);
			setPlayingMessageId(null);
		};

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				document.body.removeChild(audioRef.current);
			}
			if (currentUrlRef.current) {
				URL.revokeObjectURL(currentUrlRef.current);
			}
		};
	}, []);

	const speak = useCallback(async (text: string, messageId: string, voice: string = 'verse') => {
		try {
			// setIsVoiceLoading(true);
			// setVoiceError(null);

			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}

			setIsPlaying(false);
			setIsPaused(false);
			setVoiceError(null);
			setPlayingMessageId(null);

			setIsVoiceLoading(true);

			const response = await axios.post(
				`${import.meta.env.VITE_SERVER_URL}/tts`,
				{ text, voice },
				{ responseType: 'blob' }
			);

			// cleanup old URL
			if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);

			const blob = response.data;
			const url = URL.createObjectURL(blob);
			currentUrlRef.current = url;

			const audio = audioRef.current;
			if (!audio) return;

			// reset and play new audio
			audio.pause();
			audio.src = url;
			audio.currentTime = 0;

			await audio.play();
			setIsPlaying(true);
			setIsPaused(false);
			setPlayingMessageId(messageId);
		} catch (err: any) {
			setVoiceError(err.message || 'Something went wrong with TTS');
			setPlayingMessageId(null);
		} finally {
			setIsVoiceLoading(false);
		}
	}, []);

	const togglePauseResume = useCallback(() => {
		if (!audioRef.current) return;

		// if (audioRef.current.paused && audioRef.current.src) {
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
			setPlayingMessageId(null);
		}
	}, []);

	return {
		speak,
		isVoiceLoading,
		voiceError,
		togglePauseResume,
		cancel,
		isPlaying,
		isPaused,
		playingMessageId,
	};
}
