import { toast } from 'sonner'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function showToast(message, type = 'success', config = {}) {
    toast.custom(
        (t) => (
            <div
                className={`flex items-center gap-3 font-semibold text-base min-w-[280px] max-w-[400px] px-4 py-3 rounded-lg shadow-lg border border-brand-gold mt-24 mr-4 bg-brand-dark-2 text-white transition-all duration-300 animate-in slide-in-from-top cursor-pointer`}
                onClick={() => toast.dismiss(t)}
            >
                {type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-brand-gold shrink-0" />
                ) : (
                    <AlertTriangle className="w-6 h-6 text-brand-gold shrink-0" />
                )}
                <span>{message}</span>
            </div>
        ),
        {
            duration: 2500,
            position: 'top-right',
            ...config,
        }
    )
}
