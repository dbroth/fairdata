home = {};

home.upload_file = function() {
    var file = $("#file").get(0).files[0];
    var fd = new FormData();
    fd.append("file", file);
    
    var csrftoken = $.cookie('csrftoken');

    $.ajax({
        type: "POST",
        url: "/accept_file/",
        dataType: "json",
        data: fd,
        headers: {"X-CSRFToken": csrftoken},
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
            if (!data["valid"]) {
                alert(data["reason"]);
                return;
            }
 	          console.log(data);
            result = data["result"];
            home.file_id = result["id"];
            home.cols = result["cols"];
            
            $("#col-typing").empty();

	    //DEREK'S FORM STUFF
	    $("#col-typing").css({"font-family":"Sintony, sans-serif", "font-size":"1.3em", "font-weight":"400", "text-align":"inline"});
	    $("#col-typing").append("<br>Which column is your outcome column (<i>i.e. yes/no</i>)?<br>");
	    $("#col-typing").append(home.new_dropdown(false));
	    $("#col-typing").append("Which columns are identifiers (<i>i.e. irrelevant to the classifier</i>)?<br>");
	    $("#col-typing").append(home.new_dropdown(true));
	    $("#col-typing").append("Which columns contain information that could be used to discriminate?<br>");
	    $("#col-typing").append(home.new_dropdown(true));
	    
	    button_div = document.createElement("div");
	    button_div.setAttribute("class","submit");

	    button = document.createElement("input");
            button.setAttribute("type","button");
	    button.setAttribute("class","form-control");
	    button.setAttribute("value","Submit");
	    button.setAttribute("onClick","home.start_calc()");

	    button_div.appendChild(button);
	    $("#col-typing").append(button_div);

            $("#col-typing").fadeIn();     
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
         alert("Failed to upload file.");
        }
    });
}

home.new_dropdown = function(mult) {
    dropdown_form = document.createElement("form");
    select = document.createElement("select");
    select.setAttribute("class","dropdown");

    if(mult) {
	select.setAttribute("multiple","multiple");
    }

    $.each(home.cols, function(index, col_name) {
	new_option = document.createElement("OPTION");
	text = document.createTextNode(col_name);
	new_option.appendChild(text);
	new_option.setAttribute("value", col_name);
	select.appendChild(new_option);
    });		
    
    dropdown_form.appendChild(select);
    return dropdown_form;
}

home.start_calc = function() {
    var col_types = [];
    $("#col-typing tr form :checked").each(function(index) {
        col_types.push($(this).val());
    });
    // For each column which has the stratify checkbox checked, append its name to this list.
    var stratify_cols = []
    var exit = false;
    $("#col-typing tr").each(function(index) {
        if ($(this).find(".stratify-checkbox").is(':checked')) {
            if ($(this).find("form :checked").val() != "I") {
                stratify_cols.push($(this).find("td:first").text());
            } else {
                exit = true; // Can't exit home.start_calc via return at this point, so store it in a var
            }
        }
    });
    if (exit) {
        alert("Please don't stratify an identification column.");
        return;
    }
    if (!home.sanity_check(col_types, stratify_cols)) {
        return;
    }
    
    
    $.ajax({
        type: "GET",
        url: "/start_calc/",
        data: JSON.stringify([home.file_id, home.cols, col_types, stratify_cols, $("#email").val(), parseFloat(1.0)]),
	contentType: "application/json",
        dataType: "json",
        success: function(data) {
            if (!data["valid"]) {
                alert(data["reason"]);
                return;
            }
            console.log(data);
            $("#download").empty().append($("<a>").attr({href: data["url"]}).text("Download"));
            if (!data["email_success"]) {
                $("#download").append($("<br>")).append($("<p class='noindent'>").text("Email failed to send."));
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Failed to calculate.");
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

home.sanity_check = function(col_types, stratify_cols) {
    if (stratify_cols.length < 1) {
        alert("Please choose at least one Stratify column.");
        return false;
    }
    var num_class_cols = 0;
    $.each(col_types, function(i, val) {
        if (val == "C") { num_class_cols += 1; }
    });
    if (num_class_cols != 1) {
        alert("Please choose exactly one Class column.");
        return false;
    }
    return true;
}

$(function() {
    $("#bgtoggle").click(function() {
        $("#background-content").toggle();
    });
});
