Feature: Deleting a List
  As a user
  I want to be able to delete an entire list
  So I can remove lists I no longer need

  Background:
    Given I am logged in
    And I have created the following lists:
      | Name               | Description                     | URLs Count |
      | Development Tools  | Useful dev tools and resources  | 5          |
      | Learning Resources | Websites for learning           | 3          |
      | Personal Links     | Personal bookmarks              | 0          |

  Scenario: Delete a list with URLs
    When I navigate to the lists overview page
    And I click the "Delete" button for "Development Tools"
    And I confirm the deletion
    Then I should see a success message that the list was deleted
    And "Development Tools" should no longer appear in my lists
    And I should see only 2 lists remaining

  Scenario: Delete an empty list
    When I navigate to the lists overview page
    And I click the "Delete" button for "Personal Links"
    And I confirm the deletion
    Then I should see a success message that the list was deleted
    And "Personal Links" should no longer appear in my lists
    And I should see only 2 lists remaining

  Scenario: Cancel list deletion
    When I navigate to the lists overview page
    And I click the "Delete" button for "Learning Resources"
    And I cancel the deletion
    Then "Learning Resources" should still appear in my lists
    And I should still see all 3 lists

  Scenario: Delete the last list
    Given I have only one list named "Last List"
    When I navigate to the lists overview page
    And I click the "Delete" button for "Last List"
    And I confirm the deletion
    Then I should see a success message that the list was deleted
    And I should see a message indicating I have no lists