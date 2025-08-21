'use client';

import { useState } from 'react';
import { usePost } from '@/lib';
import type { FeedPost } from '@/lib/collegeAPI';

interface PostCardProps {
  post: FeedPost;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [eventResponse, setEventResponse] = useState<string>('none');

  const {
    toggleLike,
    addComment,
    addReply,
    respondToEvent,
    claimItem,
    likeLoading,
    commentLoading,
    replyLoading,
    responseLoading,
    claimLoading
  } = usePost(post._id);

  const handleLike = async () => {
    try {
      await toggleLike();
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment('');
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (commentId: string) => {
    const replyText = newReply[commentId];
    if (!replyText?.trim()) return;

    try {
      await addReply({ commentId, content: replyText });
      setNewReply({ ...newReply, [commentId]: '' });
      setReplyingTo(null);
      onUpdate();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleEventResponse = async (response: string) => {
    try {
      await respondToEvent(response as 'going' | 'interested' | 'notGoing' | 'none');
      setEventResponse(response);
      onUpdate();
    } catch (error) {
      console.error('Error responding to event:', error);
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'EVENT':
        return 'bg-blue-100 text-blue-800';
      case 'LOST_FOUND':
        return 'bg-orange-100 text-orange-800';
      case 'ANNOUNCEMENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLiked = post.interactions.likes.some(like => like.user === 'current-user-id'); // You'll need to get current user ID

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar || 'https://via.placeholder.com/40x40?text=U'}
              alt={post.author.fullname}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{post.author.fullname}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{post.author.department}</span>
                <span>•</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType)}`}>
            {post.postType.replace('_', ' & ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-700 mb-4">{post.summary}</p>

        {/* Event-specific content */}
        {post.postType === 'EVENT' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Event Response</h4>
              <div className="text-sm text-blue-700">
                {/* You can show participant counts here */}
              </div>
            </div>
            <div className="flex space-x-2">
              {['going', 'interested', 'notGoing'].map((response) => (
                <button
                  key={response}
                  onClick={() => handleEventResponse(response)}
                  disabled={responseLoading}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    eventResponse === response
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                  } disabled:opacity-50`}
                >
                  {response === 'going' && '👍 Going'}
                  {response === 'interested' && '🤔 Interested'}
                  {response === 'notGoing' && '👎 Not Going'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lost & Found specific content */}
        {post.postType === 'LOST_FOUND' && (
          <div className="bg-orange-50 rounded-lg p-4 mb-4">
            <button
              onClick={() => claimItem('I think this is mine!')}
              disabled={claimLoading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {claimLoading ? 'Claiming...' : 'Claim This Item'}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              } disabled:opacity-50`}
            >
              <svg className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.interactions.likes.length}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.interactions.comments.length}</span>
            </button>

            <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{post.interactions.shares.length}</span>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {post.interactions.views} views
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Add Comment */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleComment} className="flex space-x-3">
              <img
                src="https://via.placeholder.com/32x32?text=U"
                alt="You"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {commentLoading ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {post.interactions.comments.map((comment) => (
              <div key={comment._id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex space-x-3">
                  <img
                    src={comment.user.avatar || 'https://via.placeholder.com/32x32?text=U'}
                    alt={comment.user.fullname}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <h4 className="font-medium text-sm text-gray-900">{comment.user.fullname}</h4>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="hover:text-indigo-600"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-2 flex space-x-2">
                        <input
                          type="text"
                          value={newReply[comment._id] || ''}
                          onChange={(e) => setNewReply({ ...newReply, [comment._id]: e.target.value })}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleReply(comment._id)}
                          disabled={replyLoading || !newReply[comment._id]?.trim()}
                          className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {replyLoading ? 'Replying...' : 'Reply'}
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {comment.replies.map((reply, index) => (
                          <div key={index} className="flex space-x-2">
                            <img
                              src={reply.user.avatar || 'https://via.placeholder.com/24x24?text=U'}
                              alt={reply.user.fullname}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <div className="bg-gray-100 rounded-lg px-2 py-1 flex-1">
                              <h5 className="font-medium text-xs text-gray-900">{reply.user.fullname}</h5>
                              <p className="text-xs text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
