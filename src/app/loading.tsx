"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/Common/Spinner";

export default function GlobalLoading() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300); // avoid flash on quick transitions
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
      <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-white shadow">
        <Spinner size={20} />
        <span className="text-sm text-gray-700">로딩 중…</span>
      </div>
    </div>
  );
}

