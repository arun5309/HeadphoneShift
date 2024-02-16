export enum GameState {
	START,
	PROGRESS,
	FINISH
}

export function rand_digit(): number {
	for (;;) {
		const array = new Uint8Array(1);
		self.crypto.getRandomValues(array);
		if (array[0] < 250) {
			return array[0] % 10;
		}
	}
}
