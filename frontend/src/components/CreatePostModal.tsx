'use client';

import { useState } from 'react';
import { useSmartPostCreation } from '@/lib';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    postPreview,
    generatePreview,
    publishFinalPost,
    editPreview,
    previewLoading,
    publishLoading,
    previewError,
    publishError
  } = useSmartPostCreation();

  const handleGeneratePreview = async () => {
    if (!content.trim()) return;

    try {
      const result = await generatePreview(content, attachments);
      if (result?.success) {
        setStep('preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handlePublish = async () => {
    if (!postPreview) return;

    try {
      const result = await publishFinalPost(postPreview);
      if (result?.success) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return '📅';
      case 'LOST_FOUND':
        return '🔍';
      case 'ANNOUNCEMENT':
        return '📢';
      default:
        return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'input' ? 'Create Post' : 'Review & Publish'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'input' ? (
            /* Input Step */
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type naturally... Our AI will understand what kind of post you want to create!

Examples:
• 'Lost my black wallet near the library yesterday'
• 'React workshop tomorrow at 5pm in CSE lab'
• 'Important: Classes cancelled due to maintenance'"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Attachments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleAttachmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {previewError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{previewError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePreview}
                  disabled={!content.trim() || previewLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : (
                    'Generate Preview'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Preview Step */
            <div className="p-6">
              {postPreview && (
                <div className="space-y-6">
                  {/* AI Classification Result */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getPostTypeIcon(postPreview.postType)}</span>
                      <h3 className="font-medium text-blue-900">
                        Detected: {postPreview.postType.replace('_', ' & ')} Post
                      </h3>
                      <span className="text-sm text-blue-700">
                        ({Math.round((postPreview.classification.confidence || 0) * 100)}% confidence)
                      </span>
                    </div>
                    {postPreview.classification.extractedEntities && (
                      <div className="text-sm text-blue-700">
                        <p>Extracted: {JSON.stringify(postPreview.classification.extractedEntities, null, 2)}</p>
                      </div>
                    )}
                  </div>

                  {/* Editable Preview */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={postPreview.title}
                        onChange={(e) => editPreview({ ...postPreview, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={postPreview.description}
                        onChange={(e) => editPreview({ ...postPreview, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Event-specific fields */}
                    {postPreview.postType === 'EVENT' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={postPreview.location || ''}
                            onChange={(e) => editPreview({ ...postPreview, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Event location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                          <input
                            type="datetime-local"
                            value={postPreview.eventDate ? new Date(postPreview.eventDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => editPreview({ ...postPreview, eventDate: new Date(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Lost & Found specific fields */}
                    {postPreview.postType === 'LOST_FOUND' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
                          <select
                            value={postPreview.itemType || 'LOST'}
                            onChange={(e) => editPreview({ ...postPreview, itemType: e.target.value as 'LOST' | 'FOUND' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="LOST">Lost</option>
                            <option value="FOUND">Found</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                          <input
                            type="text"
                            value={postPreview.itemName || ''}
                            onChange={(e) => editPreview({ ...postPreview, itemName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="What item?"
                          />
                        </div>
                      </div>
                    )}

                    {/* Announcement specific fields */}
                    {postPreview.postType === 'ANNOUNCEMENT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={postPreview.priority || 'MEDIUM'}
                          onChange={(e) => editPreview({ ...postPreview, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {publishError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{publishError}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('input')}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Edit
                    </button>
                    <div className="space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={publishLoading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {publishLoading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Publishing...
                          </div>
                        ) : (
                          'Publish Post'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
