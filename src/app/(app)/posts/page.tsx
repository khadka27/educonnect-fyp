"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useDropzone } from "react-dropzone";
import { Document, Page } from "react-pdf";
import {
  Upload,
  Image,
  Link,
  Send,
  MessageCircle,
  Share2,
  Heart,
  Save,
  MoreVertical,
  Download,
  Eye,
  FileText,
  Paperclip,
  X,
} from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "react-share";
import { FacebookIcon, TwitterIcon, LinkedinIcon } from "react-share";

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  image?: string;
  file?: File;
  link?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  saved: boolean;
}

const PostPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postLink, setPostLink] = useState("");
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  const loadMorePosts = async () => {
    setLoading(true);
    // Simulating API call to fetch more posts
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newPosts: Post[] = [
      {
        id: posts.length + 1,
        author: "John Doe",
        content: "This is a new post content. What do you think?",
        likes: Math.floor(Math.random() * 100),
        comments: [
          {
            id: 1,
            author: "Alice",
            content: "Great post!",
            timestamp: "5 minutes ago",
          },
          {
            id: 2,
            author: "Bob",
            content: "I agree!",
            timestamp: "3 minutes ago",
          },
        ],
        shares: Math.floor(Math.random() * 10),
        saved: false,
      },
      {
        id: posts.length + 2,
        author: "Jane Smith",
        content: "Check out this amazing view!",
        image: "/placeholder.svg?height=300&width=400",
        likes: Math.floor(Math.random() * 100),
        comments: [
          {
            id: 1,
            author: "Charlie",
            content: "Wow, beautiful!",
            timestamp: "10 minutes ago",
          },
        ],
        shares: Math.floor(Math.random() * 10),
        saved: false,
      },
    ];
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    setLoading(false);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim() || postImage || postFile || postLink) {
      const newPost: Post = {
        id: posts.length + 1,
        author: "Current User",
        content: postContent,
        image: postImage ? URL.createObjectURL(postImage) : undefined,
        file: postFile || undefined,
        link: postLink || undefined,
        likes: 0,
        comments: [],
        shares: 0,
        saved: false,
      };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setPostContent("");
      setPostImage(null);
      setPostFile(null);
      setPostLink("");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0].type.startsWith("image/")) {
      setPostImage(acceptedFiles[0]);
    } else {
      setPostFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleLike = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleSave = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <form
        onSubmit={handlePostSubmit}
        className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
      >
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind? Ask a question or share something interesting!"
          className="w-full p-2 mb-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
          rows={3}
        />
        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-md mb-4 ${
            isDragActive
              ? "border-green-400 dark:border-green-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-gray-600 dark:text-gray-300">
            Drag 'n' drop some files here, or click to select files
          </p>
        </div>
        {(postImage || postFile) && (
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {postImage ? postImage.name : postFile?.name}
              <button
                onClick={() =>
                  postImage ? setPostImage(null) : setPostFile(null)
                }
                className="ml-2 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </p>
          </div>
        )}
        <input
          type="text"
          value={postLink}
          onChange={(e) => setPostLink(e.target.value)}
          placeholder="Add a link..."
          className="w-full p-2 mb-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
        />
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="cursor-pointer flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-cyan-400 dark:hover:text-cyan-500">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && setPostImage(e.target.files[0])
                }
                className="hidden"
              />
              <Image className="h-5 w-5" />
              <span>Add Image</span>
            </label>
            <label className="cursor-pointer flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-cyan-400 dark:hover:text-cyan-500">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  e.target.files && setPostFile(e.target.files[0])
                }
                className="hidden"
              />
              <FileText className="h-5 w-5" />
              <span>Add File</span>
            </label>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-cyan-400 dark:hover:text-cyan-500"
            >
              <Link className="h-5 w-5" />
              <span>Add Link</span>
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md transition duration-300 ease-in-out"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {post.author}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="relative group">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSave(post.id)}
                  >
                    {post.saved ? "Unsave" : "Save"} Post
                  </button>
                  {post.file && (
                    <a
                      href={URL.createObjectURL(post.file)}
                      download
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Download File
                    </a>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {post.content}
            </p>
            {post.image && (
              <img
                src={post.image}
                alt="Post content"
                className="w-full rounded-md mb-4 cursor-pointer"
                onClick={() => handlePreviewImage(post.image!)}
              />
            )}
            {post.file && (
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {post.file.name}
                </span>
                <div className="flex space-x-2">
                  <button className="text-cyan-400 hover:text-cyan-500 dark:text-cyan-500 dark:hover:text-cyan-400">
                    <Eye className="h-5 w-5" />
                  </button>
                  <a
                    href={URL.createObjectURL(post.file)}
                    download
                    className="text-green-400 hover:text-green-500 dark:text-green-600 dark:hover:text-green-500"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
            )}
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-cyan-400 hover:text-cyan-500 dark:text-cyan-500 dark:hover:text-cyan-400"
              >
                {post.link}
              </a>
            )}
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 ${
                  post.likes > 0
                    ? "text-green-400 dark:text-green-600"
                    : "hover:text-green-400 dark:hover:text-green-600"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${post.likes > 0 ? "fill-current" : ""}`}
                />
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-2 hover:text-cyan-400 dark:hover:text-cyan-500"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments.length}</span>
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-cyan-400 dark:hover:text-cyan-500">
                  <Share2 className="h-5 w-5" />
                  <span>{post.shares}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="p-2 space-y-2">
                    <FacebookShareButton
                      url={`https://example.com/post/${post.id}`}
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <TwitterShareButton
                      url={`https://example.com/post/${post.id}`}
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <LinkedinShareButton
                      url={`https://example.com/post/${post.id}`}
                    >
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSave(post.id)}
                className={`flex items-center space-x-2 ${
                  post.saved
                    ? "text-yellow-400 dark:text-yellow-600"
                    : "hover:text-yellow-400 dark:hover:text-yellow-600"
                }`}
              >
                <Save
                  className={`h-5 w-5 ${post.saved ? "fill-current" : ""}`}
                />
                <span>{post.saved ? "Saved" : "Save"}</span>
              </button>
            </div>
            {expandedComments.includes(post.id) && (
              <div className="mt-4 space-y-4">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {comment.author}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.timestamp}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                ))}
                <form className="mt-4 flex items-center">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-grow p-2 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-r-md transition duration-300 ease-in-out"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="space-y-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={ref} className="h-10"></div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </div>
  );
};

export default PostPage;
