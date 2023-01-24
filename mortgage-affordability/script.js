var graphic = d3.select('#graphic');
var pymChild = null;

function drawGraphic() {

  //read in bank of england data 
  boe = boe.map(function (d) {
    return {
      date: d3.timeParse("%d %b %Y")(d.DATE).getTime(),
      series: config.boeLookup[d.SERIES],
      "value": +d.VALUE
    }
  })
  maxDate = d3.max(boe, d => d.date)

  // find latest data
  latestBoe = boe.filter(d => d.date == maxDate).map(function (d) {
    return {
      date: new Date(d.date),
      series: d.series,
      value: d.value
    }
  })

  rates = latestBoe.flatMap(d => d.value)

  // use the rates to set up a threshold scale
  rate = d3.scaleThreshold()
    .domain([0.60, 0.75, 0.85, 0.9, 0.95])
    .range(rates.concat(null))


    // get deposit, mortgage term
    deposit = document.getElementById('deposit').value
    mortgageTerm = document.getElementById('mortgageTerm').value

    detached = {}
    semi = {}
    flat = {}
    terrace = {}
    areaname = {}

    graphic_data.forEach(d => {
      detached[d.Area_Code] = monthlyrepayments(+d.Detached_Average_Price);
      semi[d.Area_Code] = monthlyrepayments(+d.Semi_Detached_Average_Price);
      flat[d.Area_Code] = monthlyrepayments(+d.Flat_Average_Price)
      terrace[d.Area_Code] = monthlyrepayments(+d.Terraced_Average_Price)
      areaname[d.Area_Code] = d.Region_Name
    })

    detached_prices=Object.values(detached).filter(d=>!isNaN(d)).sort(d3.ascending)
    detachedBreaks=ss.equalIntervalBreaks(detached_prices,5)

    //set up colour scales for map 
    colour = d3.scaleThreshold()
      .domain(detachedBreaks.slice(1))
      .range(['#BCD6E9', '#A4C3DC','#8DB3D3','#77A2C5','#6390B5'])


    map = new maplibregl.Map({
      container: 'map', // container id
      style: '../lib/style.json', //stylesheet location //includes key for API
      center: [-2.5, 54], // starting position
      minZoom: 3.5,//
      zoom: 4, // starting zoom
      maxZoom: 13, //
      attributionControl: false // needed for compact attribution
    })

    // Add zoom and rotation controls to the map.
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    // Disable map rotation using right click + drag
    // map.dragRotate.disable();

    // Disable map rotation using touch rotation gesture
    // map.touchZoomRotate.disableRotation();

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

    map.fitBounds([
      [-18.94,49.91],
      [12.09,60.84]
    ])

    // if touch screen, disable stuff
    if (isTouchDevice()) {
      // map.scrollZoom.disable();
      // map.dragPan.disable();
    };

    //convert topojson to geojson
    for (key in geog.objects) {
      areas = topojson.feature(geog, geog.objects[key])
    }


    areas.features.map(function (d, i) {
      if (!isNaN(detached[d.properties.AREACD])) { d.properties.fill = colour(detached[d.properties.AREACD]) }
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
          'fill-opacity': 1,
          'fill-outline-color': '#707071'
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

    // d3.select('#type').on('change',function(){
    //   type=eval(d3.select(this).property('value'))

    //   //update properties to the geojson based on the property type selected
		// 	areas.features.map(function(d,i) {
    //     if(!isNaN(type[d.properties.AREACD]))
    //      {d.properties.fill = colour(type[d.properties.AREACD])}
    //     else {d.properties.fill = '#ccc'};
    //  });

    //  //Reattach geojson data to area layer
    //  map.getSource('area').setData(areas);

    //  //set up style object
    //  styleObject = {
    //              type: 'identity',
    //              property: 'fill'
    //        }
    //  //repaint area layer map usign the styles above
    //  map.setPaintProperty('area', 'fill-color', styleObject);

    // })


  function monthlyrepayments(price){
    if(price==""){return NaN}
    loan = price - deposit;
    ltv = loan / price

    ourRate = rate(ltv)
    monthlyrate = ourRate / 1200
    term = mortgageTerm * 12

    payment = loan * (monthlyrate * (1 + monthlyrate) ** term) / ((1 + monthlyrate) ** term - 1) 

    return Math.round(payment * 100) / 100
    
  }  

  // function canIaffordit(price) {
  //   loan = price - deposit;
  //   ltv = loan / price

  //   ourRate = rate(ltv)
  //   monthlyrate = ourRate / 1200
  //   term = mortgageTerm * 12
  //   maxprice = monthlySpend * ((1 + monthlyrate) ** term - 1) / (monthlyrate * (1 + monthlyrate) ** term)

  //   if (maxprice > loan) {
  //     result = true
  //   } else {
  //     result = false
  //   }
  //   return +result
  // }




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
