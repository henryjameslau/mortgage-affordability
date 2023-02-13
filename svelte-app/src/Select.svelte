<script>
	  export let options = ['Detached','Semi-detached','Terraced','Flat'];
    export let label;
    export let selected;

</script>

<div>
	<label for="dropdown">{label}
        <select bind:value={selected} id="dropdown">
            {#each options as option}
            <option value={option}>{option}</option>
            {/each}
        </select>
    </label>
</div>


<style>

  label{
    font-weight: 700;
  }
  
	div{
        position:relative;
		top: 3px;
		left: 3px;
		width: calc(100% - 6px);
	}
	
	div::before {
  height: 43px;
  width: 46px;
  position: absolute;
  top: 23px;
  right: 1px;
  bottom: 1px;
  background: #206095;
  content: '';
  pointer-events: none;
}
	
	div::after {
  content: '';
  position: absolute;
  top: 22px;
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
	
	::before, ::after {
  box-sizing: border-box;
}
	
	select{
		width:100%;
		height: 44px;
		color: #206095;
		background-color: #FFF;
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


	
select:focus{
  box-shadow: 0 0 0px 3pt orange;
}
</style>