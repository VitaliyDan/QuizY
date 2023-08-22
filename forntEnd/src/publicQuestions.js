$(document).ready(function(){
    $(".modal-overlay").click(function(event) {
        if (event.target === $(".modal-overlay")[0]) {
            $(".modal-overlay").fadeOut("fast");
            $(".modal-for-callback").fadeOut("fast");
        }
    });

    $("#PublicQuizyS").click(function () {
        getPublicQuestionsAction();
    });
    $('.list-public-question').on('click', '.description, .user-name, .count-passed, .check, .status-quize, .date-creation-quize', function () {
        showModalForQuestion();
    });
    $(".close-modal, .cancel-button").click(function() {
       hideModalForQuestion();
    });

    $(document).on('mouseenter', '.describe', function(event) {
        var titleText = $(this).attr('title');
        $(this)
            .data('tipText', titleText)
            .removeAttr('title');

        $('<div style="width: 200px; text-align: center" class="tooltip"></div>')
            .text(titleText)
            .appendTo('body')
            .css('top', (event.pageY - 5) + 'px')
            .css('right', ($(window).width() - event.pageX + 20) + 'px')
            .fadeIn('slow');
    }).on('mouseleave', '.describe', function() {
        $(this).attr('title', $(this).data('tipText'));
        $('.tooltip').remove();
    }).on('mousemove', '.describe', function(event) {
        $('.tooltip')
            .css('top', (event.pageY - 5) + 'px')
            .css('right', ($(window).width() - event.pageX + 20) + 'px');
    });

    $('.list-public-question').on('click', '.description, .user-name, .count-passed, .check, .status-quize, .date-creation-quize', function () {
        var publicQuestionId = $(this).closest('.public-item').attr('public-question-id');
        var questionTitle = $(this).closest('.public-item').find('.title').text();
        var answersList = $(this).closest('.public-item').find('.description p').text();
        var answersArray = answersList.split('; ').map(answer => answer.replace(/^\d+\. /, ''));

        $('.modal-header h2').text(questionTitle);

        const modalContent = $('.modal-content');
        modalContent.empty();

        answersArray.forEach((answer, index) => {
            const label = $('<label>', { class: 'answer-label' });
            const icon = $('<i>', { class: 'fa-regular fa-circle-check', style: 'color: #669c35;' });
            const textSpan = $('<span>', { class: 'text-for-question', text: answer });

            label.append(icon);
            label.append(textSpan);

            label.click(function () {
                $('.answer-label i.fa-solid').removeClass('fa-solid').addClass('fa-regular').css('color', '#669c35');
                icon.removeClass('fa-regular').addClass('fa-solid').css('color', '#00c709');
                const selectedAnswer = textSpan.text();
            });

            modalContent.append(label);
        });

        $(".modal-overlay").fadeIn("fast");
        $(".modal-for-callback").fadeIn("fast");

        $('.respond-button').off('click').on('click', function () {
            const selectedAnswer = $('.answer-label i.fa-solid').closest('.answer-label').find('.text-for-question').text();
            if (selectedAnswer !== '') {
                showSpinner();
                $.ajax({
                    url: `${basic_url}/checkAnswerForQuestion`,
                    method: 'POST',
                    dataType: 'json',
                    data: JSON.stringify({ question_id: publicQuestionId, answer: selectedAnswer }),
                    contentType: 'application/json',
                    success: function(response) {
                        showModal(response.message);
                        hideSpinner();
                        hideModalForQuestion();
                    },
                    error: function(error) {
                        showModal('Error while checking the answer');
                        hideSpinner();
                    }
                });
            } else {
                showModal('Please choose one answer')
            }
        });
    });





    $('.list-public-question').on('click', '.send-like', function () {
        var heartIcon = $(this);
        var publicQuestionItem = heartIcon.closest('.public-item');
        var likesCountSpan = publicQuestionItem.find('.likes-count');

        var currentLikes = parseInt(likesCountSpan.text());
        var newStatus = heartIcon.hasClass('fa-solid') ? 'not liked' : 'liked';

        if (newStatus === 'liked') {
            currentLikes += 1;
        } else {
            currentLikes -= 1;
        }

        likesCountSpan.text(currentLikes);

        heartIcon.toggleClass('fa-regular fa-solid');
        publicQuestionItem.attr('status-like', newStatus);

        var publicQuestionId = publicQuestionItem.attr('public-question-id');
        $.ajax({
            url: `${basic_url}/likeQuestion`,
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify({ question_id: publicQuestionId, status: newStatus }),
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('successToken')
            },
            success: function(response) {
                showModal(response.message);

            },
            error: function(error) {
                showModal('Failed to update like status');
            }
        });
    });
});

getPublicQuestionsAction =()=>{
    showSpinner();
    $.ajax({
        url: `${basic_url}/readPublicQuestion`,
        method: 'GET',
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('successToken')
        },
        success: function(response) {
            if (response.valid === 1) {
                const questions = response.questions;
                const itemsList = $('.list-public-question');
                itemsList.empty();
                const user_id = localStorage.getItem('user_id');
                questions.forEach(question => {
                    let formattedAnswers = '';
                    if (question.answers) {
                        const answersArray = JSON.parse(question.answers);
                        formattedAnswers = answersArray.map((answer, index) => {
                            return `${index + 1}. ${answer}`;
                        }).join('; ');
                    }
                    let item = `
                   <li class='public-item item' public-question-id="${question.question_id}" status-like="${question.liked_status}">
                        <div class='user-name'>${question.user_name}</div>
                        <div class="like-for-question">
                            <i class="${question.liked_status === 'liked' ? 'fa-solid' : 'fa-regular'} fa-heart send-like" style="color: #e32400;"></i>
                            <span class="likes-count" style="margin-left: 4px">${question.liked}</span>
                        </div>
                        <div class='description'>
                            <div class='title'>${question.question_title}</div>
                            <p>${formattedAnswers}</p>
                        </div>
                        <div class='count-passed'><span>${question.passed_by_others}</span></div>
                        <div class='info-icon'>
                            <i class="${question.liked_status === 'liked' ? 'fa-solid' : 'fa-regular'} fa-circle-info describe" title="${question.email} Question ID: ${question.question_id}" style="color: #4fa290;"></i>
                        </div>
                    </li>
                `;
                    if (question.creator_id === +user_id) {
                        item = $(item).css({
                            'background-color': 'aliceblue',
                            'border-color': 'darkcyan'
                        });
                    }

                    itemsList.append(item);
                });
                hideSpinner();
            }
            if(response.valid === 0) {
                showModal(response.error_msg);
                hideSpinner();
            }
        },
        error: function(error) {
            console.error('Error fetching data:', error);
            hideSpinner();
        }
    });
}

showModalForQuestion=()=>{
    $(".modal-overlay").fadeIn("fast");
    $(".modal-for-callback").fadeIn("fast")
}
hideModalForQuestion=()=>{
    $(".modal-overlay").fadeOut("fast");
    $(".modal-for-callback").fadeOut("fast");
}
renderModalFor =($title_question, $answers)=>{
    let item = `
    <div class="modal-overlay" style="display: none"></div>
    <div class="modal-for-callback" style="display: none">
          <div class="modal-header">
            <h2>Modal Title</h2>
            <span class="close-modal">×</span>
          </div>
          <div class="modal-content">
            <label>
              <input type="checkbox" style="display: none">
              <i class="fa-regular fa-circle" style="color: #669c35;"></i> Option 1
            </label>
            <label>
              <input type="checkbox" style="display: none">
              <i class="fa-regular fa-circle" style="color: #669c35;"></i> Option 2
            </label>
            <label>
              <input type="checkbox" style="display: none">
              <i class="fa-regular fa-circle" style="color: #669c35;"></i> Option 3
            </label>
          </div>
          <div class="modal-buttons">
            <button class="cancel-button">Cancel</button>
            <button class="respond-button">Respond</button>
          </div>
    </div>
`;
}
