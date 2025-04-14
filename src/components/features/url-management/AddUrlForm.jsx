import React, { useState } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

export default function AddUrlForm({ onAddUrl }) {
  const [urlData, setUrlData] = useState({
    url: '',
    title: '',
    description: '',
    image: ''
  });
  const [advancedFormVisible, setAdvancedFormVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUrlData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!urlData.url.trim()) {
      setFeedback('URL cannot be empty.');
      return;
    }

    onAddUrl(urlData);
    setUrlData({
      url: '',
      title: '',
      description: '',
      image: ''
    });
    setFeedback('');
  };

  const toggleAdvancedForm = () => {
    setAdvancedFormVisible(!advancedFormVisible);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Add New URL</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              id="newUrl"
              name="url"
              type="url"
              placeholder="https://example.com"
              value={urlData.url}
              onChange={handleInputChange}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Add URL
          </Button>
        </div>
        
        <div>
          <button 
            type="button" 
            onClick={toggleAdvancedForm} 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {advancedFormVisible ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide Advanced Options
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show Advanced Options
              </>
            )}
          </button>
        </div>
        
        {advancedFormVisible && (
          <div className="space-y-3 pt-2">
            <div>
              <label htmlFor="urlTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Title (Optional)
              </label>
              <Input
                id="urlTitle"
                name="title"
                type="text"
                placeholder="Title for this URL"
                value={urlData.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="urlDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <Input
                id="urlDescription"
                name="description"
                type="text"
                placeholder="Short description"
                value={urlData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="urlImage" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <Input
                id="urlImage"
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlData.image}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
        
        {feedback && (
          <div className="text-sm text-red-600 mt-1">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}