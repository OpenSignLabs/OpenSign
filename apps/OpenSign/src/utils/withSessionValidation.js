import { sessionStatus } from "../redux/reducers/userReducer";
import { store } from "../redux/store";
import Parse from "parse";

export function withSessionValidation(fn) {
  return async (...args) => {
    try {
      const tenantId = localStorage.getItem("TenantId");
      const user =
        typeof Parse !== "undefined" ? Parse.User?.current?.() : null;
      const sessionToken = user?.getSessionToken?.();

      if (!tenantId || !sessionToken) {
        store.dispatch(sessionStatus(false));
        throw new Error("invalid session token");
      }

      return await fn(...args);
    } catch (error) {
      if (error?.message === "invalid session token") {
        console.error("invalid session or missing tenantId", error);
        store.dispatch(sessionStatus(false));
        return;
      } else {
        throw error; // important: don't silently swallow errors
      }
    }
  };
}
