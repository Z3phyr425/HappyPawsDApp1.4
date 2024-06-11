// Function to check if the entered address is allowed
function isAddressAllowed(enteredAddress, allowedAddresses) {
  return allowedAddresses.includes(enteredAddress.toLowerCase());
}

// Function to check if the user is already logged in
function isUserLoggedIn() {
  return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Example login function using MetaMask
async function loginWithMetaMask() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask to use this feature.');
      return;
    }

    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    // Get the selected account
    const selectedAddress = accounts[0].toLowerCase();

    // Replace this with your actual method to get Ganache accounts
    const ganacheAccounts = await ethereum.request({ method: 'eth_accounts' });

    // List of allowed addresses (replace with your actual allowed addresses)
    const allowedAddresses = [
      '0x2084407b8c9d7708a6bf5c7a04e3eee5db62bce6',
      '0x88001c871a034377e0cce4cb5c5e6b2d67e0bad8',
      '0x7e010f4beef32e290660181c7f1c42ef7b6b8209',
      '0x552c17d6db1853b4cf51340841a2f65f22f83130',
      '0xcf09f67feeac469686d6d701e78432f239b37c0b',
      '0xfe07a3ddf624d0829aa1a176bb0f9f83557eb564',
      '0xd48317356c683771b49e4173ce1687e5c7ee9570',
      '0xb26948c8c49a0262231ddff39620fbed466df673',
      '0x2a8badecebd26f523f3add355161136f5636bd1d',
      '0xc4292a4ada5a237286f62f6305230dfabfd6f56b'
      // Add other allowed addresses
    ];

    // Get the element to display the result
    const resultElement = document.getElementById('loginResult');

    if (isAddressAllowed(selectedAddress, allowedAddresses)) {
      // Check if the user is already logged in
      if (isUserLoggedIn()) {
        alert('You are already logged in. Change your account to access index.html.');
      } else {
        // Login successful
        resultElement.innerHTML = `Login successful for address: ${selectedAddress}`;
        resultElement.style.color = 'green';

        // Set a session flag to indicate the user is logged in
        sessionStorage.setItem('isLoggedIn', 'true');

        // Replace the current history state to remove the login page from the history
        history.replaceState(null, document.title, window.location.href);

        // Redirect to the new page (replace 'dashboard.html' with your actual page)
        window.location.href = 'dashboard.html';
      }
    } else {
      // Login failed
      resultElement.innerHTML = `Login failed for address: ${selectedAddress}`;
      resultElement.style.color = 'red';

      // Clear the session flag to indicate the user is logged out
      sessionStorage.removeItem('isLoggedIn');
    }
  } catch (error) {
    console.error('Error during MetaMask login:', error);
  }
}

// Attach click event to the login button
document.getElementById('loginButton').addEventListener('click', loginWithMetaMask);

// Check if the user is already logged in
window.addEventListener('load', () => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  // If already logged in, redirect to dashboard.html
  if (isLoggedIn) {
    window.location.href = 'dashboard.html';
  }
});
