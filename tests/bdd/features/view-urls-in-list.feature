Feature: Viewing URLs in a List
  As a user
  I want to be able to see all the URLs I have added to my list
  So I can review and manage them

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I have added the following URLs to the list:
      | URL                     | Title          | Description               |
      | https://example.com     | Example Site   | An example website        |
      | https://test.org        | Test Website   | A testing website         |
      | https://reference.net   | Reference Site | A reference documentation |

  Scenario: View all URLs in a list
    When I navigate to the "My URL Collection" list
    Then I should see all 3 URLs in the list
    And each URL should display its address and title

  Scenario: Search for URLs in a list
    When I navigate to the "My URL Collection" list
    And I enter "test" in the search field
    Then I should see 1 URL in the filtered list
    And I should see "https://test.org" in the list

  Scenario: Sort URLs by different criteria
    When I navigate to the "My URL Collection" list
    And I click on the "Title" sort header
    Then the URLs should be sorted alphabetically by title
    When I click on the "Title" sort header again
    Then the URLs should be sorted in reverse alphabetical order by title

  Scenario: View empty list
    Given I have created a list named "Empty List"
    When I navigate to the "Empty List" list
    Then I should see a message indicating there are no URLs in the list
    And I should see an option to add URLs