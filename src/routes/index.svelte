<script>
	import loading from 'images/loading.gif';
</script>

<svelte:head>
	<title>milkbox</title>
</svelte:head>

<div class="grid grid-cols-3 gap-4 text-xl">

	<div class="col-span-2 font-bold">Name</div>
	<div class="font-bold">Size</div>

	<div class="col-span-2">
		<a id="parent_id" style="color:#3399ff;">../<span id="returnLink" class="text-sm text-gray-500"></span></a>
		<span id="file" class="text-sm text-gray-500">(dasdasdasd)</span>
	</div>
	<div class="">-</div>

	<div id="#loading" class="col-span-full">
		<center>
			<img width="30px" height="30px" alt="Loading.." src="{loading}">
		</center>
	</div>

	<div id="content-list">

	</div>
</div>