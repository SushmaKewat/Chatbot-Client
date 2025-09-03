interface Category {
	_id: string;
	title: string;
	slug: string;
	subCategories: SubCategory[];
	image: {
		public_id: string;
		url: string;
	};
	smallBanner: {
		public_id: string;
		url: string;
	};
	totalGeeks: number;
}

interface SubCategory {
	_id: string;
	title: string;
	slug: string;
	totalGeeks: number;
	parentCategory: string;
}

export type { Category, SubCategory };
