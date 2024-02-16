<script lang="ts">
	import num0 from '$lib/audio/num0.wav';
	import num1 from '$lib/audio/num1.wav';
	import num2 from '$lib/audio/num2.wav';
	import num3 from '$lib/audio/num3.wav';
	import num4 from '$lib/audio/num4.wav';
	import num5 from '$lib/audio/num5.wav';
	import num6 from '$lib/audio/num6.wav';
	import num7 from '$lib/audio/num7.wav';
	import num8 from '$lib/audio/num8.wav';
	import num9 from '$lib/audio/num9.wav';
	import { GameState, rand_digit } from './logic';
	import Keypad from './Keypad.svelte';

	let value = '';
	let pin = '';
	let shift_digit = rand_digit();
	let game_state = GameState.START;
	let show_pin = false;

	const recordings = [num0, num1, num2, num3, num4, num5, num6, num7, num8, num9];

	function say_num(i: number) {
		const audio = new Audio(recordings[i]);
		audio.play();
	}

	function start_game() {
		game_state = GameState.PROGRESS;
		say_num(shift_digit);
	}

	function bkspc_handler() {
		if (value) {
			value = value.slice(0, value.length - 1);
			pin = pin.slice(0, pin.length - 1);
			shift_digit = rand_digit();
			say_num(shift_digit);
		}
	}

	function enter_handler() {
		if (value.length == 4) {
			game_state = GameState.FINISH;
		}
	}

	function press_handler(i: number) {
		const temp = (((i - shift_digit) % 10) + 10) % 10;
		if (value.length == 4) return;
		value += String(i);
		pin += String(temp);

		if (value.length == 4) return;
		shift_digit = rand_digit();
		say_num(shift_digit);
	}
</script>

<svelte:head>
	<title>Headphone Shift PIN Entry</title>
	<meta name="description" content="Headphone Shift PIN Entry" />
</svelte:head>

<h1>Headphone Shift</h1>

{#if game_state === GameState.START}
	<button on:click={start_game}>Start Game</button>
{:else if game_state === GameState.PROGRESS}
	<input type="number" placeholder="Enter shifted PIN" bind:value readonly />
	<br />
	<Keypad {bkspc_handler} {enter_handler} {press_handler} />
	<br />
	<button on:click={() => say_num(shift_digit)}>Repeat Shift Digit</button>
{:else}
	{#if show_pin}
		<div>Entered PIN: {pin}</div>
	{/if}
	<br />
	<button on:click={() => (show_pin = !show_pin)}>Toggle PIN Visibility</button>
{/if}

<style>
	h1 {
		width: 100%;
	}
	input {
		font-size: 1em;
	}
</style>
