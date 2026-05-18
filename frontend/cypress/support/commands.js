// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Custom Cypress commands
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Application endpoints
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const API_URL = 'http://localhost:5000'
const APP_URL = 'http://localhost:3000'

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        User response helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const getFullName = (user) => {
  return `${user.firstName} ${user.lastName}`
}

const extractUserId = (response) => {
  return response.body?._id?.$oid || response.body?._id || response.body?.id
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Test user commands
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cypress.Commands.add('createTestUser', () => {
  return cy.fixture('user.json').then((user) => {
    return cy.request({
      method: 'POST',
      url: `${API_URL}/users/create`,
      form: true,
      body: user
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201])

      const userId = extractUserId(response)

      expect(userId, 'created user id').to.exist

      return {
        user,
        userId,
        fullName: getFullName(user)
      }
    })
  })
})

Cypress.Commands.add('deleteTestUser', (context) => {
  if (!context?.userId) {
    return cy.wrap(null)
  }

  return cy.request({
    method: 'DELETE',
    url: `${API_URL}/users/${context.userId}`,
    failOnStatusCode: false
  })
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Authentication commands
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cypress.Commands.add('loginAs', (user) => {
  cy.visit(APP_URL)

  cy.contains('div', 'Email Address')
    .find('input[type=text]')
    .clear()
    .type(user.email)

  cy.get('form').submit()

  cy.get('h1', { timeout: 10000 })
    .should('contain.text', `Your tasks, ${getFullName(user)}`)
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Fixture commands
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cypress.Commands.add('loadTaskFixture', () => {
  return cy.fixture('task.json')
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//        Navigation commands
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cypress.Commands.add('visitApp', () => {
  return cy.visit(APP_URL)
})