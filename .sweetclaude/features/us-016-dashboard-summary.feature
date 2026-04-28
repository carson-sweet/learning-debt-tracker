Feature: View debt summary on the dashboard
  As a user
  I want to see a summary of my learning debt at a glance
  So that I can understand how my backlog is growing or shrinking over time

  Background:
    Given I am on the dashboard view

  Scenario: Dashboard is a distinct view from the backlog
    Then the dashboard view is separate from the backlog view

  Scenario: Dashboard displays total open items metric
    Given there are 3 "Open" items and 2 "In Progress" items and 5 "Resolved" items
    Then the dashboard displays a "Total open items" metric with value 5

  Scenario: Total open items counts both Open and In Progress
    Given there are 3 "Open" items and 2 "In Progress" items
    Then the total open items metric shows 5

  Scenario: Total open items excludes Resolved items
    Given there are 4 "Open" items and 6 "Resolved" items
    Then the total open items metric shows 4

  Scenario: Dashboard displays resolved last 7 days metric
    Given 3 items were resolved within the last 7 days
    And 2 items were resolved more than 7 days ago
    Then the "Resolved last 7 days" metric shows 3

  Scenario: Resolved last 7 days uses a rolling window from current time
    Given today is "2026-04-28"
    And an item was resolved on "2026-04-21" at 23:59:59
    And an item was resolved on "2026-04-20" at 00:00:00
    Then the "Resolved last 7 days" metric counts only the item resolved on "2026-04-21"

  Scenario: Dashboard displays resolved last 30 days metric
    Given 7 items were resolved within the last 30 days
    And 3 items were resolved more than 30 days ago
    Then the "Resolved last 30 days" metric shows 7

  Scenario: Resolved last 30 days uses a rolling window from current time
    Given today is "2026-04-28"
    And an item was resolved on "2026-03-29" at 23:59:59
    And an item was resolved on "2026-03-28" at 00:00:00
    Then the "Resolved last 30 days" metric counts only the item resolved on "2026-03-29"

  Scenario: Dashboard displays oldest open item metric
    Given the oldest open item is "Understand closures" created 45 days ago
    Then the "Oldest open item" metric displays the title "Understand closures"
    And the metric displays the age such as "45 days ago"

  Scenario: Oldest open item considers both Open and In Progress items
    Given an "Open" item created 10 days ago
    And an "In Progress" item created 20 days ago
    Then the "Oldest open item" metric shows the "In Progress" item

  Scenario: Metrics reflect current database state on page load without manual refresh
    When I navigate to the dashboard
    Then the metrics are populated from the current database state

  Scenario: Oldest open item shows empty state when no open items exist
    Given there are no "Open" or "In Progress" items
    Then the "Oldest open item" metric displays "No open items" or equivalent positive empty state

  Scenario: Resolved last 7 days shows 0 when no items were resolved in the window
    Given no items were resolved in the last 7 days
    Then the "Resolved last 7 days" metric shows 0

  Scenario: Resolved last 30 days shows 0 when no items were resolved in the window
    Given no items were resolved in the last 30 days
    Then the "Resolved last 30 days" metric shows 0

  Scenario: Each metric has an accessible label for screen readers
    Then each metric on the dashboard has a descriptive label readable by screen readers
    And no metric value is presented as a bare number without a surrounding label or accessible name
