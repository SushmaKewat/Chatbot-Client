import React from 'react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
	const createPageNumbers = () => {
		const pages: number[] = [];

		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, currentPage + 2);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	};

	return (
		<div className='flex justify-center mt-8 gap-2 flex-wrap items-center'>
			{/* Prev */}
			<button
				className='px-3 py-1 rounded bg-pink-300 cursor-pointer disabled:opacity-50'
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}>
				&lt; Prev
			</button>

			{/* First page + ellipsis */}
			{currentPage > 3 && (
				<>
					<button
						className={`px-3 py-1 cursor-pointer rounded ${
							currentPage === 1 ? 'bg-pink-500 text-white' : 'bg-pink-200'
						}`}
						onClick={() => onPageChange(1)}>
						1
					</button>
					<span className='px-2'>...</span>
				</>
			)}

			{/* Centered pages */}
			{createPageNumbers().map((p) => (
				<button
					key={p}
					className={`px-3 py-1 cursor-pointer rounded ${
						currentPage === p ? 'bg-pink-500 text-white' : 'bg-pink-200'
					}`}
					onClick={() => onPageChange(p)}>
					{p}
				</button>
			))}

			{/* Last page + ellipsis */}
			{currentPage < totalPages - 2 && (
				<>
					<span className='px-2'>...</span>
					<button
						className={`px-3 py-1 cursor-pointer rounded ${
							currentPage === totalPages ? 'bg-pink-500 text-white' : 'bg-pink-200'
						}`}
						onClick={() => onPageChange(totalPages)}>
						{totalPages}
					</button>
				</>
			)}

			{/* Next */}
			<button
				className='px-3 py-1 rounded cursor-pointer bg-pink-300 disabled:opacity-50'
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}>
				Next &gt;
			</button>
		</div>
	);
};

export default Pagination;
