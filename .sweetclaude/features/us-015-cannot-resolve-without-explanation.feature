Feature: Cannot resolve without an explanation
  As a user
  I want the system to prevent me from closing an item without writing something
  So that the closure ritual is enforced even when I'm tempted to skip it

  Background:
    Given I am on the resolution view for an "In Progress" item

  Scenario: Submit resolution button is disabled when textarea is empty
    Given the resolution textarea is empty
    Then the "Submit resolution" button has attribute aria-disabled="true"

  Scenario: Submit resolution button is disabled when textarea contains only spaces
    When I type "     " into the resolution textarea
    Then the "Submit resolution" button has attribute aria-disabled="true"

  Scenario: Submit resolution button is disabled when textarea contains only newlines
    When I type only newlines into the resolution textarea
    Then the "Submit resolution" button has attribute aria-disabled="true"

  Scenario: Submit resolution button is disabled when textarea contains only tabs
    When I type only tab characters into the resolution textarea
    Then the "Submit resolution" button has attribute aria-disabled="true"

  Scenario: Submit resolution button becomes enabled when at least one non-whitespace character is entered
    When I type "a" into the resolution textarea
    Then the "Submit resolution" button does not have aria-disabled="true"

  Scenario: Item status does not change when submit is attempted with empty textarea
    Given the resolution textarea is empty
    When I attempt to force-submit the resolution form
    Then the item's status remains unchanged

  Scenario: Disabled state is communicated to screen readers
    Given the resolution textarea is empty
    Then the "Submit resolution" button has aria-disabled="true"
    And the button is not the only indication of the disabled state — a visible label or the aria-disabled attribute communicates it programmatically

  Scenario: Button transitions from disabled to enabled as user types
    Given the resolution textarea is empty
    And the "Submit resolution" button has attribute aria-disabled="true"
    When I type "I now understand" into the resolution textarea
    Then the "Submit resolution" button does not have aria-disabled="true"

  Scenario: Button transitions from enabled back to disabled if text is cleared
    Given I have typed "I now understand" into the resolution textarea
    When I clear the resolution textarea
    Then the "Submit resolution" button has attribute aria-disabled="true"
