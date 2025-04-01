describe('Chat Application', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3001/api/chat/message', {
      statusCode: 200,
      body: { response: 'This is a test AI response' }
    }).as('chatMessage');
  });

  it('should send message and receive AI response', () => {
    cy.visit('/');
    
    // Type and send a message
    cy.get('input[placeholder="Type your message..."]').type('Hello, AI!');
    cy.get('button').click();

    // Verify user message appears
    cy.contains('Hello, AI!').should('be.visible');

    // Wait for and verify AI response
    cy.wait('@chatMessage');
    cy.contains('This is a test AI response').should('be.visible');
  });

  it('should handle empty messages', () => {
    cy.visit('/');
    
    // Try to send empty message
    cy.get('button').click();
    
    // Verify no message was sent
    cy.get('@chatMessage.all').should('have.length', 0);
  });
}); 