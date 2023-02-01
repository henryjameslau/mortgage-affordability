<script>
    export let breaks;
    export let colour;
    let outofrange = "#EC9AA4"
    // $: colours $$ = colour.range();;
     
</script>

{#if colour}
    <div><p>Click on areas on the map to learn more about them.</p></div>
    <div style="display:flex;">
        {#each colour.range().concat(outofrange) as d }
            <div class='legend-block' style="background-color:{d};">{d}</div>

        {/each}
    </div>
{/if}

<style>
    div.legend-block {
        height: 27px;
        width: 20%;
        align-self: center;
        flex-shrink: 0;
    }
</style>
