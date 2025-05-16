// Default word length
let wordLength = 5;
// Default max length (will be updated after dictionary loads)
let maxWordLength = 20;

// Store the current letters
let currentLetters = [];

// Update word length display
function updateWordLengthDisplay() { 
  // Keep the input in sync with wordLength
  const input = document.getElementById('word-length-input');
  if (input) {
    input.value = wordLength;
    // Also ensure max attribute is set to maxWordLength
    input.setAttribute('max', maxWordLength);
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
    // Create a wrapper for index and input
    const wrapper = document.createElement('div');
    wrapper.className = 'letter-input-wrapper';

    // Subtle index number (1-based)
    const indexSpan = document.createElement('span');
    indexSpan.className = 'letter-index';
    indexSpan.textContent = i + 1;
    wrapper.appendChild(indexSpan);

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'letter-input';
    input.dataset.position = i;
    
    // Restore letter if available
    if (preserveLetters && i < currentLetters.length) {
      input.value = currentLetters[i];
    }
    
    wrapper.appendChild(input);
    container.appendChild(wrapper);
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
document.getElementById('word-length-input').addEventListener('change', (e) => {
  e.preventDefault();
  const newLength = parseInt(e.target.value);
  
  if (newLength && newLength >= 1 && newLength <= maxWordLength) {
    wordLength = newLength;
    updateWordLengthDisplay();
    initializeLetterInputs(true);
  } else {
    // Reset to current wordLength if invalid input
    e.target.value = wordLength;
  }
});

// Select all contents on focus or click for easier editing
const wordLengthInput = document.getElementById('word-length-input');
if (wordLengthInput) {
  wordLengthInput.addEventListener('focus', e => e.target.select());
  wordLengthInput.addEventListener('click', e => e.target.select());
}

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
    
    // Find the maximum word length in the dictionary
    maxWordLength = polishWords.reduce((max, word) => 
      Math.max(max, word.length), 0);
    
    // Update the input's max attribute
    const input = document.getElementById('word-length-input');
    if (input) {
      input.setAttribute('max', maxWordLength);
    }
    
    console.log(`Loaded ${polishWords.length} Polish words. Maximum word length: ${maxWordLength}`);
  } catch (error) {
    console.error('Error loading dictionary:', error);
    document.getElementById('results-status').textContent = 
      'Nie udało się wczytać słownika. Sprawdź konsolę, aby uzyskać więcej informacji.';
  }
}

function searchWords() {
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.setAttribute('aria-busy', 'true');
  // Show results container if hidden
  resultsContainer.hidden = false;
  
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
    let shownWords = matchingWords;
    let infoMsg = '';
    if (matchingWords.length > 1000) {
      // Shuffle and pick 1000 random words
      shownWords = matchingWords
        .map(word => ({ word, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 1000)
        .map(obj => obj.word);
      infoMsg = ` (pokazano losowe 1000 z ${matchingWords.length})`;
    }
    resultsStatus.textContent = `Znaleziono ${matchingWords.length} pasujących słów${infoMsg}:`;
    
    // Sort words alphabetically for better organization
    const sortedWords = [...shownWords].sort((a, b) => a.localeCompare(b, 'pl'));
    
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
