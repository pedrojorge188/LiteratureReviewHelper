import { Engines, SearchResponseDto } from "../../pages/types";
import { resolveFilterName } from "./mapApiToFlow";
import { useTranslation } from "react-i18next";

export const PrismaReport = (data: SearchResponseDto) => {
    const { t } = useTranslation();

    if (!data) return null;

    const rawEngineTotals: Record<string, number> = {};
    const rawEngineDropped: Record<string, number> = {};

    Object.entries(data.filterImpactByEngine || {}).forEach(([engine, filters]) => {
        const firstFilter = Object.values(filters)[0];
        if (firstFilter) rawEngineTotals[engine] = firstFilter.INPUT;
    });


    Object.entries(data.filterImpactByEngine || {}).forEach(([engine, filters]) => {
        const nonDuplicateFilters = Object.entries(filters).filter(
            ([filterName]) => filterName !== "DuplicateResultFilter"
        );

        const totalDropped = nonDuplicateFilters.reduce((sum, [, filter]) => {
            return sum + (filter.DROPPED || 0);
        }, 0);

        rawEngineDropped[engine] = totalDropped;
    });

    const totalRawArticles = Object.values(rawEngineTotals).reduce((sum, val) => sum + val, 0);
    const totalRRemovedArticlesViaFilters = Object.values(rawEngineDropped).reduce((sum, val) => sum + val, 0);


    return (
        <div className="flow-report">
            <div className="section">
                <div className="heading">
                    {t("prisma:report_title")}
                </div>
                <p>
                    <strong>{t("prisma:report_query_label")}:</strong> {data.query}
                </p>
                <p>
                    <strong>{t("prisma:report_total_articles_label")}:</strong> {totalRawArticles}
                </p>
                <p>
                    <strong>{t("prisma:report_final_articles_label")}:</strong> {data.totalArticles}
                </p>
                {data.duplicatedResultsRemoved !== undefined && (
                    <p>
                        <strong>{t("prisma:report_duplicates_removed_label")}:</strong>{" "}
                        {data.duplicatedResultsRemoved}
                    </p>
                )}
                <p>
                    <strong>{t("prisma:report_removed_via_filters_label")}:</strong>{" "}
                    {totalRRemovedArticlesViaFilters}
                </p>
            </div>

            <div className="section">
                <div className="heading">
                    {t("prisma:report_articles_by_engine_title")}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>{t("prisma:report_table_engine_header")}</th>
                            <th>{t("prisma:report_table_total_articles_header")}</th>
                            <th>{t("prisma:report_table_final_articles_header")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.articlesByEngine || {}).map(([engine, count]) => (
                            <tr key={engine}>
                                <td>{engine}</td>
                                <td>{rawEngineTotals[engine] || count}</td>
                                <td>{count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <div className="heading">
                    {t("prisma:report_filter_impact_title")}
                </div>

                {Object.entries(data.filterImpactByEngine || {}).map(([engine, filters]) => (
                    <div key={engine} style={{ marginBottom: "20px" }}>
                        <div className="subheading">{engine}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("prisma:report_table_filter_header")}</th>
                                    <th>{t("prisma:report_table_received_header")}</th>
                                    <th>{t("prisma:report_table_gathered_header")}</th>
                                    <th>{t("prisma:report_table_dropped_header")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(filters).map(([filterName, stats]) => (
                                    <tr key={filterName}>
                                        <td>{resolveFilterName(filterName, t)}</td>
                                        <td>{stats.INPUT}</td>
                                        <td>{stats.OUTPUT}</td>
                                        <td>{stats.DROPPED}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};