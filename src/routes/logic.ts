export enum GameState {
	START,
	PROGRESS,
	FINISH
}

export type GetPointsResponse = {
	uid: number | null;
	points: number | null;
	actual_pin: string;
};

export type CreateInstanceResponse = {
	iid: number;
};

export type UpdateInstanceResponse = {
	iid: number;
};

export function rand_digit(): number {
	for (;;) {
		const array = new Uint8Array(1);
		self.crypto.getRandomValues(array);
		if (array[0] < 250) {
			return array[0] % 10;
		}
	}
}
