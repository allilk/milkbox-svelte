<script>
    export let id
    export let name
</script>

<div class="drive-obj whitespace-normal text-center text-lg px-16 py-6 shadow-inner col-span-2 md:col-span-1">
    {name}
    <div id="file" class="text-xs text-gray-500">
        ({id})
    </div>
</div>