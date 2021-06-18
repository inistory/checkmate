//show tutorial 
if (localStorage) {
  var visits_tasks = localStorage.getItem('visits_tasks');
  console.log(visits_tasks);
  if (visits_tasks == null) {
    console.log("welcome!")
    tutorial();
    localStorage.setItem("visits_tasks", "first_visit");
    var visits_tasks = localStorage.getItem('visits_tasks');
  } else {
    localStorage.setItem("visits_tasks", "visited");
  }
}

function tutorial () {
  $(document).ready(function(){
      $(".modal").fadeIn();
  });
}

$(function(){ 
  $("#tutor_close_btn").click(function(){
    $(".modal").fadeOut();
  });
})

//get clicked category_id, category_names
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var category_id = getParameterByName("category_id");
var category_name = getParameterByName("category_name");
var category_color = getParameterByName("category_color");
console.log(category_id);
console.log(category_name);
console.log(category_color);

//get category_name
$(document).ready(get_category_name());
get_todo();
get_color();

//get category_name
function get_category_name() {
  console.log("category_name : " + category_name);
  document.querySelector("header").innerHTML = `
          <div class="tooltip">
          <input class='screen-header__title' type='text' id="category_title" value='${category_name}' style="color:#${category_color};" maxlength='10'/>
          <span class="tooltiptext">카테고리 수정</span>
          <span id="span_category_delete_btn" style="margin-left:10px; cursor:pointer; display:none;"><i class="fas fa-trash-alt" id="category_delete_btn"></i></span>
          </div>
          `;
}

$('#category_title').css('width', $('#category_title').val().length * 23 + 50);
$('#category_title').keyup(resizeInput);

function resizeInput() {
  $(this).css('width', $(this).val().length * 20 + 50);

  if ($(this).val().length > $(this).attr('maxlength')) {
    $(this).val($(this).val().substr(0, $(this).attr('maxlength')));
  }
  
  if (event.keyCode == 13 && $("#category_title").val() != "") {
      var url = "/todo/";
  }
}

//get category_color
function get_color() {
  console.log(category_color);
  document.querySelector(".color_picker").innerHTML = `
    <input id='color_picker' type='color' value='#${category_color}'>
  `;
}

$(document).ready(function() {
  $("#color_picker_btn").click(function() { 
      $(".color_picker").toggle();
  });
});


//update category_color => PUT
$("#color_picker").change(function(){
  new_category_color = $("#color_picker").val();
  console.log(new_category_color);
  var url = "/todo/";

  fetch(url, {
    method: "PUT",
    body: JSON.stringify({
      category_id: category_id,
      color: new_category_color
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
      console.log(result.result.color);
      console.log(location.href);
      
      var color = result.result.color.replace('#', '');
      
      var oldUrl = new URL(location.href);
      var params = new URLSearchParams(oldUrl.search);
      params.set('category_color', color);
      var newURL = params.toString();
      console.log(newURL);

      location.href = "tasks?"+ newURL;
    });
});

//get todo -> GET
function get_todo() {
  var url = "/todo/" + category_id;
  console.log("category_id : ", category_id);
  fetch(url, { category_id: category_id })
    .then(function (type) {
      return type.json();
    })
    .then(function (result) {
      var result = result.result;
      console.log(result);

      // get content
      for (var i = 0; i < result.length; i++) {
        var todo_id = result[i].id;
        var content = result[i].content;
        var status = result[i].status;
        var important = result[i].important;

        var task = `<div class='task' id=${todo_id} ></div>`;

        //delete
        var del = $("<i class='fas fa-trash-alt'></i>").click(function () {
          var p = $(this).parent();
          p.fadeOut(function () {
            p.remove();
          });

          //delete db
          var todo_id = $(this).parent().attr("id");
          console.log(todo_id);
          url = "/todo/" + category_id;

          fetch(url, {
            method: "DELETE",
            body: JSON.stringify({
              todo_id: todo_id,
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
            });
        });

        //check

        var check = $("<i class='fas fa-check'></i>").click(function () {
          var p = $(this).parent();

          p.fadeOut(function () {
            if (p.parent().hasClass("notcomp")) {
              $(".comp").append(p);
              p.fadeIn();
            } else if (p.parent().hasClass("comp")) {
              $(".notcomp").append(p);
              p.fadeIn();
            }
          });

          if (p.parent().hasClass("notcomp")) {
            var status = 1;
          } else if (p.parent().hasClass("comp")) {
            var status = 0;
          }

          var todo_id = $(this).parent().attr("id");
          console.log(status);
          console.log(todo_id);

          //update task status
          var url = "/todo/" + category_id;
          console.log(url);
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              todo_id: todo_id,
              status: status,
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
            });
        });

        //calendar
        var isClicked = true;
        var cal =
          "<span style='display:none;'><input class='cal' style='margin-left: 10px;' type='text' id='from_" +
          todo_id +
          "'><span> ~ </span><input type='text' id='to_" +
          todo_id +
          "'></span>";

        var calendar = $(
          `<span id='cal_${todo_id}'><i class='far fa-calendar-alt'></i></span>`
        ).click(function () {
          var arr = $(this).attr("id").split("_");
          var p = $("#from_" + arr[1]).parent();
          p.toggle();

          for (var i = 0; i < result.length; i++) {
            //조회한 id와 선택된 calendar id가 같을경우
            if (result[i].id == arr[1]) {
              if (result[i].start_date != null) {
                $("#from_" + arr[1])
                  .datepicker({
                    dateFormat: "mm-dd-yy",
                  })
                  .datepicker(
                    "setDate",
                    new Date(Date.parse(result[i].start_date))
                  );
              }

              if (result[i].end_date != null) {
                $("#to_" + arr[1])
                  .datepicker({
                    dateFormat: "mm-dd-yy",
                  })
                  .datepicker(
                    "setDate",
                    new Date(Date.parse(result[i].end_date))
                  );
              }
            }
          }

          var from = $("#from_" + arr[1]).val();
          var to = $("#to_" + arr[1]).val();

          //달력을 닫았을 때
          if(p.attr("style").includes('none')) {
            
            if(from == '') {
              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'info',
                title: '시작일을 입력해주세요',
                showConfirmButton: false,
                timer: 1000
              })
              p.css("display", "inline");
              $("#from_" + arr[1]).focus();
              return;
            }

            if(to == '') {
              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'info',
                title: '종료일을 입력해주세요',
                showConfirmButton: false,
                timer: 1000
              })
              p.css("display", "inline");
              $("#to_" + arr[1]).focus();
              return;
            }

          }

        });
        
        //star
        var star = $(
          `<span class='important' id='star_${todo_id}'><i class='far fa-star'></i></span>`
        ).click(function () {
          var p = $(this).parent();

          if (important_clicked == false) {
            $(this)
              .children(".fa-star")
              .removeClass("far fa-star")
              .addClass("fas fa-star");
            p.css("background", "#371F54");
            important_clicked = true;
            console.log(important_clicked);
            var important = 1;
            console.log(important);
          } else {
            $(this)
              .children(".fa-star")
              .removeClass("fas fa-star")
              .addClass("far fa-star");
            p.css("background", "#81589f9d");
            important_clicked = false;
            console.log(important_clicked);
            var important = 0;
            console.log(important);
          }

          var todo_id = p.attr("id");
          console.log(p);
          console.log(important);
          console.log(todo_id);

          //update task important
          var url = "/todo/" + category_id;
          console.log(url);
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              todo_id: todo_id,
              important: important,
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
            });
        });

        // del,check,star,cal,calendar
        console.log('content : ', content);
        var task = $(task).html(`<input class='content' type='text' value='${content}' onkeyup='contentKeyup($(this).val(), ${todo_id})' onfocus='todo_initial_content($(this).val())' onblur='todo_edited_content($(this).val(), ${todo_id})' maxlength='30' />`);
        task.append(del, check, star, cal, calendar);

        if (status === false) {
          $(".notcomp").append(task);
        } else {
          $(".comp").append(task);
        }

        //get important
        console.log(star);
        var p = $(star).parent();
        console.log(p);

        if (important) {
          $(star)
            .children(".fa-star")
            .removeClass("far fa-star")
            .addClass("fas fa-star");
          p.css("background", "#371F54");
          important_clicked = true;
          console.log(important_clicked);
          var important = 1;
          console.log(important);
        } else {
          $(star)
            .children(".fa-star")
            .removeClass("fas fa-star")
            .addClass("far fa-star");
          p.css("background", "#81589f9d");
          important_clicked = false;
          console.log(important_clicked);
          var important = 0;
          console.log(important);
        }

        fn_init(todo_id);
      }
    });
}

// edit_category_title -> PUT
$("#category_title")
  .focus(function () {
    $(this).data("initialText", $(this).val());
    console.log($("#category_title").val());
    $("#span_category_delete_btn").css("display", "");    
  })
  // When you leave an item...
  .blur(function () {
    // ...if content is different...

    $("#span_category_delete_btn").delay(3000).fadeOut();

    if ($(this).data("initialText") !== $(this).val()) {
      // ... do something.
      console.log("New data when content change.");
      console.log($(this).val());

      var category_title = $(this).val();
      console.log(category_title);
      console.log(category_id);
      var url = "/todo/";

      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          category_id: category_id,
          name: category_title,
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
          console.log(result.result.name)
          console.log(location.href);
          
          var oldUrl = new URL(location.href);
          var params = new URLSearchParams(oldUrl.search);
          params.set('category_name', result.result.name);
          var newURL = params.toString();
          console.log(newURL);

          location.href = "tasks?"+ newURL;
        }); 
    }
  });

function contentKeyup(val, todo_id) {
  var content = $(`#${todo_id}`).children('input.content');

  if (content.val().length > content.attr('maxlength')) {
    content.val(content.val().substr(0, content.attr('maxlength')));
  }

  if (event.keyCode == 13 && $(".content").val() != "") {
    todo_edited_content(val, todo_id);
  }
}

// enter 키 -> task 추가 -> POST
$(".txtb").on("keyup", function (e) {
  if ($(".txtb").val().length > $(".txtb").attr('maxlength')) {
    $(".txtb").val($(".txtb").val().substr(0, $(".txtb").attr('maxlength')));
  }

  //13  means enter button
  if (e.keyCode == 13 && $(".txtb").val() != "") {
    var new_task_content = $(".txtb").val();
    console.log(new_task_content);

    var url = "/todo/" + category_id;
    console.log(url);
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        content: new_task_content,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(function (type) {
        return type.json();
      })
      .then(function (result) {
        var todo_id = result.result["todo_id"];

        var task = `<div class='task' id=${todo_id} ></div>`;
        var task = $(task).html(`<input class='content' type='text' value='${new_task_content}' onkeyup='contentKeyup($(this).val(), ${todo_id})' onfocus='todo_initial_content($(this).val())' onblur='todo_edited_content($(this).val(), ${todo_id})' maxlength='30' />`);

        //delete
        var del = $("<i class='fas fa-trash-alt'></i>").click(function () {
          var p = $(this).parent();
          p.fadeOut(function () {
            p.remove();
          });

          //delete db
          var todo_id = $(this).parent().attr("id");
          console.log(todo_id);
          url = "/todo/" + category_id;

          fetch(url, {
            method: "DELETE",
            body: JSON.stringify({
              todo_id: todo_id,
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
            });
        });

        //check
        var check = $("<i class='fas fa-check'></i>").click(function () {
          var p = $(this).parent();

          p.fadeOut(function () {
            if (p.parent().hasClass("notcomp")) {
              $(".comp").append(p);
              p.fadeIn();
            } else if (p.parent().hasClass("comp")) {
              $(".notcomp").append(p);
              p.fadeIn();
            }
          });

          if (p.parent().hasClass("notcomp")) {
            var status = 1;
          } else if (p.parent().hasClass("comp")) {
            var status = 0;
          }

          var todo_id = $(this).parent().attr("id");
          console.log(status);
          console.log(todo_id);

          //update task status
          var url = "/todo/" + category_id;
          console.log(url);
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              todo_id: todo_id,
              status: status,
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
            });
        });

        //calendar
        var cal =
          "<span style='display:none;'><input style='margin-left: 10px;' type='text' id='from_" +
          todo_id +
          "'><span> ~ </span><input type='text' id='to_" +
          todo_id +
          "'></span>";

        var calendar = $(
          `<span id='cal_${todo_id}'><i class='far fa-calendar-alt'></i></span>`
        ).click(function () {
          var arr = $(this).attr("id").split("_");
          var p = $("#from_" + arr[1]).parent();
          p.toggle();

          var from = $("#from_" + arr[1]).val();
          var to = $("#to_" + arr[1]).val();

          //달력을 닫았을 때
          if(p.attr("style").includes('none')) {
            
            if(from == '') {
              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'info',
                title: '시작일을 입력해주세요',
                showConfirmButton: false,
                timer: 1000
              })
              p.css("display", "inline");
              $("#from_" + arr[1]).focus();
              return;
            }

            if(to == '') {
              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'info',
                title: '종료일을 입력해주세요',
                showConfirmButton: false,
                timer: 1000
              })
              p.css("display", "inline");
              $("#to_" + arr[1]).focus();
              return;
            }

          }

        });

        var important_clicked = false;
        //star
        var star = $(
          `<span id='star_${todo_id}'><i class='far fa-star'></i></span>`
        ).click(function () {
          var p = $(this).parent();

          if (important_clicked == false) {
            $(this)
              .children(".fa-star")
              .removeClass("far fa-star")
              .addClass("fas fa-star");
            p.css("background", "#371F54");
            important_clicked = true;
            console.log(important_clicked);
            var important = 1;
            console.log(important);
          } else {
            $(this)
              .children(".fa-star")
              .removeClass("fas fa-star")
              .addClass("far fa-star");
            p.css("background", "#81589f9d");
            important_clicked = false;
            console.log(important_clicked);
            var important = 0;
            console.log(important);
          }

          var todo_id = p.attr("id");
          console.log(p);
          console.log(important);
          console.log(todo_id);

          //update task important
          var url = "/todo/" + category_id;
          console.log(url);
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              todo_id: todo_id,
              important: important
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
            });
        });

        // del, check append
        task.append(del, check, star, cal, calendar);

        // append to notcomplete task
        $(".notcomp").append(task);
        //to clear the input
        $(".txtb").val("");

        fn_init(todo_id);
      });
  }
});

//edit_todo_content
//todo_initial_content
function todo_initial_content(value) {
  initial_content = value.replace(/~/g, "");
  console.log('todo_initial_content');
  console.log(initial_content);
}

//todo_edited_content
function todo_edited_content(value, todo_id) {
  var edited_content = value.replace(/~/g, "");
  console.log('edited_content : ', edited_content);
  console.log('initial_content : ', initial_content);

  if (edited_content !== initial_content) {
    console.log("New data when content change.");
    console.log('todo_id : ', todo_id);

    var url = "/todo/" + category_id;

    fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        todo_id: todo_id,
        content: edited_content,
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
      });
  }
}

function fn_init(id) {
  var rangeDate = 31; // set limit day
  var setSdate, setEdate;
  $("#from_" + id).datepicker({
    dateFormat: "yy-mm-dd",
    autoSize: true,
    minDate: 0,
    onSelect: function (selectDate) {
      var stxt = selectDate.split("-");
      stxt[1] = stxt[1] - 1;
      var sdate = new Date(stxt[0], stxt[1], stxt[2]);
      var edate = new Date(stxt[0], stxt[1], stxt[2]);
      edate.setDate(sdate.getDate() + rangeDate);
      $("#to_" + id).datepicker("option", {
        minDate: selectDate,
        beforeShow: function () {
          $("#to_" + id).datepicker("option", "maxDate", edate);
          setSdate = selectDate;
          //console.log(setSdate)
        },
      });
      //to 설정

      var arr = $(this).attr("id").split("_");
      var todo_id = arr[1];

      //save date
      var url = "/todo/" + category_id;
      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          todo_id: todo_id,
          start_date: $(this).val(),
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
          if(result.status == 'success') {

            //Sweetalert2
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: '저장되었습니다',
              showConfirmButton: false,
              timer: 1000
            })

            $('.task').remove();
            get_todo();
          } else {
            //Sweetalert2
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: '저장에 실패하였습니다',
              showConfirmButton: false,
              timer: 1000
            })
          }
        });
    },
    //from 선택되었을 때
  });

  $("#from_" + id).datepicker('setDate', 'today');

  $("#to_" + id).datepicker({
    dateFormat: "yy-mm-dd",
    autoSize: true,
    minDate: 0,
    onSelect: function (selectDate) {
      setEdate = selectDate;

      var arr = $(this).attr("id").split("_");
      var todo_id = arr[1];

      //save date
      var url = "/todo/" + category_id;
      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          todo_id: todo_id,
          end_date: $(this).val(),
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
            if(result.status == 'success') {

              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: '저장되었습니다',
                showConfirmButton: false,
                timer: 1000
              })

              $('.task').remove();
              get_todo();
            } else {
              //Sweetalert2
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: '저장에 실패하였습니다',
                showConfirmButton: false,
                timer: 1000
              })
            }
            
        });
    }
  });

}

// check 선언
// click -> update task status -> PUT
var check = $("<i class='fas fa-check'></i>").click(function () {
  var p = $(this).parent();
  p.fadeOut(function () {
    if (p.parent().hasClass("notcomp")) {
      $(".comp").append(p);
      p.fadeIn();
    } else if (p.parent().hasClass("comp")) {
      $(".notcomp").append(p);
      p.fadeIn();
    }
  });

  if (p.parent().hasClass("notcomp")) {
    var status = 1;
  } else if (p.parent().hasClass("comp")) {
    var status = 0;
  }

  var todo_id = $(this).parent().attr("id");
  console.log(status);
  console.log(todo_id);

  //update task status
  var url = "/todo/" + category_id;
  console.log(url);
  fetch(url, {
    method: "PUT",
    body: JSON.stringify({
      todo_id: todo_id,
      status: status,
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
    });
});

// del 선언
// click -> delete task -> DELETE
var del = $("<i class='fas fa-trash-alt'></i>").click(function () {
  var p = $(this).parent();
  p.fadeOut(function () {
    p.remove();
  });

  //delete db
  var todo_id = $(this).parent().attr("id");
  console.log(todo_id);
  url = "/todo/" + category_id;

  fetch(url, {
    method: "DELETE",
    body: JSON.stringify({
      todo_id: todo_id,
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
    });
});
