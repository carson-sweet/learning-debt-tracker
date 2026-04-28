Feature: Add source context at capture
  As a user
  I want to optionally add a source or context note when capturing an item
  So that I can remember where the gap came from without having to reconstruct it later

  Background:
    Given I am on the main view of the app

  Scenario: Source field is visible in the capture flow
    Then a source or context text field is visible in the capture area

  Scenario: Capture succeeds without a source value
    When I type "Understand RAFT consensus" into the capture input
    And I leave the source field empty
    And I submit the capture form
    Then a new item is created with title "Understand RAFT consensus"
    And the item has no source value

  Scenario: Source text is saved with the item
    When I type "Understand RAFT consensus" into the capture input
    And I type "Came up in the distributed systems chapter of Designing Data-Intensive Applications" into the source field
    And I submit the capture form
    Then the saved item has source "Came up in the distributed systems chapter of Designing Data-Intensive Applications"

  Scenario: Saved source text is displayed in the backlog row
    When I type "Understand RAFT consensus" into the capture input
    And I type "DDIA chapter 9" into the source field
    And I submit the capture form
    Then the backlog row for "Understand RAFT consensus" displays the source "DDIA chapter 9"

  Scenario: Source field accepts free text up to 500 characters
    When I type "Understand RAFT consensus" into the capture input
    And I type a source text of exactly 500 characters into the source field
    And I submit the capture form
    Then the item is saved successfully

  Scenario: Source field rejects text exceeding 500 characters
    When I type "Understand RAFT consensus" into the capture input
    And I type a source text of 501 characters into the source field
    Then the source field does not accept the 501st character
