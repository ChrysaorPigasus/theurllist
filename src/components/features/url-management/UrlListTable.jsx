import React, { useState } from 'react';
import { formatDate } from '../../../utils/formatDate';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import EditUrlsInList from './EditUrlsInList';
import DeleteUrlsFromList from './DeleteUrlsFromList';

export default function UrlListTable({ urls, onUrlUpdated, onUrlDeleted }) {
  const [editingUrl, setEditingUrl] = useState(null);
  const [urlToDelete, setUrlToDelete] = useState(null);
  
  // Early return for empty state
  if (!urls || urls.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No URLs</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new URL above.</p>
      </div>
    );
  }

  const handleEdit = (url) => {
    setEditingUrl(url);
  };

  const handleDelete = (url) => {
    setUrlToDelete(url);
  };

  const handleEditComplete = () => {
    setEditingUrl(null);
    if (onUrlUpdated) onUrlUpdated();
  };

  const handleDeleteComplete = () => {
    setUrlToDelete(null);
    if (onUrlDeleted) onUrlDeleted();
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urls.map((url) => (
              <tr key={url.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={url.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                  >
                    {url.url}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{url.title || 'No title'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(url.addedAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(url)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(url)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit URL Dialog */}
      {editingUrl && (
        <Dialog
          isOpen={Boolean(editingUrl)}
          onClose={() => setEditingUrl(null)}
          title="Edit URL"
        >
          <EditUrlsInList 
            url={editingUrl} 
            onComplete={handleEditComplete} 
            onCancel={() => setEditingUrl(null)} 
          />
        </Dialog>
      )}

      {/* Delete URL Dialog */}
      {urlToDelete && (
        <Dialog
          isOpen={Boolean(urlToDelete)}
          onClose={() => setUrlToDelete(null)}
          title="Delete URL"
        >
          <DeleteUrlsFromList 
            url={urlToDelete} 
            onComplete={handleDeleteComplete} 
            onCancel={() => setUrlToDelete(null)} 
          />
        </Dialog>
      )}
    </>
  );
}