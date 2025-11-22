import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Product } from "@/types";

const items = [
  { id: 1, name: "haroun 1" },
  { id: 2, name: "nori 2" },
  { id: 3, name: "rachid 3" },
  { id: 4, name: "ishak 4" },
  { id: 5, name: "mohamed 5" },
  { id: 6, name: "youssef 6" },
  { id: 7, name: "amine 7" },
  { id: 8, name: "salah 8" },
  { id: 9, name: "karim 9" },
];
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
type PropsData = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  loadOptions: (searchQuery?: string) => Promise<Product[]>;
};

const InputSearch = React.forwardRef<HTMLInputElement, InputProps & PropsData>(
  (
    { className, type, searchTerm, setSearchTerm, loadOptions, ...props },
    ref
  ) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [options, setOptions] = useState<Product[]>(items);

    useEffect(() => {
      loadOptions(searchTerm).then((data) => setOptions(data));
    }, [searchTerm]);

    return (
      <div className="relative">
        <input
          type={type || "text"}
          className={cn("", className)}
          value={searchTerm}
          onInput={() => {
            setIsOpen(true);
            setSelectedItem("");
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              const currentIndex = options.findIndex(
                (item) => item.name === selectedItem
              );
              const nextIndex = (currentIndex + 1) % options.length;
              divRef.current?.children[nextIndex].scrollIntoView({
                block: "nearest",
              });
              setSelectedItem(options[nextIndex].name);
            }
            if (e.key === "ArrowUp") {
              const currentIndex = options.findIndex(
                (item) => item.name === selectedItem
              );
              const prevIndex =
                (currentIndex - 1 + options.length) % options.length;
              divRef.current?.children[prevIndex].scrollIntoView({
                block: "nearest",
              });
              setSelectedItem(options[prevIndex].name);
            }
            if (e.key === "Enter") {
              if (options.length === 0) {
              }
              setSearchTerm(selectedItem || e.currentTarget.value);
              setIsOpen(false);
            }
          }}
          autoComplete="off"
          ref={ref}
          {...props}
        />
        <span
          className="absolute top-2 left-3 text-gray-400 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          🔍
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
                  selectedItem === item.name && "bg-gray-200"
                )}
                onMouseDown={() => {
                  setSearchTerm(item.name);
                  setIsOpen(false);
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
InputSearch.displayName = "InputSearch";

export default InputSearch;
