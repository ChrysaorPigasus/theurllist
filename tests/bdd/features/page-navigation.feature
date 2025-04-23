Feature: Page Navigation
  As a user
  I want to navigate between different pages of the application
  So that I can access different features without encountering errors

  Background:
    Given I am on the home page

  Scenario: Navigate from home page to list page and back
    When I click on "Create New List"
    And I enter "Navigation Test List" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "Navigation Test List"
    When I navigate back to the home page
    Then I should see the home page without errors

  Scenario: Navigate between multiple lists
    When I click on "Create New List"
    And I enter "First Test List" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "First Test List"
    When I navigate back to the home page
    And I click on "Create New List"
    And I enter "Second Test List" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "Second Test List"
    When I navigate back to the home page
    Then I should see the home page without errors

  Scenario: Create list, add URLs, and navigate back
    When I click on "Create New List"
    And I enter "URL Navigation Test" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "URL Navigation Test"
    When I add a URL to the list
    And I navigate back to the home page
    And I return to the "URL Navigation Test" list
    Then I should see the previously added URL

  Scenario: Navigate using browser back and forward buttons
    When I click on "Create New List"
    And I enter "Browser Nav Test" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "Browser Nav Test"
    When I click the browser back button
    Then I should see the home page without errors
    When I click the browser forward button
    Then I should see the "Browser Nav Test" list without errors