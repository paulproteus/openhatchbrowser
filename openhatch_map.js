function handleResults(data) {
    var features = [];
    for (var key in data) {
        var person = data[key];
        var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(
            person['lat_long_data']['longitude'],
            person['lat_long_data']['latitude']),
            {'name':person['name'], 'location': person['location'], 'all_data': person});
        feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        features.push(feature);
    }
    layer.destroyFeatures();
    layer.addFeatures(features);
    drawResults();
}
function drawResults() {
    $("#results").html("");
    var extent = map.getExtent();
    for (var i = 0; i < layer.features.length; i++) {
        var feat = layer.features[i];
        if (extent.intersectsBounds(feat.geometry.getBounds()))  {
            for (var j = 0 ; j < feat.cluster.length; j++) {
                var f = feat.cluster[j];
                var div = $("<div />");
                var a = $("<a href='http://openhatch.org/people/"+f.attributes.all_data.extra_person_info.username+"/'>" + f.attributes.name + "</a>");
                div.append(a);
                var span = $("<span>, " + f.attributes.location + "</span>");
                div.append(span);
                $("#results").append(div);
            }
        }
    }
}
function init() {
    map = new OpenLayers.Map("map");
    var l = new OpenLayers.Layer.OSM();
    l.transitionEffect = "resize";
    map.addLayer(l);
    var styleMap =new OpenLayers.StyleMap({'default': new OpenLayers.Style(
        { fillColor: 'red','pointRadius':'${radius}', 'label': "${label}" },
                {
                    context: {
                        label: function(feature) {
                            return feature.cluster.length;
                        },
                        radius: function(feature) {
                            return feature.cluster ?
                                Math.min((Math.max(feature.cluster.length, 7) + 8)/2, 16) :
                                15;
                        }
                    }
                })});

    var s = new OpenLayers.Strategy.Cluster();
    layer = new OpenLayers.Layer.Vector("", {strategies: [ s ], styleMap: styleMap});
    map.addLayer(layer);
    s.activate();
    map.zoomToMaxExtent();
    jQuery.getJSON("location_data", handleResults);
    map.events.register("moveend", null, drawResults);
}
