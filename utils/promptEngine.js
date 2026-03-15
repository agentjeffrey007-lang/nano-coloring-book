// Contextual Question Generator
export async function generateContextualQuestions(userInput) {
  // This would normally call an LLM, but for now returning templates
  const questionTemplates = {
    animals: [
      {
        text: 'Where should the animals be?',
        options: ['In their natural habitat', 'In a fantasy world', 'Doing an activity', 'Multiple environments'],
      },
      {
        text: 'How many animals?',
        options: ['Just one', 'A family group', 'A whole herd/flock', 'Mix of different animals'],
      },
      {
        text: 'What mood should it have?',
        options: ['Playful & cute', 'Adventurous', 'Peaceful & calm', 'Magical & whimsical'],
      },
    ],
    space: [
      {
        text: 'What space elements?',
        options: ['Planets', 'Stars & galaxies', 'Spaceships', 'Aliens & creatures'],
      },
      {
        text: 'Should it be realistic or fantasy?',
        options: ['Realistic science', 'Pure fantasy', 'Mix of both', 'Cartoonish & fun'],
      },
      {
        text: 'How many pages should focus on space?',
        options: ['All space', 'Mostly space with planets', 'Half space, half other', 'Space themes throughout'],
      },
    ],
    default: [
      {
        text: 'What setting should it have?',
        options: ['Indoor', 'Outdoor nature', 'Fantasy world', 'Abstract/artistic'],
      },
      {
        text: 'Complexity level?',
        options: ['Simple & bold', 'Medium detail', 'Highly detailed', 'Very intricate'],
      },
      {
        text: 'Any special themes?',
        options: ['None, just the subject', 'Include decorative borders', 'Add patterns', 'Tell a story'],
      },
    ],
  };

  // Simple categorization logic
  let category = 'default';
  const lower = userInput.toLowerCase();
  
  if (lower.includes('animal') || lower.includes('dog') || lower.includes('cat') || lower.includes('turtle')) {
    category = 'animals';
  } else if (lower.includes('space') || lower.includes('planet') || lower.includes('astronaut')) {
    category = 'space';
  }

  return questionTemplates[category];
}

// Synthesize final prompt from user answers
export async function synthesizePrompt(userInput, answers, chatMessage) {
  let prompt = `Create a coloring book page series (black and white line art) featuring: ${userInput}. `;

  // Add answer context
  Object.values(answers).forEach((answer) => {
    prompt += `${answer}. `;
  });

  // Add chat refinements
  if (chatMessage) {
    prompt += `Additional details: ${chatMessage}. `;
  }

  prompt += 'Style: Clean black and white line art, suitable for children to color, detailed but not overly complex, high contrast.';

  return prompt;
}
