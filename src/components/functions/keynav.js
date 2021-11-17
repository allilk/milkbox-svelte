import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';
import { currentFolder } from '../../stores';

const lineSelected = writable(-2);

// export const handleKeydown = (ev) => {
// 	const keyCode = ev.keyCode;
// 	const up = [83, 40];
// 	const down = [87, 38];
// 	let ifDown = true;
// 	if ([...up, ...down].includes(keyCode)) {
// 		ev.preventDefault();
// 		if (up.includes(keyCode)) {
// 			lineSelected.update((x) => ++x);
// 		} else if (down.includes(keyCode)) {
// 			lineSelected.update((x) => --x);
// 		}

// 		let selected;
// 		let last;

// 		lineSelected.subscribe((x) => {
// 			selected = document.querySelector(`[key='${x}']`);
// 			last = document.querySelector(`[key='${(x - 1).toString()}']`);
// 			if (!last) {
// 				last = document.querySelector(`[key='${(x + 1).toString()}']`);
// 			}
// 			// selected.focus();
// 			// console.log(selected);
// 		});
// 		if (selected) {
// 			selected.classList.add('selected');
// 			if (last) {
// 				last.classList.remove('selected');
// 			}
// 		}
// 	}
// 	// if (keyCode) ev.preventDefault();
// 	// if (keyCode == 83 || keyCode == 40) {
// 	// 	// 83, 40 - down
// 	// 	lineSelected.update((x) => ++x);
// 	// } else if (keyCode == 87 || keyCode == 38) {
// 	// 	// 87, 38 - up
// 	// 	lineSelected.update((x) => --x);
// 	// }
// };

export const handleKeydown = (ev) => {
	const { keyCode } = ev;
	const add = () => {
		lineSelected.update((x) => ++x);
	};
	const subtract = () => {
		lineSelected.update((x) => --x);
	};
	let line;
	let items = document.querySelectorAll('[key]').length - 2;
	const up = [83, 40];
	const down = [87, 38];

	if ([...up, ...down].includes(keyCode)) {
		ev.preventDefault();

		if (up.includes(keyCode)) {
			add();
		} else if (down.includes(keyCode)) {
			subtract();
		}
		lineSelected.subscribe((x) => {
			line = x;
		});

		let selected;
		$: selected = document.querySelector(`[key='${line.toString()}']`);
		$: if (selected) console.log(selected);

		// lineSelected.subscribe((x) => {
		// 	console.log(x);
		// });
	}
};
