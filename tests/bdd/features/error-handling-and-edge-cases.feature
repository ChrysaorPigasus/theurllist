Feature: Error Handling and Edge Cases
  As a user
  I want the application to handle errors gracefully
  So that I can continue using the application even when things go wrong

  Background:
    Given I am logged in
    And I am on the lists page

  # Network Error Scenarios
  Scenario: Handle network error when creating a list
    When the network connection is unavailable
    And I click on "Create New List"
    And I enter "Test List" as the list name
    And I click the "Create List" button
    Then I should see an error message indicating network issues
    And the application should allow me to retry when connection is restored

  Scenario: Handle network error when loading lists
    When the network connection is unavailable
    And I navigate to the lists page
    Then I should see an offline indicator
    And I should be able to see any cached lists
    And I should see a retry button

  Scenario: Recover from network error when adding URLs
    Given I have created a list called "My URLs"
    When the network connection is unavailable
    And I try to add "https://example.com" to the list
    Then the URL should be queued for adding
    When the network connection is restored
    Then the queued URL should be added to the list
    And I should see a success message

  # Concurrency Scenarios
  Scenario: Handle concurrent edits to the same list
    Given I open the list "Shared List" in two browser tabs
    When I edit the list name to "My New Name" in the first tab
    And I edit the list name to "Different Name" in the second tab
    And I save changes in both tabs
    Then the application should detect the conflict
    And show a conflict resolution dialog
    And allow me to choose which version to keep

  # Performance Scenarios
  Scenario: Handle a list with many URLs efficiently
    Given I have a list with 100 URLs
    When I open the list
    Then the page should load within 3 seconds
    And URLs should be paginated
    And I should be able to navigate between pages
    When I search for a specific URL
    Then the results should appear within 1 second

  Scenario: Cache large lists for offline access
    Given I have a list with 100 URLs
    When I visit the list
    And the list is cached
    And I go offline
    And I navigate to the list again
    Then I should see the cached list data
    And an indicator that I'm viewing cached data