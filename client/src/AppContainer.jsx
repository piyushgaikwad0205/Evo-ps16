import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./config/queryClient";
import createAppStore from "./redux/store";
import axios from "axios";
import CommonLoading from "./components/loader/CommonLoading";
import App from "./App";
import { getTitleFromRoute } from "./utils/docTitle";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { usePrefetch } from "./hooks/usePrefetch";

const ErrorComponent = ({ errorMessage }) => (
  <div className="text-red-500 font-bold text-center">{errorMessage}</div>
);

const AppWithPrefetch = () => {
  const { prefetchCommonRoutes } = usePrefetch();

  useEffect(() => {
    // Prefetch common routes in background after app loads
    const timer = setTimeout(() => {
      prefetchCommonRoutes();
    }, 2000);

    return () => clearTimeout(timer);
  }, [prefetchCommonRoutes]);

  return <App />;
};

const AppContainer = () => {
  const location = useLocation();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get("/server-status");
      } catch (err) {
        setError("Server is down. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    checkServerStatus();
  }, []);

  // Asynchronously initialize the Redux store, including data fetching and authentication,
  // while displaying a loading indicator. Making sure that the store is initialized with credentials and data before rendering the app.

  useEffect(() => {
    const initializeStore = async () => {
      try {
        const appStore = await createAppStore();
        setStore(appStore);
      } catch (err) {
        setError(`Error initializing the app: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeStore();
  }, []);

  if (loading || error || !store) {
    return (
      <div className="flex items-center justify-center h-screen">
        {loading ? <CommonLoading /> : <ErrorComponent errorMessage={error} />}
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Helmet>
          <title>{getTitleFromRoute(location.pathname)}</title>
        </Helmet>
        <AppWithPrefetch />
      </Provider>
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

export default AppContainer;
