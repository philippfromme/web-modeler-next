import React, { createContext, useContext, useState } from "react";

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());

  const setCacheData = (key, value) => {
    setCache((prevCache) => new Map(prevCache.set(key, value)));
  };

  const getCacheData = (key) => {
    return cache.get(key);
  };

  return (
    <CacheContext.Provider value={{ cache, setCacheData, getCacheData }}>
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
