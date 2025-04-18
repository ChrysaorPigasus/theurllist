Feature: Deleting URLs from a List
  As a user
  I want to be able to remove a URL from my list
  So I can keep my list relevant and free of mistakes

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I have added the following URLs to the list:
      | URL                   | Title        | Description        |
      | https://example.com   | Example Site | An example website |
      | https://test.org      | Test Website | A testing website  |
      | https://reference.net | Reference    | Reference docs     |

  Scenario: Delete a single URL from the list
    When I navigate to the "My URL Collection" list
    And I click the "Delete" button for "https://example.com"
    And I confirm the deletion
    Then I should see a success message
    And "https://example.com" should no longer appear in the list
    And I should see 2 URLs remaining in the list

  Scenario: Cancel the deletion of a URL
    When I navigate to the "My URL Collection" list
    And I click the "Delete" button for "https://test.org"
    And I cancel the deletion
    Then "https://test.org" should still appear in the list
    And I should see 3 URLs in the list

  Scenario: Delete the last URL from a list
    Given I have created a list named "Single URL List"
    And I have added "https://single-example.com" to the list
    When I navigate to the "Single URL List" list
    And I click the "Delete" button for "https://single-example.com"
    And I confirm the deletion
    Then I should see a success message
    And I should see a message indicating there are no URLs in the list