Feature: Creating a New URL List
  As a user
  I want to be able to start a new, empty list
  So I can begin adding URLs

  Background:
    Given I am on the home page

  Scenario: Create a new empty list
    When I click on "Create New List"
    And I enter "My Test List" as the list name
    And I click the "Create List" button
    Then I should see a new empty list with the name "My Test List"
    And I should see an option to add URLs to the list

  Scenario: Try to create a list without a name
    When I click on "Create New List"
    And I leave the list name empty
    And I click the "Create List" button
    Then I should see an error message indicating that a name is required

  Scenario: Create a list with additional details
    When I click on "Create New List"
    And I enter "My Detailed List" as the list name
    And I enter "A collection of my favorite websites" as the description
    And I click the "Create List" button
    Then I should see a new list with the name "My Detailed List"
    And I should see the description "A collection of my favorite websites"