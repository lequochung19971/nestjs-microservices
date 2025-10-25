import { toast } from "sonner";

export const useToast = () => {
  return {
    toast,
    // Provide direct methods for common toast patterns
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    loading: (message: string) => toast.loading(message),
    dismiss: toast.dismiss,
    custom: toast.custom,
  };
};
