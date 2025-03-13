import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json()); // To parse JSON request bodies

// Mock users and events
let users = [
  { username: 'testuser', password: 'password123' },
  { username: 'johndoe', password: 'password456' },
];

let events = [];
let loggedInUser = null;

// Authentication middleware
function authenticate(req, res, next) {
  if (!loggedInUser) {
    return res.status(401).send('You must be logged in.');
  }
  req.loggedInUser = loggedInUser;
  next();
}

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    loggedInUser = user;
    return res.status(200).send('Logged in successfully.');
  } else {
    return res.status(401).send('Invalid username or password.');
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  loggedInUser = null;
  return res.status(200).send('Logged out successfully.');
});

// Event creation route
app.post('/api/events', authenticate, (req, res) => {
  const { name, description, date, time, category, reminderTime } = req.body;

  const event = {
    id: events.length + 1,
    name,
    description,
    date,
    time,
    category,
    reminderTime,
    reminderSent: false,
  };

  events.push(event);
  return res.status(201).json(event);
});

// Get upcoming events route
app.get('/api/events/upcoming', authenticate, (req, res) => {
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(`${event.date} ${event.time}`) > now);
  res.json(upcomingEvents);
});

// Get events by category route
app.get('/api/events/category/:category', authenticate, (req, res) => {
  const { category } = req.params;
  const filteredEvents = events.filter(event => event.category === category);
  res.json(filteredEvents);
});

// Get events by reminder status route
app.get('/api/events/reminder/:status', authenticate, (req, res) => {
  const { status } = req.params;
  const reminderStatus = status === 'sent';
  const filteredEvents = events.filter(event => event.reminderSent === reminderStatus);
  res.json(filteredEvents);
});

// Reminder notification route (simulate sending reminders)
app.post('/api/events/reminder', authenticate, (req, res) => {
  const { eventId } = req.body;
  const event = events.find(e => e.id === eventId);

  if (event) {
    if (event.reminderSent) {
      return res.status(400).send('Reminder already sent for this event.');
    }

    event.reminderSent = true;
    return res.status(200).send('Reminder sent.');
  } else {
    return res.status(404).send('Event not found.');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
