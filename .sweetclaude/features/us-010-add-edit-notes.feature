Feature: Add or edit notes on an item
  As a user
  I want to add or edit free-text notes on any debt item
  So that I can record partial understanding, useful links, or context as I work toward resolution

  Background:
    Given I am on the detail view of an item with title "Understand futures and promises"

  Scenario: Notes field is accessible from the detail view
    Then a notes text field is visible on the detail view

  Scenario: Notes are saved when the user exits the field
    When I type "Promises are eager, futures are lazy in many implementations" into the notes field
    And I move focus away from the notes field
    Then the notes are saved with the text "Promises are eager, futures are lazy in many implementations"

  Scenario: Notes are saved when the user presses the save action
    When I type "Promises are eager, futures are lazy in many implementations" into the notes field
    And I press the save action
    Then the notes are saved with the text "Promises are eager, futures are lazy in many implementations"

  Scenario: Existing notes are displayed when the item is opened
    Given the item has existing notes "Already read MDN article on Promises"
    When I open the detail view for the item
    Then the notes field contains "Already read MDN article on Promises"

  Scenario: Notes accept free text with no format requirements
    When I type a multi-line note with links and mixed characters into the notes field
    And I save the item
    Then the notes are saved exactly as entered

  Scenario: Notes are distinct from the source field
    Then the notes field and the source field are separate, labeled fields on the detail view

  Scenario: Notes are not auto-saved while typing
    When I type "partial note in progress" into the notes field
    And I have not yet exited the field or pressed save
    Then the item's stored notes do not yet contain "partial note in progress"
