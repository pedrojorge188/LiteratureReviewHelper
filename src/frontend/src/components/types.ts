export interface SelectionModalProps {
	setShow: Function;
	setConfirm: Function;
	questionText: string;
	descriptionText?: string;
	closeTime?: number;
	closeOnClickOutside?: boolean;
	rejectText?: string;
	acceptText?: string;
	rejectIcon?: React.ReactNode;
	acceptIcon?: React.ReactNode;
}

export interface TitleToExclude {
	id: string;
	title: string;
}

export interface TitlesGroups {
	id: string;
	name: string;
	creationDate: Date;
	titles: string[];
}

export type TitleOption = TitleToExclude | TitlesGroups;