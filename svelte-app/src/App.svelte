<script>
	import { onMount } from "svelte";
	import Map from "./Map.svelte";
	import Legend from "./Legend.svelte";
	import Areainfo from "./Areainfo.svelte";
	import { csv } from "d3-fetch";
	import { autoType } from "d3-dsv";
	import { max, ascending } from "d3-array";
	import { timeParse } from "d3-time-format";
	import { scaleThreshold } from "d3-scale";
	import { equalIntervalBreaks } from "simple-statistics";
	import { areacd } from "./stores.js";

	let mortgageTerm = 25;
	let deposit = 30000;
	let propertyType;

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
	let prices = {};
	let boe;
	let hpi;
	let breaks;
	let colour;
	let areaovertime;
	let customised = false;
	let minimum;
	let maximum;

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

	$: {
		if (hpi) {
			areaovertime = hpi
				.filter((d) => d.code == $areacd)
				.sort((a, b) => a["date.value"] - b["date.value"]);
		}

		function monthlyrepayments(price) {
			if (price == "") {
				return "Unavailable";
			}
			let loan = price - deposit;
			let ltv = loan / price;

			let ourRate = rate(ltv);
			let monthlyrate = ourRate / 1200;
			let term = mortgageTerm * 12;

			let payment =
				(loan * (monthlyrate * (1 + monthlyrate) ** term)) /
				((1 + monthlyrate) ** term - 1);

			return Math.round(payment * 100) / 100;
		}
		if (latestHpi)
			latestHpi.forEach((d) => {
				prices[d.code] = monthlyrepayments(
					d[propertyLookup[propertyType]]
				);
			});

		let pricevalues = Object.values(prices)
			.filter((d) => !isNaN(d))
			.sort(ascending);
		breaks = equalIntervalBreaks(pricevalues, 4);

		//set up colour scales for map
		colour = scaleThreshold()
			.domain(breaks.slice(1))
			.range(["#E9EFF4", "#BCD6E9", "#8DB3D3", "#6390B5"]);
	}

	if (pricevalues) {
		minimum = pricevalues[0];
		maximum = pricevalues[pricevalues.length - 1];
	}
</script>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<!-- svelte-ignore non-top-level-reactive-declaration -->
<h1>Where in the UK can you afford to buy a property?</h1>
<h2>
	Fill in some details below to find out which areas are affordable depending
	on your budget. Click on each area to find out about house prices.
</h2>
<hr />
<fieldset>
	<div>
		<label for="mortgageTerm">Mortgage term in years</label>
		<input type="number" id="mortgageTerm" bind:value={mortgageTerm} />
	</div>

	<div>
		<label for="deposit">Deposit amount</label>
		<input type="number" id="deposit" bind:value={deposit} />
	</div>

	<div>
		<label for="propertyType">Select property type</label>
		<select bind:value={propertyType} id="propertyType">
			<option>Detached</option>
			<option>Semi-detached</option>
			<option>Terraced</option>
			<option>Flat</option>
		</select>
	</div>
</fieldset>

<hr />
<details>
	<summary>Adjust monthly repayment price range</summary>
	<p>
		Enter the minimum and maximum monthly mortgage payments that suits your
		budget.
	</p>
	<fieldset>
		<div>
			<label for="minimum">Minimum</label>
			<input bind:value={minimum} type="number" id="minimum" />
		</div>

		<div>
			<label for="maximum">Maximum</label>
			<input bind:value={maximum} type="number" id="maximum" />
		</div>
	</fieldset>
</details>

<div id="results">
	<h2>Map of average monthly mortgage</h2>
	<div id="map-container" style="height:300px;">
		<Map {prices} {colour} />
	</div>
	<div>
		<Areainfo {latestHpi} {propertyType} {areaovertime} />
		<Legend {breaks} {colour} />
	</div>
</div>
<hr />
<h3>Use and share</h3>
<div>Get data</div>
<div>Embed</div>
<div>Share</div>
