Feature: Set priority at capture
  As a user
  I want to optionally set a priority (P1, P2, P3) when capturing an item
  So that high-urgency gaps are immediately visible in my backlog without a separate triage step

  Background:
    Given I am on the main view of the app

  Scenario: Priority selector is visible in the capture flow
    Then a priority selector with options "P1", "P2", and "P3" is visible in the capture area

  Scenario: Priority defaults to P2 when not selected
    When I type "Learn about monads" into the capture input
    And I submit the capture form without selecting a priority
    Then the saved item has priority "P2"

  Scenario Outline: Selected priority is saved with the item
    When I type "Learn about monads" into the capture input
    And I select priority "<priority>" in the capture area
    And I submit the capture form
    Then the saved item has priority "<priority>"

    Examples:
      | priority |
      | P1       |
      | P2       |
      | P3       |

  Scenario: Priority selector does not block capture when not interacted with
    When I type "Learn about monads" into the capture input
    And I do not interact with the priority selector
    And I submit the capture form
    Then a new item is created successfully
