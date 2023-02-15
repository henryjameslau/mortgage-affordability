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
    <div class='container'>
        {#each colour.range() as d,i }
            <div class='vflex'>
                <div class='legend-block' style="background-color:{d};">
                </div>
                   <div class='legend-text-div'>
                    
                         <p class='legend-text'>
                            
                            {#if customise}
                                {#if i==colour.range().length-1}
                                    Above maximum or mortgage unavailable
                                {:else if (!breaks.some(v=>v==0) && i==0) | (breaks.some(v=>v==0) && i==1)}
                                    Below minimum
                                {:else if breaks.some(v=>v==0) && i==0}
                                    Cash buyer
                                {:else}
                                    <MediaQuery query="(max-width:500px)" let:matches>
                                        {#if matches}
                                            £{format(".2~s")(breaks[i-1])}+
                                        {:else}
                                            £{format(".3~s")(breaks[i-1])} to £{format(".3~s")(breaks[i])}
                                        {/if}
                                    </MediaQuery>
                                {/if}
                            {:else if breaks.some((v) => v ==0)} 
                                {#if i==colour.range().length-1}
                                    Mortgage unavailable
                                {:else if i==0}
                                    Cash buyer
                                {:else}
                                    <MediaQuery query="(max-width:500px)" let:matches>
                                        {#if matches}
                                            £{format(".2~s")(breaks[i-1])}+
                                        {:else}
                                            £{format(".3~s")(breaks[i-1])} to £{format(".3~s")(breaks[i])}
                                        {/if}
                                    </MediaQuery>
                                {/if}
                            {:else}
                                {#if i==colour.range().length-1}
                                    Mortgage unavailable
                                {:else}
                                    <MediaQuery query="(max-width:500px)" let:matches>
                                        {#if matches}
                                            £{format(".2~s")(breaks[i])}+
                                        {:else}
                                            £{format(".3~s")(breaks[i])} to £{format(".3~s")(breaks[i+1])}
                                        {/if}
                                    </MediaQuery>
                                {/if}
                            {/if} 
                        </p>
                    </div>  
            </div><!--  end vflex -->
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

    .container{
        display:flex; 
        box-sizing:border-box;
        flex-wrap: wrap;
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
        flex:1;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width:calc(100% - 20px);
    }

    .vflex > * {
        width:calc(100% - 10px);
        margin:0 5px;
    }

    p.legend-text{
        text-align: center;
        box-sizing: border-box;
        overflow-wrap: break-word;
        margin:0;
    }


</style>
