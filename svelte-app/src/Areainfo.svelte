<script>
    import {areacd} from './stores.js'
    export let latestHpi;
    export let property

    let priceforproperty
    if(latestHpi){ priceforproperty = latestHpi[property]}
</script>
{#if $areacd}
<p>The area code is {$areacd}. The price for a X property is {priceforproperty}</p>

{/if}
<style>

</style>
