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
            $("#col-typing").html($("<table>").addClass("table table-striped table-condensed")
                .css({"width":"0","white-space":"nowrap"}));
            $.each(home.cols, function(index, col_name){
                var new_row = $("<tr>");
                // Name of column
                new_row.append($("<td>").text(col_name).css({"padding":"5px 15px","border":"1px solid #DDD"}));
                // dropdown for the type of column (Protected, Identifier, etc)
                new_row.append($("<td>").css({"width":"0","white-space":"nowrap","padding":"5px 15px","border":"1px solid #DDD"})
                    .append(home.generate_radio_buttons(index)));
                // Stratify?
                var stratify_checkbox = $("<label class='checkbox-inline'>").append($("<input>")
                    .attr({type:'checkbox',name:'stratify',class:'stratify-checkbox'})).append("Stratify");
                new_row.append($("<td>").css({"padding":"5px 15px","border":"1px solid #DDD"})
                    .append(stratify_checkbox));
                    
                $("#col-typing table").append(new_row);
            });
            
            var start_calc_button = $("<form class='form-inline' role='form'>");
            start_calc_button.append($("<div class='form-group'>").append($("<input>")
                .attr({type:'email',id:'email',class:'form-control',placeholder:'Enter email'})
                .css({"width":"300", "margin-right":"30"})));
            start_calc_button.append($("<div class='form-group'>").append($("<input>")
                .attr({type:'button',class:'form-control',value:'Calculate',onclick:'home.start_calc()'})));
            $("#col-typing").append(start_calc_button);
            $("#col-typing").fadeIn();     
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
         alert("Failed to upload file.");
        }
    });
}

home.generate_radio_buttons = function(number) {
    dropdown_form = document.createElement("form");
    select = document.createElement("select");

    //Identification option
    id = document.createElement("OPTION");
    idText = document.createTextNode("Identification");
    id.appendChild(idText);
    id.setAttribute("value","I");
    select.appendChild(id);

    //Protected option
    protect = document.createElement("OPTION");
    protectText = document.createTextNode("Protected");
    protect.appendChild(protectText);
    protect.setAttribute("value","X");
    select.appendChild(protect);

    //Unprotected option
    unprotected = document.createElement("OPTION");
    unprotectedText = document.createTextNode("Unprotected");
    unprotected.appendChild(unprotectedText);
    unprotected.setAttribute("value","Y");
    unprotected.setAttribute("checked","checked");
    select.appendChild(unprotected);

    //Class option
    classOption = document.createElement("OPTION");
    classOptionText = document.createTextNode("Class");
    classOption.appendChild(classOptionText);
    classOption.setAttribute("value","C");
    select.appendChild(classOption);

    dropdown_form.appendChild(select);
    
    return dropdown_form
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
