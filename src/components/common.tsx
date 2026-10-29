import React from "react";

export function cn(
  ...classes: (
    | string
    | boolean
    | undefined
    | null
    | Record<string, boolean | undefined | null>
  )[]
): string {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") result.push(c);
    else if (typeof c === "object") {
      for (const [k, v] of Object.entries(c)) {
        if (v) result.push(k);
      }
    }
  }
  return result.join(" ");
}

export function Show({
  when,
  fallback = null,
  children,
}: {
  when: any;
  fallback?: React.ReactNode;
  children: React.ReactNode | ((val: any) => React.ReactNode);
}) {
  if (!when) return <>{fallback}</>;
  return <>{typeof children === "function" ? (children as Function)(when) : children}</>;
}

export function For<T>({
  each,
  fallback = null,
  children,
}: {
  each?: T[] | null;
  fallback?: React.ReactNode;
  children: (item: T, index: number) => React.ReactNode;
}) {
  if (!each || each.length === 0) return <>{fallback}</>;
  return <>{each.map((item, index) => children(item, index))}</>;
}
