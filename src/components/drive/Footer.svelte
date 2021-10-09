<script>
	import { goto } from '$app/navigation';
</script>

<div class="footer">
	<div class="footer-text">
		<div>
			Created by the dev <span
				class="link"
				on:click={() => {
					goto('https://github.com/allilk');
				}}>@allilk</span
			>.
		</div>
		<div>
			Check out the source on <span
				class="link"
				on:click={() => {
					goto('https://github.com/allilk/milkbox-svelte/tree/rewrite');
				}}>GitHub</span
			>.
		</div>
		<div>
			<span
				class="link"
				on:click={() => {
					goto('/privacy-policy');
				}}>Privacy Policy</span
			>
			|
			<span
				class="link"
				on:click={() => {
					goto('/terms-of-service');
				}}
			>
				Terms of Service</span
			>
		</div>
	</div>
</div>

<style>
	.footer {
		font-size: var(--primary);
		width: 100%;
		padding-top: 20px;
		padding-bottom: 20px;
		border-radius: 0.25rem;
		margin-top: 1rem;
		margin-bottom: 1rem;
		color: var(--color-5);
		background-color: var(--color-3);
	}
	.footer-text {
		margin-top: 1rem;
		margin-bottom: 1rem;
		padding-bottom: 10px;
		width: 100%;
		line-height: 1.5rem;
		text-align: center;
	}

	@media (min-width: 768px) {
		.footer-text {
			margin-left: 2rem;
			margin-right: 2rem;
			text-align: left;
			padding-bottom: 0;
			width: auto;
		}
	}
</style>
