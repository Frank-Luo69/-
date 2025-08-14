"use client";
import React from "react";

export function SWUpdateToast(){
  const [waiting, setWaiting] = React.useState<ServiceWorker|null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(()=>{
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then(reg=>{
      if (!reg) return;
      const listen = (reg: ServiceWorkerRegistration)=>{
        reg.addEventListener("updatefound", ()=>{
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", ()=>{
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              setWaiting(nw);
              setVisible(true);
            }
          });
        });
      };
      listen(reg);
      // 如果已经有 waiting 的 worker
      if (reg.waiting) { setWaiting(reg.waiting); setVisible(true); }
    });
    // 切换控制权后自动刷新
    navigator.serviceWorker.addEventListener("controllerchange", ()=>{
      window.location.reload();
    });
  }, []);

  const doUpdate = ()=>{
    if (waiting) waiting.postMessage({type:"SKIP_WAITING"});
  };

  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-xl border bg-white/95 dark:bg-neutral-800/95 px-4 py-2 shadow">
        <span className="text-sm mr-3">有新版本可用</span>
        <button onClick={doUpdate} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700">立即更新</button>
      </div>
    </div>
  );
}
