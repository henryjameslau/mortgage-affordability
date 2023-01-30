<script>
  // import { onMount } from "svelte";
  import Map from "./Map.svelte";
  import { csv } from "d3-fetch";
  import { autoType } from "d3-dsv";
  import { max, ascending } from "d3-array";
  import { timeParse } from "d3-time-format";
  import { scaleThreshold } from "d3-scale";
  import { equalIntervalBreaks } from "simple-statistics";

  let mortgageTerm = 25;
  let deposit = 30000;
  let propertyType;
  let prices = {};
  let colour;

  // let boeLookup = {
  //   IUMZICQ: "2 year, 60% LTV",
  //   IUMBV34: "2 year, 75% LTV",
  //   IUMZICR: "2 year, 85% LTV",
  //   IUMB482: "2 year, 90% LTV",
  //   IUM2WTL: "2 year, 95% LTV",
  // };

  // let propertyLookup = {
  //   Detached: "averagePriceDetached.value",
  //   "Semi-detached": "averagePriceSemiDetached.value",
  //   Terrace: "averagePriceTerraced.value",
  //   Flat: "averagePriceFlatMaisonette.value",
  // };

  // onMount(
  //   async () => {
  //     boe = await csv("https://corsproxy.io/?https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Sep/2022&Dateto=now&SeriesCodes=IUMZICQ,IUMBV34,IUMZICR,IUMB482,IUM2WTL&CSVF=CN&UsingCodes=Y&VPD=N&VFD=N"),
  //     hpi = await csv("https://raw.githubusercontent.com/ONSvisual/land-registry-flat-data/main/landreg.csv",autoType)
  //   }
  // )
  // $: console.log(boe)
  // $: console.log(hpi)
  // console.log(topo)

  // Promise.all([
  //   csv(
  //     "https://raw.githubusercontent.com/ONSvisual/land-registry-flat-data/main/landreg.csv",
  //     autoType
  //   ),
  //   csv(
  //     "https://corsproxy.io/?https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Sep/2022&Dateto=now&SeriesCodes=IUMZICQ,IUMBV34,IUMZICR,IUMB482,IUM2WTL&CSVF=CN&UsingCodes=Y&VPD=N&VFD=N",
  //     autoType
  //   ),
  // ]).then(([hpi, boe]) => {
  //   let maxHpiDate = max(hpi, (d) => d["date.value"]).getTime();

  //   //read in bank of england data
  //   boe = boe.map(function (d) {
  //     return {
  //       date: timeParse("%d %b %Y")(d.DATE).getTime(),
  //       series: boeLookup[d.SERIES],
  //       value: +d.VALUE,
  //     };
  //   });

  //   let boeBefore = boe.filter((d) => d.date < maxHpiDate);
  //   let maxBoeBefore = max(boeBefore, (d) => d.date);

  //   // find relevant data to latest HPI data
  //   let latestBoe = boe
  //     .filter((d) => d.date == maxBoeBefore)
  //     .map(function (d) {
  //       return {
  //         date: new Date(d.date),
  //         series: d.series,
  //         value: d.value,
  //       };
  //     });

  //   const rates = latestBoe.flatMap((d) => d.value);

  //   const rate = scaleThreshold()
  //     .domain([0.6, 0.75, 0.85, 0.9, 0.95])
  //     .range(rates.concat(null));

  //   const latestHpi = hpi.filter((d) => d["date.value"] == maxHpiDate);

  //   $: {
  //     latestHpi.forEach((d) => {
  //       prices[d.Area_Code] = monthlyrepayments(
  //         +d[propertyLookup[propertyType]]
  //       );
  //       console.log(prices);
  //     });

  //     let pricevalues = Object.values(prices)
  //       .filter((d) => !isNaN(d))
  //       .sort(ascending);
  //     let breaks = equalIntervalBreaks(pricevalues, 5);

  //     //set up colour scales for map
  //     colour = scaleThreshold()
  //       .domain(breaks.slice(1))
  //       .range(["#BCD6E9", "#A4C3DC", "#8DB3D3", "#77A2C5", "#6390B5"]);
  //   }
  // });

  $: choices = {mortgageTerm:mortgageTerm,deposit:deposit,propertyType:propertyType}

  
</script>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<!-- svelte-ignore non-top-level-reactive-declaration -->
<h1>Where in the UK can you afford to buy a property?</h1>
<h2>
  Fill in some details below to find out which areas are affordable depending on
  your budget. Click on each area to find out about house prices.
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
      <input type="number" id="minimum" />
    </div>

    <div>
      <label for="maximum">Maximum</label>
      <input type="number" id="maximum" />
    </div>
  </fieldset>
</details>

<div id="results">
  <div id="map" style="height:300px;">
    <Map data={prices} {colour} {choices}/>
  </div>
</div>
<hr />
<h3>Use and share</h3>
<div>Get data</div>
<div>Embed</div>
<div>Share</div>
