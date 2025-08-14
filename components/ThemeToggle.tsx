"use client";
import React from "react";

function applyTheme(dark:boolean){
  const root = document.documentElement;
  if (dark) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle(){
  const [dark, setDark] = React.useState(false);

  React.useEffect(()=>{
    const stored = localStorage.getItem("theme");
    if (stored === "dark") setDark(true);
    else if (stored === "light") setDark(false);
    else {
      const prefers = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(prefers);
    }
  }, []);

  React.useEffect(()=>{
    applyTheme(dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={()=>setDark(v=>!v)}
      title={dark ? "切换为浅色" : "切换为深色"}
      className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
    >
      {dark ? "☾ 深色" : "☼ 浅色"}
    </button>
  );
}
