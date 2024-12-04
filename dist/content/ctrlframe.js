(()=>{"use strict";var e;!function(e){e[e.WHOAMI=0]="WHOAMI",e[e.CREATE=1]="CREATE",e[e.CLOSE=2]="CLOSE",e[e.SHOW=3]="SHOW",e[e.EXPAND=4]="EXPAND",e[e.HIDE=5]="HIDE",e[e.MOVE_START=6]="MOVE_START",e[e.MOVE=7]="MOVE",e[e.ANALYZE=8]="ANALYZE",e[e.ANALYSIS=9]="ANALYSIS",e[e.SUMMARIZE=10]="SUMMARIZE"}(e||(e={}));const t=new URLSearchParams(window.location.search),o=Number.parseInt(t.get("tabId")),i=new Map,a=new Map;function n(t){return chrome.tabs.sendMessage(t,{action:e.ANALYZE})}chrome.runtime.onMessage.addListener(((t,d,s)=>{var r,c,h,m;if(!(null===(r=d.tab)||void 0===r?void 0:r.id))return;if(a.has(d.tab.id))t.action,e.ANALYSIS;else if(d.tab.id!==o)return;if(t.action==e.CREATE)return c=t.gistId,h=t.url,m=t.position,void chrome.windows.create({top:Math.round(m.top),left:Math.round(m.left),width:400,height:500,url:h,type:"panel"},(t=>{var d,s;const r=null===(s=null===(d=null==t?void 0:t.tabs)||void 0===d?void 0:d[0])||void 0===s?void 0:s.id;if(!t||!r)throw new Error;const h={winId:t.id,tabId:r,moveWidth:t.width,moveHeight:t.height};i.set(c,h),a.set(r,c),addEventListener("beforeunload",(e=>{chrome.windows.remove(t.id)})),addEventListener("visibilitychange",(e=>{document.hidden&&chrome.windows.update(t.id,{state:"minimized"})})),chrome.tabs.onUpdated.addListener(((t,i,a)=>{t===r&&("complete"==i.status&&function(t,i){n(t).then((t=>{chrome.tabs.sendMessage(o,{action:e.ANALYSIS,gistId:i,analysis:t})}))}(r,c),"loading"==i.status&&chrome.tabs.setZoomSettings(r,{mode:"automatic",scope:"per-tab",defaultZoomFactor:.3}).then((()=>{chrome.tabs.setZoom(r,.3)})))}))}));const w=i.get(t.gistId);if(!w)return;const u=w.winId;switch(t.action){case e.CLOSE:chrome.windows.remove(w.winId);break;case e.SHOW:chrome.windows.update(u,{focused:!0});break;case e.EXPAND:chrome.tabs.get(o).then((e=>{chrome.tabs.move(w.tabId,{index:e.index+1,windowId:e.windowId}).then((e=>{chrome.tabs.setZoom(w.tabId,1)}))}));break;case e.MOVE_START:chrome.windows.get(u).then((e=>{w.moveWidth=e.width,w.moveHeight=e.height}));break;case e.MOVE:chrome.windows.update(u,{focused:!0,left:Math.floor(t.position.left),top:Math.floor(t.position.top),width:w.moveWidth,height:w.moveHeight}).catch((e=>{chrome.windows.update(u,{state:"minimized"})}));break;case e.HIDE:chrome.windows.update(w.winId,{state:"minimized"});break;case e.ANALYZE:n(w.tabId).then((e=>{s(e)}));break;default:return!1}return!0}))})();
//# sourceMappingURL=ctrlframe.js.map