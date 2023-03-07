<script>
    import { LineChart } from "@onsvisual/svelte-charts";
    import {timeFormat} from 'd3-time-format';
    import {format} from 'd3-format';
    import {min} from 'd3-array';
    export let areaovertime;
    export let propertyType;
    export let height;
 
    let propertyLookup = {
		Detached: "averagePriceDetached.value",
		"Semi-detached": "averagePriceSemiDetached.value",
		Terraced: "averagePriceTerraced.value",
		Flat: "averagePriceFlatMaisonette.value",
	};

    $:linedata = areaovertime.map(function(d){
        return {date:d['date.value'],'value':d[propertyLookup[propertyType]]};   
    })

 
   
</script>

{#if linedata}
    <LineChart height='250px' yMin={min(linedata,d=>d.value)} colors={['#206095','#27A0CC','#A8BD3A','#F66068']} data={linedata} yFormatTick={d=>format('.3~s')(d)} xFormatTick={d=>timeFormat('%Y')(d)} xScale='time' xKey="date" yKey="value" yPrefix="£" snapTicks={true} area={false} >
        
    </LineChart>
{/if}

