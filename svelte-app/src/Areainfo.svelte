<script>
    import { areacd } from "./stores.js";
    import { format } from "d3-format";
    import { timeFormat } from "d3-time-format";
    import { max,ascending } from "d3-array";
    import {timeYear} from 'd3-time';


    import Chart from "./Chart.svelte";
    export let latestHpi;
    export let propertyType;
    export let areaovertime;
    let fiveyearsago;
    let percentageChange;


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

    let thisarea;
    $: if (latestHpi) {
        thisarea = latestHpi.filter((d) => d.code == $areacd)[0];
    }

    $: if (areaovertime) {
        let maxdate = max(areaovertime, (d) => d["date.value"]);
        if (maxdate) {
            let indexnow = areaovertime.filter(d=>d["date.value"].getTime() == maxdate.getTime())[0][indexLookup[propertyType]]
            let newdate = timeYear.offset(maxdate,-5)
            
            fiveyearsago = areaovertime.filter(
                (d) => d["date.value"].getTime() == newdate.getTime()
            )[0];
            let index5yearsago = fiveyearsago[indexLookup[propertyType]]
            percentageChange = 100*(indexnow-index5yearsago)/index5yearsago
        }
    }

</script>

{#if $areacd}
    <p>Property prices in {thisarea["regionName.value"]}</p>
    <div id="legend">
        <div class="legend--item">
            <div class="legend--icon--circle" style="background-color: #206095;" />
            <div><p class="legend--text">Detached</p></div>
        </div>
        <div class="legend--item">
            <div class="legend--icon--circle" style="background-color: #27A0CC;" />
            <div><p class="legend--text">Semi-detached</p></div>
        </div>
        <div class="legend--item">
            <div class="legend--icon--circle" style="background-color: #A8BD3A;" />
            <div><p class="legend--text">Terraced</p></div>
        </div>
        <div class="legend--item">
            <div class="legend--icon--circle" style="background-color: #F66068;" />
            <div><p class="legend--text">Flats</p></div>
        </div>
    </div>
    <Chart {areaovertime} />
    <p>
        The average price for a {propertyType.toLowerCase()} property in {thisarea[
            "regionName.value"
        ]} is £{format(".3~s")(thisarea[propertyLookup[propertyType]])} in {timeFormat(
            "%b %Y"
        )(thisarea["date.value"])}. This has increased by {format(".0f")(percentageChange)}% since {timeFormat("%b %Y")(fiveyearsago["date.value"])}.
    </p>
{/if}

<style>
    #legend {
        display: flex;
        flex-wrap: wrap;
    }

    .legend--item {
        display: flex;
        padding-right: 40px;
        padding-bottom: 12px;
    }

    .legend--icon--circle {
        height: 12px;
        width: 12px;
        border-radius: 50%;
        align-self: center;
        flex-shrink: 0;
    }

    .legend--text {
        color: #707070;
        line-height: 14px;
        font-size: 14px;
        padding-left: 12px;
        margin: 0;
    }
</style>
