<script>
    import {onMount} from 'svelte';
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
        })
        async function setDefault(){
            db.settings.where('user').equals(0).toArray().then(async function(res){
                let USR = res[0];
                // Set default theme
                let optionList = document.getElementById('#themes').getElementsByTagName('option');
                for (let i = 0; i < optionList.length; i++) {
                    if (USR.theme == optionList[i].value){
                        optionList[i].setAttribute('selected', true);
                    }
                }
                // Set default display folder id
                let displayOList = document.getElementById('#display-fid').getElementsByTagName('option');
                for (let i = 0; i < displayOList.length; i++) {
                    if (USR.displayfid == displayOList[i].value){
                        displayOList[i].setAttribute('selected', true);
                    }
                }
            })
        }
        setDefault()
    });

</script>

<svelte:head>
    <title>milkbox</title>
</svelte:head>
<form>
    <label for="theme">Theme:</label>
    <select name="theme" id="#themes">
        <option value="dark-theme">Dark Theme</option>
        <option value="dark-gold-theme">Dark Gold Theme</option>
        <option value="darker-dark-theme">Darker Dark Theme</option>
        <option value="light-theme">Light Theme</option>
        <option value="silver-theme">Silver Theme</option>
    </select>
    <br>
    <label for="display-Fid">Display Folder ID (next to file name):</label>
    <select name="display-Fid" id="#display-fid">
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
</form>