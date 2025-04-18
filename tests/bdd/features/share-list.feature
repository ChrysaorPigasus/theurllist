Feature: Sharing a List
  As a user
  I want to be able to easily share the link to my list with others
  So they can access my collection of URLs

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I have published my list

  Scenario: Copy shareable URL to clipboard
    When I navigate to the "My URL Collection" list
    And I open the "Share List" section
    And I click the "Copy URL" button
    Then I should see a confirmation that the URL was copied to clipboard
    And the clipboard should contain the shareable URL for my list

  Scenario: Share list via Twitter
    When I navigate to the "My URL Collection" list
    And I open the "Share List" section
    And I click the "Twitter" button
    Then I should be redirected to Twitter with a pre-filled post containing my list URL

  Scenario: Share list via LinkedIn
    When I navigate to the "My URL Collection" list
    And I open the "Share List" section
    And I click the "LinkedIn" button
    Then I should be redirected to LinkedIn with my list URL pre-filled for sharing

  Scenario: Share list via Email
    When I navigate to the "My URL Collection" list
    And I open the "Share List" section
    And I click the "Email" button
    Then my default email client should open
    And the email should contain the shareable URL for my list

  Scenario: Try to share an unpublished list
    Given I have an unpublished list named "Private Collection"
    When I navigate to the "Private Collection" list
    And I open the "Share List" section
    Then I should see a message indicating I need to publish the list first