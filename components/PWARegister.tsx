"use client";
import React from "react";

export function PWARegister(){
  React.useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  }, []);
  return null;
}
