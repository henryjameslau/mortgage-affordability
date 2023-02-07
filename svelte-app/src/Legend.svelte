<script>
    export let breaks;
    export let colour;
    export let customise;
    let outofrange = "#EC9AA4"
    import {format} from 'd3-format';
     
</script>

{#if colour}
    <div><p>Click on areas on the map to learn more about them.</p></div>
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
                        £{format(".2~s")(breaks[i-1])}+
                        {/if}
                    {:else}
                        {#if i==colour.range().length-1}
                        Out of budget
                        {:else}
                        £{format(".2~s")(breaks[i])}+
                        {/if}
                    {/if}
                    
                    
                </p></div>
            </div>
            

        {/each}
    </div>
{/if}

<style>
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
        width: 20%;
    }

    p.legend-text{
        text-align: center;
    }
</style>
