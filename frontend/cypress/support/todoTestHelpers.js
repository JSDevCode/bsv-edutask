// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Todo test helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared todo test data
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const defaultTodoText = 'Watch video'
export const setupTodoText = 'First'
export const validBoundaryTodoText = 'X'
export const validTodoText = 'Second'

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared task form selectors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const taskTitleInput = () => {
  return cy.get('#title')
}

const taskUrlInput = () => {
  return cy.get('#url')
}

const createTaskButton = () => {
  return cy.get('input[type="submit"][value="Create new Task"]')
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared todo selectors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const todoForm = () => {
  return cy.get('input[placeholder="Add a new todo item"]')
    .filter(':visible')
    .last()
    .closest('form')
}

const todoInput = () => {
  return todoForm()
    .find('input[placeholder="Add a new todo item"]')
}

const addTodoButton = () => {
  return todoForm()
    .find('input[type="submit"][value="Add"]')
}

const todoList = () => {
  return todoForm()
    .closest('ul.todo-list')
}

const todoLabels = () => {
  return todoList()
    .find('li.todo-item:visible span.editable')
}

const todoLabel = (todoText) => {
  return todoLabels()
    .filter((index, todoLabelElement) => {
      return todoLabelElement.innerText.trim() === todoText
    })
    .first()
}

const todoItem = (todoText) => {
  return todoLabel(todoText)
    .closest('li.todo-item')
}

const todoChecker = (todoText) => {
  return todoItem(todoText)
    .find('span.checker')
}

const todoRemover = (todoText) => {
  return todoItem(todoText)
    .find('span.remover')
}

const visibleTodoItemsWithText = ($todoList, todoText) => {
  return $todoList
    .find('li.todo-item:visible')
    .filter((index, todoItemElement) => {
      const todoLabelElement = todoItemElement.querySelector('span.editable')

      return todoLabelElement &&
        todoLabelElement.innerText.trim() === todoText
    })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared task form actions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const fillTaskForm = (task) => {
  taskTitleInput()
    .clear()
    .type(task.title)

  taskUrlInput()
    .clear()
    .type(task.url)
}

const submitTaskForm = () => {
  createTaskButton()
    .should('not.be.disabled')
    .click()
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared setup and navigation helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const createTaskAndOpenDetailView = (task) => {
  fillTaskForm(task)
  submitTaskForm()

  cy.contains('.title-overlay', task.title)
    .should('exist')
    .closest('a')
    .click({ force: true })

  cy.contains('h1', task.title)
    .should('exist')

  todoForm()
    .should('exist')

  todoInput()
    .should('exist')

  addTodoButton()
    .should('exist')

  todoList()
    .should('exist')
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared todo actions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const addTodo = (todoText) => {
  todoInput()
    .clear({ force: true })
    .type(todoText, { force: true })

  addTodoButton()
    .should('not.be.disabled')
    .click({ force: true })

  todoLabel(todoText)
    .should('exist')
}

export const setupTodoItem = (todoText) => {
  addTodo(todoText)
  expectTodoIsActive(todoText)
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Shared todo assertions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const expectTodoExists = (todoText) => {
  todoLabel(todoText)
    .should('exist')
}

export const expectTodoDoesNotExist = (todoText) => {
  todoLabels()
    .should(($todoLabelElements) => {
      const visibleTodoTexts = [...$todoLabelElements].map((todoLabelElement) => {
        return todoLabelElement.innerText.trim()
      })

      expect(visibleTodoTexts).not.to.include(todoText)
    })
}

export const expectDefaultTodoExists = () => {
  expectTodoExists(defaultTodoText)
}

export const expectSetupTodoExists = () => {
  expectTodoExists(setupTodoText)
}

export const expectTodoIsActive = (todoText) => {
  todoItem(todoText)
    .within(() => {
      cy.get('span.checker')
        .should('have.class', 'unchecked')
        .and('not.have.class', 'checked')

      cy.get('span.editable')
        .should('have.text', todoText)
    })
}

export const expectTodoIsDone = (todoText) => {
  todoItem(todoText)
    .within(() => {
      cy.get('span.checker')
        .should('have.class', 'checked')
        .and('not.have.class', 'unchecked')

      cy.get('span.editable')
        .should('have.text', todoText)
    })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        R8UC1 add todo item helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const expectTodoInputToBeEmpty = () => {
  todoInput()
    .click({ force: true })
    .clear({ force: true })
    .type('temporary reset text', { force: true })
    .type('{selectall}{backspace}', { force: true })
    .should('have.value', '')
}

export const expectAddTodoButtonToBeDisabled = () => {
  addTodoButton()
    .should('be.disabled')
}

export const expectTodoWasAppendedAfterExistingTodos = (todoText) => {
  todoList()
    .within(() => {
      cy.contains('span.editable', defaultTodoText)
        .should('exist')

      cy.contains('span.editable', setupTodoText)
        .should('exist')

      cy.get('li.todo-item:visible span.editable')
        .last()
        .should('have.text', todoText)
    })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        R8UC2 toggle todo item helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const toggleTodo = (todoText) => {
  todoChecker(todoText)
    .click({ force: true })
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        R8UC3 delete todo item helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const todoRemovalSettleDelay = 100

const clickTodoRemover = ($todoItem) => {
  return cy.wrap($todoItem)
    .scrollIntoView()
    .trigger('mouseover', { force: true })
    .find('span.remover')
    .first()
    .should('exist')
    .click({ force: true })
}

const completeTodoDeletion = (todoText, startedAt = Date.now()) => {
  return todoList()
    .then(($todoList) => {
      const $todoItem = visibleTodoItemsWithText($todoList, todoText).first()

      if ($todoItem.length === 0) {
        return
      }

      expect(
        Date.now() - startedAt,
        `delete "${todoText}"`
      ).to.be.lessThan(Cypress.config('defaultCommandTimeout'))

      return clickTodoRemover($todoItem)
        .then(() => {
          return cy.wait(todoRemovalSettleDelay)
        })
        .then(() => {
          return completeTodoDeletion(todoText, startedAt)
        })
    })
}

export const deleteTodo = (todoText) => {
  todoRemover(todoText)
    .should('exist')

  completeTodoDeletion(todoText)

  expectTodoDoesNotExist(todoText)
}