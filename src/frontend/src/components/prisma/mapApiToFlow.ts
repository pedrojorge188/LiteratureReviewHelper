import { Engines, SearchResponseDto } from "../../pages/types";

export const resolveFilterName = (
    name: string,
    t: (key: string, options?: any) => string
) => {
    switch (name) {
        case "YearResultFilter":
            return t("prisma:filter_dates");
        case "DuplicateResultFilter":
            return t("prisma:filter_duplicates");
        case "AuthorResultFilter":
            return t("prisma:filter_authors");
        case "TitleResultFilter":
            return t("prisma:filter_titles");
        case "VenueResultFilter":
            return t("prisma:filter_venues");
        default:
            return name;
    }
};

export const mapApiToFlow = (
    data: SearchResponseDto,
    t: (key: string, options?: any) => string
) => {
    if (!data) return { nodes: [], edges: [] };

    const nodes: any[] = [];
    const edges: any[] = [];
    let idCounter = 1;

    const engines = Object.entries(data.articlesByEngine || {});
    const rawEngineTotals: Record<string, number> = {};
    const rawEngineDropped: Record<string, number> = {};

    Object.entries(data.filterImpactByEngine || {}).forEach(([engine, filters]) => {
        const firstFilter = Object.values(filters)[0];
        if (firstFilter) {
            rawEngineTotals[engine] = firstFilter.INPUT;
        }
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

    const totalRawArticles = Object.values(rawEngineTotals).reduce(
        (sum, val) => sum + val,
        0
    );
    const totalRRemovedArticlesViaFilters = Object.values(rawEngineDropped).reduce(
        (sum, val) => sum + val,
        0
    );

    const queryNodeId = `${idCounter++}`;
    nodes.push({
        id: queryNodeId,
        type: "editableNode",
        position: { x: 400, y: 50 },
        data: {
            label: `${t("prisma:flow_query_label")}: ${data.query}\n${t(
                "prisma:flow_total_articles_label"
            )}: ${totalRawArticles}`,
            title: t("prisma:flow_research_query_title")
        }
    });

    const engineSpacing = 250;
    const totalWidth = (engines.length - 1) * engineSpacing;
    const startX = 400 - totalWidth / 2;

    const lastFilterNodes: { id: string; y: number }[] = [];

    engines.forEach(([engine, count], engineIdx) => {
        const x = startX + engineIdx * engineSpacing;
        const y = 200;

        const engineNodeId = `${idCounter++}`;
        nodes.push({
            id: engineNodeId,
            type: "editableNode",
            position: { x, y },
            data: {
                label: `${t("prisma:flow_total_articles_label")}: ${rawEngineTotals[engine] || count
                    }`,
                title: engine
            }
        });

        edges.push({
            id: `e${queryNodeId}-${engineNodeId}`,
            source: queryNodeId,
            target: engineNodeId,
            animated: true,
            style: { strokeWidth: 3, strokeDasharray: "5,5", color: "black" }
        });

        const filters = data.filterImpactByEngine?.[engine as Engines];

        if (filters) {
            const filterEntries = Object.entries(filters);

            let prevNodeId = engineNodeId;

            filterEntries.forEach(([filterName, filterData], fIdx) => {
                const filterNodeId = `${idCounter++}`;
                const fy = y + 180 + fIdx * 180;

                nodes.push({
                    id: filterNodeId,
                    type: "editableNode",
                    position: { x, y: fy },
                    data: {
                        label:
                            `${t("prisma:flow_total_articles_label")}: ${filterData.INPUT}\n` +
                            `${t("prisma:flow_articles_retrieved_label")}: ${filterData.OUTPUT}\n` +
                            `${t("prisma:flow_articles_dropped_label")}: ${filterData.DROPPED}`,
                        title: resolveFilterName(filterName, t)
                    }
                });

                edges.push({
                    id: `e${prevNodeId}-${filterNodeId}`,
                    source: prevNodeId,
                    target: filterNodeId,
                    animated: true,
                    style: { strokeWidth: 3, strokeDasharray: "5,5", color: "black" }
                });
                prevNodeId = filterNodeId;
            });

            const newY = y + 180 + filterEntries.length * 180;
            const filteredEngineNodeId = `${idCounter++}`;
            const filteredEngineY = newY;

            nodes.push({
                id: filteredEngineNodeId,
                type: "editableNode",
                position: { x, y: newY },
                data: {
                    label: `${t("prisma:flow_total_articles_label")}: ${count}`,
                    title: t("prisma:flow_filtered_articles_title", { engine })
                }
            });

            edges.push({
                id: `e${prevNodeId}-${filteredEngineNodeId}`,
                source: prevNodeId,
                target: filteredEngineNodeId,
                animated: true,
                style: { strokeWidth: 3, strokeDasharray: "5,5", color: "black" }
            });
            lastFilterNodes.push({ id: filteredEngineNodeId, y: filteredEngineY });
        }
    });

    const maxY = Math.max(...lastFilterNodes.map((n) => n.y));
    const finalNodeY = maxY + 180;

    const finalNodeId = `${idCounter++}`;
    nodes.push({
        id: finalNodeId,
        type: "editableNode",
        position: { x: 400, y: finalNodeY },
        data: {
            label:
                `${t("prisma:flow_final_articles_after_filtering_label")}: ${data.totalArticles
                }\n` +
                `${t("prisma:flow_articles_removed_label")}: ${data.duplicatedResultsRemoved
                }\n` +
                `${t("prisma:flow_articles_filtered_out_label")}: ${totalRRemovedArticlesViaFilters}`,
            title: t("prisma:flow_final_result_title")
        }
    });

    lastFilterNodes.forEach(({ id }) => {
        edges.push({
            id: `e${id}-${finalNodeId}`,
            source: id,
            target: finalNodeId,
            animated: true,
            style: { strokeWidth: 3, strokeDasharray: "5,5", color: "black" }
        });
    });

    return { nodes, edges };
};
