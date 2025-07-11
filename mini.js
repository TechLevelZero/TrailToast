class TrailToast{constructor(t={}){this.mouseX=0,this.mouseY=0,this.toastCounter=0,this.activeToasts=[],this.toastMap=new Map,this.options={moveDelay:1e3,fadeDelay:5e3,fadeOutDuration:500,toastHeight:60,toastWidth:220,topOffset:20,rightOffset:20,padding:"16px 24px",borderRadius:"12px",spawnAtCursor:!0,backgroundColor:"#fff",textColor:"#333",showProgress:!0,progressHeight:3,progressColor:"rgba(255, 255, 255, 0.8)",stackDirection:"vertical",pauseOnHover:!0,...t},this.init()}init(){document.addEventListener("mousemove",t=>{this.mouseX=t.clientX,this.mouseY=t.clientY}),this.injectStyles()}injectStyles(){let t="toast-notification-styles";if(document.getElementById(t))return;let e=`
    .toast-notification {
        position: fixed;
        border-radius: 12px;
        background: linear-gradient(45deg,rgb(245, 245, 245), #e0e0e0);
        color: #333;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-size: 16px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        min-width: 200px;
        text-align: center;
        transform: scale(0);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: inherit;
        overflow: hidden;
    }

    .toast-notification.show {
        transform: scale(1);
    }

    .toast-notification.moving {
        transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .toast-notification.fade-out {
        opacity: 0;
        transform: scale(0.8) translateY(-10px);
        transition: all 0.5s ease-out;
    }

    .toast-content {
        position: relative;
        z-index: 1;
    }

    .toast-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.8);
        width: 100%;
        transform-origin: left;
        transition: transform linear;
    }

    .toast-progress-bar.animate {
        transform: scaleX(0);
    }

    .toast-notification.paused .toast-progress-bar {
        animation-play-state: paused;
    }
`,o=document.createElement("style");o.id=t,o.textContent=e,document.head.appendChild(o)}show(t,e={}){this.toastCounter++;let o=this.toastCounter,s={...this.options},r=TrailToast.themes[e.theme]||TrailToast.themes.default,a={...s,...r,...e},i=document.createElement("div");i.className="toast-notification",i.dataset.toastId=o;let n=document.createElement("div");n.className="toast-content",n.textContent=t||`Toast Notification #${this.toastCounter}`,i.appendChild(n),i.contentWrapper=n,i.originalOptions=a,this.applyToastStyles(i,a),a.pauseOnHover&&this.addHoverFunctionality(i,a),a.showProgress&&this.addProgressBar(i,a),this.positionToast(i,a),document.body.appendChild(i),this.activeToasts.push(i);let l={id:o,element:i,fadeTimeout:null,options:a,update:(t,e={})=>{this.updateToast(o,t,e)},hide:()=>this.hide(o)};return this.toastMap.set(o,l),this.showToastWithAnimation(i,l,a),l}applyToastStyles(t,e){t.style.background=e.backgroundColor,t.style.color=e.textColor,t.style.borderColor=e.borderColor,t.style.padding=e.padding,t.style.borderRadius=e.borderRadius}addHoverFunctionality(t,e){t.addEventListener("mouseenter",()=>{if(t.classList.add("paused"),t.progressBar&&t.progressStartTime){let o=window.getComputedStyle(t.progressBar),s=o.transform,r=1;if(s&&"none"!==s){let a=s.match(/matrix\(([^)]+)\)/);if(a&&a[1]){let i=a[1].split(",");r=parseFloat(i[0])}}Date.now(),t.progressStartTime;let n=e.fadeDelay-50;t.progressRemainingTime=Math.max(0,n*r),t.progressBar.style.transitionDuration="0ms"}let l=this.toastMap.get(parseInt(t.dataset.toastId));l&&l.fadeTimeout&&clearTimeout(l.fadeTimeout)}),t.addEventListener("mouseleave",()=>{t.classList.remove("paused"),t.progressBar&&t.progressRemainingTime>0&&(t.progressBar.style.transitionDuration=t.progressRemainingTime+"ms",t.progressStartTime=Date.now(),requestAnimationFrame(()=>{t.progressBar.style.transform="scaleX(0)"}));let o=this.toastMap.get(parseInt(t.dataset.toastId));o&&t.progressRemainingTime>0&&(o.fadeTimeout=setTimeout(()=>{this.fadeOutToast(t,e)},t.progressRemainingTime))})}addProgressBar(t,e){let o=document.createElement("div");o.className="toast-progress-bar",o.style.height=e.progressHeight+"px",o.style.background=e.progressColor,t.appendChild(o),t.progressBar=o}positionToast(t,e){e.spawnAtCursor?(t.style.left=this.mouseX+"px",t.style.top=this.mouseY+"px"):(t.style.visibility="hidden",requestAnimationFrame(()=>{let o=t.offsetWidth,s=this.calculateToastPosition(this.activeToasts.length-1,e,t);t.style.left=window.innerWidth-s.right-o+"px",t.style.top=s.top+"px",t.style.visibility="visible"}))}showToastWithAnimation(t,e,o){setTimeout(()=>{if(t.classList.add("show"),o.showProgress&&t.progressBar){let e=o.fadeDelay-50;t.progressStartTime=Date.now(),t.progressRemainingTime=e,setTimeout(()=>{t.progressBar.style.transitionDuration=e+"ms",t.progressBar.classList.add("animate")},50)}},10),setTimeout(()=>{t.classList.add("moving"),setTimeout(()=>{this.moveToastToTopRight(t)},10)},o.moveDelay),this.setupFadeTimeout(t,e,o)}setupFadeTimeout(t,e,o){o.pauseOnHover,e.fadeTimeout=setTimeout(()=>{this.fadeOutToast(t,o)},o.fadeDelay)}fadeOutToast(t,e){t.classList.add("fade-out"),setTimeout(()=>{this.removeToast(t)},e.fadeOutDuration)}removeToast(t){t.parentNode&&t.parentNode.removeChild(t),this.activeToasts=this.activeToasts.filter(e=>e!==t);let e=parseInt(t.dataset.toastId);this.toastMap.delete(e),this.repositionRemainingToasts()}updateToast(t,e,o={}){let s=this.toastMap.get(t);if(!s){console.warn(`Toast with ID ${t} not found`);return}let r=s.element,a=s.options;s.fadeTimeout&&clearTimeout(s.fadeTimeout);let i={...a,...o};if(r.contentWrapper?r.contentWrapper.textContent=e:r.textContent=e,o.theme){let n=TrailToast.themes[o.theme]||TrailToast.themes.default,l={...i,...n};this.applyToastStyles(r,l),i.backgroundColor=l.backgroundColor,i.textColor=l.textColor,i.borderColor=l.borderColor,i.progressColor=l.progressColor,r.progressBar&&(r.progressBar.style.background=l.progressColor)}if(o.hasOwnProperty("spawnAtCursor")&&!1===o.spawnAtCursor&&r.style.transform&&this.moveToastToTopRight(r),r.progressBar&&i.showProgress){r.progressBar.classList.remove("animate"),r.progressBar.style.transitionDuration="0ms",r.progressBar.style.transform="scaleX(1)",r.progressBar.offsetHeight;let d=i.fadeDelay-50;r.progressStartTime=Date.now(),r.progressRemainingTime=d,r.progressBar.style.transitionDuration=d+"ms",requestAnimationFrame(()=>{r.progressBar.style.transform="scaleX(0)"})}s.options=i,s.fadeTimeout=setTimeout(()=>{this.fadeOutToast(r,i)},i.fadeDelay)}hide(t){let e=this.toastMap.get(t);if(!e)return;let o=e.element;e.fadeTimeout&&clearTimeout(e.fadeTimeout),this.fadeOutToast(o,e.options)}calculateToastPosition(t,e=this.options,o=null){let s="horizontal"===e.stackDirection,r=this.activeToasts.filter(t=>t.classList.contains("moving")&&!t.classList.contains("fade-out")),a=o?r.slice(0,r.indexOf(o)):r;if(s){let i=window.innerWidth-2*e.rightOffset,n=[],l=[[]],d=0,g=0;for(let p=0;p<t&&p<a.length;p++){let h=a[p].getBoundingClientRect(),$=h.width,c=h.height;d+$>i&&d>0?(n.push(d),d=$+10,g=c,l.push([c])):(d+=(d>0?10:0)+$,l[l.length-1].push(c),g=Math.max(g,c))}let u=e.topOffset+l.slice(0,l.length-1).reduce((t,e)=>t+Math.max(...e)+10,0),f=e.rightOffset,m=0;for(let T=0;T<t&&T<a.length;T++){let b=a[T],C=b.getBoundingClientRect(),y=C.width;m+y>i&&m>0?(m=y+10,f=e.rightOffset+y+10):(m+=(m>0?10:0)+y,f+=y+10)}return{top:u,right:f}}{let _=a.slice(0,t).reduce((t,e)=>t+e.getBoundingClientRect().height+15,0);return{top:e.topOffset+_,right:e.rightOffset}}}moveToastToTopRight(t){let e=this.activeToasts.filter(t=>t.classList.contains("moving")&&!t.classList.contains("fade-out")),o=e.indexOf(t),s=this.calculateToastPosition(o,this.options),r=t.getBoundingClientRect(),a=parseFloat(t.style.left),i=parseFloat(t.style.top),n=window.innerWidth-s.right-r.width,l=s.top;t.style.transform=`translate(${n-a}px, ${l-i}px)`}repositionRemainingToasts(){let t=this.activeToasts.filter(t=>t.classList.contains("moving")&&!t.classList.contains("fade-out"));t.forEach((t,e)=>{let o=this.calculateToastPosition(e,this.options),s=t.getBoundingClientRect(),r=parseFloat(t.style.left),a=parseFloat(t.style.top),i=window.innerWidth-o.right-s.width,n=o.top;t.style.transform=`translate(${i-r}px, ${n-a}px)`})}static themes={default:{backgroundColor:"linear-gradient(45deg, #f5f5f5, #e0e0e0)",textColor:"#333",borderColor:"rgba(255, 255, 255, 0.3)",progressColor:"rgba(100, 100, 100, 0.6)"},success:{backgroundColor:"linear-gradient(45deg,rgb(95, 179, 97),rgb(80, 153, 84))",textColor:"white",borderColor:"rgba(255, 255, 255, 0.3)",progressColor:"rgba(255, 255, 255, 0.8)"},error:{backgroundColor:"linear-gradient(45deg,rgb(245, 116, 107),rgb(206, 76, 76))",textColor:"white",borderColor:"rgba(255, 255, 255, 0.3)",progressColor:"rgba(255, 255, 255, 0.8)"},warning:{backgroundColor:"linear-gradient(45deg,rgb(255, 183, 76),rgb(255, 154, 53))",textColor:"white",borderColor:"rgba(255, 255, 255, 0.3)",progressColor:"rgba(255, 255, 255, 0.8)"},info:{backgroundColor:"linear-gradient(45deg,rgb(88, 180, 255), #1976D2)",textColor:"white",borderColor:"rgba(255, 255, 255, 0.3)",progressColor:"rgba(255, 255, 255, 0.8)"},dark:{backgroundColor:"linear-gradient(45deg, #424242, #212121)",textColor:"white",borderColor:"rgba(255, 255, 255, 0.2)",progressColor:"rgba(255, 255, 255, 0.6)"},light:{backgroundColor:"linear-gradient(45deg, #f5f5f5, #e0e0e0)",textColor:"#333",borderColor:"rgba(0, 0, 0, 0.1)",progressColor:"rgba(100, 100, 100, 0.6)"}};clearAll(){this.activeToasts.forEach(t=>{t.parentNode&&t.parentNode.removeChild(t)}),this.activeToasts=[],this.toastMap.clear()}getActiveCount(){return this.activeToasts.length}}"undefined"!=typeof module&&module.exports?module.exports=TrailToast:"function"==typeof define&&define.amd?define([],function(){return TrailToast}):window.TrailToast=TrailToast;