<script>
    import {areacd} from './stores.js'
    import {format} from 'd3-format';
    import Chart from './Chart.svelte'
    export let latestHpi;
    export let propertyType
    export let areaovertime

    let propertyLookup = {
		Detached: "averagePriceDetached.value",
		"Semi-detached": "averagePriceSemiDetached.value",
		Terraced: "averagePriceTerraced.value",
		Flat: "averagePriceFlatMaisonette.value",
	};

    let thisarea
    $: if(latestHpi){
        thisarea = latestHpi.filter(d=>d.code==$areacd)[0]
    }

</script>
{#if $areacd}
<Chart {areaovertime}></Chart>
<p>The average price for a {propertyType.toLowerCase()} property in {thisarea['regionName.value']} is £{format(".3~s")(thisarea[propertyLookup[propertyType]])}</p>

{/if}
<style>

</style>
