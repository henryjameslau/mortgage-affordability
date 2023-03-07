<script>
    export let breaks;
    export let colour;
    export let customise;
    export let latestHpi;
    import { format } from "d3-format";
    import { areacd } from "./stores.js";
    import MediaQuery from "svelte-media-query";
    import { feature } from "topojson";
    import topo from "./data/geog.json";
    import { onMount } from "svelte";

    let geojson;
    let features;

    onMount(() => {
        for (let key in topo.objects) {
            geojson = feature(topo, topo.objects[key]);
        }
    });

    $: if (latestHpi && geojson) {
        features = geojson.features
            .map((d) => ({
                code: d.properties.AREACD,
                value: latestHpi.filter(
                    (e) => e.code == d.properties.AREACD
                )[0]["regionName.value"],
            }))
            .sort((a, b) => a.value.localeCompare(b.value));
    }
</script>

{#if colour}
    {#if !$areacd}<div class="bold">
            <p>
                Click on areas on the map or select an area to learn more about
                them.
            </p>
            {#if features}
                <div id="select">
                    <!-- <Select bind:value itemId={d=>d.code} label=value items={features}>
                
                </Select> -->

                    <select bind:value={$areacd}>
                        <option
                            value={undefined}
                            disabled={true}
                            selected={true}>Choose an area</option
                        >
                        {#each features as area}
                            <option value={area.code}>{area.value}</option>
                        {/each}
                    </select>
                </div>
            {/if}
        </div>{/if}
    <div class="container">
        <div class="right"><span>Average monthly mortgage payments</span></div>
        {#each colour.range() as d, i}
            <div class="vflex">
                <div class="legend-block" style="background-color:{d};" />
                <div class="legend-text-div">
                    <p class="legend-text">
                        {#if customise}
                            {#if i == colour.range().length - 1}
                                Above maximum or mortgage unavailable
                            {:else if (!breaks.some((v) => v == 0) && i == 0) | (breaks.some((v) => v == 0) && i == 1)}
                                Below minimum
                            {:else if breaks.some((v) => v == 0) && i == 0}
                                Cash buyer
                            {:else}
                                <MediaQuery
                                    query="(max-width:500px)"
                                    let:matches
                                >
                                    {#if matches}
                                        {#if i==0}
                                            £{format(",.0f")(Math.floor(breaks[i - 1]))}+
                                        {:else}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))}+
                                        {/if}

                                        
                                    {:else}
                                        {#if i == 0}
                                            £{format(",.0f")(Math.floor(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.round(breaks[i]))}
                                        {:else if i == colour.range().length - 1}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.ceil(breaks[i]))}
                                        {:else}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.round(breaks[i]))}
                                        {/if}
                                    {/if}
                                </MediaQuery>
                            {/if}
                        {:else if breaks.some((v) => v == 0)}
                            {#if i == colour.range().length - 1}
                                Mortgage unavailable
                            {:else if i == 0}
                                Cash buyer
                            {:else}
                                <MediaQuery
                                    query="(max-width:500px)"
                                    let:matches
                                >
                                    {#if matches}
                                        {#if i==0}
                                            £{format(",.0f")(Math.floor(breaks[i - 1]))}+
                                        {:else}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))}+
                                        {/if}
                                        
                                    {:else}
                                        {#if i == 0}
                                            £{format(",.0f")(Math.floor(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.round(breaks[i]))}
                                        {:else if i == colour.range().length - 1}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.ceil(breaks[i]))}
                                        {:else}
                                            £{format(",.0f")(Math.round(breaks[i - 1]))} to £{format(
                                                ",.0f"
                                            )(Math.round(breaks[i]))}
                                        {/if}
                                    {/if}
                                </MediaQuery>
                            {/if}
                        {:else if i == colour.range().length - 1}
                            Mortgage unavailable
                        {:else}
                            <MediaQuery query="(max-width:500px)" let:matches>
                                {#if matches}
                                    {#if i == 0}
                                        £{format(",.0f")(
                                            Math.floor(breaks[i])
                                        )}+
                                    {:else}
                                        £{format(",.0f")(
                                            Math.round(breaks[i])
                                        )}+
                                    {/if}
                                {:else}    
                                    {#if i == 0}
                                        £{format(",.0f")(Math.floor(breaks[i]))} to £{format(
                                            ",.0f"
                                        )(Math.round(breaks[i + 1]))}
                                    {:else if i == colour.range().length - 1}
                                        £{format(",.0f")(Math.round(breaks[i]))} to £{format(
                                            ",.0f"
                                        )(Math.ceil(breaks[i + 1]))}
                                    {:else}
                                        £{format(",.0f")(Math.round(breaks[i]))} to £{format(
                                            ",.0f"
                                        )(Math.round(breaks[i + 1]))}
                                    {/if}
                                {/if}
                            </MediaQuery>
                        {/if}
                    </p>
                </div>
            </div>
            <!--  end vflex -->
        {/each}
        
    </div>
{/if}

<style>
    .right {
        text-align: start;
        width: 100%;
        font-weight: bold;
        padding-bottom:10px;
    }
    span {
        font-size: 14px;
    }

    p {
        margin: 16px 0;
    }

    .bold {
        font-weight: 700;
    }

    .container {
        display: flex;
        box-sizing: border-box;
        flex-wrap: wrap;
    }

    div.legend-block {
        height: 27px;
        width: 100%;
        align-self: center;
        flex-shrink: 0;
    }

    div.vflex:last-child {
        margin-left: 3px;
    }

    .vflex {
        flex: 1;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: calc(100% - 20px);
    }

    .vflex > * {
        width: calc(100% - 10px);
        margin: 0 5px;
    }

    p.legend-text {
        text-align: center;
        box-sizing: border-box;
        overflow-wrap: break-word;
        margin: 0;
        font-size: 14px;
    }

    #select {
        padding-bottom: 10px;
    }

    div#select {
        position: relative;
        width: 100%;
    }

    div#select::before {
        height: 43px;
        width: 46px;
        position: absolute;
        top: 1px;
        right: 1px;
        bottom: 1px;
        background: #206095;
        content: "";
        pointer-events: none;
    }

    div#select::after {
        content: "";
        position: absolute;
        top: 1px;
        width: 0;
        height: 0;
        right: 14px;
        bottom: 0;
        margin: 18px 0 0 0;
        border-style: solid;
        border-width: 10px 9px 0 9px;
        border-color: #ffffff transparent transparent transparent;
        pointer-events: none;
    }

    ::before,
    ::after {
        box-sizing: border-box;
    }

    select {
        width: 100%;
        height: 44px;
        color: #206095;
        background-color: #fff;
        font-size: 16px;
        box-shadow: none;
        border-radius: 0;
        cursor: pointer;
        outline: none;
        padding-left: 6px;
        margin-bottom: 10px;
        border: 2px solid #206095;
        -webkit-appearance: none;
        appearance: none;
        font-family: Open Sans, sans-serif;
    }

    select:focus {
        box-shadow: 0 0 0px 3pt orange;
    }
</style>
