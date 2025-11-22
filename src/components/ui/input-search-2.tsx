import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Customer } from "@/types";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

type PropsData = {
  idValue: number;
  onValueChange: (value: number) => void;
  loadOptions: (searchQuery?: string) => Promise<Customer[]>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

const InputSearch2 = React.forwardRef<HTMLInputElement, InputProps & PropsData>(
  (
    {
      className,
      type,
      idValue,
      onValueChange,
      loadOptions,
      searchTerm,
      setSearchTerm,
      ...props
    },
    ref
  ) => {
    const divRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<number>();
    const [options, setOptions] = useState<Customer[]>([]);

    // 🔹 Load options when search changes
    useEffect(() => {
      let active = true;

      loadOptions(searchTerm).then((data) => {
        if (!active) return;

        setOptions(data);

        // sync selected name from idValue (only when searchTerm = "")
        if (searchTerm === "") {
          const selected = data.find((item) => item.id === idValue);
          if (selected) {
            setSearchTerm(selected.name);
          }
        }
      });

      return () => {
        active = false;
      };
    }, [searchTerm, idValue]);

    return (
      <div className="relative">
        <input
          type={type || "text"}
          className={cn("", className)}
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedItem(undefined);
            onValueChange(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              const currentIndex = options.findIndex(
                (item) => item.id === selectedItem
              );
              const nextIndex = (currentIndex + 1) % options.length;
              setSelectedItem(options[nextIndex].id);
              divRef.current?.children[nextIndex].scrollIntoView({
                block: "nearest",
              });
            }

            if (e.key === "ArrowUp") {
              const currentIndex = options.findIndex(
                (item) => item.id === selectedItem
              );
              const prevIndex =
                (currentIndex - 1 + options.length) % options.length;
              setSelectedItem(options[prevIndex].id);
              divRef.current?.children[prevIndex].scrollIntoView({
                block: "nearest",
              });
            }

            if (e.key === "Enter") {
              const selected = options.find((item) => item.id === selectedItem);
              if (selected) {
                onValueChange(selected.id);
                setSearchTerm(selected.name);
              }
              setSelectedItem(undefined);
              setIsOpen(false);
            }
          }}
          autoComplete="off"
          ref={ref}
          {...props}
        />

        {/* search icon */}
        <span
          className="absolute top-2 end-3 text-gray-400 cursor-pointer"
          onMouseDown={() => setIsOpen((v) => !v)}
        >
          🔍
        </span>

        <span className="absolute top-2 end-10  cursor-pointer">
          {(() => {
            const selected = options.find((item) => item.id === idValue);
            if (selected?.total_debt && selected.total_debt > 0) {
              return `مدين بـ ${selected.total_debt.toFixed(2)}`;
            }
            return null;
          })()}
        </span>

        {isOpen && (
          <div
            ref={divRef}
            className="border p-2 absolute w-full rounded translate-y-1 card max-h-96 overflow-y-auto z-10"
          >
            {options.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "hover:bg-gray-100 p-2 rounded cursor-pointer",
                  selectedItem === item.id && "bg-gray-200"
                )}
                onMouseDown={() => {
                  onValueChange(item.id);
                  setSearchTerm(item.name);
                  setIsOpen(false);
                }}
              >
                {item.name} - {item.phone}
                {/* {item?.total_debt && (
                  <span className="text-red-600 font-medium mr-2">
                    (مدين بـ {item.total_debt.toFixed(2)})
                  </span>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

InputSearch2.displayName = "InputSearch2";
export default InputSearch2;
