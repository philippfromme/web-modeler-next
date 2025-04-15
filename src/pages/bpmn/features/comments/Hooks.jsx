import { useEffect, useState } from "react";

import { useCache, useFetchWithCache } from "../../../../Cache";

import { fetchComments, postComment } from "../../../../Backend";

export const useComments = () => {
  const { data, isLoading, error } = useFetchWithCache("comments", fetchComments);

  const { getCacheData, subscribe, unsubscribe } = useCache();

  const [ comments, setComments ] = useState(getCacheData("comments") || []);

  useEffect(() => {
    const unsubscribe = subscribe((key, value) => {
      if (key === "comments") {
        setComments(value);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ subscribe, unsubscribe ]);

  useEffect(() => {
    if (data) {
      setComments(data);
    }
  }, [ data ]);

  return { comments, isLoading, error };
};

export const useAddComment = () => {
  const { setCacheData, getCacheData } = useCache();

  return async (newComment) => {
    const key = "comments";

    const prevComments = getCacheData(key) || [];

    // optimistic update
    const tempComment = { ...newComment, id: Date.now() };

    setCacheData(key, [...prevComments, tempComment]);

    try {

      // post to server
      await postComment(tempComment);

      // refetch in background
      const updatedComments = await fetchComments();

      setCacheData(key, updatedComments);
    } catch (err) {
      console.error(err);

      // rollback
      setCacheData(key, prevComments);
    }
  };
};