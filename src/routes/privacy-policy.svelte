<script>
	import Header from '../components/drive/Header.svelte';
	import Footer from '../components/drive/Footer.svelte';
	import { goto } from '$app/navigation';
</script>

<div>
	<Header />
	<br />

	<div>
		This site does not share personal information with third parties nor do we store any information
		about your visit to this site.
		<br /><br />
		While not reccomended, You can turn off the use of cookies at anytime by changing your browser settings.
		<br /><br />
		None of your files are stored on the server or sent back to the server in any way. This means that
		everything that is loaded, and shown in the UI is between <b>your</b> browser and Google. I am
		not responsible for anything shown through this UI alternative.
		<br /><br />
		This privacy policy is subject to change without notice and was last updated on January 16th, 2021.
		If you have any questions, feel free to contact me directly here:
		<span
			class="link"
			on:click={() => {
				goto('mailto:milk@cream.glass');
			}}
		>
			milk@cream.glass</span
		>
		<br /><br />
	</div>
	<Footer />
</div>
