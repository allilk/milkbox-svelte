<script>
    import {onMount, afterUpdate} from 'svelte';
    import db from './drive/connection';
    onMount(async ()=>{
        let themeSelection = document.getElementById('#themes');
        themeSelection.addEventListener('change', async (ev) => {
            let currentTheme = document.getElementById('current-theme');
            currentTheme.href = ev.target.value+'.css'
            db.settings.update(0, {
						theme: ev.target.value
					});
        });

        let folderIdShow = document.getElementById('#display-fid');
        folderIdShow.addEventListener('change', async (ev) => {
            db.settings.update(0, {
                displayfid: ev.target.value
            });
        });
    });
</script>

<svelte:head>
    <title>milkbox</title>
</svelte:head>

<form>
    <label for="theme">Theme:</label>
    <select name="theme" id="#themes">
        <option value="" selected disabled hidden>Choose Theme</option>
        <option value="dark-theme">Dark Theme</option>
        <option value="dark-gold-theme">Dark Gold Theme</option>
        <option value="darker-dark-theme">Darker Dark Theme</option>
        <option value="light-theme">Light Theme</option>
        <option value="silver-theme">Silver Theme</option>
    </select>
    <br>
    <label for="display-id">Display Folder ID (next to file name):</label>
    <select name="display-id" id="#display-fid">
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
</form>
  