<script>
    import { LineChart } from "@onsvisual/svelte-charts";
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

    $: console.log(pivoted)

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
    <LineChart data={pivoted} xKey="date.value" yKey="value" zKey="property" area={false} title="Multi-line chart" legend/>
{/if}
