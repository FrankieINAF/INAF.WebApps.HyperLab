var targets = [];

const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "width": 600,
    "height": 600,
    "data": { "name": "rectangles" },
    "projection": {
        "type": "orthographic",
        "rotate": { "expr": "[0, 0, 0]" }
    },
    "layer": [
        {
            "data": { "sphere": true },
            "mark": { "type": "geoshape", "fill": "darkblue" }
        },
        {
            "data": {
                "name": "world",
                "url": "https://vega.github.io/editor/data/world-110m.json",
                "format": { "type": "topojson", "feature": "countries" }
            },
            "mark": { "type": "geoshape", "fill": "mintcream", "stroke": "black" }
        },
        {
            "encoding": {
                "longitude": { "field": "centerLon", "type": "quantitative" },
                //"longitude2": { "field": "maxLon", "type": "quantitative" },
                "latitude": { "field": "centerLat", "type": "quantitative" },
                //"latitude2": { "field": "maxLat", "type": "quantitative" },
            },
            "mark": { "type": "circle", "color": "red", "opacity": 0.25 },
        }
    ]
};

function formatRectangles(obj) {
    if (obj != null && obj.length > 0) {
        console.log("Targets with observation coordinates retrieved: " + obj.length);
        const rectangles = obj.map(item => {
            //console.log(item);
            return {
                centerLon: item.CenterLon,
                centerLat: item.CenterLat,
                minLon: item.MinLon,
                maxLon: item.maxLon,
                minLat: item.MinLat,
                maxLat: item.MaxLat,
            };
        });
        return rectangles;
    }
}

function retrieveAndshowTargets() {
    vegaEmbed('#map', spec).then(result => {
        // Qui result è definito e puoi usarlo
        fetch(UrlGetTargetsWithObsCoords)
            .then(res => res.json())
            .then(rawData => {
                const formatted = formatRectangles(rawData); // tua funzione di trasformazione
                result.view.change(
                    'rectangles',
                    vega.changeset().remove(() => true).insert(formatted)
                ).run();
            });
    });
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    showPageItems(true);

    retrieveAndshowTargets();
});