import React, { useEffect, useState } from "react";

import { useComments, useAddComment } from "./Hooks";

import { useSelectedElements } from "../shared/Hooks";

export default function CommentsTab() {
  const { comments, isLoading, error } = useComments();

  const selectedElements = useSelectedElements();

  const [commentsSelected, setCommentsSelected] = useState([]);

  useEffect(() => {
    if (!comments) return;

    setCommentsSelected(comments.filter(comment => selectedElements.includes(comment.elementId)));
  }, [selectedElements, comments]);

  const addComment = useAddComment();

  const [ inputValue, setInputValue ] = useState("");

  return <div className="comments-tab">
    {isLoading ? (
      <p>Loading comments...</p>
    ) : (selectedElements.length === 1 && commentsSelected.length === 0) ? (
      <p>No comments available for element {selectedElements[0]}</p>
    ) : (!selectedElements.length) ? (
      <p>No elements selected</p>
    ) : (selectedElements.length > 1) ? (
      <p>Multiple elements selected</p>
    ) : (
      commentsSelected.map((comment, index) => (
        <div key={index} className="comment">
          <p><strong>{comment.author}</strong>: {comment.text}</p>
          <p>Element ID: {comment.elementId}</p>
        </div>
      ))
    )}
    {
      selectedElements.length === 1 && (
        <>
          <input type="text" value={ inputValue } onChange={({ target }) => setInputValue(target.value)} />
          <button onClick={() => {
            const comment = { elementId: selectedElements[0], text: inputValue, author: "John Doe" };

            setInputValue("");

            addComment(comment);
          }}>
            Add Comment
          </button>
        </>
      )
    }
  </div>;
}