Feature: Viewing all lists
  As a user
  I want to be able to see all the lists I have created
  So I can manage them easily

  Background:
    Given I am logged in
    And I have created the following lists:
      | Name               | Description                     | Published |
      | Development Tools  | Useful dev tools and resources  | Yes       |
      | Learning Resources | Websites for learning           | No        |
      | Personal Links     | Personal bookmarks              | No        |

  Scenario: View all my lists
    When I navigate to the lists overview page
    Then I should see all 3 of my lists
    And each list should display its name and description
    And I should see which lists are published

  Scenario: Filter lists by published status
    When I navigate to the lists overview page
    And I filter to show only published lists
    Then I should see only the "Development Tools" list
    And I should not see the "Learning Resources" or "Personal Links" lists

  Scenario: Search for a specific list
    When I navigate to the lists overview page
    And I search for "Learning"
    Then I should see only the "Learning Resources" list
    And I should not see the other lists

  Scenario: Handle empty lists
    Given I have not created any lists yet
    When I navigate to the lists overview page
    Then I should see a message indicating I have no lists
    And I should see an option to create a new list