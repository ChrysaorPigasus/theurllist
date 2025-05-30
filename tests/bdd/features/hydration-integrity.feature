Feature: React Hydration Integrity
  As a developer
  I want to ensure my application hydrates correctly
  So that users don't experience UI glitches or errors

  Background:
    Given hydration tracking is enabled
  
  @hydration @critical
  Scenario: Verify hydration integrity on the home page
    When I navigate to the home page
    Then no hydration errors occur
  
  @hydration @critical  
  Scenario: Verify hydration integrity when creating a list
    Given I am on the home page
    When I enter "Test Hydration List" as the list name
    And I click the "Create List" button
    Then no hydration errors occur
    And I should see a success message
  
  @hydration @critical
  Scenario: Verify hydration integrity with loading buttons
    Given I am on the home page
    When I enter "Loading Test List" as the list name
    And I click the "Create List" button
    Then no hydration errors occur
    
  @hydration @critical
  Scenario: Verify hydration integrity on lists page
    When I navigate to the lists page
    Then no hydration errors occur
    When I click on "Create New List"
    Then no hydration errors occur
