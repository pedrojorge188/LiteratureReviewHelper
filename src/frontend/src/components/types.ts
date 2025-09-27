

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

