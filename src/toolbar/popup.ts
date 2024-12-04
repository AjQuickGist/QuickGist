import {mount} from "svelte";
import Popup from "./Popup.svelte";

const mountpoint = document.getElementById('mount')!
const popup = mount(Popup, {
    target: mountpoint, props: {
        // @ts-ignore

    }
})