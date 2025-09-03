// useTTS.tsx
import { useState, useCallback } from 'react';
import axios from 'axios';

export function useTTS() {
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);
	const [voiceError, setVoiceError] = useState<string | null>(null);

	const speak = useCallback(async (text: string, voice: string = 'verse') => {
		try {
			setIsVoiceLoading(true);
			setVoiceError(null);

			const response = await axios.post(
				`${import.meta.env.VITE_SERVER_URL}/tts`,
				{ text, voice },
				{ responseType: 'blob' }
			);

			// Convert ArrayBuffer → Blob → URL
			// const buffer = await response.arrayBuffer();
			// const blob = new Blob([buffer], { type: 'audio/wav' });
			const blob = response.data;
			const url = URL.createObjectURL(blob);

			// Play audio in browser
			const audio = new Audio(url);
			audio.play();
		} catch (err: any) {
			setVoiceError(err.message || 'Something went wrong with TTS');
		} finally {
			setIsVoiceLoading(false);
		}
	}, []);

	return { speak, isVoiceLoading, voiceError };
}
