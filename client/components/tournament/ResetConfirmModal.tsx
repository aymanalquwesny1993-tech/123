import { AlertCircle } from "lucide-react";

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmModal({
  onConfirm,
  onCancel,
}: ResetConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Reset</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to start over? All tournament data will be lost.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Yes, Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
