var graphic = d3.select('#graphic');
var pymChild = null;

function drawGraphic() {

  deposit = 40000 // an assumption for now 
  mortgageTerm = 25 //assume 25 years
  monthlySpend = 1500 // starting value

  colour = d3.scaleOrdinal()
    .domain([true, false])
    .range(['#206095', '#F66068'])

  boe = boe.map(function (d) {
    return {
      date: d3.timeParse("%d %b %Y")(d.DATE).getTime(),
      series: config.boeLookup[d.SERIES],
      "value": +d.VALUE
    }
  })
  maxDate = d3.max(boe, d => d.date)

  latestBoe = boe.filter(d => d.date == maxDate).map(function (d) {
    return {
      date: new Date(d.date),
      series: d.series,
      value: d.value
    }
  })

  rates = latestBoe.flatMap(d => d.value)

  rate = d3.scaleThreshold()
    .domain([0.60, 0.75, 0.85, 0.9, 0.95])
    .range(rates.concat(null))

  detached = {}
  semi = {}
  flat = {}
  terrace = {}
  areaname = {}

  graphic_data.forEach(d => {
    detached[d.Area_Code] = canIaffordit(+d.Detached_Average_Price);
    semi[d.Area_Code] = canIaffordit(+d.Semi_Detached_Average_Price);
    flat[d.Area_Code] = canIaffordit(+d.Flat_Average_Price)
    terrace[d.Area_Code] = canIaffordit(+d.Terraced_Average_Price)
    areaname[d.Area_Code] = d.Region_Name
  })

  // data = graphic_data.map(function (area) {
  //   return {
  //     ...area,
  //     detached: canIaffordit(+area.Detached_Average_Price),
  //     semi: canIaffordit(+area.Semi_Detached_Average_Price),
  //     flat: canIaffordit(+area.Flat_Average_Price),
  //     terrace: canIaffordit(+area.Terraced_Average_Price)
  //   }
  // })

  // console.log(data)

  map = new maplibregl.Map({
    container: 'map', // container id
    style: '../lib/style.json', //stylesheet location //includes key for API
    center: [-2.5, 54], // starting position
    minZoom: 3.5,//
    zoom: 4.5, // starting zoom
    maxZoom: 13, //
    attributionControl: false // needed for compact attribution
  })

  // Add zoom and rotation controls to the map.
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

  // Disable map rotation using right click + drag
  map.dragRotate.disable();

  // Disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation();

  // Add geolocation controls to the map.
  // map.addControl(new maplibregl.GeolocateControl({
  //   positionOptions: {
  //     enableHighAccuracy: true
  //   }
  // }));

  //add compact attribution
  map.addControl(new maplibregl.AttributionControl({
    compact: true
  }));

  // if touch screen, disable stuff
  if (isTouchDevice()) {
    map.scrollZoom.disable();
    map.dragPan.disable();
  };

  //convert topojson to geojson
  for (key in geog.objects) {
    areas = topojson.feature(geog, geog.objects[key])
  }



  areas.features.map(function (d, i) {
    if (!isNaN(terrace[d.properties.AREACD])) { d.properties.fill = colour(terrace[d.properties.AREACD]) }
    else { d.properties.fill = '#ccc' };
  });

  map.on('load', loadmap);

  function loadmap() {
    map.addSource('area', { 'type': 'geojson', 'data': areas });

    map.addLayer({
      'id': 'area',
      'type': 'fill',
      'source': 'area',
      'touchAction': 'none',
      'layout': {},
      'paint': {
        'fill-color': {
          type: 'identity',
          property: 'fill'
        },
        'fill-opacity': 0.9,
        'fill-outline-color': '#fff'
      }
    }, 'place_city');

    //Get current year for copyright
    today = new Date();
    copyYear = today.getFullYear();
    map.style.sourceCaches['area']._source.attribution = "Contains OS data &copy; Crown copyright and database right " + copyYear;

    map.addLayer({
      "id": "state-fills-hover",
      "type": "line",
      "source": "area",
      "layout": {},
      "paint": {
        "line-color": "#000",
        "line-width": 2
      },
      "filter": ["==", "AREACD", ""]
    }, 'place_city');

    map.addLayer({
      'id': 'area_labels',
      'type': 'symbol',
      'source': 'area',
      'minzoom': 10,
      'layout': {
        "text-field": '{AREANM}',
        "text-font": ["Open Sans", "Arial Unicode MS Regular"],
        "text-size": 14
      },
      'paint': {
        "text-color": "#666",
        "text-halo-color": "#fff",
        "text-halo-width": 1,
        "text-halo-blur": 1
      }
    });

    // //Highlight stroke on mouseover (and show area information)
    // map.on("mousemove", "area", onMove);

    // // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
    // map.on("mouseleave", "area", onLeave);

    // //Add click event
    // map.on("click", "area", onClick);
  }


  function canIaffordit(price) {
    loan = price - deposit;
    ltv = loan / price

    ourRate = rate(ltv)
    monthlyrate = ourRate / 1200
    term = mortgageTerm * 12
    maxprice = monthlySpend * ((1 + monthlyrate) ** term - 1) / (monthlyrate * (1 + monthlyrate) ** term)

    if (maxprice > loan) {
      result = true
    } else {
      result = false
    }
    return result
  }




  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

// https://stackoverflow.com/a/4819886/4442503
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}


Promise.all([
  d3.csv(config.graphic_data_url),
  d3.json('geog.json'),
  d3.csv("https://corsproxy.io/?https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Sep/2022&Dateto=now&SeriesCodes=IUMZICQ,IUMBV34,IUMZICR,IUMB482,IUM2WTL&CSVF=CN&UsingCodes=Y&VPD=N&VFD=N")
]).then(([data, geogdata, boedata]) => {
  graphic_data = data
  boe = boedata;
  geog = geogdata

  pymChild = new pym.Child({
    renderCallback: drawGraphic
  });
})
