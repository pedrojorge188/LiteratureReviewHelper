import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { resolveFilterName } from "./mapApiToFlow";
import { Artigo, Engines, SearchResponseDto, Statistic } from "../../pages/types";

export const PrismaCharts = (data: SearchResponseDto) => {
  const [property, setProperty] = useState("venueType");
  const [selectedFilter, setSelectedFilter] = useState("");

  const safeData = data || { articles: [], articlesByEngine: {}, filterImpactByEngine: {}, totalArticles: 0 };

  const engines = Object.keys(safeData.articlesByEngine || {});
  const finalCounts = Object.values(safeData.articlesByEngine || {});

  const rawCounts = engines.map(engine => {
    const filters = safeData.filterImpactByEngine?.[engine as Engines];
    if (!filters) return 0;
    const firstFilter = Object.values(filters)[0] as Record<Statistic, number> | undefined;

    return firstFilter?.INPUT ?? 0;
  });

  const availableFilters = useMemo(() => {
    const set = new Set<string>();
    Object.values(safeData.filterImpactByEngine || {}).forEach(engineFilters => {
        Object.keys(engineFilters || {}).forEach(f => set.add(f));
    });
    return Array.from(set);
  }, [safeData.filterImpactByEngine]);

    const aggregatedFilterSteps = (() => {
      const result: { name: string; value: number }[] = [];

      availableFilters.forEach(filterName => {
        let totalOutput = 0;

        engines.forEach(engine => {
          const f = safeData.filterImpactByEngine?.[engine as Engines]?.[filterName];
          if (f?.OUTPUT) totalOutput += f.OUTPUT;
        });

      result.push({
        name: resolveFilterName(filterName) || filterName,
        value: totalOutput
      });
  });

  return result;
})();

  React.useEffect(() => {
    if (availableFilters.length > 0 && !availableFilters.includes(selectedFilter)) {
        setSelectedFilter(availableFilters[0]);
    }
  }, [availableFilters, selectedFilter]);


  const pipelineSteps = [
      { name: "Total Raw Articles", value: rawCounts.reduce((a, b) => a + b, 0) },
      ... aggregatedFilterSteps,
      { name: "Final Filtered Articles", value: safeData.totalArticles ?? 0 }
  ];

  const selectableProperties = [
    "publicationYear",
    "venue",
    "venueType"
  ];

  const propertyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (safeData.articles || []).forEach(article => {
      const keyProp = property as keyof Artigo;
      let value = article[keyProp];

      if (Array.isArray(value)) {
        value.forEach(v => {
          const key = v || "Unknown";
          map[key] = (map[key] || 0) + 1;
        });
      } else {
        const key = value ?? "Unknown";
        map[key] = (map[key] || 0) + 1;
      }
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);
    return { labels, values };
  }, [safeData.articles, property]);

  if (!data) return null;

  const buildFilterImpactOption = (filterName: string) => {
    const inputData = engines.map(
      (engine) => safeData.filterImpactByEngine?.[engine as Engines]?.[filterName]?.INPUT ?? 0
    );
    const outputData = engines.map(
      (engine) => safeData.filterImpactByEngine?.[engine as Engines]?.[filterName]?.OUTPUT ?? 0
    );
    const droppedData = engines.map(
      (engine) => safeData.filterImpactByEngine?.[engine as Engines]?.[filterName]?.DROPPED ?? 0
    );

    return {
      title: {
        text: resolveFilterName(filterName),
        left: 'center',
        textStyle: { color: "#222" }
      },
      tooltip: { trigger: "axis" },
      legend: { data: ["INPUT", "OUTPUT", "DROPPED"], textStyle: { color: "#222" } },
      xAxis: {
        type: "category",
        data: engines,
        name: resolveFilterName(filterName),
        nameLocation: 'middle',
        nameGap: 25,
        axisLabel: { color: "#222" }
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { formatter: (v: number) => Math.floor(v) },
      },
      series: [
        { name: "Received", type: "bar", data: inputData, itemStyle: { color: "#888" } },
        { name: "Gathered", type: "bar", data: outputData, itemStyle: { color: "#444" } },
        { name: "Dropped", type: "bar", data: droppedData, itemStyle: { color: "#222" } },
      ],
    };
  };

  const funnelColor = (dataLength: number) => (params: any) => {
    const index = params.dataIndex;
    const start = 190;
    const end = 34;

    const value = Math.floor(
      start + (end - start) * (index / Math.max(dataLength - 1, 1))
    );

    return `rgb(${value}, ${value}, ${value})`;
  };

  return (
    <div className="prisma-charts">

      <div className="chart-section">
        <h2>Overall Filtering Funnel (Global Summary)</h2>
        <ReactECharts
          className="echarts-container"
          style={{ height: 260 }}
          option={{
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const pct = ((params.data.value / pipelineSteps[0].value) * 100 || 0).toFixed(1);
                return `${params.name}<br/>${params.value} articles<br/>(${pct}% retained)`;
              }
            },
            series: [
              {
                type: "funnel",
                orient: "horizontal",
                left: "5%",
                right: "5%",
                top: "10%",
                bottom: "10%",
                width: "90%",
                minSize: "40%",
                maxSize: "90%",
                sort: "none",
                gap: 8,
                data: pipelineSteps,
                itemStyle: {
                  borderColor: "#333",
                  borderWidth: 1,
                  opacity: 0.85,
                  color: funnelColor(pipelineSteps.length)
                },
                label: {
                  show: true,
                  color: "#111",
                  fontSize: 14,
                  formatter: (params: any) => {
                    const pct = ((params.value / pipelineSteps[0].value) * 100 || 0).toFixed(1);
                    return `${params.name}\n${params.value} (${pct}%)`;
                  }
                },
                emphasis: {
                  label: { fontSize: 16, fontWeight: 600, color: "#000" }
                }
              }
            ]
          }}
        />
      </div>

      <div className="grid-two-cols">
        <div className="chart-section">
          <h2>Articles per Engine</h2>
          <ReactECharts
            className="echarts-container"
            style={{ height: 320 }}
            option={{
              tooltip: {},
              xAxis: { type: "category", data: engines },
              yAxis: { type: "value", minInterval: 1, axisLabel: { formatter: (v: number) => Math.floor(v) } },
              series: [{ type: "bar", data: finalCounts, itemStyle: { color: "#444" } }]
            }}
          />
        </div>

        <div className="chart-section">
          <h2>Raw vs Final Articles</h2>
          <ReactECharts
            className="echarts-container"
            style={{ height: 320 }}
            option={{
              tooltip: { trigger: "axis" },
              legend: { data: ["Raw", "Final"] },
              xAxis: { type: "category", data: engines },
              yAxis: { type: "value", minInterval: 1, axisLabel: { formatter: (v: number) => Math.floor(v) } },
              series: [
                { name: "Raw", type: "bar", data: rawCounts, itemStyle: { color: "#777" } },
                { name: "Final", type: "bar", data: finalCounts, itemStyle: { color: "#333" } }
              ]
            }}
          />
        </div>
      </div>

      <div className="chart-section">
        <h2>Articles per Selected Property</h2>

        <div className="property-selector" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 12 }}>Property:</label>
          <select value={property} onChange={e => setProperty(e.target.value)} style={{ padding: "4px 6px" }}>
            {selectableProperties.map(p => (
              <option key={p} value={p}>
                {p === "publicationYear" ? "Publication Year" : p === "venueType" ? "Venue Type" : p === "authors" ? "Authors" : p}
              </option>
            ))}
          </select>
        </div>

        <ReactECharts
          className="echarts-container"
          style={{ height: 360 }}
          option={{
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: propertyCounts.labels, axisLabel: { rotate: 40 } },
            yAxis: { type: "value", minInterval: 1, axisLabel: { formatter: (v: number) => Math.floor(v) } },
            series: [{ type: "bar", data: propertyCounts.values, itemStyle: { color: "#555" } }]
          }}
        />
      </div>

      <div className="chart-section">
        <h2>Filter Impact by Engine</h2>

        <div className="filter-selector" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 12 }}>Filter:</label>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            style={{ padding: "4px 6px" }}
          >
            {availableFilters.map(filter => (
              <option key={filter} value={filter}>
                  {resolveFilterName(filter) || filter}
              </option>
            ))}
          </select>
        </div>

        <ReactECharts
          className="echarts-container"
          style={{ height: 360 }}
          option={buildFilterImpactOption(selectedFilter)}
        />
      </div>
    </div>
  );
};
