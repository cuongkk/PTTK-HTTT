import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  details?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  details,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      iconBg: "bg-red-100",
      btn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      iconBg: "bg-yellow-100",
      btn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      iconBg: "bg-blue-100",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const s = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${s.iconBg}`}>
              {s.icon}
            </div>
            <div className="pt-1">
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          {details && (
            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              {details}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${s.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-like helper to manage confirm dialog state.
 * Usage:
 *   const [confirmState, setConfirmState] = useConfirmDialog();
 */
export function useConfirmState() {
  return {
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  };
}
