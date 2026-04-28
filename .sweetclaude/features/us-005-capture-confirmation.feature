Feature: Receive capture confirmation
  As a user
  I want visible feedback when an item is saved
  So that I know the capture succeeded and can return to what I was doing

  Background:
    Given I am on the main view of the app

  Scenario: Item appearing in the backlog communicates successful save
    When I type "Understand event sourcing" into the capture input
    And I submit the capture form
    Then the item "Understand event sourcing" is visible in the backlog

  Scenario: Success feedback does not require user dismissal
    When I type "Understand event sourcing" into the capture input
    And I submit the capture form
    Then the capture form returns to its empty state without requiring any user action to dismiss a confirmation

  Scenario: Error message is shown when the save fails
    Given the database write will fail on the next save
    When I type "Understand event sourcing" into the capture input
    And I submit the capture form
    Then an error message is displayed on the capture form
    And the title input still contains "Understand event sourcing"

  Scenario: Item data is preserved in the form after a save failure
    Given the database write will fail on the next save
    And I have typed "Understand event sourcing" into the capture input
    And I have typed "Came up in a podcast episode" into the source field
    And I have selected priority "P1" in the capture area
    When I submit the capture form
    Then the title input still contains "Understand event sourcing"
    And the source field still contains "Came up in a podcast episode"
    And the priority selector still shows "P1"
