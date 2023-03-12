<script>
    import { areacd } from "./stores.js";
    import { format } from "d3-format";
    import { timeFormat } from "d3-time-format";
    import { max, ascending } from "d3-array";
    import { timeYear } from "d3-time";
    import {afterUpdate} from 'svelte';

    import Chart from "./Chart.svelte";
    export let latestHpi;
    export let propertyType;
    export let areaovertime;
    export let payment;
    export let deposit;
    export let mortgageTerm;
    let fiveyearsago;
    let percentageChange;
    let thisarea;
    let textInfoHeight;
    let infoReady=false;


    let propertyLookup = {
        Detached: "averagePriceDetached.value",
        "Semi-detached": "averagePriceSemiDetached.value",
        Terraced: "averagePriceTerraced.value",
        Flat: "averagePriceFlatMaisonette.value",
    };

    let indexLookup = {
        Detached: "hpiDetached.value",
        "Semi-detached": "hpiSemiDetached.value",
        Terraced: "hpiTerraced.value",
        Flat: "hpiFlatMaisonette.value",
    };

    $: if (latestHpi && $areacd) {
        thisarea = latestHpi.filter((d) => d.code == $areacd)[0];
    }

    $: if (areaovertime) {
        let maxdate = max(areaovertime, (d) => d["date.value"]);
        if (maxdate) {
            let indexnow = areaovertime.filter(
                (d) => d["date.value"].getTime() == maxdate.getTime()
            )[0][indexLookup[propertyType]];
            let newdate = timeYear.offset(maxdate, -5);

            fiveyearsago = areaovertime.filter(
                (d) => d["date.value"].getTime() == newdate.getTime()
            )[0];
            let index5yearsago = fiveyearsago[indexLookup[propertyType]];
            percentageChange =
                (100 * (indexnow - index5yearsago)) / index5yearsago;
        }
    }

    function cleararea() {
        areacd.set(undefined);
    }

    afterUpdate(()=>{
        if($areacd){infoReady=true}
        else{infoReady=false}
    })

</script>

{#if $areacd && thisarea}
    {#if payment=="No data"}
        <button tabindex=0 aria-label="close selected area information" on:click={cleararea} />
        <h3>Data unavailable</h3>
    {:else}
        <button tabindex=0 aria-label="close selected area information" on:click={cleararea} />
        <h3>{propertyType} {propertyType == "Flat" ? "" : "property"} prices in {thisarea["regionName.value"]}</h3>
        <div class='flex-container'>
            <div id="chart" style="height:{textInfoHeight}">
                {#if infoReady}
                    <Chart {areaovertime} {propertyType} height={textInfoHeight}/>
                {/if}
                
            </div>

            <div bind:clientHeight={textInfoHeight} id="textinfo">
                {#if thisarea}
                    {#if payment!="Mortgage unavailable"}
                        {#if payment <0}
                            <p>It would be possible to buy an average {propertyType.toLowerCase()}
                            {propertyType == "Flat" ? "" : "property"} with a deposit of £{format(",.0f")(deposit)} without a mortgage.</p>
                        {:else}
                            <p>
                                Typical payments on a 5 year fixed mortgage for an average {propertyType.toLowerCase()}
                                {propertyType == "Flat" ? "" : "property"} in <span class="bold">{thisarea[
                                    "regionName.value"
                                ]}</span> is <span class="bold">£{format(",.0f")(payment)}</span> with a deposit of £{format(
                                    ",.0f"
                                )(deposit)} and a {mortgageTerm} year mortgage.
                            </p>
                        {/if}
                        
                    
                        
                    {/if}

                    <p>
                        The average price for a {propertyType.toLowerCase()} property in {thisarea[
                            "regionName.value"
                        ]} is £{format(".3~s")(thisarea[propertyLookup[propertyType]])} in {timeFormat(
                            "%b %Y"
                        )(thisarea["date.value"])}.
                    </p>

                    <p>
                        This has increased by <span class="bold">{format(".0f")(percentageChange)}%</span> since {timeFormat(
                            "%b %Y"
                        )(fiveyearsago["date.value"])}.
                    </p>
                {/if}
            </div>
            
        </div>
    
    {/if}
{/if}



<style>

    h3{
        font-size: 20px;
    }
    button {
        position: relative;
        top: 15px;
        right: 0;
        float: right;
        background-image: url("./images/Close-cross.png");
        height: 13px;
        width: 13px;
        border: 0;
        background-color: white;
    }

    button:focus, button:hover {
        box-shadow: 0 0 0 3px orange;
    }
  
    .flex-container{
        display: flex;
        flex-wrap: no-wrap;
        justify-content: space-between;
        gap:20px;
        align-items: flex-start;
    }

    @media (max-width:650px){
        .flex-container{
            flex-direction: column;
            align-items: stretch;
        }
    }

    .bold{
        font-weight: 700;
    }

    #chart, #textinfo{
        flex:1 1 50%;
    }


    #textinfo{
        align-items: flex-start;
    }

    p{
        margin:0;
        margin-bottom: 10px;
        font-size: 16px;
    }
</style>
