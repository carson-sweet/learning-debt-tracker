Feature: Complete capture keyboard-first
  As a user
  I want to capture a new item without using a mouse
  So that I can stay in my coding or reading flow without switching input devices

  Background:
    Given I am on the main view of the app
    And no input field is currently focused

  Scenario: Capture input is auto-focused on page load
    When the page finishes loading
    Then the capture title input is focused

  Scenario: Pressing the focus shortcut focuses the capture input
    Given focus is not on the capture input
    When I press the keyboard shortcut to focus the capture input
    Then the capture title input is focused

  Scenario: Tab moves focus from title to source field
    Given the capture title input is focused
    When I press "Tab"
    Then focus moves to the source field

  Scenario: Tab moves focus from source field to priority selector
    Given the source field in the capture area is focused
    When I press "Tab"
    Then focus moves to the priority selector

  Scenario: Pressing Enter from the title field submits when title is non-empty
    Given the capture title input is focused
    And the title input contains "Understand CAP theorem"
    When I press "Enter"
    Then a new item is created with title "Understand CAP theorem"

  Scenario: Pressing Enter from the title field does nothing when title is empty
    Given the capture title input is focused
    And the title input is empty
    When I press "Enter"
    Then no new item is created

  Scenario: Focus returns to the title field after submission
    Given the capture title input is focused
    And the title input contains "Understand CAP theorem"
    When I press "Enter"
    Then focus is on the capture title input
