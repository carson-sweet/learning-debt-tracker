Feature: View backlog sorted by priority and age
  As a user
  I want to see all my open debt items sorted by priority then by age
  So that the most important and most neglected items are at the top

  Background:
    Given I am on the backlog view

  Scenario: Backlog defaults to showing Open items only
    Given I have items with statuses "Open", "In Progress", and "Resolved"
    Then the backlog displays the "Open" items
    And the backlog does not display "Resolved" items

  Scenario: P1 items appear before P2 items
    Given I have an item with priority "P2" created before an item with priority "P1"
    Then the "P1" item appears above the "P2" item in the backlog

  Scenario: P2 items appear before P3 items
    Given I have an item with priority "P3" created before an item with priority "P2"
    Then the "P2" item appears above the "P3" item in the backlog

  Scenario: Within the same priority, older items appear first
    Given I have two "P2" items where "Understand TCP handshake" was created before "Understand UDP"
    Then "Understand TCP handshake" appears above "Understand UDP" in the backlog

  Scenario: Sort order updates synchronously when an item's priority changes
    Given I have a "P3" item "Understand UDP" and a "P2" item "Understand TCP handshake" in the backlog
    When I change the priority of "Understand UDP" to "P1"
    Then "Understand UDP" moves to the top of the backlog without a page reload

  Scenario: Backlog rows are keyboard-navigable
    Given I have at least two items in the backlog
    When I press "Tab" from the first backlog row
    Then focus moves to the next backlog row or its actions

  Scenario: Priority badges have accessible labels not relying on color alone
    Given I have items with priorities "P1", "P2", and "P3" in the backlog
    Then each priority badge displays a text label such as "P1", "P2", or "P3"

  Scenario: Status badges have accessible labels not relying on color alone
    Given I have items with status "Open" and "In Progress" in the backlog
    Then each status badge displays a text label such as "Open" or "In Progress"
