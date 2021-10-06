import { writable } from 'svelte/store';
import { currentFolder } from '../../stores';

let lineSelected = writable(-2);

export const handleKeydown = (ev) => {
	const keyCode = ev.keyCode;
	const up = [83, 40];
	const down = [87, 38];
	if ([...up, ...down].includes(keyCode)) {
		ev.preventDefault();
		if (up.includes(keyCode)) {
			lineSelected.update((x) => ++x);
		} else if (down.includes(keyCode)) {
			lineSelected.update((x) => --x);
		}
		lineSelected.subscribe((x) => {
			const selected = document.querySelector(`[key='${x}']`);
			// selected.focus();
			// selected.classList.add('selected');
			console.log(selected);
		});
	}
	// if (keyCode) ev.preventDefault();
	// if (keyCode == 83 || keyCode == 40) {
	// 	// 83, 40 - down
	// 	lineSelected.update((x) => ++x);
	// } else if (keyCode == 87 || keyCode == 38) {
	// 	// 87, 38 - up
	// 	lineSelected.update((x) => --x);
	// }
};
