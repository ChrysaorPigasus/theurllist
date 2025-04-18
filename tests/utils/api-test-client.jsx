import React, { useState, useEffect } from 'react';
import { request, APIRequestContext } from '@playwright/test';
import { config } from '@tests/utils/test-config';

const ApiTestClient = ({ page }) => {
  const [apiContext, setApiContext] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const context = await request.newContext({
        baseURL: config.apiUrl,
        extraHTTPHeaders: config.authToken ? { 
          'Authorization': `Bearer ${config.authToken}` 
        } : {},
      });
      setApiContext(context);
    };
    initialize();
  }, [authToken]);

  const setToken = (token) => {
    setAuthToken(token);
  };

  const get = async (endpoint, params) => {
    const url = new URL(endpoint, config.apiUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await apiContext.get(url.toString(), {
      timeout: config.timeouts.apiTimeout
    });
    
    if (!response.ok()) {
      throw new Error(`API GET request failed: ${response.status()} ${response.statusText()}`);
    }
    
    return await response.json();
  };

  const post = async (endpoint, data) => {
    const response = await apiContext.post(`${config.apiUrl}${endpoint}`, {
      data,
      timeout: config.timeouts.apiTimeout
    });
    
    if (!response.ok()) {
      throw new Error(`API POST request failed: ${response.status()} ${response.statusText()}`);
    }
    
    return await response.json();
  };

  const put = async (endpoint, data) => {
    const response = await apiContext.put(`${config.apiUrl}${endpoint}`, {
      data,
      timeout: config.timeouts.apiTimeout
    });
    
    if (!response.ok()) {
      throw new Error(`API PUT request failed: ${response.status()} ${response.statusText()}`);
    }
    
    return await response.json();
  };

  const del = async (endpoint) => {
    const response = await apiContext.delete(`${config.apiUrl}${endpoint}`, {
      timeout: config.timeouts.apiTimeout
    });
    
    if (!response.ok()) {
      throw new Error(`API DELETE request failed: ${response.status()} ${response.statusText()}`);
    }
    
    return await response.json();
  };

  const getLists = async () => {
    return get('/lists');
  };

  const getList = async (id) => {
    return get(`/lists/${id}`);
  };

  const createList = async (data) => {
    return post('/lists', data);
  };

  const updateList = async (id, data) => {
    return put(`/lists/${id}`, data);
  };

  const deleteList = async (id) => {
    return del(`/lists/${id}`);
  };

  const getUrls = async (listId) => {
    return get(`/lists/${listId}/urls`);
  };

  const addUrl = async (listId, data) => {
    return post(`/lists/${listId}/urls`, data);
  };

  const updateUrl = async (listId, urlId, data) => {
    return put(`/lists/${listId}/urls/${urlId}`, data);
  };

  const deleteUrl = async (listId, urlId) => {
    return del(`/lists/${listId}/urls/${urlId}`);
  };

  const shareList = async (listId, data) => {
    return post(`/lists/${listId}/share`, data);
  };

  const getShareInfo = async (listId) => {
    return get(`/lists/${listId}/share`);
  };

  const updateSharing = async (listId, data) => {
    return put(`/lists/${listId}/share`, data);
  };

  return null; // This component does not render anything
};

export default ApiTestClient;
