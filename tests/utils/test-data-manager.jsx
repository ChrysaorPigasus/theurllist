import React, { useState, useEffect } from 'react';
import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const TestDataManager = ({ page }) => {
  const [dataCache, setDataCache] = useState(new Map());
  const [createdData, setCreatedData] = useState(new Map());

  useEffect(() => {
    if (!createdData.has('lists')) {
      setCreatedData(new Map(createdData.set('lists', [])));
    }
  }, [createdData]);

  const createTestList = async (name, description, urls) => {
    const listData = {
      name,
      description: description || `Test list created at ${new Date().toISOString()}`,
      urls: urls || []
    };

    const response = await page.request.post('/api/lists', {
      data: listData
    });

    const responseData = await response.json();
    const listId = responseData.id;

    setCreatedData(new Map(createdData.set('lists', [...createdData.get('lists'), listId])));
    setDataCache(new Map(dataCache.set(`list:${listId}`, responseData)));

    return listId;
  };

  const addUrlsToList = async (listId, urls) => {
    for (const urlData of urls) {
      await page.request.post(`/api/lists/${listId}/urls`, {
        data: urlData
      });
    }

    const list = dataCache.get(`list:${listId}`);
    if (list) {
      list.urls = [...(list.urls || []), ...urls];
      setDataCache(new Map(dataCache.set(`list:${listId}`, list)));
    }
  };

  const createLargeList = async (name, urlCount = 100) => {
    const urls = [];
    for (let i = 1; i <= urlCount; i++) {
      urls.push({
        url: `https://example.com/page-${i}`,
        title: `Test Page ${i}`,
        description: `Description for test page ${i}`
      });
    }

    return createTestList(name, `Large test list with ${urlCount} URLs`, urls);
  };

  const loadTestData = (filename) => {
    const filePath = path.join(process.cwd(), 'tests', 'data', filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  };

  const getTestData = (key) => {
    return dataCache.get(key) || null;
  };

  const cleanup = async () => {
    const lists = createdData.get('lists') || [];
    for (const listId of lists) {
      try {
        await page.request.delete(`/api/lists/${listId}`);
      } catch (error) {
        console.warn(`Error cleaning up list ${listId}:`, error);
      }
    }

    setCreatedData(new Map());
  };

  return null; // This component does not render anything
};

export default TestDataManager;
