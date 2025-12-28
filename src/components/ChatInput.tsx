import { useRef, useState } from 'react';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface ChatInputProps {
	onSendMessage: (message: string) => Promise<void>;
	isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
	const [inputValue, setInputValue] = useState<string>('');
	const textareaRef = useRef<HTMLInputElement | null>(null);

	const handleVoiceTranscript = async (transcript: string) => {
		await onSendMessage(transcript);
	};

	const { isRecording, startRecording, stopRecording } = useAudioRecorder(handleVoiceTranscript);

	// const { listening, startedListening, browserSupportsSpeechRecognition } =
	useVoiceToText(handleVoiceTranscript);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setInputValue('');
		await onSendMessage(inputValue.trim());
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.focus();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e as unknown as React.FormEvent);
		}
	};

	return (
		<div className='flex items-end'>
			<form
				className='w-full p-4 pb-0 bg-background/80 backdrop-blur-sm'
				onSubmit={handleSubmit}>
				<div className='flex items-center space-x-2'>
					<input
						ref={textareaRef}
						type='text'
						placeholder='Type your message here'
						className='w-full flex-1 p-2 rounded border border-pink-300 focus:outline-none focus:border-pink-500'
						value={inputValue}
						onKeyDown={handleKeyDown}
						onChange={handleInputChange}
					/>
					{/* {browserSupportsSpeechRecognition && (
						<button
							type='button'
							onClick={startedListening}
							className={` m-1 w-10 h-10 rounded-full ${
								listening ? 'bg-red-400' : 'bg-gray-200'
							}`}
							title={listening ? 'Listening…' : 'Record Voice'}>
							{listening ? '🎙️' : '🎤'}
						</button>
					)} */}
					<button
						type='button'
						onMouseDown={startRecording}
						onMouseUp={stopRecording}
						className={`m-1 w-10 h-10 rounded-full ${
							isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-200'
						}`}>
						{isRecording ? '🛑' : '🎤'}
					</button>
					<button
						type='submit'
						disabled={isLoading || !inputValue.trim()}
						className='m-1 bg-pink-500 rounded py-2 px-4 hover:bg-pink-600 cursor-pointer text-white font-medium'>
						Send
					</button>
				</div>
				<div className='mt-2 mb-0 text-gray-400 text-sm text-center'>
					Please note that you are interacting with an AI-powered assistant.
				</div>
			</form>
		</div>
	);
};

export default ChatInput;
