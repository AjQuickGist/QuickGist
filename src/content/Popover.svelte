<script lang="ts">
    import {Action, type Gist} from '../common/common';
    import {onMount} from "svelte";

    interface Props {
        gist: Gist
        close: Function
    }

    let {gist, close}: Props = $props()
    let left = $state(0)
    let top = $state(0)
    let isAnchored = $state(true)
    let isDragging = $state(false)


    let popover: HTMLDivElement
    const anchor = gist.metadata!.anchor!
    const clickEv = gist.metadata!.click!
    let anchorRect = anchor.getBoundingClientRect()

    const anchorOffset = {
        x: clickEv.clientX - anchorRect.left,
        y: clickEv.clientY - anchorRect.top
    }

    let xOffset = 0
    let yOffset = 0

    let screenXOffset = clickEv.screenX - clickEv.clientX
    let screenYOffset = clickEv.screenY - clickEv.clientY

    onMount(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            updatePreview()
        })

        resizeObserver.observe(popover)

        chrome.runtime.sendMessage({
            action: Action.CREATE,
            gistId: gist.id,
            url: gist.url,
            position: {
                left: clickEv.screenX,
                top: clickEv.screenY + 35
            }
        })
    })

    const updatePosition = () => {
        anchorRect = anchor.getBoundingClientRect()
        left = anchorRect.left + anchorOffset.x
        top = anchorRect.top + anchorOffset.y
    }

    function onMouseDown(event: MouseEvent) {
        isDragging = true
        xOffset = popover.offsetLeft - event.clientX
        yOffset = popover.offsetTop - event.clientY

        chrome.runtime.sendMessage({
            action: Action.MOVE_START,
            gistId: gist.id
        })

        updatePreview(event)
        event.preventDefault()
    }

    function onMouseUp(event: MouseEvent) {
        updatePreview(event)
    }

    function updatePreview(event?: MouseEvent) {
        if (event) {
            screenXOffset = event.screenX - event.clientX
            screenYOffset = event.screenY - event.clientY
        }

        const boundingRect = popover.getBoundingClientRect()
        chrome.runtime.sendMessage({
            action: Action.MOVE,
            gistId: gist.id,
            position: {
                left: (boundingRect.height > 50 ? boundingRect.right : boundingRect.left) + screenXOffset,
                top: (boundingRect.height > 50 ? boundingRect.top : boundingRect.bottom) + screenYOffset
            }
        })
    }

    document.addEventListener('scroll', e => {
        if (isAnchored) {
            updatePosition()
            updatePreview()
        }
    })

    document.addEventListener('mousemove', (ev: MouseEvent) => {
        if (isDragging) {
            isAnchored = false
            left = ev.clientX + xOffset
            top = ev.clientY + yOffset
            updatePreview(ev)
        }
    })

    document.addEventListener('mouseup', (ev: MouseEvent) => {
        isDragging = false
    })


    function expandGist() {
        chrome.runtime.sendMessage({
            action: Action.EXPAND,
            gistId: gist.id
        })
        close()
    }

    function closeGist() {
        chrome.runtime.sendMessage({
            action: Action.CLOSE,
            gistId: gist.id
        })
        close()
    }

    updatePosition()
</script>

<style>

    .popover {
        position: absolute;
        border: none;

        font-family: Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif;
        font-weight: normal;

        width: 300px;

        display: flex;
        flex-direction: column;

        align-content: flex-start;
        align-items: stretch;
        justify-content: flex-start;
        justify-items: stretch;

        background: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);

        box-shadow: inset -1px -1px rgba(255, 255, 255, 0.1),
            inset 1px 1px rgba(255, 255, 255, 0.025),
            3px 2px 10px rgba(0, 0, 0, 0.25),
            inset 0 0 10px 5px rgba(255, 255, 255, 0.025),
            inset 0 0 40px 5px rgba(255, 255, 255, 0.025);

        padding: 4px;
        border-radius: 5px;
        transition: min-width 100ms ease, height 100ms ease;

        .summary {
            font-size: 0.75em;
        }

        * {
            background: transparent;
        }

        .menu {
            display: flex;
            flex-direction: row;
            align-content: flex-end;
            align-items: flex-start;
            cursor: grab;

            .loader {
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                padding: 0;

                .balls {
                    height: 1em;
                    aspect-ratio: 2.5;

                    background: no-repeat radial-gradient(farthest-side, #bd22d1 90%, #0000),
                    no-repeat radial-gradient(farthest-side, #2db9f9 90%, #0000),
                    no-repeat radial-gradient(farthest-side, #ffeb36 90%, #0000),
                    no-repeat radial-gradient(farthest-side, #2bb7a9 90%, #0000);

                    background-size: 20% 50%;
                    animation: wave 1s infinite linear alternate;
                }
            }

            &.dragging {
                cursor: grabbing;
            }

            * {
                height: 1.5em;
            }

            button {
                border: none;
                cursor: pointer;
            }

            .expand svg {
                stroke: black;

                &:hover {
                    stroke: gray;
                }
            }

            .close svg {
                fill: black;

                &:hover {
                    fill: gray;
                }
            }

            .logo {
                margin-right: auto;
                aspect-ratio: 1;
            }
        }
    }

    @keyframes wave {
        0%,
        5% {
            background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%
        }
        12.5% {
            background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%
        }
        25% {
            background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 0, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%
        }
        37.5% {
            background-position: calc(0 * 100% / 3) 100%, calc(1 * 100% / 3) 0, calc(2 * 100% / 3) 0, calc(3 * 100% / 3) 50%
        }
        50% {
            background-position: calc(0 * 100% / 3) 100%, calc(1 * 100% / 3) 100%, calc(2 * 100% / 3) 0, calc(3 * 100% / 3) 0
        }
        62.5% {
            background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 100%, calc(2 * 100% / 3) 100%, calc(3 * 100% / 3) 0
        }
        75% {
            background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 100%, calc(3 * 100% / 3) 100%
        }
        87.5% {
            background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 100%
        }
        95%,
        100% {
            background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%
        }
    }

</style>

<div bind:this={popover} class="popover"
     onmouseup={onMouseUp}
     style="left: {left}px; top: {top}px;">
    <div class="menu" class:dragging={isDragging} onmousedown={onMouseDown}>
        <img class="logo" src="{chrome.runtime.getURL('icons/logo.svg')}"
             alt=""/>
        {#if !gist.analysis}
            <div class="loader">
                <div class="balls"></div>
            </div>
        {/if}
        <button class="expand" onclick={expandGist} aria-label="expand">
            <svg class="gist-exp-svg" xmlns="http://www.w3.org/2000/svg"
                 width="100%" height="100%"
                 fill="none"
                 viewBox="0 0 24 24">
                <path
                        d="M20 4L12 12M20 4V8.5M20 4H15.5M19 12.5V16.8C19 17.9201 19 18.4802 18.782 18.908C18.5903 19.2843 18.2843 19.5903 17.908 19.782C17.4802 20 16.9201 20 15.8 20H7.2C6.0799 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4 18.4802 4 17.9201 4 16.8V8.2C4 7.0799 4 6.51984 4.21799 6.09202C4.40973 5.71569 4.71569 5.40973 5.09202 5.21799C5.51984 5 6.07989 5 7.2 5H11.5"
                        stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"/>
            </svg>
        </button>
        <button class="close" onclick={closeGist} aria-label="close">
            <svg class="gist-close-svg"
                 xmlns="http://www.w3.org/2000/svg"
                 width="100%"
                 height="100%" viewBox="0 0 1024 1024">
                <path
                        d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/>
            </svg>
        </button>
    </div>
    {#if gist.analysis && gist.analysis.summary}
        <div class="summary">{gist.analysis.summary}</div>
    {/if}
    <div class="content"></div>
</div>