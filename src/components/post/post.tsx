// "use client";

// import { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Heart, MessageCircle, Share2, Bookmark, Smile } from "lucide-react";
// import Link from "next/link";
// import EmojiPicker from "emoji-picker-react";
// import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// // Define the types for post and comment
// type Comment = {
//   id: number;
//   username: string;
//   content: string;
// };

// export type PostProps = {
//   post: {
//     id: string;
//     username: string;
//     content: string;
//     avatar: string;
//     timestamp: string;
//     likes: number;
//     comments: number;
//     isLiked?: boolean;
//     isSaved?: boolean;
//     fileUrl?: string;
//     fileName?: string;
//   };
// };

// export const fetchPosts = async () => {
//   try {
//     const response = await fetch("/api/posts"); // Adjust the API endpoint as needed
//     if (!response.ok) throw new Error("Failed to fetch posts");

//     const posts = await response.json();
//     return posts;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return [];
//   }
// };

// export default function Post({ post }: PostProps) {
//   const [liked, setLiked] = useState(post.isLiked ?? false);
//   const [saved, setSaved] = useState(post.isSaved ?? false);
//   const [showComments, setShowComments] = useState(false);
//   const [newComment, setNewComment] = useState("");
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [isExpanded, setIsExpanded] = useState(false);

//   const maxLength = 150;
//   const shouldTruncate = post.content.length > maxLength;

//   const handleLike = async () => {
//     try {
//       const response = await fetch(`/api/posts/${post.id}/like`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ liked: !liked }),
//       });
//       if (!response.ok) throw new Error("Failed to update like status");

//       const result = await response.json();
//       setLiked(result.liked);
//     } catch (error) {
//       console.error("Error liking post:", error);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const response = await fetch(`/api/posts/${post.id}/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ saved: !saved }),
//       });
//       if (!response.ok) throw new Error("Failed to update save status");

//       const result = await response.json();
//       setSaved(result.saved);
//     } catch (error) {
//       console.error("Error saving post:", error);
//     }
//   };

//   const handleComment = async () => {
//     if (newComment.trim()) {
//       try {
//         const response = await fetch(`/api/posts/${post.id}/comment`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ content: newComment }),
//         });
//         if (!response.ok) throw new Error("Failed to add comment");

//         const comment = await response.json();
//         setComments([...comments, comment]);
//         setNewComment("");
//       } catch (error) {
//         console.error("Error adding comment:", error);
//       }
//     }
//   };

//   const handleEmojiClick = (emojiObject: any) => {
//     setNewComment((prevComment) => prevComment + emojiObject.emoji);
//   };

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//   };

//   const renderContent = () => {
//     if (!shouldTruncate || isExpanded) {
//       return <p className="mt-2">{post.content}</p>;
//     }
//     return (
//       <div>
//         <p className="mt-2">{post.content.slice(0, maxLength)}...</p>
//         <Button
//           variant="link"
//           onClick={toggleExpand}
//           className="mt-1 p-0 h-auto font-normal text-blue-400 hover:text-blue-300"
//         >
//           Show more
//         </Button>
//       </div>
//     );
//   };

//   const renderImage = () => {
//     if (post.fileUrl && post.fileName) {
//       return (
//         <div className="mt-2">
//           {isExpanded ? (
//             <img
//               src={post.fileUrl}
//               alt={post.fileName}
//               className="w-full h-auto object-cover"
//             />
//           ) : (
//             <div className="relative">
//               <img
//                 src={post.fileUrl}
//                 alt={post.fileName}
//                 className="w-full h-auto object-cover"
//               />
//               <Button
//                 variant="link"
//                 onClick={toggleExpand}
//                 className="absolute bottom-2 right-2 bg-blue-400 text-white rounded px-2 py-1"
//               >
//                 {isExpanded ? "Show less" : "Show more"}
//               </Button>
//             </div>
//           )}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <Card className="w-full bg-gray-800 text-gray-100 mb-6">
//       <CardContent className="pt-6">
//         <div className="flex items-start space-x-4">
//           <Link href={`/user-profile/${post.username } `}> <span> {post.username || "fuck"}  </span>

//             <Avatar className="w-12 h-12 cursor-pointer">
//               <AvatarImage src={post.avatar} alt={post.username || "User"} />
//               <AvatarFallback>
//                 {post.username ? post.username[0].toUpperCase() : "U"}
//               </AvatarFallback>
//             </Avatar>
//           </Link>
//           <div className="flex-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-semibold">{post.username}</h2>
//                 <p className="text-sm text-gray-400">{post.timestamp}</p>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleSave}
//                 className="hover:text-green-400"
//               >
//                 <Bookmark
//                   className={`h-5 w-5 ${
//                     saved ? "fill-current text-green-500" : ""
//                   }`}
//                 />
//               </Button>
//             </div>
//             {renderImage()}
//             {renderContent()}
//             {isExpanded && shouldTruncate && (
//               <Button
//                 variant="link"
//                 onClick={toggleExpand}
//                 className="mt-1 p-0 h-auto font-normal text-blue-400 hover:text-blue-300"
//               >
//                 Show less
//               </Button>
//             )}
//           </div>
//         </div>
//       </CardContent>
//       <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={handleLike}
//           className="flex-1 hover:text-red-500"
//         >
//           <Heart
//             className={`mr-2 h-5 w-5 ${
//               liked ? "fill-current text-red-500" : ""
//             }`}
//           />
//           {post.likes + (liked ? 1 : 0)}
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => setShowComments(!showComments)}
//           className="flex-1 hover:text-blue-400"
//         >
//           <MessageCircle className="mr-2 h-5 w-5" />
//           {post.comments}
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="flex-1 hover:text-green-400"
//         >
//           <Share2 className="mr-2 h-5 w-5" />
//           Share
//         </Button>
//       </CardFooter>
//       {showComments && (
//         <CardContent className="pt-4">
//           {comments.length ? (
//             <div className="space-y-4">
//               {comments.map((comment) => (
//                 <div key={comment.id} className="flex items-start space-x-4">
//                   <Avatar className="w-8 h-8">
//                     <AvatarImage src={post.avatar} alt={comment.username} />
//                     <AvatarFallback>
//                       {comment.username[0].toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex-1">
//                     <h3 className="text-sm font-semibold">
//                       {comment.username}
//                     </h3>
//                     <p className="text-sm">{comment.content}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p>No comments yet</p>
//           )}
//           <div className="mt-4 flex items-center space-x-2">
//             <Input
//               type="text"
//               placeholder="Add a comment..."
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//             />
//             <Popover>
//               <PopoverTrigger>
//                 <Button variant="outline" className="p-1">
//                   <Smile className="h-5 w-5" />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent>
//                 <EmojiPicker onEmojiClick={handleEmojiClick} />
//               </PopoverContent>
//             </Popover>
//             <Button onClick={handleComment} className="ml-2">
//               Post
//             </Button>
//           </div>
//         </CardContent>
//       )}
//     </Card>
//   );
// }




















  // src/components/post/post.tsx

import Image from 'next/image';
import React from 'react';

export interface PostProps {
  post: {
    id: string;
    content: string;
    postUrl?: string;
    createdAt: string;
    userId: string;
    user: {
      username: string;
      profileImage?: string;
    };
  };
}



  
  export const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts"); // Adjust the API endpoint as needed
      if (!response.ok) throw new Error("Failed to fetch posts");
  
      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

const Post: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-2">
        <img
          src={post.user.profileImage || '/default-profile.png'}
          alt={post.user.username}
          className="w-12 h-12 rounded-full mr-3"
        />
        <span className="font-semibold">{post.user.username}</span>
      </div>
        <p className="text-gray-400 text-sm mb-2">{post.createdAt}</p>
      <p className="mb-2">{post.content}</p>
      {post.postUrl && (


        <Image
            src={post.postUrl}
            alt="Post Image"
            width={500}
            height={500}
            />
            
        // <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
        //   {post.postUrl}
        // </a>
      )}
    </div>
  );
};

export default Post;





