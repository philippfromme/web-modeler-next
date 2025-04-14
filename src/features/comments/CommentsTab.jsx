import React from 'react';

import { useComments, useAddComment } from './Hooks';

export default function CommentsTab() {
  const { comments, isLoading, error } = useComments();

  const addComment = useAddComment();

  return <div className="comments-tab">
    {isLoading ? (
      <p>Loading comments...</p>
    ) : comments.length === 0 ? (
      <p>No comments available.</p>
    ) : (
      comments.map((comment, index) => (
        <div key={index} className="comment">
          <p><strong>{comment.author}</strong>: {comment.text}</p>
          <p>Element ID: {comment.elementId}</p>
        </div>
      ))
    )}
    <button onClick={() => addComment({ elementId: 'Task_1', text: 'Foobar', author: 'John Doe' })}>
      Add Comment
    </button>
  </div>;
}