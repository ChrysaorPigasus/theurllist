Feature: Customizing the List URL
  As a user
  I want to be able to choose a custom URL for my list
  So it's easy to remember and share

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"

  Scenario: Set a custom URL for a list
    When I navigate to the "My URL Collection" list
    And I open the "Customize URL" section
    And I enter "my-awesome-collection" as the custom URL
    And I click the "Update URL" button
    Then I should see a success message
    And the shareable URL should contain "/list/my-awesome-collection"

  Scenario: Try to set an invalid custom URL
    When I navigate to the "My URL Collection" list
    And I open the "Customize URL" section
    And I enter "invalid url with spaces" as the custom URL
    And I click the "Update URL" button
    Then I should see an error message about invalid characters
    And the URL should not be updated

  Scenario: Try to set a custom URL that is already taken
    Given another user has a list with custom URL "popular-list"
    When I navigate to the "My URL Collection" list
    And I open the "Customize URL" section
    And I enter "popular-list" as the custom URL
    And I click the "Update URL" button
    Then I should see an error message that the URL is already taken

  Scenario: Change an existing custom URL
    Given my list "My URL Collection" has custom URL "old-collection-url"
    When I navigate to the "My URL Collection" list
    And I open the "Customize URL" section
    And I enter "new-collection-url" as the custom URL
    And I click the "Update URL" button
    Then I should see a success message
    And the shareable URL should contain "/list/new-collection-url"
    And the old URL "/list/old-collection-url" should no longer work