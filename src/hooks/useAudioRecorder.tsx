import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export function useAudioRecorder(onTranscript: (text: string) => void) {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const startRecording = useCallback(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mediaRecorder = new MediaRecorder(stream);
		mediaRecorderRef.current = mediaRecorder;
		chunksRef.current = [];

		mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) chunksRef.current.push(e.data);
		};

		mediaRecorder.onstop = async () => {
			const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

			const formData = new FormData();
			formData.append('file', audioBlob, 'recording.webm');

			try {
				const response = await axios.post(
					`${import.meta.env.VITE_SERVER_URL}/stt`,
					formData,
					{ headers: { 'Content-Type': 'multipart/form-data' } }
				);
				onTranscript(response.data.text);
			} catch (error) {
				console.error('STT ERROR: ', error);
			}
		};
		mediaRecorder.start();
		setIsRecording(true);
	}, [onTranscript]);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
		}
	}, []);

	return { isRecording, startRecording, stopRecording };
}
