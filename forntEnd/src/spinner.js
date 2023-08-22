function showSpinner() {
    $("#spinner-container").addClass("show");
    $("#spinner-container").removeClass("hide");
    $("body").css({ overflow: "hidden" });
}

function hideSpinner() {
    $("#spinner-container").addClass("hide");
    $("#spinner-container").removeClass("show");
    $("body").css({ overflow: "auto" });
}
