# How to contribute to UniForum

## Contribution Workflow

Collaborative task management is conducted in the main project repository using

> - [Issues](#issues-tasks)
> - [Kanban board](../../../projects) - _links to the Project board_
> - [Pull Requests](#pull-requests)

### Repository contribution workflow:

> - **_IFF_** you are not already currently _assigned_ to any other task [Issue](#issues-tasks) in either
> - the '_In progress_' column in the [Kanban board](../../../projects), or
> - the '_To do_' column in the [Kanban board](../../../projects)

- assign yourself to an [Issue](#issues-tasks)
  - in either
    - the '_To do_' column in the [Kanban board](../../../projects)
    - the '_In progress_' column in the [Kanban board](../../../projects)
      - **_IFF_ existing contributors allow it**
  - or in a new task [Issue](#issues-tasks) created by you
    - **_IFF_ the _team_ or _sub-team_ allows it**, and
    - the [Issue](#issues-tasks) guidelines are followed
- move the [Issue](#issues-tasks) to the '_In progress_' column before (re)starting the task
- fork either
  - the main repository
  - an existing fork (when joining an [Issue](#issues-tasks) already in progress)
- clone forked repository
- create a development branch in the cloned forked repository
  - name the branch something relevant to the [Issue](#issues-tasks) and understandable
- for development guidelines see [Development](#development)
- add completed development changes to remote main repository
  - push changes to the development branch in the forked repository
    - _**DO NOT**_ use `push --force`
  - create a new [Pull Request](#pull-requests) to the main repository

## Issues (tasks)

### Issues (tasks) workflow

- Tasks should initially be collaboratively planned in team meetings
- Tasks created after team meetings should be discussed and approved on Discord
  - refer to [contribution workflow](#repository-contribution-workflow)
- A new issue must be created for each project task
- A task issue must
  - on creation
    - not already exist (open or closed)
    - have a relevant and understandable title
    - have a description either
      - stating what it is and why it is needed if a _feature_
      - stating as much information as possible if a _bug_
    - have a _Label_ **_IFF_**
      - _enhancement_
      - _bug_
      - _documentation_
    - have a _Project_ (linked to it)
      - and be in the '_To do_' column in the [Kanban board](../../../projects)
    - have a _Milestone_ (linked to it)
  - when started
    - have those contributing to it set as _Assignee(s)_
    - be in the '_In progress_' column in the [Kanban board](../../../projects)
  - when stopped
    - have a Label **_IFF_**
      - _help wanted_
      - _duplicate_
      - _invalid_ (not suitable for the project)
      - _wontfix_ (won't be worked on)
    - be in the
      - '_Review in progress_' column in the [Kanban board](../../../projects)
        - **_IFF_**
          - a [Pull Request](#pull-requests) has been made before
            - it is approved, or
            - changes are requested
          - requested changes to a [Pull Request](#pull-requests) are completed
      - '_To do_' column in the [Kanban board](../../../projects)
        - **_IFF_**
          - incomplete, without _Assignee(s)_, and no pull request for it is open, or
      - '_Done_' column in the [Kanban board](../../../projects)
        - **_IFF_** is either Label
          - _duplicate_
          - _invalid_ (not suitable for the project)
          - _wontfix_ (won't be worked on)
  - when a [Pull Request](#pull-requests) review is approved, be in
    - the '_Done_' column in the [Kanban board](../../../projects)

#### [Click here to create a new issue](../../../issues/new)

## Development

Task development must be

- associated with an [Issue](#issues-tasks)
- contributed to
  - locally using a cloned fork of the main repository
  - in a development branch
- using the MERN stack
- documented
- tested using either
  - automated testing suites
  - documented manual testing
- reviewed before making a [Pull Request](#pull-requests) using either
  - a self-review, or
  - a peer-review (not a [code review](#code-review)), including
    - attribution of the peer-review with @ mention added to the task [Issue](#issues-tasks)

## Pull Requests

Pull requests are required for merging task contributions to the main repository

> Before making a pull request ensure changes are first pushed to a development branch in a fork repository

### Make a Pull Request

- Create a new pull request in the **forked** repository on the GitHub website
  - [Click here (in fork repo website) to create a new pull request](../../../compare)
  - click '_compare across forks_'
  - set _base repository:_ to **main repository**
  - set _base:_ to **master**
  - set _head repository:_ to **fork repository**
  - set _compare_ to **development branch**
- a pull request must have
  - a relevant and understandable title succinctly summarizing the changes
  - a more thorough description of the changes
  - link(s) to task [Issue(s)](#issues-tasks)
  - _can be added afterward_
    - a _Project_ (linked to it)
    - a _Milestone_ (linked to it)
    - a _Label_ **_IFF_**
      - _enhancement_
      - _bug_
      - _documentation_
  - at least one _Reviewer_ assigned for [code review](#code-review) - can be added by a reviewer
  - an _Assignee_ **responsible for merging** the pull request - can be added by an assignee
  - [Issue(s)](#issues-tasks) linked to the pull request must be moved to
    - the '_Review in progress_' column in the [Kanban board](../../../projects)

### Code review

#### To review a pull request

- go to the pull request on the main repository website
- assign yourself as a _Reviewer_ if you are not already assigned
- assign yourself as an _Assignee_ if you are **responsible for merging**
- check the pull request passes continuous integration workflow(s)
- review the code (on the website or locally)
- run test suites
- run the code
- pass or reject the pull request (see below)

#### To pass a pull request review

- go to the pull request on the main repository website
- click the _Review_ button
- accept the pull request
- notify those responsible (_Assignee_) for merging the pull request

#### To fail a pull request review

- go to the pull request on the main repository website
- click the _Review_ button
- request changes to the pull request
  - give a description of what and why the pull request requires a change
- move task [Issue(s)](#issues-tasks) linked to the pull request to
  - the '_In progress_' column in the [Kanban board](../../../projects)
- notify those responsible (_Assignee(s)_) for the task [Issue(s)](#issues-tasks) linked to the pull request

### Merging a Pull Request

To merge a pull request

- you must be assigned to the pull request as an _Assignee_
  - only this person is responsible for merging the pull request to the main repository
- all assigned code reviewers must approve the pull request before merging
- click the 'Squash and merge' button - only squash merge pull requests
- close the pull request (if not done automatically)
- move task [Issue(s)](#issues-tasks) linked to the pull request to
  - the '_Done_' column in the [Kanban board](../../../projects)

## Team Documentation

- Follow the [contribution workflow](#contribution-workflow) for team documentation contributions
- The [Pull Request](#pull-requests) must be approved by team members before merging
