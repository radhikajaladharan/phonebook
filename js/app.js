let contacts = [];

// DOM elements
const contactsTableBody = document.querySelector('#contactsTable tbody');
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const contactIdInput = document.getElementById('contactId');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const messageDiv = document.getElementById('message');

// To show messages
function showMessage(msg, isError = false) {
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    messageDiv.textContent = '';
  }, 3000);
}

// Function to fetch all contacts
async function loadContacts() {
  renderContacts(contacts);
}

// Render contacts in table
function renderContacts(list) {
  contactsTableBody.innerHTML = '';
  if (list.length === 0) {
    contactsTableBody.innerHTML = `<tr><td colspan="3">No contacts found.</td></tr>`;
    return;
  }
  list.forEach(contact => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>
        <button data-id="${contact.id}" class="editBtn">Edit</button>
        <button data-id="${contact.id}" class="deleteBtn">Delete</button>
      </td>
    `;
    contactsTableBody.appendChild(tr);
  });
  // Attach event listeners for edit & delete
  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });
}

// Handler for Add / Update form submit
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!name || !phone) {
    showMessage('Please provide both name and phone number.', true);
    return;
  }

  const existingId = contactIdInput.value;
  if (existingId) {
    // Update existing
    await updateContact(existingId, name, phone);
  } else {
    // Add new
    await addContact(name, phone);
  }

  // Reset form
  contactForm.reset();
  contactIdInput.value = '';
  cancelUpdateBtn.style.display = 'none';

  // Reload table
  await loadContacts();
});

// Cancel update
cancelUpdateBtn.addEventListener('click', () => {
  contactForm.reset();
  contactIdInput.value = '';
  cancelUpdateBtn.style.display = 'none';
});

// Add contact
async function addContact(name, phone) {
  try {
    const newContact = { id: Date.now().toString(), name, phone };
    contacts.push(newContact);
    showMessage('Contact added successfully.');
  } catch (err) {
    console.error(err);
    showMessage('Failed to add contact.', true);
  }
}

// Update contact
async function updateContact(id, name, phone) {
  try {
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) {
      showMessage('Contact not found for update.', true);
      return;
    }
    contacts[index].name = name;
    contacts[index].phone = phone;
    showMessage('Contact updated successfully.');
  } catch (err) {
    console.error(err);
    showMessage('Failed to update contact.', true);
  }
}

// Delete contact
async function handleDelete(e) {
  const id = e.target.getAttribute('data-id');
  if (!confirm('Are you sure you want to delete this contact?')) return;
  try {
    contacts = contacts.filter(c => c.id !== id);
    await loadContacts();
    showMessage('Contact deleted successfully.');
  } catch (err) {
    console.error(err);
    showMessage('Failed to delete contact.', true);
  }
}

// Edit contact
function handleEdit(e) {
  const id = e.target.getAttribute('data-id');
  const contact = contacts.find(c => c.id === id);
  if (!contact) {
    showMessage('Contact not found for editing.', true);
    return;
  }
  nameInput.value = contact.name;
  phoneInput.value = contact.phone;
  contactIdInput.value = contact.id;
  cancelUpdateBtn.style.display = 'inline-block';
}

// Search contacts
searchBtn.addEventListener('click', async () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    await loadContacts();
    return;
  }
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.phone.toLowerCase().includes(term)
  );
  renderContacts(filtered);
});

clearSearchBtn.addEventListener('click', async () => {
  searchInput.value = '';
  await loadContacts();
});

// On page load
window.addEventListener('DOMContentLoaded', async () => {
  await loadContacts();
});
