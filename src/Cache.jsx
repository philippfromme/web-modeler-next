import React, { createContext, useContext, useState } from "react";

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  const [subscribers, setSubscribers] = useState(new Set());

  const setCacheData = (key, value) => {
    setCache((prevCache) => new Map(prevCache.set(key, value)));

    subscribers.forEach((callback) => callback(key, value));
  };

  const getCacheData = (key) => {
    return cache.get(key);
  };

  const subscribe = (callback) => {
    setSubscribers((prevSubscribers) => new Set(prevSubscribers.add(callback)));
    return () => setSubscribers((prevSubscribers) => new Set([...prevSubscribers].filter((cb) => cb !== callback)));
  };

  const unsubscribe = (callback) => {
    setSubscribers((prevSubscribers) => new Set([...prevSubscribers].filter((cb) => cb !== callback)));
  };

  return (
    <CacheContext.Provider value={{ cache, setCacheData, getCacheData, subscribe, unsubscribe }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);

  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
};

export const useFetchWithCache = (key, fetchFunction) => {
  const { getCacheData, setCacheData } = useCache();

  const [data, setData] = React.useState(getCacheData(key));

  const [isLoading, setIsLoading] = React.useState(!data);

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!data) {
      setIsLoading(true);

      fetchFunction()
        .then((result) => {
          setData(result);
          setCacheData(key, result);
        })
        .catch((err) => setError(err))
        .finally(() => setIsLoading(false));
    }
  }, [key, fetchFunction, data, setCacheData]);

  return { data, isLoading, error };
};