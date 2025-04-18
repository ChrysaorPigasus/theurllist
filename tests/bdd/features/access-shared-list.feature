Feature: Accessing a Shared List
  As a recipient
  I want to be able to view the collection of URLs by clicking on or entering the shared link
  So I can access the resources shared with me

  Background:
    Given there is a published list named "Shared Resources"
    And the list contains the following URLs:
      | URL                   | Title        | Description        |
      | https://example.com   | Example Site | An example website |
      | https://docs.com      | Documentation| Reference docs     |
      | https://blog.com      | Blog         | A blog site        |

  Scenario: Access a shared list via direct URL
    When I visit the shareable URL for "Shared Resources"
    Then I should see the list name "Shared Resources"
    And I should see all 3 URLs in the list
    And I should be able to click on the URLs to open them

  Scenario: Access a shared list with a custom URL
    Given the list "Shared Resources" has a custom URL "dev-resources"
    When I visit "/list/dev-resources"
    Then I should see the list name "Shared Resources"
    And I should see all 3 URLs in the list

  Scenario: Try to access a non-existent shared list
    When I visit a URL for a list that does not exist
    Then I should see a message indicating the list was not found

  Scenario: Try to access a private list
    Given there is a private list named "Private Resources"
    When I try to access the URL for "Private Resources"
    Then I should see a message indicating the list is private or not found