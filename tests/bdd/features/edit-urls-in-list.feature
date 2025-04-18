Feature: Editing URLs in a List
  As a user
  I want to be able to edit a URL in my list
  So I can correct mistakes or update changed links

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I have added the following URLs to the list:
      | URL                   | Title        | Description        |
      | https://example.com   | Example Site | An example website |
      | https://test.org      | Test Website | A testing website  |

  Scenario: Edit a URL's address
    When I navigate to the "My URL Collection" list
    And I click the "Edit" button for "https://example.com"
    And I change the URL to "https://updated-example.com"
    And I click the "Save" button
    Then I should see "https://updated-example.com" in the URL list
    And I should see a success message

  Scenario: Edit a URL's title and description
    When I navigate to the "My URL Collection" list
    And I click the "Edit" button for "https://test.org"
    And I change the title to "Updated Test Site"
    And I change the description to "An updated testing website"
    And I click the "Save" button
    Then I should see the URL with title "Updated Test Site"
    And I should see the URL with description "An updated testing website"
    And I should see a success message

  Scenario: Try to save a URL with empty address
    When I navigate to the "My URL Collection" list
    And I click the "Edit" button for "https://example.com"
    And I clear the URL field
    And I click the "Save" button
    Then I should see an error message indicating that URL cannot be empty
    And the URL should not be updated

  Scenario: Cancel editing a URL
    When I navigate to the "My URL Collection" list
    And I click the "Edit" button for "https://example.com"
    And I change the URL to "https://should-not-be-saved.com"
    And I click the "Cancel" button
    Then I should still see "https://example.com" in the URL list
    And I should not see "https://should-not-be-saved.com"