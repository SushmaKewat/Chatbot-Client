import 'regenerator-runtime/runtime';
import { useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export function useVoiceToText(onTranscript: (transcript: string) => void) {
	const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
		useSpeechRecognition();

	const startListening = useCallback(() => {
		console.log('Speech recognition: ', browserSupportsSpeechRecognition);
		if (!browserSupportsSpeechRecognition) {
			console.log('Speech recognition not supported');
			return;
		}
		resetTranscript();
		SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
	}, [browserSupportsSpeechRecognition, resetTranscript]);

	useEffect(() => {
		// When speech stops and transcript is non-empty, invoke callback
		if (!listening && transcript.trim().length > 0) {
			onTranscript(transcript.trim());
			resetTranscript();
		}
	}, [listening, transcript, onTranscript, resetTranscript]);

	return { transcript, listening, startListening, browserSupportsSpeechRecognition };
}
