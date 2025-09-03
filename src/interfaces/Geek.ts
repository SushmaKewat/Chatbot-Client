import type { Category } from './Category';

export interface RateCard {
	_id: string;
	skill: Category;
	chargeType: string;
	rate: number;
}

export interface Address {
	pin: string;
	city: string;
	state: string;
	country: string;
	line1: string;
	line2: string;
	line3: string | undefined;
	location: {
		type: string;
		coordinates: [number, number];
	};
}

interface Geek {
	_id: string;
	email: string;
	mobile: string;
	fullName: {
		first: string;
		last: string;
	};
	idProof: {
		type: 'Aadhar' | string;
		isAdhaarVerified: boolean;
		idNumber: string;
		status: 'Requested' | 'Verified' | 'Rejected' | string;
		requestId: string;
	};
	primarySkill: Category;
	secondarySkills: Category[];
	modeOfService: 'All' | 'Online' | 'Offline' | string;
	// brandsServiced: Brand[];
	profileCompleted: boolean;
	profileCompletedPercentage: number;
	address: Address;
	yoe: number;
	type: 'Individual' | 'Company' | string;
	languagePreferences: string[];
	qualifications: string[];
	createdAt: Date; // Use `Date` if you will parse it
	updatedAt: Date;
	__v: number;
	isPhoneVerified: boolean;
	isEmailVerified: boolean;
	authProvider: 'custom' | 'google' | 'facebook' | string;
	isAdhaarVerified: boolean;
	profileImage: {
		public_id: string;
		url: string;
	};
	availability: string[];
	// services: Service[];
	// rateCard: RateCard[];
	// requests: ServiceRequest[];
}

export interface GeekData extends Geek {
	primarySkillName: string;
	secondarySkillsNames: string[];
	id: string;
}

// export interface Geek;
