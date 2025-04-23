import { Page } from '@playwright/test';
import { selectors, getSelectors, SelectorHelpers } from '@tests/utils/selector-helper';

/**
 * Page object for the list editor page
 */
export class ListEditorPage {
  private selectors: SelectorHelpers;

  constructor(page: Page) {
    this.page = page;
    this.selectors = getSelectors(page);
  }

  /**
   * Fill the list name input field
   */
  async fillListName(name: string) {
    await this.page.locator('[data-testid="input-name"], input#name').fill(name);
  }

  /**
   * Click the create list button
   */
  async clickCreateListButton() {
    await this.selectors.button('Create List').click();
  }

  /**
   * Open the publish section
   */
  async openPublishSection() {
    await this.page.locator('[data-testid="publish-section-toggle"], button:has-text("Publish"), button:has-text("Share")').click();
  }

  /**
   * Publish list
   */
  async publishList() {
    await this.selectors.button('Publish List').click();
  }

  /**
   * Make list private
   */
  async makeListPrivate() {
    await this.selectors.button('Make Private').click();
  }

  /**
   * Get publish success message
   * @returns {Locator} - Locator for the success message
   */
  getPublishSuccessMessage() {
    return this.page.locator('[data-testid="publish-success-message"], text="published", text="Published successfully"');
  }

  /**
   * Get private list confirmation message
   * @returns {Locator} - Locator for the private list confirmation message
   */
  getPrivateListConfirmationMessage() {
    return this.page.locator('[data-testid="private-confirmation-message"], text="private", text="no longer public", text="made private"');
  }

  /**
   * Get public URL
   * @returns {Promise<string>} - The public URL of the list
   */
  async getPublicUrl() {
    const urlElement = this.page.locator('[data-testid="public-url"], input[type="url"]');
    return await urlElement.inputValue();
  }

  /**
   * Open the custom URL section
   */
  async openCustomUrlSection() {
    await this.page.click('[data-testid="customize-url-toggle"], button:has-text("Customize URL"), summary:has-text("Customize URL")');
  }

  /**
   * Set a custom URL for the list
   */
  async setCustomUrl(url: string) {
    const urlInput = this.page.locator('[data-testid="custom-url-input"], input[id="custom-url"]');
    await urlInput.fill(url);
    await this.selectors.button('Update URL').click();
    await this.page.waitForSelector('[data-testid="success-message"], text="successfully"');
  }

  /**
   * Get the URL input field
   */
  getUrlInput() {
    return this.page.locator('[data-testid="url-input"], input[type="url"], input[placeholder*="URL"]').first();
  }

  /**
   * Fill the URL input field
   */
  async fillUrlInput(url: string) {
    await this.getUrlInput().fill(url);
  }

  /**
   * Click the Add URL button
   */
  async clickAddUrlButton() {
    await this.selectors.button('Add URL').click();
  }

  /**
   * Show additional fields button
   */
  async clickShowAdditionalFields() {
    const showMoreBtn = this.selectors.button('Show additional fields');
    await showMoreBtn.click();
  }

  /**
   * Fill the title input field
   */
  async fillTitleInput(title: string) {
    const titleInput = this.page.locator('[data-testid="input-title"], input[name="title"], input[id="title"]');
    await titleInput.fill(title);
  }

  /**
   * Fill the description input field
   */
  async fillDescriptionInput(description: string) {
    const descInput = this.page.locator('[data-testid="input-description"], input[name="description"], textarea[name="description"]');
    await descInput.fill(description);
  }

  /**
   * Add URL to the list
   */
  async addUrl(url: string, title?: string, description?: string) {
    // Fill URL field
    await this.fillUrlInput(url);
    
    // Handle optional fields if provided
    if (title || description) {
      // Show additional fields if available
      await this.clickShowAdditionalFields();
      
      if (title) {
        await this.fillTitleInput(title);
      }
      
      if (description) {
        await this.fillDescriptionInput(description);
      }
    }
    
    // Add the URL
    await this.clickAddUrlButton();
    
    // Wait for UI update
    await this.page.waitForTimeout(500);
  }

  /**
   * Get custom URL input field
   */
  getCustomUrlInput() {
    return this.page.locator('[data-testid="custom-url-input"], input[id="custom-url"]');
  }

  /**
   * Click the generate URL button
   */
  async clickGenerateButton() {
    await this.selectors.button('Generate').click();
  }

  /**
   * Click the save/update URL button
   */
  async clickSaveUrlButton() {
    await this.page.click('[data-testid="save-url-button"], button:has-text("Update URL"), button:has-text("Save URL")');
  }

  /**
   * Get success message
   */
  getSuccessMessage() {
    return this.selectors.successMessage();
  }

  /**
   * Get the generated URL message
   */
  getUrlGeneratedMessage() {
    return this.page.locator('[data-testid="url-generated-message"], text="generated", text="save", text="Save"');
  }

  /**
   * Get the shareable URL display
   */
  getShareableUrlDisplay() {
    return this.page.locator('[data-testid="share-url"], input[id="share-url"], text="Share this URL"');
  }

  /**
   * Get the current value of the custom URL input field
   */
  async getCustomUrlValue() {
    return await this.getCustomUrlInput().inputValue();
  }

  /**
   * Update the custom URL input field with a new value
   */
  async updateCustomUrl(url: string) {
    const input = this.page.locator('[data-testid="custom-url-input"], input[placeholder="custom-url"]');
    await input.fill('');
    await input.fill(url);
  }

  /**
   * Fill the list description field
   */
  async fillDescription(description: string) {
    await this.page.locator('[data-testid="input-description"], textarea[name="description"], textarea[id="description"]').fill(description);
  }

  /**
   * Get the list title element
   */
  getListTitle(title: string) {
    return this.page.locator(`[data-testid="list-title-${title}"], h1:has-text("${title}"), h2:has-text("${title}")`);
  }

  /**
   * Get list description text
   */
  getListDescription(description: string) {
    return this.page.locator(`[data-testid="list-description"], text="${description}"`);
  }

  /**
   * Get empty list indicator
   */
  getEmptyListIndicator() {
    return this.page.locator('[data-testid="empty-list-indicator"], text="No URLs in this list yet", text="No URLs added yet"');
  }

  /**
   * Get the Add URL section
   */
  getAddUrlSection() {
    return this.page.locator('[data-testid="add-url-section"], button:has-text("Add URL"), input[placeholder*="URL"]');
  }

  /**
   * Get error message for required fields
   */
  getRequiredFieldError() {
    return this.selectors.errorMessage('name is required') || this.selectors.errorMessage('required field');
  }

  /**
   * Click the make private button
   */
  async clickMakePrivateButton() {
    await this.page.locator('button:has-text("Make Private")').click();
  }

  /**
   * Get private confirmation message
   */
  getPrivateConfirmationMessage() {
    return this.page.locator('text="list is now private", text="made private", text="private"');
  }

  /**
   * Get publish confirmation message
   */
  getPublishConfirmationMessage() {
    return this.page.locator('text="list is published", text="published successfully"');
  }

  /**
   * Open the share list section
   */
  async openShareListSection() {
    await this.page.click('button:has-text("Share"), summary:has-text("Share")');
  }

  /**
   * Click the copy URL button
   */
  async clickCopyUrlButton() {
    await this.page.click('button:has-text("Copy URL")');
  }

  /**
   * Get URL copied confirmation message
   */
  getUrlCopiedMessage() {
    return this.page.locator('text="copied to clipboard", text="URL copied"');
  }

  /**
   * Get the share buttons (Twitter, LinkedIn, Email)
   */
  getShareButton(platform: string) {
    return this.page.locator(`button:has-text("${platform}"), a:has-text("${platform}")`);
  }

  /**
   * Click a specific share button
   */
  async clickShareButton(platform: string) {
    await this.page.click(`button:has-text("${platform}"), a:has-text("${platform}")`);
  }

  /**
   * Get unpublished list message
   */
  getUnpublishedListMessage() {
    return this.page.locator('text="need to publish first", text="publish the list to share"');
  }

  /**
   * Click the publish button for the list
   * @returns {Promise<void>}
   */
  async clickPublishButton() {
    await this.page.locator('[data-testid="publish-button"], button:has-text("Publish")').click();
  }

  /**
   * Click the unpublish button for the list
   * @returns {Promise<void>}
   */
  async clickUnpublishButton() {
    await this.page.locator('button:has-text("Unpublish"), [data-testid="unpublish-button"]').click();
  }

  /**
   * Check if the publish success message is visible
   * @returns {Promise<boolean>}
   */
  async isPublishSuccessMessageVisible() {
    return await this.page.locator('[data-testid="success-message"]:has-text("published"), text="successfully published", .success-message').isVisible();
  }

  /**
   * Check if the unpublish success message is visible
   * @returns {Promise<boolean>}
   */
  async isUnpublishSuccessMessageVisible() {
    return await this.page.locator('text="successfully unpublished", .success-message').isVisible();
  }

  /**
   * Get the published URL of the list
   * @returns {Promise<string>}
   */
  async getPublishedUrl() {
    const urlElement = this.page.locator('.published-url, [data-testid="published-url"]');
    return await urlElement.textContent();
  }

  /**
   * Open the URL customization section
   * @returns {Promise<void>}
   */
  async openUrlCustomizationSection() {
    await this.page.locator('button:has-text("Customize URL"), [data-testid="customize-url-button"]').click();
  }

  /**
   * Enter a custom URL for the list
   * @param {string} customUrl - The custom URL to enter
   * @returns {Promise<void>}
   */
  async enterCustomUrl(customUrl: string) {
    await this.page.locator('[data-testid="custom-url-input"], input[placeholder="Enter custom URL"]').fill(customUrl);
  }

  /**
   * Save the custom URL
   * @returns {Promise<void>}
   */
  async saveCustomUrl() {
    await this.page.locator('[data-testid="save-custom-url-button"], button:has-text("Save")').click();
  }

  /**
   * Check if a custom URL error message is visible
   * @returns {Promise<boolean>}
   */
  async isCustomUrlErrorVisible() {
    return await this.selectors.errorMessage().isVisible();
  }

  /**
   * Get the text of the custom URL error message
   * @returns {Promise<string>}
   */
  async getCustomUrlErrorText() {
    const errorElement = this.selectors.errorMessage();
    return await errorElement.textContent();
  }

  /**
   * Get the publish section
   * @returns {Locator} - Locator for the publish section
   */
  getPublishSection() {
    return this.page.locator('[data-testid="publish-section"], #publish-section, div:has(> h3:has-text("Publish")), div:has(> button:has-text("Publish List"))');
  }

  /**
   * Get share button
   * @returns {Locator} - Locator for the share button
   */
  getShareButton() {
    return this.page.locator('[data-testid="share-button"], button:has-text("Share"), summary:has-text("Share")');
  }

  /**
   * Get share section
   * @returns {Locator} - Locator for the share section
   */
  getShareSection() {
    return this.page.locator('[data-testid="share-section"], #share-section, div:has(> h3:has-text("Share")), div:has(> input#share-url)');
  }

  /**
   * Get copy URL button
   * @returns {Locator} - Locator for the copy URL button
   */
  getCopyUrlButton() {
    return this.page.locator('[data-testid="copy-url-button"], button:has-text("Copy URL")');
  }
  
  /**
   * Get share button for specific platform
   * @param {string} platform - Platform name (Twitter, LinkedIn, Email)
   * @returns {Locator} - Locator for the specific share button
   */
  getShareButton(platform?: string) {
    if (platform) {
      return this.page.locator(`[data-testid="share-${platform.toLowerCase()}-button"], button:has-text("${platform}"), a:has-text("${platform}")`);
    }
    return this.page.locator('[data-testid="share-button"], button:has-text("Share"), summary:has-text("Share")');
  }

  /**
   * Get shareable URL input
   * @returns {Locator} - Locator for the shareable URL input
   */
  getShareableUrlInput() {
    return this.page.locator('[data-testid="share-url-input"], input#share-url, input[aria-label="Shareable URL"]');
  }
}