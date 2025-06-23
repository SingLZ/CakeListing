import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit, handledDelete } from "./addEdit.js";

let jobsDiv = null;
let jobsTable = null;
let jobsTableHeader = null;

export const handleJobs = () => {
  jobsDiv = document.getElementById("jobs");
  const logoff = document.getElementById("logoff");
  const addJob = document.getElementById("add-job");
  jobsTable = document.getElementById("jobs-table");
  jobsTableHeader = document.getElementById("jobs-table-header");
  const sortAsc = document.getElementById("sort-asc");
  const sortDesc = document.getElementById("sort-desc");

  sortAsc.addEventListener("click", () => showJobs("name"));
  sortDesc.addEventListener("click", () => showJobs("-name"));


  jobsDiv.addEventListener("click", (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addJob) {
        showAddEdit(null);
      } else if (e.target === logoff) {
        setToken(null);

        message.textContent = "You have been logged off.";

        jobsTable.replaceChildren([jobsTableHeader]);

        showLoginRegister();
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        handledDelete(e.target.dataset.id);
      }
        
    }
  });
};

export const showJobs = async (sort = "") => {
  try {
    enableInput(false);

    const url = new URL("/api/v1/cakes", window.location.origin);
    if (sort) url.searchParams.append("sort", sort);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    let children = [jobsTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        jobsTable.replaceChildren(...children);
      } else {
        for (let cake of data.cakes) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${cake.name}</td>
            <td>${cake.description}</td>
            <td><img src="${cake.image}" alt="${cake.name}" width="100"></td>
            <td>$${cake.price?.toFixed(2) || ''}</td>
            <td>${cake.isAvailable ? '✅' : '❌'}</td>
            <td>
              <button type="button" class="editButton" data-id="${cake._id}">edit</button>
              <button type="button" class="deleteButton" data-id="${cake._id}">delete</button>
            </td>
          `;
          children.push(row);
        }
        jobsTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.error(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(jobsDiv);
};
