Feature: Publishing a List
  As a user
  I want to be able to publish my list
  So that others can view the collection of URLs

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I have added several URLs to the list

  Scenario: Publish a list for public access
    When I navigate to the "My URL Collection" list
    And I open the "Publish List" section
    And I click the "Publish List" button
    Then I should see a success message that the list is published
    And the list should be accessible to anyone with the URL

  Scenario: Make a published list private again
    Given I have published my list "My URL Collection"
    When I navigate to the "My URL Collection" list
    And I open the "Publish List" section
    And I click the "Make Private" button
    Then I should see a confirmation message that the list is now private
    And the list should no longer be accessible to others

  Scenario: Verify a published list is accessible
    Given I have published my list "My URL Collection"
    When I log out
    And I visit the public URL for "My URL Collection"
    Then I should see the list name "My URL Collection"
    And I should see all the URLs in the list

  Scenario: Verify a private list is not accessible
    Given I have a private list "My URL Collection"
    When I log out
    And I try to visit the URL for "My URL Collection"
    Then I should see a message indicating the list is private or not found