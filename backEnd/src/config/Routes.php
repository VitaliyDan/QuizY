<?php

use FastRoute\RouteCollector;

return function (RouteCollector $r) {
    //AUTH
    $r->addRoute('POST', '/registration', 'AuthenticationController@registrationAction');
    $r->addRoute('POST', '/login', 'AuthenticationController@loginAction');
    $r->addRoute('POST', '/checkEmailCode', 'AuthenticationController@checkEmailCodeAction');
    $r->addRoute('GET', '/getData', 'AuthenticationController@getDataAction');
    //USER
    $r->addRoute('GET', '/getStatisticForUsers', 'UserController@getStatisticForUsersAction');
    $r->addRoute('GET', '/getUserData', 'UserController@getUserDataAction');
    //QUESTIONS
    $r->addRoute('POST', '/createQuestion', 'QuestionsController@createQuestionAction');
    $r->addRoute('POST', '/updateQuestion', 'QuestionsController@updateQuestionAction');
    $r->addRoute('POST', '/deleteQuestions', 'QuestionsController@deleteQuestionsAction');
    $r->addRoute('POST', '/setStatusQuestion', 'QuestionsController@setStatusQuestionAction');
    $r->addRoute('GET', '/readQuestion', 'QuestionsController@readQuestionAction');
    $r->addRoute('GET', '/readPublicQuestion', 'QuestionsController@readPublicQuestionAction');
    $r->addRoute('POST', '/checkAnswerForQuestion', 'QuestionsController@checkAnswerForQuestionAction');
    $r->addRoute('POST', '/likeQuestion', 'QuestionsController@likeQuestionAction');
};

