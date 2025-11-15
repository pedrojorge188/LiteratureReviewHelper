import { Engines, SearchResponseDto } from "../../pages/types";
import { resolveFilterName } from "./mapApiToFlow";

export const PrismaReport = (data: SearchResponseDto) => {
    if (!data) return null;

    const rawEngineTotals: Record<string, number> = { };
    const rawEngineDropped: Record<string, number> = { };
    
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
                <div className="heading">Search Report</div>
                <p><strong>Query:</strong> {data.query}</p>
                <p><strong>Total Articles:</strong> {totalRawArticles}</p>
                <p><strong>Final Articles:</strong> {data.totalArticles}</p>
                {data.duplicatedResultsRemoved !== undefined && (
                    <p><strong>Duplicated Removed:</strong> {data.duplicatedResultsRemoved}</p>
                )}
                <p><strong>Removed via filtering</strong>: {totalRRemovedArticlesViaFilters}</p>
            </div>

        <div className="section">
            <div className="heading">Articles by Engine</div>
            <table>
                <thead>
                    <tr>
                        <th>Engine</th>
                        <th>Total Articles</th>
                        <th>Final Articles</th>
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
            <div className="heading">Filter Impact by Engine</div>

            {Object.entries(data.filterImpactByEngine || {}).map(([engine, filters]) => (
                <div key={engine} style={{ marginBottom: "20px" }}>
                    <div className="subheading">{engine}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Filter</th>
                                    <th>Received</th>
                                    <th>Gathered</th>
                                    <th>Dropped</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(filters).map(([filterName, stats]) => (
                                    <tr key={filterName}>
                                        <td>{resolveFilterName(filterName)}</td>
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