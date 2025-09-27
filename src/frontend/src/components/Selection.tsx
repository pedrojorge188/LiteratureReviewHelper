import { useEffect, useRef } from "react";

import { SelectionModalProps } from "./types";

export const SelectionModal = (props: SelectionModalProps) => {
	const {
		setShow,
		acceptIcon = <></>,
		rejectIcon = <></>,
		setConfirm,
		questionText,
		acceptText,
		rejectText,
		descriptionText,
		closeTime,
		closeOnClickOutside = true,
	} = props;

	const selectionTimer: { current: NodeJS.Timeout | null } = useRef(null);
	const compRef = useRef<any|null>(null);

	const closeComponent = (e: any) => {
		if (compRef.current && !compRef.current.contains(e.target) && closeOnClickOutside) leavingAnimation();
	};

	useEffect(() => {
		if (closeTime)
			selectionTimer.current = setTimeout(() => {
				setConfirm(false);
				leavingAnimation();
			}, closeTime);

		window.addEventListener("mouseup", closeComponent);

		return () => {
			window.removeEventListener("mouseup", closeComponent);
			clearTimeout(selectionTimer.current as NodeJS.Timeout);
		};
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function leavingAnimation() {
		compRef.current.classList.add("leaving");
		setTimeout(() => {
			setShow(false);
		}, 300);
	}

	return (
		<div className="info-modal__container">
			<div className="info-modal" ref={compRef}>
				<div className="info-modal__top">
					<div className="info-modal__top__icon-container">{/**ICON AQUI */}</div>
				</div>
				<div className="info-modal__content">
					<>
						<span className="info-modal__content-text" dangerouslySetInnerHTML={{ __html: questionText }} />
						{descriptionText && <span className="info-modal__content-descritpion" dangerouslySetInnerHTML={{ __html: descriptionText }} />}
						<div className="info-modal__content-btns">
							<button
								onClick={() => {
									leavingAnimation();
									setTimeout(() => setConfirm(false), 300);
								}}
								className="btn btn-primary">
								<>
									{rejectIcon}
									<span>Cancelar</span>
								</>
							</button>
							<button
								onClick={() => {
									leavingAnimation();
									setTimeout(() => {
										setConfirm(true);
									}, 300);
								}}
								className="btn btn-primary">
								<>
									{acceptIcon}
									<span>Aceitar</span>
								</>
							</button>
						</div>
					</>
				</div>
			</div>
		</div>
	);
};
