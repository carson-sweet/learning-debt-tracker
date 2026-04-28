Feature: Filter backlog by status
  As a user
  I want to filter my backlog by status (Open, In Progress, Resolved)
  So that I can focus on what needs attention without resolved items cluttering the view

  Background:
    Given I am on the backlog view
    And I have items with statuses "Open", "In Progress", and "Resolved"

  Scenario: Default view shows Open items only
    Then only items with status "Open" are displayed
    And the "Open" filter is visually indicated as active

  Scenario Outline: Selecting a filter shows only matching items
    When I select the "<filter>" filter
    Then only items matching "<expected_status>" are displayed

    Examples:
      | filter      | expected_status              |
      | Open        | Open                         |
      | In Progress | In Progress                  |
      | Resolved    | Resolved                     |
      | All         | Open, In Progress, Resolved  |

  Scenario: Selecting a filter updates the list without a page reload
    When I select the "Resolved" filter
    Then the backlog updates to show resolved items without a full page reload

  Scenario: Active filter is visually indicated
    When I select the "In Progress" filter
    Then the "In Progress" filter control has an active visual indicator

  Scenario: Active filter is announced to screen readers
    When I select the "In Progress" filter
    Then the "In Progress" filter control has an aria-pressed or aria-selected attribute set to true

  Scenario: Filter state persists across page refreshes
    When I select the "Resolved" filter
    And I reload the page
    Then the "Resolved" filter is still active
    And only resolved items are displayed

  Scenario: Filter controls are operable by keyboard — Tab to reach
    Given focus is before the filter controls
    When I press "Tab" until focus reaches a filter control
    Then focus is on a filter control

  Scenario Outline: Filter controls are operable by keyboard — activate with Enter or Space
    Given focus is on the "<filter>" filter control
    When I press "<key>"
    Then the "<filter>" filter becomes active

    Examples:
      | filter      | key   |
      | In Progress | Enter |
      | Resolved    | Space |
