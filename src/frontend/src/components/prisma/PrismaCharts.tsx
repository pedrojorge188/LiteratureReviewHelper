import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { resolveFilterName } from "./mapApiToFlow";
import { Artigo, Engines, SearchResponseDto, Statistic } from "../../pages/types";
import { useTranslation } from "react-i18next";

export const PrismaCharts = (data: SearchResponseDto) => {
  const { t } = useTranslation();

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
        name: resolveFilterName(filterName, t) || filterName,
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
    { name: t("prisma:funnel_step_total_raw"), value: rawCounts.reduce((a, b) => a + b, 0) },
    ...aggregatedFilterSteps,
    { name: t("prisma:funnel_step_final_filtered"), value: safeData.totalArticles ?? 0 }
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
        text: resolveFilterName(filterName, t),
        left: 'center',
        textStyle: { color: "#222" }
      },
      tooltip: { trigger: "axis" },
      legend: { data: [t("prisma:series_received"), t("prisma:series_gathered"), t("prisma:series_dropped")], textStyle: { color: "#222" } },
      xAxis: {
        type: "category",
        data: engines,
        name: resolveFilterName(filterName, t),
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
        { name: t("prisma:series_received"), type: "bar", data: inputData, itemStyle: { color: "#888" } },
        { name: t("prisma:series_gathered"), type: "bar", data: outputData, itemStyle: { color: "#444" } },
        { name: t("prisma:series_dropped"), type: "bar", data: droppedData, itemStyle: { color: "#222" } },
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
        <h2>{t("prisma:charts_overall_funnel_title")}</h2>
        <ReactECharts
          className="echarts-container"
          style={{ height: 260 }}
          option={{
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const pct = ((params.data.value / pipelineSteps[0].value) * 100 || 0).toFixed(1);
                return `${params.name}<br/>${params.value} ${t("prisma:tooltip_articles")}<br/>(${pct}% ${t("prisma:tooltip_retained")})`;
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
          <h2>{t("prisma:charts_articles_per_engine_title")}</h2>
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
          <h2>{t("prisma:charts_raw_vs_final_title")}</h2>
          <ReactECharts
            className="echarts-container"
            style={{ height: 320 }}
            option={{
              tooltip: { trigger: "axis" },
              legend: {
                data: [t("prisma:series_raw"), t("prisma:series_final")]
              },
              xAxis: { type: "category", data: engines },
              yAxis: { type: "value", minInterval: 1, axisLabel: { formatter: (v: number) => Math.floor(v) } },
              series: [
                { name: t("prisma:series_raw"), type: "bar", data: rawCounts, itemStyle: { color: "#777" } },
                { name: t("prisma:series_final"), type: "bar", data: finalCounts, itemStyle: { color: "#333" } }
              ]
            }}
          />
        </div>
      </div>

      <div className="chart-section">
        <h2>{t("prisma:charts_property_distribution_title")}</h2>

        <div className="property-selector" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 12 }}>{t("prisma:label_property")}</label>
          <select value={property} onChange={e => setProperty(e.target.value)} style={{ padding: "4px 6px" }}>
            {selectableProperties.map(p => (
              <option key={p} value={p}>
                {p === "publicationYear"
                  ? t("prisma:property_publicationYear")
                  : p === "venueType"
                    ? t("prisma:property_venueType")
                    : p === "authors"
                      ? t("prisma:property_authors")
                      : p
                }
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
        <h2>{t("prisma:charts_filter_impact_title")}</h2>

        <div className="filter-selector" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 12 }}>{t("prisma:label_filter")}</label>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            style={{ padding: "4px 6px" }}
          >
            {availableFilters.map(filter => (
              <option key={filter} value={filter}>
                {resolveFilterName(filter, t) || filter}
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
