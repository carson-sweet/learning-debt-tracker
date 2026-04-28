Feature: Change item priority
  As a user
  I want to change the priority of any debt item
  So that I can reorganize my backlog as my understanding of urgency evolves

  Background:
    Given I am on the backlog view
    And I have an item with title "Understand memoization" and priority "P3"

  Scenario: Priority can be changed from the item detail view
    When I open the detail view for "Understand memoization"
    And I change the priority to "P1"
    Then the item is saved with priority "P1"

  Scenario: Priority can be changed inline in the backlog row
    When I change the priority of "Understand memoization" inline in the backlog row to "P1"
    Then the item is saved with priority "P1"

  Scenario: Priority change is saved without a separate save button
    When I change the priority of "Understand memoization" inline to "P2"
    Then the change is persisted immediately without pressing a save button

  Scenario: Backlog sort order updates synchronously after a priority change
    Given the backlog contains a "P2" item "Understand recursion" and a "P3" item "Understand memoization"
    When I change the priority of "Understand memoization" to "P1"
    Then "Understand memoization" moves above "Understand recursion" in the backlog without a page reload

  Scenario Outline: All three priority values are selectable
    When I open the priority selector for "Understand memoization"
    Then "<target_priority>" is available as a selectable option

    Examples:
      | target_priority |
      | P1              |
      | P2              |
      | P3              |

  Scenario: Priority selector is keyboard-focusable
    When I tab to the priority selector for "Understand memoization" in the backlog row
    Then the priority selector receives focus

  Scenario: Priority selector options are selectable with keyboard
    Given focus is on the priority selector for "Understand memoization"
    When I press "Enter" to open the selector
    And I use arrow keys to navigate to "P1"
    And I press "Enter" to confirm
    Then the item is saved with priority "P1"
