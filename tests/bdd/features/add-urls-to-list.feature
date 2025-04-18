Feature: Adding URLs to a List
  As a user
  I want to be able to input or paste URLs into my list
  So I can compile the resources I want to share

  Background:
    Given I am logged in
    And I have created a list named "My URL Collection"
    And I am viewing "My URL Collection"

  Scenario: Add a single URL to a list
    When I enter "https://example.com" in the URL input field
    And I click the "Add URL" button
    Then I should see "https://example.com" in the URL list
    And I should see a success message

  Scenario: Add a URL without protocol prefix
    When I enter "example.org" in the URL input field
    And I click the "Add URL" button
    Then I should see "https://example.org" in the URL list
    And I should see a success message

  Scenario: Try to add an empty URL
    When I leave the URL input field empty
    And I click the "Add URL" button
    Then I should see an error message indicating that URL cannot be empty
    And no URL should be added to the list

  Scenario: Add a URL with additional metadata
    When I enter "https://example.com" in the URL input field
    And I click on "Show additional fields"
    And I enter "Example Website" as the title
    And I enter "This is an example website for testing" as the description
    And I click the "Add URL" button
    Then I should see "https://example.com" in the URL list
    And the URL should display with title "Example Website"
    And the URL should display with description "This is an example website for testing"