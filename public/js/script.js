// Default word length
let wordLength = 5;

// Store the current letters
let currentLetters = [];

// Update word length display
function updateWordLengthDisplay() {
  const display = document.getElementById('word-length-display');
  if (display) {
    display.querySelector('strong').textContent = wordLength;
  }
}

// Helper function to check if character is a letter
function isLetter(char) {
  return /^\p{L}$/u.test(char) || char === ' ' || char === '?';
}

// Initialize the letter inputs
function initializeLetterInputs(preserveLetters = false) {
  const container = document.getElementById('letters-container');
  
  // Store current letters if preserving
  if (preserveLetters) {
    currentLetters = Array.from(document.querySelectorAll('.letter-input')).map(input => input.value);
  }
  
  container.innerHTML = '';
  
  for (let i = 0; i < wordLength; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'letter-input';
    input.dataset.position = i;
    
    // Restore letter if available
    if (preserveLetters && i < currentLetters.length) {
      input.value = currentLetters[i];
    }
    
    container.appendChild(input);
  }
  
  // Add event listeners for easy navigation between boxes
  const inputs = document.querySelectorAll('.letter-input');
  inputs.forEach((input, index) => {
    // Add focus event to select all text when clicking on input
    input.addEventListener('focus', (e) => {
      e.target.select();
    });

    input.addEventListener('input', (e) => {
      // Filter out non-letter characters
      const value = e.target.value;
      if (value) {
        // Only allow letters, space, or question mark
        if (isLetter(value)) {
          // Keep spaces as is, but uppercase letters
          if (value !== ' ' && value !== '?') {
            e.target.value = value.toUpperCase();
          }
          
          // Move to next input
          if (index < inputs.length - 1) {
            setTimeout(() => inputs[index + 1].focus(), 0);
          }
        } else {
          // Non-letter input - clear it
          e.target.value = '';
        }
      }
    });
    
    input.addEventListener('keydown', (e) => {
      // Handle keyboard shortcuts for increasing/decreasing word length
      // Allow both with and without modifier keys
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        increaseWordLength(true);
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        decreaseWordLength(true);
        return;
      }
      
      // Handle Enter key to search
      if (e.key === 'Enter') {
        e.preventDefault();
        searchWords();
        return;
      }
      
      // Handle backspace to go back to previous input
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        // Handle left arrow key
        inputs[index - 1].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
        // Handle right arrow key
        inputs[index + 1].focus();
        e.preventDefault();
      }
    });
  });

  // Update the word length display
  updateWordLengthDisplay();
  
  // Auto-focus the first input after initialization
  if (inputs && inputs.length > 0) {
    setTimeout(() => inputs[0].focus(), 100);
  }
}

// Functions for increasing and decreasing word length
function increaseWordLength(preserveLetters = false) {
  wordLength++;
  updateWordLengthDisplay();
  initializeLetterInputs(preserveLetters);
}

function decreaseWordLength(preserveLetters = false) {
  if (wordLength > 1) {
    wordLength--;
    updateWordLengthDisplay();
    initializeLetterInputs(preserveLetters);
  }
}

// Add event listeners
document.getElementById('increase-btn').addEventListener('click', (e) => {
  e.preventDefault();
  increaseWordLength(true);
});

document.getElementById('decrease-btn').addEventListener('click', (e) => {
  e.preventDefault();
  decreaseWordLength(true);
});

document.getElementById('search-btn').addEventListener('click', (e) => {
  e.preventDefault();
  searchWords();
});

// Dictionary loading and word search functionality
let polishWords = [];

async function loadDictionary() {
  try {
    const response = await fetch('dict/polish.txt');
    if (!response.ok) {
      throw new Error('Failed to load dictionary');
    }
    const text = await response.text();
    polishWords = text.split('\n').map(word => word.trim().toLowerCase());
    console.log(`Loaded ${polishWords.length} Polish words`);
  } catch (error) {
    console.error('Error loading dictionary:', error);
    document.getElementById('results-status').textContent = 
      'Nie udało się wczytać słownika. Sprawdź konsolę, aby uzyskać więcej informacji.';
  }
}

function searchWords() {
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.setAttribute('aria-busy', 'true');
  
  const inputs = document.querySelectorAll('.letter-input');
  const pattern = Array.from(inputs).map(input => {
    // Treat both space and '?' as wildcards
    const val = input.value.trim();
    return (val === '' || val === ' ' || val === '?') ? '?' : val.toLowerCase();
  }).join('');
  
  // Create regex pattern - '?' represents any letter
  const regexPattern = new RegExp('^' + pattern.replace(/\?/g, '.') + '$');
  
  // Filter words from dictionary
  const matchingWords = polishWords.filter(word => 
    word.length === pattern.length && regexPattern.test(word)
  );
  
  // Display results
  const resultsStatus = document.getElementById('results-status');
  const resultsList = document.getElementById('results-list');
  
  if (matchingWords.length > 0) {
    // Update status with count
    resultsStatus.textContent = `Znaleziono ${matchingWords.length} pasujących słów:`;
    
    // Sort words alphabetically for better organization
    const sortedWords = [...matchingWords].sort((a, b) => a.localeCompare(b, 'pl'));
    
    // Create HTML elements: each word is a clickable link
    resultsList.innerHTML = sortedWords.map(word => 
      `<div><a href="https://sjp.pwn.pl/sjp/${encodeURIComponent(word)}" target="_blank" rel="noopener noreferrer">${word}</a></div>`
    ).join('');
    
    // Remove height constraint if there are many results to avoid unnecessary scrolling
    if (matchingWords.length > 30) {
      resultsList.style.maxHeight = 'none';
    }
  } else {
    resultsStatus.textContent = 'Nie znaleziono pasujących słów.';
    resultsList.innerHTML = '';
  }
  
  resultsContainer.setAttribute('aria-busy', 'false');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeLetterInputs();
  loadDictionary();
});
