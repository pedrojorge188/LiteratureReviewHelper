import { CommonLink } from "../../components/shared";
import { PaginationCompProps } from "./types";
import { useEffect } from "react";
import { usePagination, DOTS } from "../../utils";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Pagination = (props: PaginationCompProps) => {
  const { currentPage = 1, onPageChange, pageSize = 1, totalCount = 1, onlyNextPrev = false, nextLink, prevLink, nextLabel, prevLabel } = props;
  const { t } = useTranslation();

  const paginationRange = usePagination({
    currentPage,
    pageSize,
    totalCount,
  });

  const pageLabel = t("general:page");
  const onNext = () => {
    onPageChange(currentPage + 1);
  };
  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange![paginationRange!.length - 1];

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    if ((searchParams.get("page") || currentPage !== 1) && parseInt(searchParams.get("page") || "1") !== currentPage) {
      searchParams.set("page", currentPage.toString());
      setSearchParams(searchParams);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // If there are less than 2 times in pagination range we shall not render the component
  if ((currentPage === 0 || paginationRange!.length < 2) && !onlyNextPrev) {
    return null;
  }

  return (
    <ul className="pagination__container">
      {/* left arrow */}
      <li className="pagination__item arrows">
        {onlyNextPrev ? (
          prevLink ? (
            <CommonLink link={prevLink} title={prevLabel} linkClass="prev-link">
              <div className="arrow-prev" />
              <p className="prev-label large-only">{prevLabel}</p>
            </CommonLink>
          ) : (
            <button className="pagination__item--disabled prev-link">
              <div className="arrow-prev" />
              <p className="prev-label large-only">{prevLabel}</p>
            </button>
          )
        ) : (
          <button className={currentPage === 1 ? "pagination__item--disabled" : ""} onClick={onPrevious} aria-label={t("home:prev", { item: pageLabel })}>
            <div className="arrow-prev" />
            <p className="d-none d-lg-block"></p>
          </button>
        )}
      </li>
      {!onlyNextPrev &&
        paginationRange!.map((pageNumber: number, index: number) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber.toString() === DOTS) {
            return (
              <li className="pagination__item" key={index}>
                <span className="pagination__item--dots">&#8230;</span>
              </li>
            );
          }
          // Render page numbers
          return (
            <li className={pageNumber === currentPage ? "pagination__item pagination__item--active" : "pagination__item"} key={index}>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
                title={`${pageLabel} ${pageNumber}`}
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}
      {/* right arrow */}
      <li className="pagination__item arrows">
        {onlyNextPrev ? (
          nextLink ? (
            <CommonLink link={nextLink} title={nextLabel} linkClass="next-link">
              <p className="next-label large-only">{nextLabel}</p>
              <div className="arrow-next" />
            </CommonLink>
          ) : (
            <button className="pagination__item--disabled next-link">
              <p className="next-label large-only">{nextLabel}</p>
              <div className="arrow-next" />
            </button>
          )
        ) : (
          <button
            className={currentPage === lastPage ? "pagination__item--disabled" : ""}
            onClick={onNext}
            aria-label={t("home:next", { context: "female", item: pageLabel })}
          >
            <p className="d-none d-lg-block"></p>
            <div className="arrow-next" />
          </button>
        )}
      </li>
    </ul>
  );
};
