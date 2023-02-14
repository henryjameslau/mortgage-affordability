<script>
    export let breaks;
    export let colour;
    export let customise;
    import {format} from 'd3-format';
    import { areacd } from "./stores.js";
    import MediaQuery from "svelte-media-query"; 

</script>

{#if colour}
    {#if !$areacd}<div class='bold'><p>Click on areas on the map to learn more about them.</p></div>{/if}
    <div style="display:flex;">
        {#each colour.range() as d,i }
            <div class='vflex'>
                <div class='legend-block' style="background-color:{d};"></div>
                <div><p class='legend-text'>
                    {#if customise}
                        {#if i==colour.range().length-1}
                        Out of budget
                        {:else if i==0}
                        Below minimum
                        {:else}
                        <MediaQuery query="(max-width:850px)" let:matches>
                            {#if matches}
                                £{format(".2~s")(breaks[i-1])}+
                            {:else}
                                £{format(".2~s")(breaks[i-1])}–£{format(".2~s")(breaks[i])}
                            {/if}
                        </MediaQuery>
                        
                        {/if}
                    {:else if breaks.some((v) => v ==0)} 
                        {#if i==colour.range().length-1}
                        Out of budget
                        {:else if i==0}
                        Cash buyer
                        {:else}
                        <MediaQuery query="(max-width:850px)" let:matches>
                            {#if matches}
                                £{format(".2~s")(breaks[i-1])}+
                            {:else}
                                £{format(".2~s")(breaks[i-1])}–£{format(".2~s")(breaks[i])}
                            {/if}
                        </MediaQuery>
                        
                        {/if}
                    {:else}
                        {#if i==colour.range().length-1}
                        Out of budget
                        {:else}
                        <MediaQuery query="(max-width:850px)" let:matches>
                            {#if matches}
                                £{format(".2~s")(breaks[i])}+
                            {:else}
                                £{format(".2~s")(breaks[i])}–£{format(".2~s")(breaks[i+1])}
                            {/if}
                        </MediaQuery>
                        {/if}
                    {/if}
                </p></div>
            </div>
        {/each}
    </div>  
{/if}

<style>
    p{
        margin:16px 0;
    }

    .bold{
        font-weight: 700;
    }

    div.legend-block {
        height: 27px;
        width: 100%;
        align-self: center;
        flex-shrink: 0;
    }

    div.vflex:last-child{
        margin-left: 3px;
    }

    .vflex{
        display: flex;
        flex-direction: column;
        flex:1;
    }

    p.legend-text{
        text-align: center;
        margin:0;
    }
</style>
