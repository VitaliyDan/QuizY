$(document).ready(function() {
    var answers = [];
    var rightAnswer = null;
    var selectedQuestionIds = [];

    $('#YourQuizyS').click(function() {
        getYourQuestionsAction();
    })

    $('.close-create-quiz').click(function () {
        $('.create-modal').fadeOut();
    });

    $('.close-error-modal').click(function () {
        $('.error-modal').fadeOut();
    });

    $('#option').on('click', function() {
        $('.function-buttons').toggle();
    });

    $('.create-quiz').click(function () {
        $('.create-modal').fadeIn();
    });

    $('#answerInput').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            $('#addAnswer').trigger('click');
        }
    });
    $('#addAnswer').click(function() {
        var answerTextarea = $('#answerInput').show().focus();;
        var answer = answerTextarea.val();
        if (answer !== '') {
            answers.push(answer);
            $('.items-answers').append('<div class="quest-item">' + answers.length + '. ' + answer + '</div>');
            answerTextarea.val('').hide();
        }
    });
    $('#addQuestionBtn').click(function() {
        var question = $('#questionInput').val();
        if (question !== '') {
            $('.create-question-action').hide();
            $('#answerInput').show().focus();
            $('#actions').show();
            $('.question-txt').text(question);
        }
    });

    $('#questionsList').on('click', '.quest-item', function() {
        $('.quest-item').css('background-color', 'transparent');
        $(this).css('background-color', 'green');
        rightAnswer = $(this).text().substring(3);
    });
    $('#saveQuizBtn').click(function() {
        if (rightAnswer !== null) {
            showSpinner();
            var questionTitle = $('#questionInput').val();
            var postData = {
                question_title: questionTitle,
                answers: answers,
                right_answer: rightAnswer
            };

            $.ajax({
                url: `${basic_url}/createQuestion`,
                method: 'POST',
                data: JSON.stringify(postData),
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('successToken')
                },
                success: function(responseText) {
                    var response = JSON.parse(responseText);
                    if (response) {
                        showModal(response.message);
                        $('.create-modal').fadeOut();
                        reload();
                    }
                },
                error: function(error) {
                    showModal('Server Not Called ')
                    hideSpinner();
                }
            });
        } else {
            showModal('No right answer selected.');
        }
    });

    $('.public-button').on('click', function() {
        if(getSelectedItems() === null){
            showModal('You have not selected a question')
        }else{
            showSpinner();
            $.ajax({
                url: `${basic_url}/setStatusQuestion`,
                method: 'POST',
                data: JSON.stringify({status: 'public', question_ids: getSelectedItems()}),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('successToken')
                },
                success: function(data) {
                    if (data.valid === 1) {
                        showModal(data.message);
                        reload()
                    } else {
                        showModal(data.error_msg);
                        hideSpinner();
                    }
                },
                error: function(xhr, status, error) {
                    showModal('Error:', error);
                    hideSpinner();
                }
            });
        }
    });
    $('.delete-button').on('click', function() {
        if(getSelectedItems() === null){
            showModal('You have not selected a question')
        }else{
            showSpinner();
            $.ajax({
                url: `${basic_url}/deleteQuestions`,
                method: 'POST',
                data: JSON.stringify({question_ids: getSelectedItems()}),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('successToken')
                },
                success: function(data) {
                    if (data.valid === 1) {
                        showModal(data.message);
                        reload();
                    } else {
                        showModal(data.error_msg);
                        hideSpinner();
                    }
                },
                error: function(xhr, status, error) {
                    showModal('Error:', error);
                    hideSpinner();
                }
            });
        }
    });
});

getYourQuestionsAction =()=>{
    showSpinner();
        $.ajax({
            url: `${basic_url}/readQuestion`,
            method: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('successToken')
            },
            success: function(data) {
                if (data.valid === 1 && data.questions !== undefined) {
                    const itemsList = $('.items-list-question');
                    itemsList.empty();
                    data.questions.forEach(question => {
                        const li = $('<li>', { class: 'item your-item', 'question-id': +question.question_id});

                        const checkboxDiv = $('<div>', { class: 'checkbox' });
                        const checkDiv = $('<div>', { class: 'check' });
                        checkboxDiv.append(checkDiv);

                        const pencilIcon = $('<i>', { class: 'fas fa-pencil-alt' });
                        checkboxDiv.append(pencilIcon);

                        const descriptionDiv = $('<div>', { class: 'description' });
                        const titleDiv = $('<div>', { class: 'title', text: question.question_title });
                        const answDescriptionP = $('<p>', { class: 'answ-description', text: question.answers });
                        descriptionDiv.append(titleDiv);
                        descriptionDiv.append(answDescriptionP);

                        const statusDiv = $('<div>', { class: 'status-quize' });
                        const statusText = $('<span>', { class: 'span-for-status', text: question.status });
                        if (question.status === 'public') {
                            statusText.css('background-color', 'green');
                        } else {
                            statusText.css('background-color', 'red');
                        }

                        statusDiv.append(statusText);

                        const dateCreationDiv = $('<div>', { class: 'date-creation-quize', text: question.creation_date });

                        li.append(checkboxDiv);
                        li.append(descriptionDiv);
                        li.append(statusDiv);
                        li.append(dateCreationDiv);
                        itemsList.append(li);
                    });

                    $('.your-item').click(function () {
                        var t = $(this).closest('.item');
                        if (!t.hasClass('active')) {
                            t.addClass('active');
                            t.find('.checkbox').find('.check').append('<div class="fa fa-check"></div>');
                        } else {
                            t.removeClass('active');
                            t.find('.checkbox').find('.check').find('.fa').remove();
                        }
                    });
                    hideSpinner();

                } else {
                    showModal(data.message);
                    hideSpinner();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error', error);
                hideSpinner();
            }
        });
}

getSelectedItems=()=>{
    selectedQuestionIds = [];
    $('.items-list-question .item.active').each(function() {
        const questionId = $(this).attr('question-id');
        selectedQuestionIds.push(questionId);
    });
    return selectedQuestionIds;
}