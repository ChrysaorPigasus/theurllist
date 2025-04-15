import { useState, useEffect } from 'react';
import Dialog from '../../ui/Dialog';
import { generateSlug } from '../../../utils/urlGeneration';

export default function UpdateList({ listId, isOpen = false, onClose, onSuccess }) {
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    slug: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    async function fetchList() {
      if (!listId || !isOpen) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/lists/${listId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch list');
        }

        const data = await response.json();
        setList(data);
        setFormData({
          name: data.name || '',
          title: data.title || '',
          description: data.description || '',
          slug: data.slug || ''
        });
        setSlugManuallyEdited(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchList();
  }, [listId, isOpen]);

  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/lists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: listId,
          ...formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update list');
      }

      const updatedList = await response.json();
      if (onSuccess) {
        onSuccess(updatedList);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          List Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          maxLength={100}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.title ? `${formData.title.length}/100 characters` : ''}
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          maxLength={500}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description ? `${formData.description.length}/500 characters` : ''}
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Custom URL (auto-generated from title)
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
          readOnly
          maxLength={60}
        />
        <p className="mt-1 text-sm text-gray-500">
          This will be used in your shareable URL: /list/{formData.slug || 'custom-url'}
        </p>
      </div>
    </form>
  );

  const dialogActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit List"
      description="Update this list's information"
      actions={dialogActions}
    >
      {isLoading ? (
        <div className="text-center py-4">
          <svg className="animate-spin h-6 w-6 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : renderForm()}
    </Dialog>
  );
}