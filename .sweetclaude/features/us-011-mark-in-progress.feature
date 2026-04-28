Feature: Mark an item as in-progress
  As a user
  I want to mark a debt item as "In Progress"
  So that I can signal to myself that I am actively working on understanding this concept

  Background:
    Given I am on the backlog view
    And I have an "Open" item with title "Understand WebSockets"

  Scenario: In Progress transition is available from the item detail view
    When I open the detail view for "Understand WebSockets"
    Then a control labeled "Mark as In Progress" or equivalent is visible

  Scenario: In Progress transition is available as an inline backlog action
    Then an inline action to mark "Understand WebSockets" as "In Progress" is visible in the backlog row

  Scenario: Marking an item as In Progress changes its status
    When I mark "Understand WebSockets" as "In Progress"
    Then the item's status is "In Progress"

  Scenario: In-progress items are visually distinct in the backlog
    When I mark "Understand WebSockets" as "In Progress"
    Then the backlog row for "Understand WebSockets" has a visual distinction such as a different background, border, or pin indicator

  Scenario: In-progress visual distinction is not communicated by color alone
    When I mark "Understand WebSockets" as "In Progress"
    Then the in-progress state is communicated by a text label or icon in addition to any color change

  Scenario: The In Progress control has an accessible label
    Then the control to mark "Understand WebSockets" as "In Progress" has an aria-label or visible label

  Scenario: The In Progress control is keyboard-operable
    When I tab to the "Mark as In Progress" control for "Understand WebSockets"
    And I press "Enter"
    Then the item's status changes to "In Progress"

  Scenario: An In Progress item can be moved back to Open
    Given "Understand WebSockets" has status "In Progress"
    When I mark "Understand WebSockets" as "Open"
    Then the item's status is "Open"

  Scenario: The In Progress transition is recorded with a timestamp
    When I mark "Understand WebSockets" as "In Progress"
    Then the item has a status_changed_at or equivalent timestamp recording when it moved to "In Progress"
