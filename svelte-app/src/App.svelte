<script>
	import { onMount } from "svelte";
	import Map from "./Map.svelte";
	import Legend from "./Legend.svelte";
	import Areainfo from "./Areainfo.svelte";
	import { csv } from "d3-fetch";
	import { autoType } from "d3-dsv";
	import { min, max, ascending } from "d3-array";
	import { timeParse } from "d3-time-format";
	import { scaleThreshold } from "d3-scale";
	import { format } from "d3-format";
	import Input from './Input.svelte';
	import MoneyInput from './MoneyInput.svelte'
	import Select from './Select.svelte'

	import { equalIntervalBreaks } from "simple-statistics";
	import { areacd } from "./stores.js";
	import RangeSlider from "svelte-range-slider-pips";
    import ButtonGroup from "./ButtonGroup.svelte";
	import MediaQuery from "svelte-media-query"; 


	let mortgageTerm = 25;
	let deposit = 30000;
	let propertyType;
	let fixedLength=5;

	let boeLookup = {
		IUMZICQ: {length:2, ltv:0.6},
		IUMBV34: {length:2, ltv:0.75},
		IUMZICR: {length:2, ltv:0.85},
		IUMB482: {length:2, ltv:0.90},
		IUM2WTL: {length:2, ltv:0.95},
		IUM5WTL: {length:5, ltv:0.95},
		IUMZO28: {length:5, ltv:0.90},
		IUMBV42: {length:5, ltv:0.75},
		IUMZO27: {length:5, ltv:0.60}
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
	let pricevalues;
	let payment;
	let minimum;
	let maximum;
	let slidermin;
	let slidermax;
	let customise = false;


	onMount(async () => {
		(boe = await csv(
			"https://raw.githubusercontent.com/ONSvisual/bank-of-england-flat-data/main/boe.csv",
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
				fixedTerm: boeLookup[d.SERIES].length,
				ltv:boeLookup[d.SERIES].ltv,
				value: +d.VALUE,
			};
		});

		let boeBefore = boe.filter((d) => d.date < maxHpiDate);
		let latestBoeBeforeHpi = max(boeBefore, (d) => d.date);

		// find relevant data to latest HPI data
		let latestBoe = boe
			.filter((d) => d.fixedTerm == fixedLength)
			.filter((d) => d.date == latestBoeBeforeHpi)
			.sort((a,b)=>a.ltv-b.ltv)

		const rates = latestBoe.flatMap((d) => d.value);

		rate = scaleThreshold()
			.domain(latestBoe.flatMap(d=>d.ltv))
			.range(rates.concat(null));

		latestHpi = hpi.filter((d) => d["date.value"].getTime() == maxHpiDate);

		const details = document.querySelector("details")

		details.addEventListener("toggle", function() {
			updateHeight()
		})
	});

	$: {
		if (hpi) {
			areaovertime = hpi
				.filter((d) => d.code == $areacd)
				.sort((a, b) => a["date.value"] - b["date.value"]);
		}

		function monthlyrepayments(price,areacd) {
			if(price===null)return "No data"
			let loan = price - deposit;
			let ltv = loan / price;

			let ourRate = rate(ltv);
			let monthlyrate = ourRate / 1200;
			let term = mortgageTerm * 12;

			let payment =
				(loan * (monthlyrate * (1 + monthlyrate) ** term)) /
				((1 + monthlyrate) ** term - 1);

			// if(areacd=='E08000003')console.log('area',areacd,price,deposit,loan,ourRate,monthlyrate,term,payment)

			if (payment) {
				return payment;
			} else {
				return "out of budget";
			}
			
		}

		if (latestHpi)
			latestHpi.forEach((d) => {
				prices[d.code] = monthlyrepayments(
					d[propertyLookup[propertyType]],d.code
				);
			});

		pricevalues = Object.values(prices)
			.filter((d) => !isNaN(d))
			.sort(ascending);
		breaks = equalIntervalBreaks(pricevalues, 4);
		breaks[breaks.length-1]=breaks[breaks.length-1] + 0.01

		if (breaks.some((v) => v < 0)) {

			let negindex = findneg(breaks)
			breaks.splice(negindex+1, 0, 0);
			breaks=breaks.filter(d=>d>=0);

			let colourrange = [
					"#E9EFF4",
					"#BCD6E9",
					"#8DB3D3",
					"#6390B5",
					"#902092",
				]

			colourrange=['#22D0B6'].concat(colourrange.slice(negindex))	


			colour = scaleThreshold()
				.domain(breaks)
				.range(colourrange);
		} else {
			//set up colour scales for map
			colour = scaleThreshold()
				.domain(breaks.slice(1))
				.range(["#E9EFF4", "#BCD6E9", "#8DB3D3", "#6390B5", "#902092"]);
		}
	}

	$: if (prices) {
		payment = prices[$areacd];
	}

	$: if (pricevalues&&deposit) {
		minimum = max([1,Math.floor(pricevalues[0])]);
		maximum = Math.ceil(pricevalues[pricevalues.length - 1]);
	}

	$: if (!customise) {
		slidermin = Math.floor(minimum);
		slidermax = Math.ceil(maximum);
	}

	$: if (customise && colour) {

		if(pricevalues.some(v=>v<0)){
			let custompricevalues = pricevalues
			.filter((d) => d > slidermin)
			.filter((d) => d < slidermax);
			let custombreaks = equalIntervalBreaks(custompricevalues, 3);

			breaks = [0].concat(custombreaks)
			breaks[breaks.length-1]=breaks[breaks.length-1] + 0.01

			colour = scaleThreshold()
				.domain(breaks)
				.range(['#22d0b6',"#E9EFF4", "#BCD6E9", "#8DB3D3", "#6390B5", "#902092"])
		}else{
			let custompricevalues = pricevalues
			.filter((d) => d > slidermin)
			.filter((d) => d < slidermax);

			breaks = equalIntervalBreaks(custompricevalues, 3);

			if(breaks.length>1){
				breaks[breaks.length-1]=breaks[breaks.length-1] + 0.01

				colour = scaleThreshold()
				.domain(breaks)
				.range(["#E9EFF4", "#BCD6E9", "#8DB3D3", "#6390B5", "#902092"]);
			}else if (breaks.length==0){
				colour = scaleThreshold()
				.domain([slidermin])
				.range(["#E9EFF4","#902092"]);
			}else if (breaks.length==1){
				breaks = breaks.concat([slidermax])

				colour = scaleThreshold()
				.domain(breaks)
				.range(["#E9EFF4","#8DB3D3","#902092"])
			}
			

		}



	}

	$: if (customise && deposit){
		slidermax = min([maximum,slidermax])
	}




	// responsive pym embedding from https://github.com/ReallyGoodSmarts/datanews-rig-demo
    // stuff for Pym, which manages iframe resizing for use as an embed
	import pym from '../scripts/pym.v1.min.js';
    var pymChild = new pym.Child();
    let mainElementHeight
    let w = 400

	$: if(w) {updateHeight()}

	function updateHeight(event) {
        // note that i'm actually ignoring the event object itself
		// only process if the first main element exists    
        if (document.getElementsByTagName('main')[0]) {
            // sending height of the first <main> tag to the Pym parent
            // as a message instead of using pymChild.sendHeight, which sends the 
            // height of the <body> tag. 
            mainElementHeight = document.getElementsByTagName('main')[0].offsetHeight.toString()
            pymChild.sendMessage('height', mainElementHeight);
        }
    }

	function setSliderInputs(e) {
		slidermin = e.detail.values[0];
		slidermax = e.detail.values[1];
		customise = true;
	}

	function findneg(arr) {
		let indices = arr
			.map((a, i) => (a < 0 ? i : -1))
			.filter((a) => a !== -1);
		let maxindex = max(indices);
		return maxindex;
	}

	function getData(){
		let csvContent = "data:text/csv;charset=utf-8," 
    + Object.entries(prices).map(e => e.join(",")).join("\n");

		let encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	}

</script>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<!-- svelte-ignore non-top-level-reactive-declaration -->

<main>
<div class='flex-container'>


	<div id="inputs">
		<h1>What are average UK monthly mortgage payments?</h1>
		<h3>
			Fill in some details below to find out how average mortgage payments
			are changing near you. Click on each area to find out about house
			prices.
		</h3>
		<fieldset>
			<div class='flex-h'>
				<div class='equalspaced'>
					<Input min={1} max={40} label="Mortgage term in years" bind:number={mortgageTerm}/>
				</div>
	
				<div class='equalspaced'>
					<MoneyInput min=0 label="Deposit amount" bind:value={deposit}/>
				</div>
			</div>
			

			
			<MediaQuery query="(max-width: 550px)" let:matches>
				{#if matches}
					<div class='addtopspace'>
						<Select bind:selected={propertyType} label="Select property type" />
					</div>
				{:else}
					<div class='addtopspace'>
						<span class='bold'>Select property type</span>
						<ButtonGroup bind:selected={propertyType}/>
					</div>
				{/if}
			</MediaQuery>
			
			
		</fieldset>

		
		<details class='addtopspace'>
			<summary>Adjust monthly repayment price range</summary>
			<p>
				Enter the minimum and maximum monthly mortgage payments that
				suits your budget.
			</p>
			<fieldset>
				<div class='flex-h'>
					<div>
						<MoneyInput bind:value={slidermin} bind:customise={customise} label="Minimum"/>
					</div>
	
					<div>
						<MoneyInput bind:value={slidermax} bind:customise={customise} label="Maximum"/>
					</div>
				</div>
				
				{#if breaks.length > 0}
					<RangeSlider
						range
						values={[slidermin, slidermax]}
						min={Math.floor(minimum)}
						max={Math.ceil(maximum)}
						float="true"
						hoverable="true"
						pips
						pipstep={(maximum - minimum) / 4}
						all="label"
						prefix="£"
						on:change={(e) => {setSliderInputs(e);}}
						formatter={(v) => format(",.0f")(v)}
						handleFormatter={(v) => format(",.0f")(v)}
						id="customise"
					/>
				{/if}
			</fieldset>
		</details>
	</div>



	<div bind:clientWidth={w} id="results">
		<p id='maptitle'>Monthly mortgage payments</p>
		<div id="map-container">
			<Map {prices} {colour}/>	
		</div>
		<div id="mapinfo">
			{#if breaks.length > 0}
				<Areainfo
					{latestHpi}
					{propertyType}
					{areaovertime}
					{payment}
					{deposit}
					{mortgageTerm}
				/>
				<Legend {breaks} {colour} {customise} />
			{:else}
			<p>Mortgage unavailable in all areas.</p>  
			{/if}
		</div>
	</div>

</div>
<div id="footer">
	<h3>Use and share</h3>
	<div style="display:flex; gap:5px;">
		<div on:click={getData}>Get data</div>
		<div>Embed</div>
		<div>Share</div>
	</div>
</div>
</main>


<style>
	.flex-h{
		display:flex;
		justify-content: space-between;
		gap:5px;
		align-items: flex-end;
	}

	.equalspaced{
		flex:1;
	}

	.bold{
		font-weight: 700;
	}

	.flex-container{
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}

	.addtopspace{
		margin-top: 10px;
	}

	#inputs {
		background-color: #f4f7fa;
		flex: 0 0 350px;
		padding:0 15px;
		height:820px;
		box-sizing: border-box;
	}
	
	#results {
		flex: 1 0 auto;
		height:820px;
		position: relative;
	}

	@media (max-width:740px){
		.flex-container{
			flex-direction: column;
		}

		#results{
			height:750px;
		}
	}
	h1 {
		margin: 0;
	}
	#map-container {
		height: 100%;
		position:relative
	}

	#mapinfo {
		position: absolute;
		bottom: 0;
		background: white;
		width: calc(100% - 20px);
		margin:10px;
		padding:0 15px 15px 15px;
		border: 1px solid #A6BFD5;
		box-sizing: border-box;
	}

	#maptitle {
		position:absolute;
		top:20px;
		z-index: 1;
		color:#A6BFD5;
		padding: 8px 12px 10px 12px;
		font-size: 16px;
		font-weight: 600;
		line-height: 20px;
		border: 1px solid #A6BFD5;
		border-left-width: 4px;
		margin-left: 18px;
		background-color: white;
	}

	fieldset{
		margin:0;
		border:0;
		padding:0;
	}

	:global(#customise) {
		--range-slider:          #A6BFD5; /* slider main background color */
		--range-handle-inactive: #79A0BF; /* inactive handle color */
		--range-handle:          #27A0CC; /* non-focussed handle color */
		--range-handle-focus:    #206095; /* focussed handle color */
	}
</style>
