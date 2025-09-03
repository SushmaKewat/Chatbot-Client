import { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import toast from 'react-hot-toast';

import type { ChatMessageInterface } from '../interfaces/ChatMessageInterface.ts';
import ChatInput from './ChatInput.tsx';
import ChatWelcome from './ChatWelcome.tsx';
import ChatMessage from './ChatMessage.tsx';
import ChatSuggestionButton from './ui/ChatSuggestionButton.tsx';
import GeekCard from './ui/GeekCard.tsx';
import Pagination from './ui/Pagination.tsx';

import loader from '../assets/loader.gif';
import { useTTS } from '../hooks/useTTS.tsx';

const generateObjectId = (): string => {
	const timestamp = Math.floor(Date.now() / 1000).toString(16);
	const randomBytes = Array.from({ length: 16 }, () =>
		Math.floor(Math.random() * 256)
			.toString(16)
			.padStart(2, '0')
	)
		.join('')
		.substring(0, 16);
	return timestamp + randomBytes;
};

export const ChatInterface = () => {
	const [messages, setMessages] = useState<Array<ChatMessageInterface>>([]);
	const [options, setOptions] = useState<Array<string>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [fetchedChatHistory, setFetchedChatHistory] = useState(false);
	const [isGeekOption, setIsGeekOption] = useState(false);
	const [geeks, setGeeks] = useState([]);

	const [userId, setUserId] = useState('');
	const textBufferRef = useRef<string>('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(3);

	const bottomRef = useRef<HTMLDivElement>(null);
	const { speak } = useTTS();

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		const storedUserId = localStorage.getItem('chatUserId');
		if (storedUserId) {
			setUserId(storedUserId);
		} else {
			const newUserId = generateObjectId();
			setUserId(newUserId);
			localStorage.setItem('chatUserId', newUserId);
		}
	}, []);

	const conversationId = userId ? `${userId}-conversation-id` : null;

	useEffect(() => {
		const getChatHistory = async () => {
			try {
				if (
					!conversationId ||
					conversationId === '' ||
					conversationId === '-conversation-id'
				) {
					return;
				}
				const { data } = await axios.get(
					`${import.meta.env.VITE_SERVER_URL}/chat/chat_history/${conversationId}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);
				if (data[0]) {
					const formattedMessages = data[0].chat_messages.map(
						(message: { message: string; sender: string; sentAt: string }) => {
							return {
								id: Date.now().toString(),
								content: message.message,
								role: message.sender,
								timestamp: message.sentAt,
							};
						}
					);
					setMessages(formattedMessages);
					setFetchedChatHistory(true);
				}
			} catch (error) {
				console.error(error);
			}
		};
		if (userId) {
			if (messages.length <= 0) {
				getChatHistory();
			}
		}
	}, [conversationId, messages.length, userId]);

	const ws = useRef<WebSocket | null>(null);

	const handleSpeak = (text: string) => {
		if (text.trim()) speak(text);
	};

	useEffect(() => {
		const sendMessage = async () => {
			ws.current = new WebSocket(
				`${
					import.meta.env.VITE_WEBSOCKET_URL
				}/chat/${userId}?conversation_id=${conversationId}`
			);

			ws.current.onopen = () => {
				console.log('WebSocket connection opened');
			};

			ws.current.onmessage = (event) => {
				const data = event.data;

				if (!data || data === '[END]') {
					setIsLoading(false);
					return;
				}

				try {
					const fullResponse = JSON.parse(data);
					const { response, options } = fullResponse;

					const botMessage = {
						id: Date.now().toString(),
						content: response,
						role: 'bot',
						timestamp: Date.now(),
					};
					setMessages((prev: ChatMessageInterface[]) => [...prev, botMessage]);
					handleSpeak(response);

					if (response === 'Please select a Geek to proceed') {
						const geekOptions = JSON.parse(options[0]);
						setPage(geekOptions?.page);
						setTotalPages(geekOptions?.pages);

						const suitableGeeks = geekOptions.geeks;
						setGeeks(suitableGeeks);

						setIsGeekOption(true);
						setOptions([]);
					} else {
						setGeeks([]);
						setPage(page);
						setIsGeekOption(false);
						setOptions(options || []);
					}
					setIsLoading(false);
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (error) {
					toast.error('Something went wrong. Please try again.');
					setIsLoading(false);
					setOptions([]);
					setGeeks([]);
					setIsGeekOption(false);
				}
			};

			ws.current.onclose = () => {
				console.log('WebSocket connection closed');
				setIsLoading(false);
			};

			ws.current.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

			return () => {
				if (ws.current && ws.current.readyState === WebSocket.OPEN) {
					ws.current.close();
					<p>The connection has been closed.</p>;
				}
			};
		};

		if (userId) {
			sendMessage();
		}
	}, [conversationId, userId]);

	const handleMessageSend = async (content: string) => {
		if (!userId || userId === '') {
			toast.error('User not found');
		}
		const userMessage = {
			id: Date.now().toString(),
			content: content.toString(),
			role: 'user',
			timestamp: Date.now(),
		};
		setMessages((prev) => {
			const updated = [...prev, userMessage];
			return updated;
		});
		setIsLoading(true);
		textBufferRef.current = '';
		setOptions([]);

		try {
			if (ws.current && ws.current.readyState === WebSocket.OPEN) {
				ws.current.send(content);
			} else {
				console.log('WebSocket is not open');
			}
		} catch (error) {
			console.error('Error sending message:', error);
		}
	};

	const handleClearConversation = async () => {
		if (!conversationId) {
			toast.error('Conversation ID not set');
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_SERVER_URL}/chat/delete/${conversationId}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				setMessages([]);
				setFetchedChatHistory(false);
				toast.success('Chat history deleted successfully');
			} else {
				console.error('Failed to delete chat history', response);
			}
		} catch (error) {
			console.log('Error deleting chat history:', error);
			toast.error('Error deleting chat history');
		}
	};

	const handleContinueChat = async () => {
		setFetchedChatHistory(true);
		if (ws.current && ws.current.readyState === WebSocket.CLOSED) {
			ws.current = new WebSocket(
				`${
					import.meta.env.VITE_SERVER_URL
				}/chat/${userId}?conversation_id=${conversationId}`
			);
		}

		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			console.log('WebSocket connection opened to continue chat with agent.');
			setIsLoading(true);
			ws.current.send(
				JSON.stringify({
					action: 'continue_conversation',
					chat_history: messages.map((message) => ({
						role: message.role,
						message: message.content,
					})),
				})
			);
		}
		setFetchedChatHistory(false);
	};

	const handleGeekCardClick = () => {
		console.log('geek card clicked');
	};

	return (
		<section className='w-full h-full relative flex flex-col items-center '>
			<div className=' w-full mx-auto h-screen  flex flex-col items-center rounded-md justify-center max-w-3xl  p-3'>
				<div className='py-10 absolute top-0 left-0 h-24 gap-0.5 justify-center items-center w-full rounded-t-md bg-white border-b  text-lg font-bold text-gray-700 flex flex-col px-4'>
					<p className='mb-0 text-xl md:text-2xl'>Welcome</p>

					<p className='  mb-0 text-xs  font-medium'>
						You are now connected to your GoD Chatbot.
					</p>

					<button
						onClick={handleClearConversation}
						className='flex  text-sm  font-semibold bg-transparent text-pink-500 cursor-pointer hover:text-pink-700  items-center w-fit px-3 py-1 rounded-md text-nowrap transition duration-150 transform hover:scale-105'>
						Clear Chat
					</button>
				</div>
				<main className='flex flex-col  flex-grow overflow-y-auto w-full scrollbar-hide'>
					{userId && userId !== '' && messages.length === 0 && !isLoading ? (
						<div className='flex mt-8 h-full items-center justify-center'>
							<ChatWelcome
								onSuggestionClick={handleMessageSend}
								isLoadingAiResponse={isLoading}
							/>
						</div>
					) : (
						<div className='flex flex-col w-full  mt-20 py-5'>
							{messages.map((message: ChatMessageInterface, index) => (
								<ChatMessage key={index} message={message} />
							))}

							{/* Loader */}
							{isLoading &&
								messages.length > 0 &&
								messages[messages.length - 1].role === 'user' && (
									<img src={loader} alt='loading' width={50} height={50} />
								)}

							{fetchedChatHistory && (
								<div className='flex flex-col items-center mx-auto my-3 justify-center border border-pink-300 p-3 w-1/2'>
									<p className='font-bold mb-3'>Continue chat?</p>
									<div className='flex flex-row gap-x-6'>
										<button
											onClick={handleContinueChat}
											className='bg-pink-400 px-4 py-1 rounded-lg text-white border border-pink-400 hover:scale-105'>
											Yes
										</button>
										<button
											onClick={handleClearConversation}
											className=' px-4 py-1 rounded-lg border border-pink-400 hover:bg-pink-400 hover:text-white hover:scale-105'>
											No
										</button>
									</div>
								</div>
							)}

							{!isLoading && isGeekOption && geeks.length > 0 ? (
								<div className='flex flex-col gap-6 mt-8'>
									<div className='flex flex-wrap w-full justify-center'>
										{geeks?.map((geek, index) => (
											<GeekCard
												key={index}
												geekData={geek}
												handleGeekCardClick={handleGeekCardClick}
											/>
										))}
									</div>

									<Pagination
										currentPage={page}
										totalPages={totalPages}
										onPageChange={() => {
											setPage(page);
										}}
									/>
								</div>
							) : (
								<div>
									{!isLoading && options.length > 0 && (
										<div className='flex flex-wrap w-3/4'>
											{options.map((option, index) => (
												<ChatSuggestionButton
													key={index}
													prompt={option}
													onClick={handleMessageSend}
													isLoading={isLoading}
												/>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					)}
					<div className='h-0' ref={bottomRef}></div>
				</main>
				{userId && userId !== '' && (
					<div className='w-full static bottom-0'>
						<ChatInput onSendMessage={handleMessageSend} isLoading={isLoading} />
					</div>
				)}
			</div>
		</section>
	);
};
