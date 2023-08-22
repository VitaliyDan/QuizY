var successToken = localStorage.getItem("successToken");
//IS ACTIVE PROFILE
$(document).ready(function () {
  if (successToken) {
    $("#Registration").fadeOut("fast", function () {
      $("#myProfile").fadeIn("fast");
      $("body").css("background-color", "#f4f6f6");
    });
  } else {
    $("#myProfile").fadeOut("fast", function () {
      $("#Registration").fadeIn("fast");
      $("body").css("background-color", "darkslategray");
    });
  }

  //LOGIN PANEL ROUTER
$("#signin").click(function () {
  $("#second").fadeOut("fast", function () {
    $("#first").fadeIn("fast");
  });
});

$("#signup").click(function () {
  $("#first").fadeOut("fast", function () {
    $("#second").fadeIn("fast");
  });
});

//REGISTRATION

    $("#submit-registr").on("click", function (event) {
      showSpinner();
      event.preventDefault();
      var email = $("#second input[type='email']").val();
      var username = $("#second input[type='text']").val();
      var password = $("#second input[type='password']").val();

      var data = {
        email: email,
        username: username,
        password: password
      };
      $.ajax({
        type: "POST",
        url: `${basic_url}/registration`,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
          if (response.valid === 1) {

            showModal(response.message);
            localStorage.setItem("successToken", response.token);
            openProfile();
            reload();
          } else {
            showModal(response.error_msg);
            hideSpinner();
          }
        },
        error: function (error) {
          showModal(error.statusText);
          hideSpinner();
        }
      });
    });


//LOGIN

    $("#submit-login").on("click", function (event) {
      event.preventDefault();
      showSpinner();
      var email = $("#first input[type='email']").val();
      var password = $("#first input[type='password']").val();

      var data = {
        email: email,
        password: password
      };
      $.ajax({
        type: "POST",
        url: `${basic_url}/login`,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
          if (response.valid === 1) {
            showModal(response.message);
            localStorage.setItem("successToken", response.token);
            openProfile();
            reload();
          } else {
            showModal(response.error_msg);
            hideSpinner();
          }
        },
        error: function (error) {
          showModal(error.statusText);
          hideSpinner();
        }
      });
    });

    //LOGOUT
  $("#logout").on("click", function (event) {
    localStorage.removeItem("successToken");
    history.pushState(null, '', window.location.pathname);
    showSpinner();
    reload();
  });

});
