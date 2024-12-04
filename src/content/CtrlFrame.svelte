<script lang="ts">

    interface Props {
        tabId: number,
    }

    let {tabId}: Props = $props()

    const CTRL_FRAME_FILE_PATH = 'content/ctrlframe.html'

    const iframeSrc = new URL(chrome.runtime.getURL(CTRL_FRAME_FILE_PATH))
    iframeSrc.searchParams.append('tabId', tabId.toString())

    function onFrameLoad() {

    }
    chrome.runtime.onMessage.addListener((message) => {

    })
</script>

<style>
    iframe {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        border: none;
        display: none;
    }
</style>

<iframe onload={onFrameLoad} title="QuickGist"
        src="{iframeSrc.toString()}"></iframe>
