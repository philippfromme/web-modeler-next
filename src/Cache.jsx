import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const cache = useRef(new Map());
  const subscribers = useRef(new Set());

  const setCacheData = (key, value) => {
    cache.current.set(key, value);

    // console.log('setting cache', key, value);

    subscribers.current.forEach((callback) => callback(key, value));
  };

  const getCacheData = (key) => {
    // console.log('getting cache', key, cache.current.get(key));

    return cache.current.get(key);
  };

  const subscribe = (callback) => {
    subscribers.current.add(callback);

    return () => unsubscribe(callback);
  };

  const unsubscribe = (callback) => {
    subscribers.current.delete(callback);
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

  const [data, setData] = useState(getCacheData(key));

  const [isLoading, setIsLoading] = useState(!data);

  const [error, setError] = useState(null);

  useEffect(() => {
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