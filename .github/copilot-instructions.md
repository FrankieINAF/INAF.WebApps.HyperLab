# Copilot Instructions

## Project Guidelines
- The INAF.WebApps.HyperLab project is migrating chart code from DevExpress (dxChart) to Apache ECharts. New/converted chart code should follow the pattern in wwwroot/js/src/chart/charts.js: use echarts.init(container[0], null, { renderer: 'canvas' }), createEchartSeries() to build series data as [X, Y] arrays, chart.setOption()/chart.dispose(), and getTooltip() for tooltip formatting.