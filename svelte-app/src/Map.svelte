<script>
	import maplibre from "maplibre-gl";
	import bbox from "@turf/bbox";
	import { onMount } from "svelte";
	import { feature } from "topojson";
	import topo from "./data/geog.json";
	import { areacd } from "./stores.js";
	import { format } from "d3-format";

	const style = "https://bothness.github.io/ons-basemaps/data/style-omt.json";

	export let colour;
	export let prices;
	let map;
	let container;
	let geojson;
	let selected;
	let newAREACD;
	let oldAREACD;

	const tooltip = new maplibre.Popup({
		closeButton: false,
		closeOnClick: false,
	});

	onMount(() => {
		for (let key in topo.objects) {
			geojson = feature(topo, topo.objects[key]);
		}

		map = new maplibre.Map({
			container,
			style,
			bounds: bbox(geojson),
			zoom: 5,
			interactive: true,
			maxBounds: [
				[-15, 37],
				[14, 65],
			],
			attributionControl: false,
		});

		map.addControl(new maplibre.NavigationControl({ showCompass: false }));
		map.addControl(
			new maplibre.AttributionControl({ compact: true }),
			"bottom-right"
		);

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
						"fill-outline-color": "#BCBCBD",
					},
				},
				"place_other"
			);
			map.addLayer(
				{
					id: "boundary-line",
					type: "line",
					source: "boundary",
					layout: {},
					paint: {
						"line-color": "#FBC900",
						"line-width": 3,
					},
					filter: ["==", "AREACD", ""],
				},
				"place_other"
			);

			setData(prices);
		});

		//Highlight stroke on mouseover (and show area information)
		map.on("mousemove", "boundary-fill", onMove);

		// Reset the state-fills-hover layer's filter when the mouse leaves the layer.
		map.on("mouseleave", "boundary-fill", onLeave);

		//Add click event
		map.on("click", "boundary-fill", onClick);

		map.on("mousemove", "boundary-fill", function (e) {
			map.getCanvas().style.cursor = "pointer";

			tooltip
				.setLngLat(e.lngLat)
				.setHTML(
					"<p>Average mortgage payments in <span>" +
						e.features[0].properties.AREANM +
						":</span></p><p>" +
						e.features[0].properties.payment +
						"</p>"
				)
				.addTo(map);
		});
	});

	function onMove(e) {
		if (map) {
			map.getCanvasContainer().style.cursor = "pointer";

			newAREACD = e.features[0].properties.AREACD;

			if (newAREACD != oldAREACD) {
				oldAREACD = e.features[0].properties.AREACD;
				map.setFilter("boundary-line", [
					"==",
					"AREACD",
					e.features[0].properties.AREACD,
				]);
			}
		}
	}

	function onLeave() {
		if (map) {
			map.getCanvasContainer().style.cursor = null;
			map.setFilter("boundary-line", ["==", "AREACD", ""]);
			oldAREACD = "";
		}
		tooltip.remove();
		map.getCanvas().style.cursor = '';
	}

	function onClick(e) {
		if (map) {
			disableMouseEvents();
			areacd.set(e.features[0].properties.AREACD);

			zoomtoarea(e.features[0].properties.AREACD);

			newAREACD = e.features[0].properties.AREACD;
			if (newAREACD != oldAREACD) {
				oldAREACD = e.features[0].properties.AREACD;
				map.setFilter("boundary-line", [
					"==",
					"AREACD",
					e.features[0].properties.AREACD,
				]);
			}
			tooltip.remove();
			map.getCanvas().style.cursor = '';	
		}
	}

	function zoomtoarea(code) {
		if (map && geojson) {
			let specificpolygon = geojson.features.filter(function (d) {
				return d.properties.AREACD == code;
			});

			let specific = bbox(specificpolygon[0].geometry);

			map.fitBounds(
				[
					[specific[0], specific[1]],
					[specific[2], specific[3]],
				],
				{
					padding: { top: 50, bottom: 600, left: 0, right: 0 },
				}
			);
		}
		setTimeout(function () {
			if (map.getLayer("boundary-line")) {
				map.setFilter("boundary-line", ["==", "AREACD", code]);
				disableMouseEvents();
			}
		}, 1000);
	}

	function disableMouseEvents() {
		if (map) {
			map.off("mousemove", "boundary-fill", onMove);
			map.off("mouseleave", "boundary-fill", onLeave);

			selected = true;
		}
	}

	function enableMouseEvents() {
		if (map) {
			map.on("mousemove", "boundary-fill", onMove);
			map.on("click", "boundary-fill", onClick);
			map.on("mouseleave", "boundary-fill", onLeave);

			selected = false;
		}
	}

	function fitBounds(bounds) {
		if (map) map.fitBounds(bounds, { padding: { bottom: 290 } });
	}

	function setData(prices) {
		geojson.features.map(function (d) {
			if (isNaN(prices[d.properties.AREACD])) {
				d.properties.payment = prices[d.properties.AREACD];
			} else {
				d.properties.payment =
					"£" + format(",.0f")(prices[d.properties.AREACD]);
			}

			if (prices[d.properties.AREACD] == "No data") {
				d.properties.fill = "#C6C6C6";
			} else if (!isNaN(prices[d.properties.AREACD])) {
				d.properties.fill = colour(prices[d.properties.AREACD]);
			} else if (prices[d.properties.AREACD] == "Mortgage unavailable") {
				d.properties.fill = "#902092";
			} else {
				d.properties.fill = "#C6C6C6";
			}
		});

		if (map && map.getSource("boundary"))
			map.getSource("boundary").setData(geojson);
	}

	function resetmap() {
		if (map && map.getSource("boundary")) {
			enableMouseEvents();
			map.setFilter("boundary-line", ["==", "AREACD", ""]);
			oldAREACD = "";
			fitBounds(bounds);
		}
	}

	$: if ($areacd == undefined) resetmap();
	$: if ($areacd) zoomtoarea($areacd);

	$: bounds = geojson
		? bbox(geojson)
		: [
				[-9, 49],
				[2, 61],
		  ];
	$: container && colour && setData(prices);
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

	:global(div.maplibregl-popup-content) {
		background: #222222;
		opacity: 0.9;
		padding: 5px 10px;
	}
	:global(.maplibregl-popup-content p) {
		color: white;
		font-size: 14px;
		margin: 0;
	}

	:global(.maplibregl-popup-content p span) {
		font-weight: 700;
	}

	:global(.maplibregl-popup-content p:last-child) {
		font-size: 18px;
		font-weight: 700;
		margin:3px 0;
	}

	:global(div.maplibregl-popup-tip){
		opacity: 0.9;
	}

	:global(div.maplibregl-popup-anchor-right .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-left-color: #222222;
	}

	:global(div.maplibregl-popup-anchor-left .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-right-color: #222222;
	}

	:global(div.maplibregl-popup-anchor-top .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-bottom-color: #222222;
	}

	:global(div.maplibregl-popup-anchor-bottom .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-top-color: #222222;
	}

	:global(div.maplibregl-popup-anchor-top-right .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-bottom-color: #222222;
	}
	
	:global(div.maplibregl-popup-anchor-top-left .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-bottom-color: #222222;
	}

	:global(div.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-top-color: #222222;
	}
	
	:global(div.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip.mapboxgl-popup-tip){
		border-top-color: #222222;
	}
	
</style>
