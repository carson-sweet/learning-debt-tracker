Feature: Write a self-explanation to resolve an item
  As a user
  I want to be required to write my own explanation before closing a debt item
  So that I am forced to consolidate my understanding before marking the gap as closed

  Background:
    Given I am on the detail view of an "In Progress" item with title "Understand event loop"

  Scenario: Resolve action is available from the item detail view
    Then a "Resolve" action control is visible on the detail view

  Scenario: Resolve action reveals a resolution textarea
    When I activate the "Resolve" action
    Then a resolution textarea is visible
    And the textarea has placeholder text "What do you understand now that you didn't when you captured this?"

  Scenario: Submit resolution button is disabled when textarea is empty
    When I activate the "Resolve" action
    Then the "Submit resolution" button is disabled

  Scenario: Submit resolution button is disabled when textarea contains only whitespace
    When I activate the "Resolve" action
    And I type "   " into the resolution textarea
    Then the "Submit resolution" button is disabled

  Scenario: Submit resolution button becomes enabled when textarea has non-whitespace content
    When I activate the "Resolve" action
    And I type "x" into the resolution textarea
    Then the "Submit resolution" button is enabled

  Scenario: Any non-empty, non-whitespace text is accepted — single character
    When I activate the "Resolve" action
    And I type "x" into the resolution textarea
    And I press "Submit resolution"
    Then the item's status changes to "Resolved"

  Scenario: Any non-empty, non-whitespace text is accepted — long explanation
    When I activate the "Resolve" action
    And I type a multi-paragraph explanation into the resolution textarea
    And I press "Submit resolution"
    Then the item's status changes to "Resolved"

  Scenario: Submitting a valid resolution sets status to Resolved
    When I activate the "Resolve" action
    And I type "The event loop processes the call stack and task queue in alternating cycles" into the resolution textarea
    And I press "Submit resolution"
    Then the item's status is "Resolved"

  Scenario: Submitting a valid resolution records a resolved_at timestamp
    When I activate the "Resolve" action
    And I type "The event loop processes the call stack and task queue" into the resolution textarea
    And I press "Submit resolution"
    Then the item has a resolved_at timestamp
