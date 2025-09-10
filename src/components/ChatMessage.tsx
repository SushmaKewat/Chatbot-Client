import type { ChatMessageInterface } from '../interfaces/ChatMessageInterface';
import assistant from '../assets/robot-assistant.png';
import { useTTS } from '../hooks/useTTS';

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
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
	const isUser = message.role === 'user';

	const { speak, togglePauseResume, cancel, isPlaying, isPaused } = useTTS();

	const bgColor = isUser
		? 'bg-gradient-to-br from-violet-400  to-pink-400'
		: 'bg-gradient-to-br from-gray-50 to-gray-200';
	const textColor = isUser ? 'text-white' : 'text-black';
	const alignment = isUser ? 'justify-end' : 'justify-start';
	const timeColor = isUser ? 'text-white/70' : 'text-gray-800/60';
	const corner = isUser ? 'rounded-tr-none' : 'rounded-tl-none';

	return (
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
			{!isUser && (
				<div className='flex gap-2 '>
					<button
						onClick={() =>
							isPlaying || isPaused ? togglePauseResume() : speak(message.content)
						}
						className='px-1 py-1 border border-pink-400 rounded-full'>
						{isPaused ? '▶' : isPlaying ? '⏸' : '▶'}
					</button>

					<button
						onClick={cancel}
						className='px-1 py-1 border border-pink-400 rounded-full'>
						⏹
					</button>
				</div>
			)}

			{isUser && (
				<div
					className={`w-10 h-10 my-2 rounded-full ${bgColor} flex items-center justify-center font-bold ${textColor}`}>
					U
				</div>
			)}
		</div>
	);
};

export default ChatMessage;
