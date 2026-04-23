const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");

const app = express();
const SECRET = "mysecretkey";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= FILE SYSTEM SETUP =================
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const tasksFile = path.join(dataDir, "tasks.json");

// Create folder if not exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create users.json if not exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

// Create tasks.json if not exists
if (!fs.existsSync(tasksFile)) {
  fs.writeFileSync(tasksFile, "[]");
}

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  let users = JSON.parse(fs.readFileSync(usersFile));

  const newUser = {
    id: Date.now(),
    username,
    password
  };

  users.push(newUser);

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "User registered" });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("LOGIN INPUT:", username, password); // DEBUG

  let users = JSON.parse(fs.readFileSync(usersFile));
  console.log("USERS:", users); // DEBUG

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    console.log("LOGIN FAILED");
    return res.status(401).json({ message: "Invalid credentials" });
  }

  console.log("LOGIN SUCCESS");

  const token = jwt.sign({ id: user.id }, SECRET);
  res.json({ token });
});

// ================= AUTH =================
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ================= ADD TASK =================
app.post("/tasks", authMiddleware, (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(tasksFile));

  const newTask = {
    id: Date.now(),
    userId: req.user.id,
    title: req.body.title,
    completed: false
  };

  tasks.push(newTask);

  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

  res.json(newTask);
});

// ================= GET TASKS =================
app.get("/tasks", authMiddleware, (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(tasksFile));

  const userTasks = tasks.filter(task => task.userId === req.user.id);

  res.json(userTasks);
});

// ================= UPDATE TASK =================
app.put("/tasks/:id", authMiddleware, (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(tasksFile));

  tasks = tasks.map(task =>
    task.id == req.params.id && task.userId === req.user.id
      ? { ...task, ...req.body }
      : task
  );

  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

  res.json({ message: "Task updated" });
});

// ================= DELETE TASK =================
app.delete("/tasks/:id", authMiddleware, (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(tasksFile));

  tasks = tasks.filter(
    task => !(task.id == req.params.id && task.userId === req.user.id)
  );

  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

  res.json({ message: "Task deleted" });
});

// ================= START SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});