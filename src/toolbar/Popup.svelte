<script lang="ts">
    let enabled = $state(false)

    chrome.storage.local.get(['enabled']).then((result) => {
        if (Boolean(result.enabled)) {
            enabled = true
        }
    })

    function onclick () {
        chrome.storage.local.get(['enabled']).then((result) => {
            console.log(result)
        })
        chrome.storage.local.set({enabled: Boolean(!enabled)}).then(value => {
            enabled = !enabled
        })
    }

</script>

<button {onclick}>{ enabled ? 'DISABLE' : 'ENABLE' }</button>