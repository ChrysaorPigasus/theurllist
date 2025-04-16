// Feature: Create New URL List (FR001)
import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, createList } from '@stores/lists';
import { generateSlug } from '@utils/urlGeneration';
import Card from '@ui/Card';
import Button from '@ui/Button';
import Input from '@ui/Input';

export default function CreateNewList() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    slug: ''
  });
  const [feedback, setFeedback] = useState('');
  const { lists } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear feedback when user starts typing again
    if (feedback) setFeedback('');
  };

  const handleCreateList = async () => {
    if (!formData.name.trim()) {
      setFeedback('List name cannot be empty.');
      return;
    }

    const newList = await createList(formData);
    if (newList) {
      setFeedback(`List "${formData.name}" created successfully!`);
      setFormData({ name: '', title: '', description: '', slug: '' });
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <Card
      title="Create New List"
      description="Create a new collection of URLs"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        <div>
          <Input
            id="name"
            name="name"
            label="List Name"
            type="text"
            placeholder="Enter list name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            error={feedback.includes('empty') ? feedback : undefined}
            success={feedback.includes('successfully') ? feedback : undefined}
            required
          />
        </div>

        <div>
          <Input
            id="title"
            name="title"
            label="Title (optional)"
            type="text"
            placeholder="Enter a descriptive title (max 100 chars)"
            value={formData.title}
            onChange={handleInputChange}
            disabled={isLoading}
            maxLength={100}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.title ? `${formData.title.length}/100 characters` : ''}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter a description for this list"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isLoading}
            maxLength={500}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.description ? `${formData.description.length}/500 characters` : ''}
          </p>
        </div>

        <div>
          <Input
            id="slug"
            name="slug"
            label="Custom URL (auto-generated from title)"
            type="text"
            placeholder="custom-url-slug"
            value={formData.slug}
            onChange={handleInputChange}
            disabled={isLoading}
            maxLength={60}
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be used in your shareable URL: /list/{formData.slug || 'custom-url'}
          </p>
        </div>

        <Button
          onClick={handleCreateList}
          disabled={isLoading || !formData.name.trim()}
          loading={isLoading}
          variant="primary"
          size="md"
          icon={
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Create List
        </Button>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {lists.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Your Lists</h3>
            <ul className="mt-3 divide-y divide-gray-200">
              {lists.map((list) => (
                <li key={list.id} className="py-3">
                  {list.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}