<script>
	import maplibre from "maplibre-gl";
	import bbox from "@turf/bbox";
	import { onMount } from "svelte";
	import { feature } from "topojson";
	import topo from "./data/geog.json";
	import { csv } from "d3-fetch";
	import { autoType } from "d3-dsv";
	import { max, ascending } from "d3-array";
	import { timeParse } from "d3-time-format";
	import { scaleThreshold } from "d3-scale";
	import { equalIntervalBreaks } from "simple-statistics";

	const style = "https://bothness.github.io/ons-basemaps/data/style-omt.json";

	export let choices = {mortgageTerm:25,deposit:30000,propertyType:'Detached'};
	let colour;
	let geojson;
	let map;
	let container;
	let boe;
	let hpi;
	let prices = {};

	let boeLookup = {
		IUMZICQ: "2 year, 60% LTV",
		IUMBV34: "2 year, 75% LTV",
		IUMZICR: "2 year, 85% LTV",
		IUMB482: "2 year, 90% LTV",
		IUM2WTL: "2 year, 95% LTV",
	};

	let propertyLookup = {
		Detached: "averagePriceDetached.value",
		"Semi-detached": "averagePriceSemiDetached.value",
		Terraced: "averagePriceTerraced.value",
		Flat: "averagePriceFlatMaisonette.value",
	};

	let latestHpi;
	let rate;

	onMount(async () => {
		(boe = await csv(
			"https://corsproxy.io/?https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Sep/2022&Dateto=now&SeriesCodes=IUMZICQ,IUMBV34,IUMZICR,IUMB482,IUM2WTL&CSVF=CN&UsingCodes=Y&VPD=N&VFD=N",
			autoType
		)),
		(hpi = await csv(
			"https://raw.githubusercontent.com/ONSvisual/land-registry-flat-data/main/landreg.csv",
			autoType
		));

		// find the latest date for HPI data
		let maxHpiDate = max(hpi, (d) => d["date.value"]).getTime();

		//read in bank of england data
		boe = boe.map(function (d) {
			return {
				date: timeParse("%d %b %Y")(d.DATE).getTime(),
				series: boeLookup[d.SERIES],
				value: +d.VALUE,
			};
		});

		let boeBefore = boe.filter((d) => d.date < maxHpiDate);
		let latestBoeBeforeHpi = max(boeBefore, (d) => d.date);

		// find relevant data to latest HPI data
		let latestBoe = boe
			.filter((d) => d.date == latestBoeBeforeHpi)
			.map(function (d) {
				return {
					date: new Date(d.date),
					series: d.series,
					value: d.value,
				};
			});

		const rates = latestBoe.flatMap((d) => d.value);

		rate = scaleThreshold()
			.domain([0.6, 0.75, 0.85, 0.9, 0.95])
			.range(rates.concat(null));

		latestHpi = hpi.filter((d) => d["date.value"].getTime() == maxHpiDate);
	});

	onMount(() => {
		for (let key in topo.objects) {
			geojson = feature(topo, topo.objects[key]);
		}

		geojson.features.map(function (d, i) {
			if (!isNaN(prices[d.properties.AREACD])) {
				d.properties.fill = colour(prices[d.properties.AREACD]);
			} else {
				d.properties.fill = "#ccc";
			}
		});

		map = new maplibre.Map({
			container,
			style,
			bounds,
			interactive: true,
		});

		map.addControl(new maplibre.NavigationControl({ showCompass: false }));

		map.on("load", () => {
			map.addSource("boundary", { type: "geojson", data: geojson });
			map.addLayer(
				{
					id: "boundary-fill",
					type: "fill",
					source: "boundary",
					layout: {},
					paint: {
						"fill-color": {
							type: "identity",
							property: "fill",
						},
						"fill-opacity": 1,
						"fill-outline-color": "#707071",
					},
				},
				"place_other"
			);
			// map.addLayer({
			// 	id: "boundary-line",
			// 	type: "line",
			// 	source: "boundary",
			// 	layout: {},
			// 	paint: {
			// 		"line-color": "#206095",
			// 		"line-width": 1,
			// 	},
			// });
			setData(choices)
		});
	});

	function fitBounds(bounds) {
		if (map) map.fitBounds(bounds, { padding: 20 });
	}

	function setData(choices) {
		if (latestHpi) //populate prices object
			latestHpi.forEach((d) => {
				prices[d.code] = monthlyrepayments(
					d[propertyLookup[choices.propertyType]]
				);
			});

		let pricevalues = Object.values(prices)
			.filter((d) => !isNaN(d))
			.sort(ascending);
		let breaks = equalIntervalBreaks(pricevalues, 5);

		//set up colour scales for map
		colour = scaleThreshold()
			.domain(breaks.slice(1))
			.range(["#BCD6E9", "#A4C3DC", "#8DB3D3", "#77A2C5", "#6390B5"]);

		if(geojson) geojson.features.map(function (d, i) {
			if (!isNaN(prices[d.properties.AREACD])) {
				d.properties.fill = colour(prices[d.properties.AREACD]);
			} else {
				d.properties.fill = "#ccc";
			}
		});
		geojson = geojson
		
		map && map.getSource('boundary') && map.getSource("boundary").setData(geojson);
		
	}

	function monthlyrepayments(price) {
		if (price == "") {
			return "Unavailable";
		}
		let loan = price - choices.deposit;
		let ltv = loan / price;

		let ourRate = rate(ltv);
		let monthlyrate = ourRate / 1200;
		let term = choices.mortgageTerm * 12;

		let payment =
			(loan * (monthlyrate * (1 + monthlyrate) ** term)) /
			((1 + monthlyrate) ** term - 1);

		return Math.round(payment * 100) / 100;
	}

	$: bounds = geojson
		? bbox(geojson)
		: [
				[-9, 49],
				[2, 61],
		  ];

	$: container && boe && hpi && setData(choices);
	$: fitBounds(bounds);
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css"
	/>
</svelte:head>

<div id="map" bind:this={container} />

<style>
	#map {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
	}
</style>
