import { useCache, useFetchWithCache } from "../../Cache";

export const useComments = () => {
  const { data: comments, isLoading, error } = useFetchWithCache('comments', fetchComments);
  
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

const comments = [
  {
    elementId: 'StartEvent_1',
    text: 'This is a comment',
    author: 'John Doe',
  },
  {
    elementId: 'Task_2',
    text: 'This is another comment',
    author: 'Jane Doe',
  },
];

// mocks
function fetchComments() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(comments);
    }, 1000);
  });
}

function postComment(comment) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      if (Math.random() < 0.333) {
        comments.push(comment);

        resolve(comment);
      } else {
        window.alert("Failed to post comment");

        reject(new Error("Failed to post comment"));
      }
    }, 1000);
  });
}