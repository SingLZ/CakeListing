import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showJobs } from "./jobs.js";

let addEditDiv = null;
let name = null;
let description = null;
let image = null;
let addingCake = null;

export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-job");
  name = document.getElementById("cake");
  description = document.getElementById("description");
  image = document.getElementById("image");
  addingCake = document.getElementById("adding-job");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingCake) {
        enableInput(false);

        let method = "POST";
        let url = "/api/v1/cakes";

        if (addingCake.textContent === "update") {
          method = "PATCH";
          url = `/api/v1/cakes/${addEditDiv.dataset.id}`;
        }

        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: name.value,
              description: description.value,
              image: image.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            if (response.status === 200) {
              message.textContent = "The cake entry was updated.";
            } else {
              message.textContent = "The cake entry was created.";
            }

            name.value = "";
            description.value = "";
            image.value = "";
            showJobs();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.log(err);
          message.textContent = "A communication error occurred.";
        }
        enableInput(true);
      }
    }
  });
};

export const showAddEdit = async (cakeId) => {

  if (!cakeId) {
    name.value = "";
    description.value = "";
    image.value = "";
    addingCake.textContent = "add";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);

    try {
      const response = await fetch(`/api/v1/cakes/${cakeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200 && data.cake) {
        name.value = data.cake.name;
        description.value = data.cake.description;
        image.value = data.cake.image;
        addingCake.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = cakeId;

        setDiv(addEditDiv);
      } else {
        message.textContent = "The cake entry was not found";
        showJobs();
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communication error has occurred.";
      showJobs();
    }

    enableInput(true);
  }
};

export const handledDelete = async (cakeId) => {
      // DELETE handler
      if (confirm("Are you sure you want to delete this cake?")) {
        enableInput(false);
        try {
          const response = await fetch(`/api/v1/cakes/${cakeId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.status === 200) {
            message.textContent = "The cake entry was deleted.";
            showJobs();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.log(err);
          message.textContent = "A communication error occurred.";
        }
        enableInput(true);
      }}

