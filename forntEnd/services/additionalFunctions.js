var basic_url = 'http://localhost:8000';
function showModal(text, timeOut = 'fast') {
    $(".error-modal p").text(text);

    $(".error-modal")
        .css("top", "100%")
        .show()
        .animate({
            top: "82%"
        }, 230);

    setTimeout(function() {
        $(".error-modal")
            .animate({
                top: "100%"
            }, 130, function() {
                $(".error-modal").hide();
            });
    }, timeOut === 'fast' ? 2000 : 5000);
}

reload=(timeOut = 1000)=>{
    setTimeout(()=>{
        window.location.reload();
    }, timeOut);
}
