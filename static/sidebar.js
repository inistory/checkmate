get_category();

/*===== EXPANDER MENU  =====*/
const showMenu = (toggleId, navbarId, bodyId) => {
  const toggle = document.getElementById(toggleId),
    navbar = document.getElementById(navbarId),
    bodypadding = document.getElementById(bodyId);

  if (toggle && navbar) {
    toggle.addEventListener("click", () => {
      navbar.classList.toggle("expander");

      bodypadding.classList.toggle("body-pd");
    });
  }
};
showMenu("nav-toggle", "navbar", "body-pd");

/*===== COLLAPSE MENU  =====*/
const linkCollapse = document.getElementsByClassName("collapse__link");
var i;

for (i = 0; i < linkCollapse.length; i++) {
  linkCollapse[i].addEventListener("click", function () {
    const collapseMenu = this.nextElementSibling;
    collapseMenu.classList.toggle("showCollapse");

    const rotate = collapseMenu.previousElementSibling;
    rotate.classList.toggle("rotate");
  });
}

/*===== create_new_personal_list =====*/
var create_personal_list_btn = document.getElementById(
  "create_personal_list_btn"
);

function create_personal_list() {
  var new_personal_list = document.createElement("a");
  var br = document.createElement("br");

  new_personal_list.innerHTML = "New_List";

  new_personal_list.setAttribute("href", "#");
  new_personal_list.setAttribute("class", "collapse__sublink");
  new_personal_list.setAttribute("onclick", "location.href='/tasks'");

  var parent_personal_list = document.getElementById("sub_personal_list");
  parent_personal_list.appendChild(new_personal_list);
  parent_personal_list.appendChild(br);

  // create new list -> post to db
  var url = "/todo/";
  var randomColor = "#".concat(
    Math.floor(Math.random() * 16777215).toString(16)
  );

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      name: "New_list",
      color: randomColor,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (type) {
      return type.json();
    })
    .then(function (result) {
      console.log(result);
      var id = result.result.id;
      var name = result.result.name;
      var color = result.result.color.replace('#', '');
      console.log(color);

      var now_url = new URL(location.href);
      var base_url = now_url.origin;
      console.log(now_url);
      console.log(base_url);

      new_url = `/tasks?category_id=${id}&category_name=${name}&category_color=${color}`;
      console.log(new_url);
      window.location.href = base_url+new_url;
    });
}

create_personal_list_btn.addEventListener("click", create_personal_list);

/*===== active color =====*/
const linkColor = document.querySelectorAll(".nav__link");
const listColor = document.querySelectorAll(".collapse__sublink");
listColor.forEach((l) => l.classList.remove("list_active"));

//for calendar
if (window.location.pathname == "/calendar/") {
  var current_location = document.getElementById("nav_calendar");
  linkColor.forEach((l) => l.classList.remove("active"));
  current_location.classList.add("active");
}

// for personal-group
else if (window.location.pathname == "/tasks") {
  var current_location = document.getElementById("personal_todo");
  linkColor.forEach((l) => l.classList.remove("active"));
  current_location.classList.add("active");

  var current_list = document.getElementById("category");
  current_list.classList.add("list_active");
}

// for profile
else if (window.location.pathname == "/myprofile") {
  var current_location = document.getElementById("profile");
  linkColor.forEach((l) => l.classList.remove("active"));
  current_location.classList.add("active");
}

// settings
else if (window.location.pathname == "/feedback") {
  var current_location = document.getElementById("feedback");
  linkColor.forEach((l) => l.classList.remove("active"));
  current_location.classList.add("active");
}

//get_category
function get_category() {
  var url = "/todo";
  fetch(url)
    .then(function (type) {
      return type.json();
    })
    .then(function (result) {
      var result = result.result;
      for (var i = 0; i < result.length; i++) {
        var name = result[i].name;
        var id = result[i].id;
        var color = result[i].color.replace('#', '');
        console.log(name);

        // get titles
        var category = `<a href='#' class='collapse__sublink category' onclick='location.href=\"/tasks?category_id=${id}&category_name=${name}&category_color=${color}\"'>${name}</a>`;
        console.log(category);
        var br = $("<br>");
        $("#sub_personal_list").append(category, br);
      }
    });
}
