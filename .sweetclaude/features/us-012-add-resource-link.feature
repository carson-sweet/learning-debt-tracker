Feature: Add a resource link to an in-progress item
  As a user
  I want to add a URL resource link to an item I am actively working on
  So that I can track the article, documentation, or video I am using to close the gap

  Background:
    Given I am on the detail view of an "In Progress" item with title "Understand service workers"

  Scenario: Resource link field is available for In Progress items
    Then a resource link URL field is visible on the detail view

  Scenario: An item can be In Progress without a resource link
    When I do not fill in the resource link field
    And I save the item
    Then the item is saved successfully with no resource link

  Scenario: A valid URL is saved and displayed as a clickable link
    When I enter "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API" into the resource link field
    And I save the item
    Then the resource link is displayed as a clickable hyperlink

  Scenario: The saved URL opens the correct destination
    Given the item has resource link "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"
    When I view the item detail
    Then the link href is "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"

  Scenario Outline: Basic URL validation accepts valid URLs
    When I enter "<url>" into the resource link field
    And I save the item
    Then the item is saved successfully

    Examples:
      | url                                      |
      | https://example.com                      |
      | http://example.com/path?query=value      |
      | https://docs.example.org/page#section    |

  Scenario Outline: Basic URL validation rejects invalid URLs
    When I enter "<url>" into the resource link field
    And I attempt to save the item
    Then a validation error is displayed for the resource link field
    And the item is not saved

    Examples:
      | url                      |
      | example.com              |
      | ftp://example.com        |
      | not a url at all         |

  Scenario: Resource link field is not shown for Open items
    Given I am on the detail view of an "Open" item
    Then the resource link field is not visible

  Scenario: Resource link field is not shown for Resolved items
    Given I am on the detail view of a "Resolved" item
    Then the resource link field is not visible
