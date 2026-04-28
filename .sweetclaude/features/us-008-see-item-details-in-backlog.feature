Feature: See item details in the backlog
  As a user
  I want to see the key details of each item in the backlog row
  So that I can identify items at a glance without opening each one

  Background:
    Given I am on the backlog view

  Scenario: Backlog row displays title
    Given I have an item with title "Understand garbage collection"
    Then the backlog row displays the title "Understand garbage collection"

  Scenario: Backlog row displays priority badge
    Given I have an item with priority "P1"
    Then the backlog row displays a priority badge labeled "P1"

  Scenario: Backlog row displays status badge
    Given I have an item with status "Open"
    Then the backlog row displays a status badge labeled "Open"

  Scenario: Backlog row displays item age
    Given I have an item created 3 days ago
    Then the backlog row displays an age indicator such as "3 days ago"

  Scenario: Backlog row displays source when present
    Given I have an item with source "SICP chapter 4"
    Then the backlog row displays the source "SICP chapter 4"

  Scenario: Backlog row does not display a source section when source is absent
    Given I have an item with no source
    Then the backlog row does not display a source section

  Scenario: In-progress items are visually distinct from open items
    Given I have an "Open" item and an "In Progress" item in the backlog
    Then the "In Progress" item has a visual distinction such as a different background, border, or pin indicator compared to the "Open" item

  Scenario: In-progress visual distinction is not communicated by color alone
    Given I have an "In Progress" item in the backlog
    Then the in-progress distinction is communicated by a text label or icon in addition to any color change

  Scenario: Resolved items show a closed indicator
    Given I am viewing the backlog with the "All" filter
    And I have a "Resolved" item
    Then the resolved item's backlog row displays a text label or icon indicating it is resolved

  Scenario: Resolved status is not communicated by color alone
    Given I am viewing the backlog with the "All" filter
    And I have a "Resolved" item
    Then the resolved status is communicated by a text label or icon, not color alone
