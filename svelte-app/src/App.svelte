<script>
  import Map from "./Map.svelte";

  let mortgageTerm = 25;
  let deposit = 30000;
  let propertyType;

  $: choices = {mortgageTerm:mortgageTerm,deposit:deposit,propertyType:propertyType}

  
</script>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<!-- svelte-ignore non-top-level-reactive-declaration -->
<h1>Where in the UK can you afford to buy a property?</h1>
<h2>
  Fill in some details below to find out which areas are affordable depending on
  your budget. Click on each area to find out about house prices.
</h2>
<hr />
<fieldset>
  <div>
    <label for="mortgageTerm">Mortgage term in years</label>
    <input type="number" id="mortgageTerm" bind:value={mortgageTerm} />
  </div>

  <div>
    <label for="deposit">Deposit amount</label>
    <input type="number" id="deposit" bind:value={deposit} />
  </div>

  <div>
    <label for="propertyType">Select property type</label>
    <select bind:value={propertyType} id="propertyType">
      <option>Detached</option>
      <option>Semi-detached</option>
      <option>Terraced</option>
      <option>Flat</option>
    </select>
  </div>
</fieldset>

<hr />
<details>
  <summary>Adjust monthly repayment price range</summary>
  <p>
    Enter the minimum and maximum monthly mortgage payments that suits your
    budget.
  </p>
  <fieldset>
    <div>
      <label for="minimum">Minimum</label>
      <input type="number" id="minimum" />
    </div>

    <div>
      <label for="maximum">Maximum</label>
      <input type="number" id="maximum" />
    </div>
  </fieldset>
</details>

<div id="results">
  <div id="map-container" style="height:300px;">
    <Map {choices}/>
  </div>
</div>
<hr />
<h3>Use and share</h3>
<div>Get data</div>
<div>Embed</div>
<div>Share</div>
