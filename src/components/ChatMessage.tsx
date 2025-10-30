import type { ChatMessageInterface } from '../interfaces/ChatMessageInterface';
import assistant from '../assets/robot-assistant.png';
import { FaPlay, FaPause } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

function TimeDisplay({ timestamp }: { timestamp: number }) {
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const formattedTime = `${hours}:${minutes}`;

	return <span>{formattedTime}</span>;
}

interface ChatMessageProps {
	message: ChatMessageInterface;
	key: number;
	playingMessageId: string | null;
	isPlaying: boolean;
	isPaused: boolean;
	speak: (text: string, messageId: string, voice?: string) => void;
	togglePauseResume: () => void;
	cancel: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
	message,
	playingMessageId,
	isPlaying,
	isPaused,
	speak,
	togglePauseResume,
	cancel,
}) => {
	const isUser = message.role === 'user';
	const isActive = playingMessageId === message.id;

	const bgColor = isUser
		? 'bg-gradient-to-br from-violet-400  to-pink-400'
		: 'bg-gradient-to-br from-gray-50 to-gray-200';
	const textColor = isUser ? 'text-white' : 'text-black';
	const alignment = isUser ? 'justify-end' : 'justify-start';
	const timeColor = isUser ? 'text-white/70' : 'text-gray-800/60';
	const corner = isUser ? 'rounded-tr-none' : 'rounded-tl-none';

	// const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

	const handlePlayPause = () => {
		if (isActive) {
			// Case 1: If it's the active message, and it's playing/paused, toggle its state
			togglePauseResume();
		} else {
			// Case 2: If it's a new message, stop whatever is playing (via 'cancel' inside the hook)
			// and start speaking the new text. We pass the message.id to the centralized speak function
			// so the parent/hook knows which ID to track (this requires an update to the 'speak' function
			// in useTTS, see below).
			speak(message.content, message.id);
		}
	};

	const displayPlayPauseIcon = () => {
		if (isActive && isPlaying) return <FaPause />;
		if (isActive && isPaused) return <FaPlay />;
		return <FaPlay />;
	};

	return (
		<>
			<div className={` flex ${alignment} items-start`}>
				{!isUser && (
					<div
						className={`w-16 h-16 my-2 flex items-center justify-center font-bold ${textColor}`}>
						<img
							width={40}
							height={40}
							className='rounded-full object-cover border border-gray-200'
							src={assistant}
							alt='bot'
						/>
					</div>
				)}

				<div
					className={`${bgColor} ${textColor} ${corner}
					text-xs font-medium sm:text-sm md:text-sm lg:text-sm rounded-2xl  px-6 py-2 m-2 flex max-w-xs sm:max-w-fit md:max-w-1/2 shadow-md flex-col`}>
					<div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
					<div className={`${timeColor} text-xs  my-1 flex justify-end`}>
						<TimeDisplay timestamp={message.timestamp} />
					</div>
				</div>
				<div className='flex my-auto'>
					{!isUser && (
						<div className='flex flex-col gap-2 text-pink-400 items-center'>
							<button onClick={handlePlayPause} className='p-1 rounded-full'>
								{displayPlayPauseIcon()}
							</button>

							<button
								onClick={() => {
									if (isActive) {
										cancel();
									}
								}}
								className='p-1 rounded-full'>
								<MdCancel />
							</button>
						</div>
					)}
				</div>

				{isUser && (
					<div
						className={`w-10 h-10 my-2 rounded-full ${bgColor} flex items-center justify-center font-bold ${textColor}`}>
						U
					</div>
				)}
			</div>
		</>
	);
};

export default ChatMessage;
