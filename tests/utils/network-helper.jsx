import React from 'react';
import { Page } from '@playwright/test';

class NetworkHelper extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  async simulateOffline() {
    await this.page.context().setOffline(true);
  }

  async simulateOnline() {
    await this.page.context().setOffline(false);
  }

  async simulateSlowNetwork(latency = 200, downloadSpeed = 50 * 1024, uploadSpeed = 20 * 1024) {
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, latency));
      await route.continue();
    });
  }

  async simulateRequestFailure(urlPattern, errorCode = 500) {
    await this.page.route(urlPattern, route => route.abort('failed'));
  }

  async simulateIntermittentIssues(failureRate = 0.3, urlPattern = '**/*') {
    await this.page.route(urlPattern, route => {
      if (Math.random() < failureRate) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
  }

  async resetNetworkConditions() {
    await this.page.context().setOffline(false);
    await this.page.unrouteAll();
  }

  render() {
    return null; // This component does not render anything
  }
}

export default NetworkHelper;
