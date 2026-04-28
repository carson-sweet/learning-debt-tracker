Feature: App runs fully locally with no network calls
  As a user
  I want the app to work with no internet connection
  So that I can use it in any environment without privacy concerns or connectivity dependencies

  Background:
    Given the application is running locally

  Scenario: App loads when the host machine has no internet connection
    Given the host machine has no internet connection
    When I open the app in the browser
    Then the app loads successfully
    And no error messages related to connectivity are displayed

  Scenario: App functions — capture — when offline
    Given the host machine has no internet connection
    When I type "Understand QUIC protocol" into the capture input
    And I submit the capture form
    Then the item is saved successfully

  Scenario: App functions — backlog view — when offline
    Given the host machine has no internet connection
    When I navigate to the backlog view
    Then the backlog displays existing items without errors

  Scenario: App functions — status change — when offline
    Given the host machine has no internet connection
    And I have an "Open" item in the backlog
    When I mark the item as "In Progress"
    Then the item status changes successfully

  Scenario: App functions — resolve — when offline
    Given the host machine has no internet connection
    And I have an "In Progress" item
    When I resolve the item with a valid explanation
    Then the item status changes to "Resolved"

  Scenario: App functions — dashboard — when offline
    Given the host machine has no internet connection
    When I navigate to the dashboard view
    Then the dashboard displays metrics without errors

  Scenario: No network requests are made to external services at runtime
    When I use the app normally — capturing, viewing, updating, and resolving items
    Then the browser network log contains no requests to external domains
    And all network activity is limited to localhost

  Scenario: All data is read from and written to the local SQLite database
    When I capture a new item
    Then the item is persisted in the local SQLite database
    And no external API call is made during the write

  Scenario: App does not degrade or show errors when offline
    Given the host machine has no internet connection
    When I perform any supported action in the app
    Then no error messages referencing network failures or external services appear
