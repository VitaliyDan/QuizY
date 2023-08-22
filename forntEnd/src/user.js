//NAVIGATION PANEL
function openProfile() {
    $("#yourQuizzes, #publicQuizzes").fadeOut("fast", function () {
        $("#profilePanel").fadeIn("fast");
    });
}
function openYourQuizyS() {
    $("#profilePanel, #publicQuizzes").fadeOut("fast", function () {
        $("#yourQuizzes").fadeIn("fast");
    });
}
function openPublicQuizyS() {
    $("#profilePanel, #yourQuizzes").fadeOut("fast", function () {
        $("#publicQuizzes").fadeIn("fast");
    });
}
function handleRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page === 'profile') {
        openProfile();
    } else if (page === 'your-quizzes') {
        openYourQuizyS();
        getYourQuestionsAction();
    } else if (page === 'public-quizzes') {
        openPublicQuizyS();
        getPublicQuestionsAction();
    }

    $("#confirm-code-button").on("click", function () {
        if (!isCodeVerified) {
            var verificationCode = $("#confirm-code").val();
            var verificationData = {
                verification_code: verificationCode,
            };

            $.ajax({
                type: "POST",
                url: `${basic_url}/checkEmailCode`,
                data: JSON.stringify(verificationData),
                contentType: "application/json; charset=utf-8",
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('successToken')
                },
                dataType: "json",
                success: function (response) {
                    if (response.valid === 1) {
                        isCodeVerified = true;
                        showModal(response.message);
                        reload();
                    } else {
                        showModal(response.error_msg);
                    }
                },
                error: function (error) {
                    showModal("Error during code verification");
                },
            });
        }
    });
}

$(document).ready(function () {
    handleRouting();

    $("#Profile").click(function () {
        openProfile();
        history.pushState(null, '', '?page=profile');
    });
    $("#YourQuizyS").click(function () {
        openYourQuizyS();
        history.pushState(null, '', '?page=your-quizzes');
    });
    $("#PublicQuizyS").click(function () {
        openPublicQuizyS();
        history.pushState(null, '', '?page=public-quizzes');
    });

    window.onpopstate = function () {
        handleRouting();
    };
});

//SET PROFILE

$(document).ready(async function() {
    var successToken = localStorage.getItem("successToken");

    if (successToken) {
        var requestHeaders = {
            "Authorization": "Bearer " + successToken
        };
        try {
            showSpinner();
            const response = await $.ajax({
                type: "GET",
                url: `${basic_url}/getUserData`,
                headers: requestHeaders,
                dataType: "json"
            });

            if (response.valid === 1) {
                localStorage.setItem('user_id',response.data.user_id);
                $(".user-name").text(response.data.user_name);
                if(response.data.verification_code.length >  1 ){
                    $(".modal-overlay").fadeIn("fast");
                    $(".modal-for-confirm-code").fadeIn("fast");
                }
                hideSpinner();
            } else {
                alert(response.error_msg);
                hideSpinner();
            }
        } catch (error) {
            alert(error.statusText);
            hideSpinner();
        }
    } else {
        $("#myProfile").fadeOut("fast", function () {
            $("#Registration").fadeIn("fast");
            $("body").css("background-color", "darkslategray");
        });
    }
});
//CHECKING EMAIL CODE
$("#confirm-code-button, #try-demo").on("click", function () {
    var verificationCode = $("#confirm-code").val();
    var codeType = $(this).data("check-option");

    var verificationData = {};
    if (codeType === 1) {
        verificationData = { verification_code: verificationCode };
    } else if (codeType === 0) {
        verificationData = { verification_code: 'demo' };
    }
    $.ajax({
        type: "POST",
        url: `${basic_url}/checkEmailCode`,
        data: JSON.stringify(verificationData),
        contentType: "application/json; charset=utf-8",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('successToken')
        },
        dataType: "json",
        success: function (response) {
            if (response.valid === 1) {
                showModal(response.message);
                reload();
            } else {
                showModal(response.error_msg);
            }
        },
        error: function (error) {
            showModal("Error during code verification");
        },
    });
});

// GET STATISTIC FOR TOP USERS
$(document).ready(async function() {
    try {
        showSpinner();
        const response = await fetch(`${basic_url}/getStatisticForUsers`);
        const data = await response.json();

        if (data.valid === 1) {
            const statistics = data.statistics;
            const itemsList = document.querySelector('.items');

            statistics.sort((a, b) => {
                if (b.quest_count !== a.quest_count) {
                    return b.quest_count - a.quest_count;
                } else {
                    return b.published - a.published;
                }
            });

            statistics.forEach((user, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'user-item';
                if (index === 0) {
                    listItem.style.backgroundColor = '#ADFF2F';
                } else if (index < 3) {
                    listItem.style.backgroundColor = '#FFD700';
                } else if (index < 10) {
                    listItem.style.backgroundColor = '#FFA07A';
                } else {
                    listItem.style.backgroundColor = '#FAFAD2';
                }
                let style ='';
                if (+localStorage.getItem('user_id') === +user.id) {
                    style = ' style= "color: #7B68EE; font-size: larger; font-weight: bold;"'
                }
                listItem.innerHTML = `
                  <span class="user-id"${style}>${user.id}</span>
                  <span class="user-name-item"${style}>${user.user_name}</span>
                  <span class="user-count"${style}>${user.quest_count}</span>
                  <span class="published"${style}>${user.published}</span>
                `;
                itemsList.appendChild(listItem);
            });
        }
        hideSpinner();
    } catch (error) {
        console.error("Error:", error);
        hideSpinner();
    }
});
