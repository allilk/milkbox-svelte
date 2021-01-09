<script>
    // import {darkmode} from './stores';
    import { writable } from "svelte/store";
    import { onMount, beforeUpdate } from 'svelte';

    // import {onMount} from 'svelte';
    export let darkmode;
    onMount(()=>{
        darkmode = writable(localStorage.getItem("darkmode"));
        darkmode.subscribe(val => localStorage.setItem("darkmode", val));
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const darkModeEnabled = darkModeQuery.matches

        darkModeQuery.addListener(event => {
            console.log('Theme changed to:', event.matches ? 'dark' : 'light')
        })

    })
    // onMount(() => {
    //     console.log(localStorage.getItem("darkmode"))
    // })
    function toggleDarkMode(){
            if ($darkmode == false){
                darkmode.update(n => true);
            } else {
                darkmode.update(n => false);
            };
        }
    
</script>

<svelte:head>
    <title>milkbox</title>
</svelte:head>
{#if process.browser}
    {#if $darkmode == true}
    <style>
        body{
            background-color: grey;
        }
    </style>
    {:else if $darkmode == false}
    <style>
        body{
            background-color: red;
        }
    </style>
    {/if}
{/if}


<input bind:value={$darkmode}>
<button on:click={toggleDarkMode}>Enable Dark Mode</button>

