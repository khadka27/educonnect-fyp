/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import EnhancedPostBox from "@/components/post/PostForm";
import Feeds from "@/components/post/PostList";

const PostPage = () => {
  const [post, setPosts] = useState<any[]>([]); // State to manage posts

  // Function to handle adding a new post
  const handleAddPost = (newPost: any) => {
    setPosts([newPost, ...post]); // Add the new post to the top of the list
  };

  return (
    <div >
      {/* Post Form for creating a new post */}
      <EnhancedPostBox onAddPost={handleAddPost} />

      {/* Post List to display posts */}
      <Feeds post={post} />
    </div>
  );
};

export default PostPage;
