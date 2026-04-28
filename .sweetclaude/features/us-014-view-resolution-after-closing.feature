Feature: View a resolution explanation after closing an item
  As a user
  I want to see my self-written explanation when I view a resolved item
  So that I can review what I understood at the time of resolution

  Background:
    Given I have a "Resolved" item with title "Understand event loop"
    And the item was resolved with explanation "The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles"
    And the item has resolved_at timestamp "2026-04-25T14:30:00Z"

  Scenario: Resolution explanation is displayed when viewing a resolved item
    When I open the detail view for "Understand event loop"
    Then the resolution explanation "The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles" is displayed

  Scenario: Resolution explanation is read-only
    When I open the detail view for "Understand event loop"
    Then the resolution explanation field is not editable

  Scenario: resolved_at timestamp is displayed alongside the explanation
    When I open the detail view for "Understand event loop"
    Then the resolved_at timestamp is displayed near the resolution explanation

  Scenario: Resolution text is visually distinct from the notes field
    Given the item also has notes "Read the MDN event loop article"
    When I open the detail view for "Understand event loop"
    Then the resolution explanation and the notes are displayed as separate, visually distinct sections
