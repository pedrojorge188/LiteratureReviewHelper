import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../store";
import { getLocaleLang } from "../../utils";
import { CalendarProps } from "./types";

export const Calendar = (props: CalendarProps) => {
  const { startDate, setStartDate, endDate, setEndDate, dateFormat = "dd/MM/yyyy", setOpen, open } = props;
  const [startDateStr, setStartDateStr] = useState<string>("");
  const [startDateStrInput, setStartDateInput] = useState<string>("");
  const [endDateStrInput, setEndDateStrInput] = useState<string>("");
  const [endDateStr, setEndDateStr] = useState<string>("");
  const { t } = useTranslation();
  const [touch, setTouch] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const onChange = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    end && setEndDate(end);
  };
  const { lang } = useSelector((state: ApplicationState) => state.HOME);

  const onOpen = () => {
    const calendar = document.querySelector<HTMLElement>(".react-datepicker");
    if (calendar) {
      window.setTimeout(() => {
        calendar.classList.add("active");
      }, 1);
    }

    const today = document.querySelector(".react-datepicker__day--today");
    if (today) {
      const todayDot = document.createElement("div");
      todayDot.classList.add("react-datepicker__day--today-dot");
      today.append(todayDot);
    }
  };

  useEffect(() => {
    let start: Date;
    let end: Date;

    if (startDate !== "" && startDate !== null) {
      start = new Date(startDate);
      setStartDateStr(
        start.getDate().toString().padStart(2, "0") +
          "/" +
          (start.getMonth() + 1).toString().padStart(2, "0") +
          "/" +
          start.getFullYear().toString().substring(2)
      );
      setStartDateInput(
        start.getDate().toString().padStart(2, "0") + "-" + (start.getMonth() + 1).toString().padStart(2, "0") + "-" + start.getFullYear().toString()
      );
      if (endDate !== "" && endDate !== new Date("01/01/1970") && endDate !== null) {
        end = new Date(endDate);
        setEndDateStr(
          end.getDate().toString().padStart(2, "0") + "/" + (end.getMonth() + 1).toString().padStart(2, "0") + "/" + end.getFullYear().toString().substring(2)
        );
        setEndDateStrInput(
          end.getDate().toString().padStart(2, "0") + "-" + (end.getMonth() + 1).toString().padStart(2, "0") + "-" + end.getFullYear().toString()
        );
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setEndDate("");
  }, [startDate]);

  const onClose = () => {
    const calendar = document.querySelector<HTMLElement>(".react-datepicker");
    if (calendar) {
      window.setTimeout(() => {
        calendar.classList.remove("active");
      }, 1);
    }
  };

  //this useeffect is to detect if is used a mouse or a human touch, because touch make 2 clicks in one click
  useEffect(() => {
    document.addEventListener(
      "touchstart",
      function onFirstTouch() {
        setTouch(true);
        document.removeEventListener("touchstart", onFirstTouch, false);
      },
      false
    );
  }, []);

  return (
    <div className={open ? "calendar-search" : "calendar-search inactive"}>
      <div className="datepicker-container">
        <div className="datepicker-container__placeHolder">
          <div className={open ? "placeHolder-text active" : "placeHolder-text"}>
            <span className="placeHolder-text--data">
              {startDate !== ""
                ? startDateStr + (endDate !== null && endDate !== "" && endDateStr !== startDateStr ? " " + t("search:to") + " " + endDateStr : "")
                : t("general:date")}
            </span>
            <span className="fa-solid fa-chevron-down"></span>
          </div>
        </div>
        <input type="text" value={startDateStrInput} id="date" className="d-none" onChange={() => {}} />
        <input type="text" value={endDateStrInput} id="endDate" className="d-none" onChange={() => {}} />
        <DatePicker
          locale={getLocaleLang(lang)}
          selected={startDate as Date}
          onChange={onChange}
          startDate={startDate as Date}
          endDate={endDate as Date}
          dateFormat={dateFormat}
          selectsRange
          onCalendarOpen={() => {
            if (touch === false) {
              onOpen();
              setOpen && setOpen(true);
            } else if (touchOpen === false) {
              onOpen();
              setOpen && setOpen(true);
              setTouchOpen(true);
            } else {
              setOpen && setOpen(false);
              setTouchOpen(false);
            }
          }}
          onCalendarClose={() => {
            onClose();
            setOpen && setOpen(false);
          }}
          formatWeekDay={(nameOfDay: any) => nameOfDay.substring(0, 1)}
          shouldCloseOnSelect={open}
          onClickOutside={() => setOpen && setOpen(false)}
          onFocus={(e) => {
            if (window.innerWidth < 992) {
              e.target.blur();
            }
          }}
        />
      </div>
    </div>
  );
};
