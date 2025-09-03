import React, { useEffect, useState } from 'react';
import Skeleton from './ui/Skeleton';
import ChatSuggestionButton from './ui/ChatSuggestionButton';

interface ChatWelcomeProps {
	onSuggestionClick: (prompt: string) => void;
	isLoadingAiResponse: boolean;
}

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onSuggestionClick, isLoadingAiResponse }) => {
	const [prompts, setPrompts] = useState<string[]>([]);
	const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);

	const loadInitialPrompts = async () => {
		setIsLoadingPrompts(true);

		try {
			await fetch(`${import.meta.env.VITE_SERVER_URL}/geek_query/get_service_categories`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((res) => {
					if (!res.ok) {
						throw new Error(res.statusText);
					} else {
						return res.json();
					}
				})
				.then((data) => {
					const categories = data.categories.map(
						(category: { title: string }) => category.title
					);
					setPrompts(categories);
					setIsLoadingPrompts(false);
					return data.categories;
				});
		} catch (err) {
			console.error('Failed to load initial prompts from the database: ', err);
			setPrompts(['Laptop Issues', 'Desktop Issues', 'Printer Issues']);
		} finally {
			setIsLoadingPrompts(false);
		}
	};

	useEffect(() => {
		setIsLoadingPrompts(true);
		loadInitialPrompts();
	}, []);

	return (
		<section className='w-full h-full mt-12 flex items-center justify-center px-12'>
			<div className='flex flex-col items-center justify-center bg-gradient-to-br   rounded-md p-6'>
				<h1 className='text-3xl font-bold text-pink-500 '>Welcome to GoDChat</h1>
				<p className='text-gray-500 text-center text-sm m-4'>
					I&apos;m an AI assistant to collect information about your device.
					<br />
					What service are you looking for?
				</p>
				<div className='flex items-center justify-center flex-wrap'>
					{isLoadingPrompts ? (
						<>
							<Skeleton />
							<Skeleton />
							<Skeleton />
						</>
					) : (
						prompts.map((prompt, index) => (
							<ChatSuggestionButton
								key={index}
								prompt={prompt}
								onClick={() => onSuggestionClick(prompt)}
								isLoading={isLoadingAiResponse}
							/>
						))
					)}
				</div>
			</div>
		</section>
	);
};

export default ChatWelcome;
