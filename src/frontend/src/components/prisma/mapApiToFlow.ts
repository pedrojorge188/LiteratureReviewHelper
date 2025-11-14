export const resolveFilterName = (name: string) => {
    switch (name) {
        case "YearResultFilter":
            return "Dates";
        case "DuplicateResultFilter":
            return "Duplicates";
        case "AuthorResultFilter":
            return "Authors";
        case "TitleResultFilter":
            return "Titles";
        case "VenueResultFilter":
            return "Venues"
    }
}

export const mapApiToFlow = (data) => {
    if (!data) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    let idCounter = 1;

    const engines = Object.entries(data.articlesByEngine || {});
    const rawEngineTotals = {};
    const rawEngineDropped = {};

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

    const totalRawArticles = Object.values(rawEngineTotals).reduce((sum, val) => sum + val, 0);
    const totalRRemovedArticlesViaFilters = Object.values(rawEngineDropped).reduce((sum, val) => sum + val, 0);


    const queryNodeId = `${idCounter++}`;
    nodes.push({
        id: queryNodeId,
        type: "editableNode",
        position: { x: 400, y: 50 },
        data: { label: `Query: ${data.query}\nTotal articles: ${totalRawArticles}`, title: 'Research Query' },
    });

    const engineSpacing = 250;
    const totalWidth = (engines.length - 1) * engineSpacing;
    const startX = 400 - totalWidth / 2;

    const lastFilterNodes = [];

    engines.forEach(([engine, count], engineIdx) => {
        const x = startX + engineIdx * engineSpacing;
        const y = 200;

        const engineNodeId = `${idCounter++}`;
        nodes.push({
            id: engineNodeId,
            type: "editableNode",
            position: { x, y },
            data: { label: `Total articles: ${rawEngineTotals[engine] || count}`, title: engine },
        });

        edges.push({ id: `e${queryNodeId}-${engineNodeId}`, source: queryNodeId, target: engineNodeId, animated: true, style: { strokeWidth: 3, strokeDasharray: '5,5', color: 'black' } });

        const filters = data.filterImpactByEngine?.[engine];

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
                        label: `Total articles: ${filterData.INPUT}\nArticles retrieved: ${filterData.OUTPUT}\nArticles dropped: ${filterData.DROPPED}`,
                        title: resolveFilterName(filterName)
                    },
                });

                edges.push({ id: `e${prevNodeId}-${filterNodeId}`, source: prevNodeId, target: filterNodeId, animated: true, style: { strokeWidth: 3, strokeDasharray: '5,5', color: 'black' } });
                prevNodeId = filterNodeId;
            });

            const newY = y + 180 + filterEntries.length * 180;
            const filteredEngineNodeId = `${idCounter++}`;
            const filteredEngineY = y + 180 + filterEntries.length * 180;

            nodes.push({
                id: filteredEngineNodeId,
                type: "editableNode",
                position: { x, y: newY },
                data: { label: `Total articles: ${count}`, title: `${engine} filtered articles` },
            });

            edges.push({ id: `e${prevNodeId}-${filteredEngineNodeId}`, source: prevNodeId, target: filteredEngineNodeId, animated: true, style: { strokeWidth: 3, strokeDasharray: '5,5', color: 'black' } });
            lastFilterNodes.push({ id: filteredEngineNodeId, y: filteredEngineY });
        };
    });

    const maxY = Math.max(...lastFilterNodes.map(n => n.y));
    const finalNodeY = maxY + 180;

    const finalNodeId = `${idCounter++}`;
    nodes.push({
        id: finalNodeId,
        type: "editableNode",
        position: { x: 400, y: finalNodeY },
        data: {
            label: `Final Articles after filtering: ${data.totalArticles}\nArticles removed: ${data.duplicatedResultsRemoved}\nArticles filtered out: ${totalRRemovedArticlesViaFilters}`,
            title: 'Final Result'
        },
    });

    lastFilterNodes.forEach(({ id }) => {
        edges.push({
            id: `e${id}-${finalNodeId}`,
            source: id,
            target: finalNodeId,
            animated: true,
            style: { strokeWidth: 3, strokeDasharray: '5,5', color: 'black' }
        });
    });

    return { nodes, edges };
};
