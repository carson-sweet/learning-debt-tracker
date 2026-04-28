Feature: Capture a debt item with title only
  As a user
  I want to save a new learning debt item by typing only a title
  So that I can capture the gap in under 10 seconds without thinking about metadata

  Background:
    Given I am on the main view of the app

  Scenario: Capture input is visible and focusable on page load
    Then a text input for capturing a new item is visible
    And the capture input is focused without any user interaction

  Scenario: Submit a new item with title only
    When I type "Understand transformer attention mechanism" into the capture input
    And I submit the capture form
    Then a new item is saved with the title "Understand transformer attention mechanism"
    And the item's priority is "P2"
    And the item's status is "Open"
    And the item has a created_at timestamp

  Scenario: New item appears in the backlog immediately after submission
    Given I have no items in the backlog
    When I type "Understand transformer attention mechanism" into the capture input
    And I submit the capture form
    Then the item "Understand transformer attention mechanism" appears in the backlog

  Scenario: Capture input is cleared after submission
    When I type "Understand transformer attention mechanism" into the capture input
    And I submit the capture form
    Then the capture input is empty
    And the capture input is focused

  Scenario: Cannot submit with an empty title
    When I leave the capture input empty
    And I attempt to submit the capture form
    Then no new item is created
    And the capture input remains focused

  Scenario: Cannot submit with a whitespace-only title
    When I type "   " into the capture input
    And I attempt to submit the capture form
    Then no new item is created

  Scenario: Cannot submit a title exceeding 300 characters
    When I type a title of 301 characters into the capture input
    And I attempt to submit the capture form
    Then no new item is created
    And I see an error indicating the title is too long
