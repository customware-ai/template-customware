import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

/** Keep recovery subscriptions outside hot-replaced route modules. */
export function useDevelopmentErrorRecovery(): void {
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  useEffect((): (() => void) | undefined => {
    const hot = import.meta.hot;
    if (!hot) return;
    const recover = (): void => {
      void navigate({ pathname, search, hash }, { replace: true, preventScrollReset: true });
    };
    hot.on("vite:afterUpdate", recover);
    return (): void => hot.off("vite:afterUpdate", recover);
  }, [navigate, pathname, search, hash]);
}
