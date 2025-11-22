import { cn } from "@/lib/utils";
import React from "react";

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed top-0 bottom-0 end-0 start-0 z-40 bg-black/30 bg-opacity-30 flex justify-center items-center"
      id="modal-backdrop"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  );
}

function DialogContent({
  children,
  onOpenChange,
  className,
}: {
  children: React.ReactNode;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg  shadow-lg w-full max-w-4xl max-h-[90vh]  overflow-auto p-6 relative flex flex-col gap-5",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
      id="modal-content"
    >
      <span className="absolute top-4 end-4 w-6 h-6 cursor-pointer  rounded-md flex justify-center items-center">
        <button
          className="text-gray-500 hover:text-gray-700 text-xl"
          id="modal-close-btn"
          onClick={() => onOpenChange(false)}
        >
          &times;
        </button>
      </span>
      {children}
    </div>
  );
}

function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id="title" className={cn("", className)}>
      {children}
    </div>
  );
}

function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id="modal-footer" className={cn("", className)}>
      {children}
    </div>
  );
}

export { Dialog, DialogContent, DialogTitle, DialogFooter };
