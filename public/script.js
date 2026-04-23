const API = "http://localhost:3000";

// LOGIN
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Trying login:", username, password); // DEBUG

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  console.log("Login response:", data); // DEBUG

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard.html";
  } else {
    alert("Login failed!");
  }
}

// REGISTER
async function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  console.log("Registering:", username, password);

  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("Response:", data);

    alert("Registered successfully!");
    closeRegister();

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong!");
  }
}
// LOAD TASKS
async function loadTasks() {
  const res = await fetch(API + "/tasks", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${task.title}
      <button onclick="deleteTask(${task.id})">Delete</button>
      <button onclick="updateTask(${task.id})">Update</button>
    `;

    list.appendChild(li);
  });
}

// ADD TASK
async function addTask() {
  const title = document.getElementById("taskInput").value;

  await fetch(API + "/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ title })
  });

  loadTasks();
}

// DELETE TASK
async function deleteTask(id) {
  await fetch(API + "/tasks/" + id, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  loadTasks();
}

// UPDATE TASK
async function updateTask(id) {
  const newTitle = prompt("Enter new task:");

  await fetch(API + "/tasks/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ title: newTitle })
  });

  loadTasks();
}

// AUTO LOAD TASKS
if (window.location.pathname.includes("dashboard.html")) {
  loadTasks();
}
// OPEN REGISTER MODAL
function openRegister() {
  document.getElementById("registerModal").style.display = "flex";
}

// CLOSE REGISTER MODAL
function closeRegister() {
  document.getElementById("registerModal").style.display = "none";
}