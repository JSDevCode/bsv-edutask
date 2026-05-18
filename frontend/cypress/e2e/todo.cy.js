// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        R8 todo item requirement tests
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import {
  addTodo,
  createTaskAndOpenDetailView,
  deleteTodo,
  expectAddTodoButtonToBeDisabled,
  expectDefaultTodoExists,
  expectSetupTodoExists,
  expectTodoDoesNotExist,
  expectTodoInputToBeEmpty,
  expectTodoIsActive,
  expectTodoIsDone,
  expectTodoWasAppendedAfterExistingTodos,
  setupTodoItem,
  setupTodoText,
  toggleTodo,
  validBoundaryTodoText,
  validTodoText
} from '../support/todoTestHelpers'

describe('R8: Todo item requirements', () => {
  let context = null

  beforeEach(() => {
    cy.viewport(1280, 900)

    cy.createTestUser().then((createdContext) => {
      context = createdContext

      cy.loginAs(context.user)

      cy.loadTaskFixture().then((task) => {
        const taskForTest = {
          ...task,
          title: `${task.title} ${Date.now()}`
        }

        createTaskAndOpenDetailView(taskForTest)
        setupTodoItem(setupTodoText)
      })
    })
  })

  afterEach(() => {
    if (context) {
      cy.deleteTestUser(context)
      context = null
    }
  })

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //        R8UC1 adding a todo item to an existing task
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  describe('R8UC1: Adding a todo item to an existing task', () => {
    it('R8UC1-T1: keeps Add disabled when the todo description is empty', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()
      expectTodoInputToBeEmpty()
      expectAddTodoButtonToBeDisabled()
    })

    it('R8UC1-T2: accepts the smallest valid todo description', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()

      addTodo(validBoundaryTodoText)

      expectTodoWasAppendedAfterExistingTodos(validBoundaryTodoText)
      expectTodoIsActive(validBoundaryTodoText)
    })

    it('R8UC1-T3: adds a valid todo item below the existing todo items', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()

      addTodo(validTodoText)

      expectTodoWasAppendedAfterExistingTodos(validTodoText)
      expectTodoIsActive(validTodoText)
    })
  })

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //        R8UC2 toggling a todo item in an existing task
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  describe('R8UC2: Toggling a todo item in an existing task', () => {
    it('R8UC2-T1: toggles an active todo item to done', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()
      expectTodoIsActive(setupTodoText)

      toggleTodo(setupTodoText)

      expectTodoIsDone(setupTodoText)
    })

    it('R8UC2-T2: toggles a done todo item back to active', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()
      expectTodoIsActive(setupTodoText)

      toggleTodo(setupTodoText)
      expectTodoIsDone(setupTodoText)

      toggleTodo(setupTodoText)
      expectTodoIsActive(setupTodoText)
    })
  })

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //        R8UC3 deleting a todo item from an existing task
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  describe('R8UC3: Deleting a todo item from an existing task', () => {
    it('R8UC3-T1: deletes an existing todo item', () => {
      expectDefaultTodoExists()
      expectSetupTodoExists()

      deleteTodo(setupTodoText)

      expectTodoDoesNotExist(setupTodoText)
      expectDefaultTodoExists()
    })
  })
})