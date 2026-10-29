import React from "react";
import { t } from "@stores";

type SelectorProps = {
  label: TranslationKeys | string;
  id: string;
  onchange?: (e: { target: HTMLSelectElement }) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  children: React.ReactNode;
};

export function Selector(props: SelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onChange) props.onChange(e);
    if (props.onchange) props.onchange({ target: e.target });
  };

  return (
    <span>
      <label htmlFor={props.id}>{t(props.label as TranslationKeys)}</label>
      <select id={props.id} onChange={handleChange} value={props.value}>
        {props.children}
      </select>
    </span>
  );
}
