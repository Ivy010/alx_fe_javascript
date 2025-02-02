// URL to fetch quotes from JSONPlaceholder
const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

// Array of quote objects
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Happiness" },
];

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p>`;
  saveLastViewedQuote(quotes[randomIndex].text);
}

// Function to add a new quote
async function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    await postQuoteToServer(newQuote);
    populateCategories(); // Update categories dropdown
    alert('New quote added and synced with the server!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  let optionsHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;  // Use textContent to set the category name
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// Function to get filtered quotes
function getFilteredQuotes() {
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

// Function to create and add the form for adding new quotes
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastViewedQuote', quote);
}

// Load last viewed quote from session storage
function loadLastViewedQuote() {
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${lastViewedQuote}</p>`;
  }
}

// Function to export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const dataUri = URL.createObjectURL(dataBlob);

  const exportFileDefaultName = 'quotes.json';

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories(); // Update categories dropdown
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  const response = await fetch(apiUrl);
  const serverQuotes = await response.json();
  return serverQuotes.map(quote => ({ text: quote.body, category: 'Server' })); // Map data to match our quote structure
}

// Function to post new quotes to the server (simulated)
async function postQuoteToServer(quote) {
  await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: {
      'Content-Type': 'application/json',  // Correct "Content-Type" header
    },
  });
}

// Function to sync quotes with the server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  mergeQuotes(serverQuotes);
}

// Merge quotes from server and resolve conflicts
function mergeQuotes(serverQuotes) {
  const mergedQuotes = [...quotes];
  let conflictResolved = false;
  
  serverQuotes.forEach(serverQuote => {
    const found = mergedQuotes.some(localQuote => localQuote.text === serverQuote.text);
    if (!found) {
      mergedQuotes.push(serverQuote);
      conflictResolved = true;
    }
  });

  if (conflictResolved) {
    showNotification('Quotes synced with the server and conflicts resolved.');
  }
  
  quotes = mergedQuotes;
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification for conflict resolution
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerHTML = `<strong>${message}</strong>`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000); // Hide after 5 seconds
}

// Periodically fetch quotes from server (every minute)
setInterval(syncQuotes, 60000); // 60000 milliseconds = 1 minute

// Call createAddQuoteForm on page load
window.onload = function() {
  populateCategories();
  loadLastViewedQuote();
  createAddQuoteForm();  // Generate the form for adding quotes
  document.getElementById('newQuote').addEventListener('click', showRandomQuote); // Add event listener for "Show New Quote" button
};






  
