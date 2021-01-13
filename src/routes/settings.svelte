<script>
    import {onMount} from 'svelte';
    import db from './drive/connection';
    onMount(async ()=>{
        let themeSelection = document.getElementById('themes');
        themeSelection.addEventListener('change', async (ev) => {
            console.log(ev.target.value)
            let currentTheme = document.getElementById('current-theme');
            currentTheme.href = ev.target.value+'.css'
            await db.settings.where("user").equals(0).modify({theme: ev.target.value});

        });
    });
</script>

<svelte:head>
    <title>milkbox</title>
</svelte:head>

<form>
    <label for="theme">Theme:</label>
    <select name="theme" id="themes">
      <option value="dark-theme">Dark Theme</option>
      <option value="dark-gold-theme">Dark Gold Theme</option>
      <option value="darker-dark-theme">Darker Dark Theme</option>
      <option value="light-theme">Light Theme</option>
      <option value="silver-theme">Silver Theme</option>
    </select>
</form>
  