<script>
	import maplibre from "maplibre-gl";
	import bbox from "@turf/bbox";
	import { onMount } from "svelte";
	import { feature } from "topojson";
	import topo from "./data/geog.json";

	
	const style = "https://bothness.github.io/ons-basemaps/data/style-omt.json";

	export let colour;
	export let prices;
	let map;
	let container;
	let geojson;

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
			setData(prices)
		});
	});

	function fitBounds(bounds) {
		if (map) map.fitBounds(bounds, { padding: 20 });
	}

	function setData(prices){
		geojson.features.map(function (d, i) {
			if (!isNaN(prices[d.properties.AREACD])) {
				d.properties.fill = colour(prices[d.properties.AREACD]);
			} else {
				d.properties.fill = "#EC9AA4";
			}
		});

		if(map && map.getSource("boundary")) map.getSource("boundary").setData(geojson);

	}
	

	$: bounds = geojson
		? bbox(geojson)
		: [
				[-9, 49],
				[2, 61],
		  ];
	$: container && setData(prices);
	$: fitBounds(bounds);
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css"
	/>
</svelte:head>

<div id="map" bind:this={container}/>

	
<style>
	#map {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
	}
</style>
