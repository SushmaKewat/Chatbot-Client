import type { GeekData } from '../../interfaces/Geek';

interface GeekCardProps {
	geekData: GeekData;
	handleGeekCardClick: () => void;
}

const GeekCard: React.FC<GeekCardProps> = ({ geekData, handleGeekCardClick }) => {
	return (
		<div className='max-w-xs h-fit shadow-lg border border-pink-500 p-4 m-2 text-wrap rounded-2xl'>
			<div className='flex flex-col gap-1'>
				<div className='mb-3 flex items-center justify-center'>
					<div className='font-semibold md:text-xl text-base'>
						{geekData.fullName.first} {geekData.fullName.last}
						{geekData?.address?.city && `, ${geekData?.address?.state}`}
					</div>
				</div>
				<div className='md:text-sm text-xs text-gray-600'>
					<span className='font-bold md:text-sm text-xs'>Primary Skill:</span>{' '}
					{geekData.primarySkillName}
				</div>
				{geekData.secondarySkillsNames.length > 0 && (
					<div className='md:text-sm text-xs flex flex-wrap  text-gray-600'>
						<span className='font-bold'>Secondary Skills:</span>{' '}
						{geekData?.secondarySkillsNames?.map(
							(skill, i: number) => i < 2 && <div key={i}>{skill}</div>
						)}
					</div>
				)}
				<div
					color='gray'
					className='md:text-sm text-xs flex items-center gap-1 text-gray-600'>
					<span className='font-bold'>Experience:</span> {geekData.yoe} years
				</div>
			</div>
			<div className='py-2 bottom-0 flex flex-wrap gap-4'>
				<button
					onClick={handleGeekCardClick}
					className='bg-pink-500 text-white py-1.5 text-xs px-4 rounded-md'>
					Book Now
				</button>
			</div>
		</div>
	);
};
export default GeekCard;
