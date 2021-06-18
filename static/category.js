// delete request
function deleteCategory(url, category_id) {
  const option = {
    method: "DELETE",
    body: JSON.stringify({
      category_id: category_id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch(url, option)
    .then(function (type) {
      return type.json();
    })
      .then(function (result) {
        if (result.status === "success") {
          window.location.replace("/dashboard");
        } else {
          alert("Sorry, can not delete this category.");
        }
      });
}

function handleDelCategoryBtn() {
  const category_id = window.location.search.split('?category_id=')[1].split('&')[0];
  const delCategoryBtn = document.querySelector("#category_delete_btn");
  const URL = "/todo/";
  
  if (delCategoryBtn) {
    delCategoryBtn.addEventListener("click", function() {
      deleteCategory(URL, category_id);
    })
  }
}

function init() {
  handleDelCategoryBtn();
}

init();