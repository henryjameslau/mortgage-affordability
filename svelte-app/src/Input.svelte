<script>
	export let min = 0;
	export let max = 30;
	export let number = 0;
	export let label = "Mortgage length in years";

	let add = () => (number += 1);

	let minus = () => (number -= 1);
</script>

<div>
	<label for="input">{label}</label>
	<button disabled={number == min} on:click={minus}><span>-</span> </button>
	<input id="input" bind:value={number} {min} {max} type="number" />
	<button disabled={number == max} on:click={add}>
		<span>+</span>
	</button>
</div>

<style>
	div {
		width: 100%;
	}

	button,
	input {
		margin: 2px 0;
		padding: 2px 0 0;
		outline: 0;
		border: 2px solid #206095;
		line-height: 0;
		cursor: pointer;
		pointer-events: all;
		float: left;
	}

	button {
		font-size: 24px;
		width: 40px;
		height: 36px;
		background-color: #206095;
		color: #fff;
	}

	input {
		z-index: 1;
		border-radius: 0;
		border-left: none;
		border-right: none;
		width: calc(100% - 80px);
		appearance: textfield;
		-webkit-appearance: textfield;
		-moz-appearance: textfield;
		text-align: center;
		height: 36px;
	}

	input:focus,
	button:focus {
		outline: 3px solid #ffa23a;
		position: relative;
		outline-offset: -2px;
	}

	button:disabled,
	button[disabled] {
		background-color: #79A0BF;
		border: 2px solid #206095;
		color: #5284AC;
	}

	span {
		vertical-align: top;
	}
</style>
