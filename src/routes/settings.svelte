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
        let largerPreviews = document.getElementById('#larger-previews');
        largerPreviews.addEventListener('change', async (ev) => {
            db.settings.update(0, {
                largerpreviews: ev.target.value
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
                let largerPreviews = document.getElementById('#larger-previews').getElementsByTagName('option');
                for (let i = 0; i < largerPreviews.length; i++) {
                    if (USR.largerpreviews == largerPreviews[i].value){
                        largerPreviews[i].setAttribute('selected', true);
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
<div class="mx-8 leading-loose">
    <form>
        <label for="theme"><b>Theme:</b></label>
        <select name="theme" id="#themes">
            <option value="dark-theme">Dark Theme</option>
            <option value="dark-gold-theme">Dark Gold Theme</option>
            <option value="darker-dark-theme">Darker Dark Theme</option>
            <option value="light-theme">Light Theme</option>
            <option value="silver-theme">Silver Theme</option>
        </select>
    </form>
    <hr>
    <form>
        <label for="display-Fid"><b>Display Folder/File IDs:</b></label>
        <select name="display-Fid" id="#display-fid">
            <option value="yes">Yes</option>
            <option value="no">No</option>
        </select>
    </form>
    <hr>
    <form>
        <label for="larger-previews"><b>Display Larger Previews:</b></label>
        <select name="larger-previews" id="#larger-previews">
            <option value="yes">Yes</option>
            <option value="no">No</option>
        </select>
    </form>
</div>