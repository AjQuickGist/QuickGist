<script lang="ts">
    import {type Gist} from "../common/common";
    import Popover from "./Popover.svelte";
    import CtrlFrame from "./CtrlFrame.svelte";

    interface Props {
        tabId: number,
        gists: Gist[]
    }

    let {tabId, gists}: Props = $props()

    function close(gistId: string) {
        const index = gists.findIndex(gist => gist.id === gistId)
        if (index !== -1) {
            gists.splice(index, 1)
        }
    }

</script>

<CtrlFrame {tabId}/>

{#each gists as gist (gist.id)}
    <Popover {gist} close={() => {close(gist.id)}}></Popover>
{/each}