Feature: Automatic URL Generation
  As a user
  If I don't want to think of a custom URL, I want the system to automatically create one for my list
  So I can still share it

  Background:
    Given I am logged in
    And I have created a list named "My Test URL Collection"

  Scenario: Generate a URL automatically
    When I navigate to the "My Test URL Collection" list
    And I open the "Custom URL" section
    And I click the "Generate" button
    Then I should see an automatically generated URL based on my list name
    And I should see a message to save the generated URL

  Scenario: Save the automatically generated URL
    When I navigate to the "My Test URL Collection" list
    And I open the "Custom URL" section
    And I click the "Generate" button
    And I click the "Save" button
    Then I should see a success message
    And the shareable URL should contain the automatically generated URL

  Scenario: Modify an automatically generated URL before saving
    When I navigate to the "My Test URL Collection" list
    And I open the "Custom URL" section
    And I click the "Generate" button
    And I modify part of the automatically generated URL
    And I click the "Save" button
    Then I should see a success message
    And the shareable URL should contain my modified version of the URL

  Scenario: Generate a URL for a list with special characters in name
    Given I have created a list named "Special Ch@racters & Symbols!"
    When I navigate to the "Special Ch@racters & Symbols!" list
    And I open the "Custom URL" section
    And I click the "Generate" button
    Then I should see an automatically generated URL with only valid characters
    And the generated URL should not contain special characters