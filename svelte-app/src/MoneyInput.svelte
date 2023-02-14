<script>
  export let min = 0;
  export let max;
  export let value = 0;
  export let label;
</script>

<label for="input">{label}</label>
<div>
  <input bind:value type="number" id="input" {max} {min} />
</div>

<style>
  label {
    font-size: 16px;
    font-weight: 700;
  }

  div::before {
    height: 29px;
    width: 24px;
    background-color: #9ab1c4;
    position: absolute;
    top: 4px;
    left: 2px;
    z-index: 2;
    content: "£";
    font-size: 18px;
    color: #000;
    padding-top: 4px;
    padding-left: 12px;
    font-weight: 700;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    width: 100%;
    position: relative;
    margin: 2px 0;
    padding-left: 46px;
    padding-top: 5px;
    height: 37px;
    outline: 0;
    border: 2px solid #206095;
    border-radius: 0;
    color: #206095;
    font-size: 18px;
    cursor: pointer;
    pointer-events: all;
    line-height: 32px;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

  div {
    position: relative;
    display: inline-block;
    width:100%;
  }

  input:focus {
    outline: 3px solid #ffa23a;
    position: relative;
    outline-offset: -2px;
    z-index: 1;
  }
</style>
