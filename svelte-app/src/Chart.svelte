<script>
    import { LineChart } from "@onsvisual/svelte-charts";
    import {timeFormat} from 'd3-time-format';
    import {format} from 'd3-format';
    export let areaovertime;
 

    $: pivoted = pivot(
        areaovertime,
        [
            "averagePriceDetached.value",
            "averagePriceSemiDetached.value",
            "averagePriceTerraced.value",
            "averagePriceFlatMaisonette.value",
        ],
        "property",
        "value"
    );

    function pivot(data, columns, name, value) {
        const keep = Object.keys(data[0]).filter((c) => !columns.includes(c));
        return data.flatMap((d) => {
            const base = keep.map((k) => [k, d[k]]);
            return columns.map((c) => {
                return Object.fromEntries([...base, [name, c], [value, d[c]]]);
            });
        });
    }
</script>

{#if pivoted}
    <LineChart colors={['#206095','#27A0CC','#A8BD3A','#F66068']} data={pivoted} yFormatTick={d=>format('.3~s')(d)} xFormatTick={d=>timeFormat('%Y')(d)} xScale='time' xKey="date.value" yKey="value" zKey="property" yPrefix="£" area={false} >
        
    </LineChart>

{/if}
