(()=>{"use strict";var a;let e;!function(a){a[a.WHOAMI=0]="WHOAMI",a[a.CREATE=1]="CREATE",a[a.CLOSE=2]="CLOSE",a[a.SHOW=3]="SHOW",a[a.EXPAND=4]="EXPAND",a[a.HIDE=5]="HIDE",a[a.MOVE_START=6]="MOVE_START",a[a.MOVE=7]="MOVE",a[a.ANALYZE=8]="ANALYZE",a[a.ANALYSIS=9]="ANALYSIS",a[a.SUMMARIZE=10]="SUMMARIZE"}(a||(a={})),(async()=>{const a=await ai.summarizer.capabilities();a&&"no"!==a.available&&("readily"===a.available?e=await ai.summarizer.create({type:"tl;dr",format:"plain-text",length:"medium"}):(e=await ai.summarizer.create(),await e.ready))})(),chrome.runtime.onInstalled.addListener((()=>{chrome.storage.local.set({enabled:!0})})),chrome.runtime.onMessage.addListener(((t,i,r)=>{var n;switch(t.action){case a.WHOAMI:r({tabId:null===(n=i.tab)||void 0===n?void 0:n.id});break;case a.SUMMARIZE:const s=t.content;return e?(e.summarize(s.substring(0,4e3)).then((a=>{r(a)})),!0):s.substring(0,100)}}))})();
//# sourceMappingURL=service_worker.js.map