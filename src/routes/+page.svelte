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
	import type { GetPointsResponse, CreateInstanceResponse, UpdateInstanceResponse } from './logic';
	import Keypad from './Keypad.svelte';
	import banner from '$lib/images/Banners_Headphone_Shift.png';

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

	function bkspc_handler() {
		if (value) {
			value = value.slice(0, value.length - 1);
			pin = pin.slice(0, pin.length - 1);
			shift_digit = rand_digit();
			say_num(shift_digit);
		}
	}

	function press_handler(i: number) {
		const temp = (((i - shift_digit) % 10) + 10) % 10;
		if (value.length === 4) return;
		value += String(i);
		pin += String(temp);

		if (value.length === 4) return;
		shift_digit = rand_digit();
		say_num(shift_digit);
	}

	let uid: string = '';
	let uid_valid: boolean = false;
	$: uid_valid = check_uid_valid(uid);
	let iid: number = -1;
	let actual_pin: string = '';

	function reset() {
		value = '';
		pin = '';
		shift_digit = rand_digit();

		game_state = GameState.START;
		show_pin = false;
		uid_valid = false;
		iid = -1;
		actual_pin = '';
		const temp = uid;
		uid = '';
		uid = temp;
	}

	async function get_points(): Promise<GetPointsResponse> {
		const url = `https://142.93.219.243.nip.io/points/${uid.toLowerCase()}`;
		const request = new Request(url, { method: 'GET' });
		const data = await fetch(request);
		return <GetPointsResponse>(<unknown>data.json());
	}

	function normalize() {
		uid = uid;
	}

	function set_actual_pin(val: string) {
		actual_pin = val;
	}

	function isAlphaNumeric(str: string): boolean {
		let code, i, len;
		for (i = 0, len = str.length; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) {
				return false;
			}
		}
		return true;
	}

	function check_uid_valid(uid_cand: string): boolean {
		return uid_cand.length === 6 && isAlphaNumeric(uid_cand);
	}

	function progress_transition() {
		if (!uid_valid) return;
		const url = 'https://142.93.219.243.nip.io/create_instance';
		const data = {
			game_id: 'HS',
			user_id: uid.toLowerCase()
		};
		const request = new Request(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: new Headers({
				'Content-Type': 'application/json; charset=UTF-8'
			})
		});
		fetch(request).then((create_instance_value_temp) => {
			create_instance_value_temp.json().then((temp) => {
				const create_instance_value = <CreateInstanceResponse>(<unknown>temp);
				iid = create_instance_value.iid;
				game_state = GameState.PROGRESS;
				say_num(shift_digit);
			});
		});
	}

	function finish_transition() {
		const url = 'https://142.93.219.243.nip.io/update_instance';
		const data = {
			iid_value: iid,
			result_pin: pin
		};
		const request = new Request(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: new Headers({
				'Content-Type': 'application/json; charset=UTF-8'
			})
		});
		fetch(request).then((instance_response_value_temp) => {
			instance_response_value_temp.json().then((temp) => {
				const instance_response_value = <UpdateInstanceResponse>(<unknown>temp);
				if (iid !== instance_response_value.iid) {
					alert('Reached invalid state, please report bug!');
				}
				game_state = GameState.FINISH;
			});
		});
	}

	function enter_handler() {
		if (value.length === 4) {
			finish_transition();
		}
	}
	function gameHeader(num: number) {
		if (num === 1) {
			return '1st';
		} else if (num === 2) {
			return '2nd';
		} else if (num === 3) {
			return '3rd';
		} else if (num === 4) {
			return '4th';
		} else if (num > 4) {
			return '4th';
		} else {
			console.log('wrong input passed to gameHeader function');
		}
	}
</script>

<svelte:head>
	<title>Headphone Shift PIN Entry</title>
	<meta name="description" content="Headphone Shift PIN Entry" />
</svelte:head>

<!-- <h1>Headphone Shift</h1> -->

{#if game_state === GameState.START}
	<!-- <h1>Headphone Shift</h1> -->
	<img src={banner} alt="Headphone Shift" />
	<br />
	<input
		type="text"
		placeholder="User ID"
		bind:value={uid}
		on:change={normalize}
		maxlength="6"
		name="userid"
		id="userid"
	/>
	{#if uid_valid}
		{#await get_points()}
			<p>Validating User ID...</p>
		{:then get_points_value}
			{#if get_points_value.uid !== null}
				{(set_actual_pin(get_points_value.actual_pin), '')}
				<p style="color: green">Points: {get_points_value.points}</p>
			{:else}
				<p style="color: red">Invalid User ID!</p>
			{/if}
		{:catch error}
			{(console.log(error), '')}
			<p style="color: purple">Network Error: Unable to check validity of User ID!</p>
		{/await}
	{/if}
	<br />
	<button on:click={progress_transition}>Start Game</button>
{:else if game_state === GameState.PROGRESS}
	<h2 style="font-size:1.2em;text-align:center;">
		<strong>{gameHeader(value.length + 1)} digit</strong>
	</h2>

	<input type="number" placeholder="Enter shifted PIN" bind:value readonly />
	<br />
	<Keypad {bkspc_handler} {enter_handler} {press_handler} />
	<h2 style="font-size:1em;text-align:center">
		Listen to the <strong>Shift Value</strong>, then <strong>add</strong> your
		<strong>{gameHeader(value.length + 1)} digit</strong> to it.
	</h2>
	<br />
	<button on:click={() => say_num(shift_digit)}
		>Repeat {gameHeader(value.length + 1)} Shift Value</button
	>
{:else}
	<!-- <h1>Headphone Shift</h1> -->
	<img src={banner} alt="Headphone Shift" />
	<br />
	{#if show_pin}
		<div>Entered PIN: {pin}</div>
	{/if}
	<br />
	{#if actual_pin === pin}
		<p style="color: green">Congratulations on entering the correct PIN!</p>
	{:else}
		<p style="color: red">Incorrect PIN entered, no points earned!</p>
	{/if}
	<br />
	{#await get_points()}
		<p>Fetching points...</p>
	{:then get_points_value}
		{#if get_points_value.uid !== null}
			<p style="color: green">Points: {get_points_value.points}</p>
		{:else}
			<p style="color: red">Invalid User ID!</p>
		{/if}
	{:catch error}
		{(console.log(error), '')}
		<p style="color: purple">Network Error: Unable to fetch points!</p>
	{/await}
	<br />
	<button on:click={() => (show_pin = !show_pin)}>Toggle Visibility of Entered PIN</button>
	<br />
	<button on:click={reset}>Play Again</button>
	<br />
	<button><a href="https://142.93.219.243.nip.io/">Checkout Other Games</a></button>
{/if}

<style>
	input {
		font-size: 1em;
	}
</style>
