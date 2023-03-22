/*jslint plusplus: true */
/*global $, jQuery, window, screen, document, escape, typeof, unescape, location, iecontroller, InstitutionHelper */
// ================================================================================
// START OF THE NEW OBJECT CODE FOR F1000RESEARCH FORMS
// --------------------------------------------------------------------------------
var F1R_formHelper = (function () {
    "use strict";
    // Define some private variables and cached items
    var privateCounter = 0,
        isDraft = $('#isDraft').val() === 'true',
        debugMode = false,
        debugConsole = "",
        formContainer = "",
        formErrorContainer = $("#default-form-error-wrapper").find(".form-input-error"),
        canUseTextEditor = (iecontroller.isIE6 || iecontroller.isIE7 || iecontroller.isIE8 || iecontroller.isIE9 || iecontroller.isIE10) ? false : true,
        formAuthorsSection = "",
        formNewAuthorInstitution = $("#add-new-author-row .js-affiliations-form"),
        formTemplates = $("#f1r-form-templates-container"),
        newAuthorTemplate = formTemplates.find("#author-row-template li.template-author-list-item"),
        newInstitutionTemplate = formTemplates.find("#author-row-template .group-item-row.the-institution-row"),
        newCollectiveTemplate = formTemplates.find("#collective-row-template li.template-collective-author-list-item"),
        newConferenceTemplate = formTemplates.find("#conference-row-template li"),
        newRelatedArticleTemplate = formTemplates.find("#related-article-row-template li.template-related-articles"),
        institutionAutoFill = new InstitutionHelper(),
        maxTextFieldLength = 255;

//  ==============================
//  START OF THE PRIVATE FUNCTIONS
//  ------------------------------
    function conferenceAutocomplete(elementID, onSelect, onChange, onClear) {
        var newConferenceRow = elementID.indexOf("new-conference-name") > -1 ? true : false;
        $(elementID).autocomplete({
            matchSubset: false,
            delay: 0,
            source: function (request, response) {
                if (request.term.length < 2) return;
                $.ajax({
                    url: "https://" + location.host + '/autocomplete/conference/' + request.term + "/",
                    crossDomain: true,
                    dataType: "json",
                    success: function(data) {
                        response($.map(data, function(row) {
                            return { label: row.name, name: row.name, id: row.id, year: row.year };
                        }));
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log("error: " + JSON.stringify(jqXHR) + ", " + textStatus + ", " + errorThrown);
                    }
                });
            },
            change: function(event, ui) { if (ui.item === null) { resetConferenceFields(); } },
            select: function(event, ui) { setConferenceFields(ui.item.id, ui.item.name, ui.item.year); },
            close: function(event, ui) { }
        }).data("autocomplete")._renderMenu = function(ul, items) {
            var self = this;
            displayElements(self, ul, items);
        };
        function resetConferenceFields() {
            var cRow = "";
            if (newConferenceRow) {
                $("#new-conference-chosen").val("false");
                $("#new-conference li").find(".disabled-faux-option").removeClass("disabled-faux-option").addClass("faux-option");
                $("#new-conference").find(".asset-form-conference-year").removeClass("is-defaulted");
                $("#new-conference").find(".faux-options-container").removeClass("is-defaulted");
            } else {
                cRow = $(elementID).closest(".form-input-wrapper");
                cRow.find("input[name$='.approved']").val("false");
                cRow.find(".disabled-faux-option").removeClass("disabled-faux-option").addClass("faux-option");
                cRow.find(".asset-form-conference-year").removeClass("is-defaulted");
                cRow.find(".faux-options-container").removeClass("is-defaulted");
            }
        }
        function setConferenceFields(id, name, year) {
            var existingRow = "",
              hiddenInput = $("#new-conference").find(".asset-form-conference-year .selected-option input");
            if (newConferenceRow) {
                $("#new-conference-id").val(id);
                $("#new-conference-name").val(name);
                $("#new-conference-chosen").val("true");
                $("#new-conference-year").find("option[value='" + year + "']").attr("selected", "selected").addClass("is-selected");
                $("#new-conference li").find(".faux-option").removeClass("faux-option is-selected").addClass("disabled-faux-option");
                $("#new-conference li").find(".disabled-faux-option[data-value='" + year + "']").removeClass("disabled-faux-option").addClass("faux-option").click();
                $("#new-conference").find(".asset-form-conference-year").addClass("is-defaulted");
                $("#new-conference").find(".faux-options-container").addClass("is-defaulted");
                if (hiddenInput) { hiddenInput.val(year); }
            } else {
                existingRow = $(elementID).closest(".form-input-wrapper");
                existingRow.find(".asset-form-conference-year").addClass("is-defaulted");
                existingRow.find(".faux-options-container").addClass("is-defaulted");
                existingRow.find("input[name$='].id']").val(id);
                existingRow.find("input[name$='conference.id']").val(id);
                existingRow.find("input[name$='.approved']").val("true");
                existingRow.find("select option.is-selected").removeAttr("selected").removeClass("is-selected");
                existingRow.find("select").find("option[value='" + year + "']").attr("selected", "selected").addClass("is-selected");
                existingRow.find(".faux-option").removeClass("faux-option is-selected").addClass("disabled-faux-option");
                existingRow.find(".disabled-faux-option[data-value='" + year + "']").removeClass("disabled-faux-option").addClass("faux-option").click();
            }
        }
        function displayElements(menu, ul, items) {
            $.each(items, function(index, item) {
                menu._renderItem = function(ul, item) {
                var re = new RegExp(menu.term, "i");
                var t = item.name.replace(re,"<span style='font-weight:bold;'>"+
                          "$&" +
                      "</span>");
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + t + "</a>" )
                    .appendTo( ul );
                };
                menu._renderItem( ul, item);
            });
        }
    } // End of conferenceAutocomplete

    function InstitutionHelper() {
        var that = this,
            incompleteAffilRefereeMSg  = "Institution and country are required fields.",
            duplicateAffilMSg = "You have already added this institution.";

        that.countryIdMenuNew = $("#new-author-country");
        that.countryMenuNew = $(".new-author-institution-row").find(".faux-options");

        // The first three 'methods' are for the new author row
        this.onAutocompleteSelectNew = function(elementId, instId, instName, isManuallyAdded, countryObj) {

            that.countryIdMenuNew.find("option[value='" + countryObj.id + "']").first().attr("selected", "selected");
            that.countryMenuNew.find(".faux-option.is-selected").removeClass("is-selected");
            that.countryMenuNew.find(".faux-option[data-value='" + countryObj.id + "']").first().click();
        };
        this.onAutocompleteChangeNew = function(elementId) {
        };
        this.onAutocompleteClearNew = function() {
            that.countryIdMenuNew.find("option").first().attr("selected", "selected");
            that.countryMenuNew.find(".faux-option.is-selected").removeClass("is-selected");
            that.countryMenuNew.find(".faux-option").first().click();
        };

        // These 3 methods are for the existing authors
        this.onAutocompleteSelect = function(elementId, instId, instName, isManuallyAdded, countryObj) {
            //console.log(elementId, instId, instName);
            var authorRow = $(elementId).closest(".group-item-row"),
                countryIdMenu = authorRow.find("select[name$='.countryCode']"),
                countryMenu = authorRow.find(".faux-options");
            countryIdMenu.find("option[value='" + countryObj.id + "']").first().attr("selected", "selected");
            countryMenu.find(".faux-option.is-selected").removeClass("is-selected");
            countryMenu.find(".faux-option[data-value='" + countryObj.id + "']").first().click();
        };
        this.onAutocompleteChange = function(elementId) {
        };
        this.onAutocompleteClear = function(elementId) {
        };
        this.onDocumentAutocompleteSelect = function(elementId, instId, instName, isManuallyAdded, countryObj) {
            //console.log(elementId, instId, instName);
            var authorRow = $(elementId).closest(".has-row-id"),
                countryIdMenu = authorRow.find("select[name$='.countryCode']"),
                countryMenu = authorRow.find(".faux-options");
            countryIdMenu.find("option[value='" + countryObj.id + "']").first().attr("selected", "selected");
            countryMenu.find(".faux-option.is-selected").removeClass("is-selected");
            countryMenu.find(".faux-option[data-value='" + countryObj.id + "']").first().click();
        };
    }


    function rebuildFormFieldName(el, rowID) {
        if (debugMode) { debugConsole.append("<br>starting rebuildFormFieldName: rowID = " + rowID + "   | el.name is " + el.attr("name")); console.log(el); }
        var name = el.attr("name") || "",
            //id = el.attr("id") || "",
            prefix = "",
            suffix = "";
        if (name.indexOf("[") !== -1) {
            prefix = name.substring(0, name.indexOf("[") + 1);
            suffix = name.substring(name.indexOf("]"));
            el.attr("name", prefix + rowID + suffix);
        }
        //if (id.indexOf("[") !== -1) {
        //    prefix = id.substring(0, id.indexOf("[") + 1);
        //    suffix = id.substring(id.indexOf("]"));
        //    el.attr("id", prefix + rowID + suffix);
        //}
    } // End of rebuildFormFieldName


    function getAssetAuthorRowTemplate(isCollective) {
        if (debugMode) { debugConsole.append("<br>starting getAssetAuthorRowTemplate: isCollective = " + isCollective); }
        var theRowIndex = $("#existing-authors-container .author-display-row").size(),
            theTemplate = newAuthorTemplate,
            theRowID = "",
            theAuthorListItem = "",
            newAuthorRow = "";
        if (isCollective) { theTemplate = newCollectiveTemplate; }
        theAuthorListItem = theTemplate.clone();
        newAuthorRow = theAuthorListItem.find(".author-display-row");
        if (isCollective) {
            theAuthorListItem.removeClass("template-collective-author-list-item").addClass("author-list-item");
        } else {
            theAuthorListItem.removeClass("template-author-list-item").addClass("author-list-item");
        }
        newAuthorRow.attr("id", "author-list-row" + theRowIndex);
        newAuthorRow.attr("data-author-index", theRowIndex);
        newAuthorRow.find(".has-row-id").each(function () {
            theRowID = $(this).attr("id");
            if (theRowID.indexOf("-edit") > -1) {
                $(this).attr("id", "author-row" + theRowIndex + "-edit");
            } else {
                $(this).attr("id", "author-row" + theRowIndex + "-display");
            }
            $(this).removeClass("has-row-id");
        });
        if(isCollective) {
            newAuthorRow.find("input[name='authors[x].collectiveName']").each(function() {
                var existingName = $(this).attr('name');
                $(this).attr('name', existingName.replace('[x]', '[' + theRowIndex + ']'))
            });

            newAuthorRow.find("input[name='authors[x].email']").each(function() {
                var existingName = $(this).attr('name');
                $(this).attr('name', existingName.replace('[x]', '[' + theRowIndex + ']'))
            });
        }

        newAuthorRow.find("input[name^='authors[x]'], select[name^='authors[x]']").each(function() {
            let name, $this = $(this);
            name = $this.attr('name');
            name = name.replace('[x]', `[${theRowIndex}]`);
            $this.attr('name', name);
        });
        newAuthorRow.find(".form-error-message-js").attr("id", "author-row" + theRowIndex + "-edit-error-displaymsg");
        return theAuthorListItem;
    } // End of getAssetAuthorRowTemplate


    function rebuildAuthorRows() {
        if (debugMode) { debugConsole.append("<br>starting rebuildAuthorRows"); }
        var theRow = "",
            theEditContainer = "",
            theDisplayContainer = "",
            theCheckbox = "",
            rowNumber = 0,
            name = "",
            prefix = "",
            suffix = "";
        $("#sortable-author-list > li").each(function (index, el) {
            rowNumber = index + 1;
            theRow = $(el).find("div[id^='author-list-row']");
            theEditContainer = theRow.find("div[id$='-edit']");
            theDisplayContainer = theRow.find("div[id$='-display']");
            theCheckbox = theEditContainer.find("input:checkbox");
            theCheckbox.attr({
                "id": "author-corresponding-" + index,
                "author-index": index
            });
            theEditContainer.attr("id", "author-row" + index + "-edit");
            theDisplayContainer.attr("id", "author-row" + index + "-display");
            // Update the order of the list
            theEditContainer.find("select").each(function (idx, el) {
                rebuildFormFieldName($(el), (rowNumber - 1));
            });
            theEditContainer.find("input").each(function (idx, el) {
                rebuildFormFieldName($(el), (rowNumber - 1));
            });
            theDisplayContainer.find("input").each(function (idx, el) {
                rebuildFormFieldName($(el), (rowNumber - 1));
            });
            theRow.attr({
                "data-author-index": index,
                "id": "author-list-row" + index
            });
        });
    } // End of rebuildAuthorRows


    function checkCollectiveEmailRequired(theRow) {
        var theEmail = theRow.find('.the-email-field'),
            corresponding = theRow.find('.author-corresponding, #new-author-collective-corresponding');

        if (corresponding.is(':checked')) {
            theEmail
                .addClass('field-mandatory')
                .attr('placeholder', 'Email');
            return true;
        } else {
            theEmail
                .removeClass('field-mandatory')
                .attr('placeholder', 'Email (Optional)');
            return false;
        }
    } // End of checkEmailRequired

    function validateNewAssetAuthorRow() {
        if (debugMode) { debugConsole.append("<br>starting validateNewAssetAuthorRow"); }
        var fName = $("#new-author-first-name").val(),
            sName = $("#new-author-last-name").val(),
            eMail = $("#new-author-email").val(),
            cAuth = $("#new-author-corresponding").parent().hasClass("checkbox-selected"),
            inst = $("#authorDetailsFormNew_institution").val(),
            country = $('#authorDetailsFormNew .js-affiliation-country'),
            countryID = country.val(),
            error = "",
            alreadyAddedCount = $("#sortable-author-list > li").size(),
            i = 0,
            theEmailCheck = "",
            errorContainer = $("#add-author-error-displaymsg");

        if (fName === "" || sName === "" || (eMail === "" && cAuth)) {
            error = "Please supply last name, first name and all affiliation fields that are not marked (optional).";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            return false;
        }

        if (sName.length > maxTextFieldLength) {
            error = "The last name field exceeds the maximum length of 255 characters.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-last-name").focus();
            return false;
        }

        if (!F1000.ValidateNoFullStopFirstCharacter(sName)) {
            error = "Please enter a last name for this author consisting of alphabetical characters.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-last-name").focus();
            return false;
        }

        if (fName.length > maxTextFieldLength) {
            error = "The first name field exceeds the maximum length of 255 characters.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-first-name").focus();
            return false;
        }

        if (cAuth && !F1000.ValidateEmail(eMail)) {
            error = "Please enter a valid e-mail address.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-email").focus();
            return false;
        }

        if (cAuth && (inst === "" || countryID === "" || countryID === "-1")) {
            error = "Please add the institution and country/region of the corresponding author.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#authorDetailsFormNew_institution").focus();
            return false;
        }

        for (i = 0; i < alreadyAddedCount; i++) {
            theEmailCheck = $("#author-row" + i + "-edit").find(".the-email-field").val();
            if (eMail && theEmailCheck === eMail) {
                error = "This email has already been added to the list. Please try another address.";
                break;
            }
        }

        if (error !== "") {
            $("#new-author-email").val("").focus();
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            return false;
        }

        return true;
    } // End of validateNewAssetAuthorRow


    function validateNewAssetCollectiveRow() {
        if (debugMode) { debugConsole.append("<br>starting validateNewAssetCollectiveRow"); }
        var cName = $("#new-author-collective-name").val(),
            eMail = $("#new-author-collective-email").val(),
            cAuth = $("#new-author-collective-corresponding").parent().hasClass("checkbox-selected"),
            error = "",
            alreadyAddedCount = $("#sortable-author-list > li").size(),
            i = 0,
            theNameCheck = "",
            theEmailCheck = "",
            errorContainer = $("#add-author-error-displaymsg");

        if (cName === "") {
            error = "Please enter a collective name.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            return false;
        }

        if (cName.length > maxTextFieldLength) {
            error = "The collective name field exceeds the maximum length of 255 characters.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-collective-name").focus();
            return false;
        }

        if (cAuth && !F1000.ValidateEmail(eMail)) {
            error = "Please enter a valid e-mail address.";
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            $("#new-author-collective-email").focus();
            return false;
        }

        for (i = 0; i < alreadyAddedCount; i++) {
            theNameCheck = $("#author-row" + i + "-edit").find(".the-collective-field").val();
            if (theNameCheck === cName) {
                error = "This collective name has already been added to the list. Please try another name.";
                break;
            }
        }

        if (error !== "") {
            $("#new-author-collective-name").val("").focus();
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            return false;
        }

        for (i = 0; i < alreadyAddedCount; i++) {
            theEmailCheck = $("#author-row" + i + "-edit").find(".the-email-field").val();
            if (eMail !== "" && theEmailCheck === eMail) {
                error = "This email has already been added to the list. Please try another address.";
                break;
            }
        }

        if (error !== "") {
            $("#new-author-collective-email").val("").focus();
            errorContainer.html(error).css({ "display": "inline-block" });
            setTimeout(function () { errorContainer.hide(500); }, 5000);
            return false;
        }

        return true;
    }// End of validateNewAssetCollectiveRow


    function removeAuthorRow(theRow) {
        if (debugMode) { debugConsole.append("<br>starting removeAuthorRow"); }
        theRow.remove();
        rebuildAuthorRows();
    } // End of removeAuthorRow


    function getAuthorInstitutionRow(authorIndex, affiliationIndex) {
        if (debugMode) { debugConsole.append("<br>starting getRelatedArticleRowTemplate"); }
        var theTemplate = newInstitutionTemplate,
            theInstitutionRow = "";
        theInstitutionRow = theTemplate.clone();
        theInstitutionRow.find("input[name='template-institutionID']").attr("name", "authors[" + authorIndex + "].affiliations[" + affiliationIndex + "].id");
        theInstitutionRow.find("input[name='template-institution']").attr("id", "asset-authors" + authorIndex + "-affiliations" + affiliationIndex + "-institution").attr("name", "authors[" + authorIndex + "].affiliations[" + affiliationIndex + "].institution");
        theInstitutionRow.find("select[name='template-country']").attr("name", "authors[" + authorIndex + "].affiliations[" + affiliationIndex + "].countryCode");
        return theInstitutionRow;
    } // End of getAuthorInstitutionRow




    function getRelatedArticleRowTemplate() {
        if (debugMode) { debugConsole.append("<br>starting getRelatedArticleRowTemplate"); }
        var rowIndex = $("#related-articles-list li").size(),
            theTemplate = newRelatedArticleTemplate,
            theRowID = "",
            theRelatedArticleItem = "",
            newRelatedArticleRow = "";
        theRelatedArticleItem = theTemplate.clone();
        newRelatedArticleRow = theRelatedArticleItem.find(".author-display-row");
        theRelatedArticleItem.removeClass("template-related-articles");
        newRelatedArticleRow.attr("id", "related-article-list-row" + rowIndex);
        newRelatedArticleRow.attr("data-related-article-index", rowIndex);
        newRelatedArticleRow.find(".has-row-id").each(function () {
            theRowID = $(this).attr("id");
            if (theRowID.indexOf("-edit") > -1) {
                $(this).attr("id", "related-articles-row" + rowIndex + "-edit");
            } else {
                $(this).attr("id", "related-articles-row" + rowIndex + "-display");
            }
            $(this).removeClass("has-row-id");
        });
        newRelatedArticleRow.find("input[name='relatedArticleIds[0]']").attr("name", "relatedArticleIds[" + rowIndex + "]");
        newRelatedArticleRow.find(".submission-form-error").attr("id", "related-article-row" + rowIndex + "-edit-error-displaymsg");
        return theRelatedArticleItem;
    } // End of getRelatedArticleRowTemplate


    function rebuildRelatedArticleRows() {
        if (debugMode) { debugConsole.append("<br>starting rebuildRelatedArticleRows"); }
        var theRow = "",
            theEditContainer = "",
            theDisplayContainer = "",
            rowNumber = 0,
            name = "",
            prefix = "",
            suffix = "";
        $("#related-articles-list li").each(function (index) {
            rowNumber = index + 1;
            theRow = $(this).find("div[id^='related-article-list-row']");
            theEditContainer = theRow.find("div[id$='-edit']");
            theDisplayContainer = theRow.find("div[id$='-display']");
            theEditContainer.attr("id", "related-articles-row" + index + "-edit");
            theDisplayContainer.attr("id", "related-articles-row" + index + "-display");
            theEditContainer.find("input").each(function () {
                rebuildFormFieldName($(this), (rowNumber - 1));
            });
            theRow.attr("id", "related-article-list-row" + index);
            theRow.attr("data-related-article-index", index);
        });
    } // End of getRelatedArticleRowTemplate

    function getArticlePublicationInfo(data) {
        var infoHTML = data.journal + " " + data.publishedDate;
        if ((data.journalVolume !== "" && data.journalVolume !== null) || (data.journalIssue !== "" && data.journalIssue !== null)) {
                infoHTML += ", " + data.journalVolume;
            if (data.journalIssue !== "" && data.journalIssue !== null) {
                infoHTML += "(" + data.journalIssue + ")";
            }
        }
        if (data.pageNumbers !== "" && data.pageNumbers !== null) {
            infoHTML += "; " + data.pageNumbers;
        }
        return infoHTML;
    }

    function addNewRelatedArticle(data, theID) {
        if (debugMode) { debugConsole.append("<br>starting addNewRelatedArticle. See 'real' console for data. theID = " + theID); console.log(data); }
        var theNewRow = getRelatedArticleRowTemplate(),
            titleHTML = "",
            infoHTML = getArticlePublicationInfo(data),
            authorArray = data.authors.split(","),
            maxAuthors = 5,
            i = 0,
            authorString = "";
        if (authorArray.length > maxAuthors) {
            for (i = 0; i < maxAuthors; i++) {
                if (authorString !== "") { authorString += ", "; }
                authorString += authorArray[i];
            }
            authorString += " <em>et al.</em>";
        } else {
            authorString = data.authors;
        }
        if (data.type === "DOI") {
            titleHTML = "<a href='https://doi.org/" + theID + "' target='_blank' " +
                        "title='Click to open this article in a new window.' class='f1r-standard-link'>" +
                        data.title + "</a>";
        } else if (data.type === "PUBMED") {
            if (data.doi === theID) {
                titleHTML = "<a href='https://doi.org/" + theID + "' target='_blank' " +
                            "title='Click to open this article in a new window.' class='f1r-standard-link'>" +
                            data.title + "</a>";
            }
            else {
                titleHTML = "<a href='http://www.ncbi.nlm.nih.gov/pubmed/" + data.id + "' target='_blank' " +
                            "title='Click to open this article in a new window.' class='f1r-standard-link'>" +
                            data.title + "</a>";
            }
        } else {
            titleHTML = data.title;
        }
        theNewRow.find(".author-display-row").attr("data-related-article-id", theID);
        // Update the fields for the article edit section
        theNewRow.find("input[name^='relatedArticleIds']").val(theID);
        theNewRow.find(".ra-title").html(titleHTML);
        theNewRow.find(".ra-authors").html(authorString);
        theNewRow.find(".ra-info").html(infoHTML);
        // Now update the fields for the article display
        theNewRow.find(".related-article-title-display").html(titleHTML);
        theNewRow.find(".related-article-authors-display").html(data.authorsText);
        theNewRow.find(".related-article-info-display").html(infoHTML);
        $("#related-articles-list").append(theNewRow);
        $("#related-article-id").val("");
    } // End of addNewRelatedArticle


    function updateRelatedArticle(data, theID, theRowNumber) {
        if (debugMode) { debugConsole.append("<br>starting updateRelatedArticle. See 'real' console for data. theID = " + theID + ". theRowNumber = " + theRowNumber); console.log(data); }
        var updateRowWrapper = $("#related-article-list-row" + theRowNumber),
            titleHTML = "",
            infoHTML = getArticlePublicationInfo(data);
        if (data.type === "DOI") {
            titleHTML = "<a href='https://doi.org/" + theID + "' target='_blank' " +
                        "title='Click to open this article in a new window.' class='f1r-standard-link'>" +
                        data.title + "</a>";
        } else if (data.type === "PUBMED") {
            titleHTML = "<a href='http://www.ncbi.nlm.nih.gov/pubmed/" + theID + "' target='_blank' " +
                        "title='Click to open this article in a new window.' class='f1r-standard-link'>" +
                        data.title + "</a>";
        } else {
            titleHTML = data.title;
        }
        updateRowWrapper.attr("data-related-article-id", theID);
        // Update the fields for the article edit section
        updateRowWrapper.find("input[name^='relatedArticleIds']").val(theID);
        updateRowWrapper.find(".ra-title").html(titleHTML);
        updateRowWrapper.find(".ra-authors").html(data.authorsText);
        updateRowWrapper.find(".ra-info").html(infoHTML);
        // Now update the fields for the article display
        updateRowWrapper.find(".related-article-title-display").html(titleHTML);
        updateRowWrapper.find(".related-article-authors-display").html(data.authorsText);
        updateRowWrapper.find(".related-article-info-display").html(infoHTML);
    } // End of updateRelatedArticle


    function getRelatedArticleData(theID, theInitiatorID) {
        if (debugMode) { debugConsole.append("<br>starting getRelatedArticleData. theID = " + theID + ". The Initiator was " + theInitiatorID); }
        var theURL = "https://" + location.host + "/externalArticle/validate/?id=" + theID,
            errorContainer = $("#related-articles-error"),
            updateRowNumber = "",
            okToAdd = true;
        $("#related-articles-list li").each(function (idx, el) {
            if (theInitiatorID !== $(el).find("input").attr("id")) {
                if (theID === $(el).find("input").val()) {
                    errorContainer.html("This article has already been added.").css({ "display": "inline-block" });
                    $(el).find("input").addClass("form-field-error");
                    setTimeout(function () { errorContainer.hide(500); $(el).find("input").removeClass("form-field-error"); }, 5000);
                    $("#new-related-article").val("").focus();
                    okToAdd = false;
                    return false;
                }
            }
        });
        if (okToAdd) {
            $.ajax({
                url: theURL,
                type: "GET",
                crossDomain: true,
                dataType: "json",
                beforeSend: function () { $("body").css({ "cursor": "progress" }); },
                success: function (data) {
                    if (!data.doi && !data.pmid && !data.title) {
                        errorContainer.html("This is not a valid PubMed ID, PMCID or DOI, please check and try again. (Just enter the number, no need to label with 'PMID' or 'doi').").show();
                        $("#related-article-id").val("").focus();
                        setTimeout(function () {
                            errorContainer.hide(500);
                        }, 5000);
                    } else {
                        if (theInitiatorID === "add-related-article") {
                            addNewRelatedArticle(data, theID);
                        } else if (theInitiatorID.indexOf("update-related-article-") > -1) {
                            updateRowNumber = theInitiatorID.substring(theInitiatorID.lastIndexOf("-")+1, theInitiatorID.length);
                            updateRelatedArticle(data, theID, updateRowNumber);
                        }
                    }
                },
                error: function (event, request, settings) {
                    errorContainer.html("Invalid ID. Event=" + event + "<div>Request: " + request + "</div><div>Settings: " + settings + "</div>");
                },
                complete: function () { $("body").css({ "cursor": "auto" }); }
            });
        }
    } // End of getRelatedArticleData


    function updateAuthorCheckbox(el, toBeSelected) {
        if (debugMode) { debugConsole.append("<br>starting updateAuthorCheckbox. toBeSelected=" + toBeSelected); }
        if (toBeSelected === true) {
            el.addClass("checkbox-selected");
            el.find("input").attr("checked", "checked").val(true);
        } else {
            el.removeClass("checkbox-selected");
            el.find("input").removeAttr("checked").val(false);
        }
    } // End of updateAuthorCheckbox


    function setDefaultInstitution(institutionField, institutionCountry, institutionRow) {
        if (debugMode) { debugConsole.append("<br>starting setDefaultInstitution."); }
        if (institutionField.val() === "") {
            institutionField.val(institutionField.attr("data-default"));
            institutionCountry.find("option[value='" + institutionCountry.attr("data-default") + "']").first().attr("selected", "selected");
            institutionRow.find(".faux-option.is-selected").removeClass("is-selected");
            institutionRow.find(".faux-option[data-value='" + institutionCountry.attr("data-default") + "']").first().click();
        }
    } // End of setDefaultInstitution



    function clearCorrespondingAuthorFields(authorRow) {
        if (debugMode) { debugConsole.append("<br>starting clearCorrespondingAuthorFields. Row=" + authorRow); }
        var instituteDisplayRow = authorRow.find(".author-affiliation"),
            affiliatinClearButton = authorRow.find(".c-affiliation-clear.enabled");
        instituteDisplayRow.html("");
        affiliatinClearButton.trigger("click");
    } // End of clearCorrespondingAuthorFields


    function trimEditorData(theText) {
        if (theText === "") { return theText; }
        var newArray = [],
            arrayText = [],
            i = 0,
            startFound = false,
            endPos = 0;
        theText = theText.replace("&nbsp;", "");
        arrayText = theText.split("<br />");
        for (i = arrayText.length - 1; i >= 0; i--) {
            if (arrayText[i] !== "") { endPos = i; break; }
        }
        for (i = 0; i <= endPos; i++) {
            if (arrayText[i] !== "" && !startFound) { startFound = true; }
            if (startFound) { newArray.push(arrayText[i]); }
        }
        return newArray.join("<br />");
    } // End of trimEditorData


    function createMultiRowEditor(fieldID, errorID) {
        if (debugMode) { debugConsole.append("<br>starting createMultiRowEditor. fieldID = " + fieldID + " | errorID = " + errorID); }
        if ($("#" + fieldID).size() > 0) {
            researchTextEditors.createFormFieldEditor({
                "id": fieldID,
                "width": 690,
                "height": 128,
                "extraPlugins": "confighelper,specialchar,wordcount,autogrow",
                //"removePlugins": "resize,elementspath,magicline",
                "wordCount": 10000,
                "wordCountErrorID": errorID,
                "autoGrow_minHeight": 128,
                "mandatoryField": {
                    "mandatoryClass": "form-field-required",
                    "targetClassList": "cke_wysiwyg_frame cke_bottom"
                },
                "toolbarOptions": iecontroller.isIE11 ? [ "Bold", "Italic", "Superscript", "Subscript", "NumberedList", "BulletedList"] : [ "Link", "Unlink", "Bold", "Italic", "Superscript", "Subscript", "NumberedList", "BulletedList" ]
            });
        }
    } // End of createMultiRowEditor


    function createSingleRowEditor(fieldID, errorID) {
        if (debugMode) { debugConsole.append("<br>starting createSingleRowEditor . fieldID = " + fieldID + " | errorID = " + errorID); }
        if ($("#" + fieldID).size() > 0) {
            researchTextEditors.createFormFieldEditor({
                "id": fieldID,
                "width": 690,
                "height": 38,
                "extraPlugins": "wordcount,autogrow",
                "wordCount": 1000,
                "wordCountErrorID": errorID,
                "hideWordCountDisplay": true,
                "autoGrow_minHeight": 38,
                "mandatoryField": {
                    "mandatoryClass": "form-field-required",
                    "targetClassList": "cke_wysiwyg_frame cke_bottom"
                }
            });
        }
    } // End of createSingleRowEditor


    function showErrorMessage(container, message) {
        message = message || "An unknown problem has occurred.";
        container.html(message).css({ "display": "inline-block" });
        setTimeout(function () { container.hide(500); }, 5000);
    } // End of showErrorMessage


    function bindGlobalFormHandlers() {
        if (debugMode) { debugConsole.append("<br>starting bindGlobalFormHandlers"); }
        $("body, .content-wrapper").css({ "background-color": "#f7f6f5" });

        // BIND AUTHOR SORTING HANDLERS ------------------------------------------------------------
        $("#sortable-author-list").sortable({
            revert: true,
            handle: ".sort-author",
            placeholder: "ui-state-highlight",
            items: "li.author-list-item:not(.not-sortable)",
            stop: function () {
                rebuildAuthorRows();
            }
        });
        $("#sortable-author-list").sortable("refreshPositions");

        // NEW AUTHORS EMAIL VALIDATION ------------------------------------------------------------
        $("#new-author-email").on("change", function() {
            var errorContainer = $("#add-author-error-displaymsg");
            if (cAuth && !F1000.ValidateEmail($(this).val())) {
                var error = "Please enter a valid e-mail address";
                showErrorMessage(errorContainer, error);
                $("#new-author-email").focus();
                return false;
            }
        });
    } // End of bindGlobalFormHandlers


    function bindFileUploadHandlers() {
        if (debugMode) { debugConsole.append("<br>starting bindFileUploadHandlers"); }
        // Handle the file upload buttons etc.
        $("#replace-asset-button").on("click", function(e) {
            e.preventDefault();
            $("#asset-file-display-name").html("");
            $("#asset-file-chosen-row").hide(10, function() { $("#choose-asset-button").fadeIn(200); });
            $("#originalFile").val("");
            $("#originalFile").click();
        });
        $("#choose-asset-button").on("click", function(e) {
            e.preventDefault();
            $("#originalFile").click();
        });
        $("#choose-asset-button.error").on("mouseenter", function() { $(this).addClass("orange").removeClass("error"); });
        $("body").on("change", "#originalFile", function(e) {
            e.preventDefault();
            var fileField = document.getElementById("originalFile"),
                fileName = "",
                fileType = "",
                errorContainer = $("#file-upload-type-error"),
                errorMessage = "",
                numberOfFiles = 0,
                assetType = $("form.asset-submission-form").attr("data-type");
            if (fileField.files) {
                numberOfFiles = fileField.files.length;
                if (numberOfFiles > 0) {
                    fileName = fileField.files[0].name;
                    fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
                    if (((assetType === "poster" || assetType === "document") && fileType === "pdf") || (assetType === "slide" && (fileType === "pdf" || fileType === "ppt" || fileType === "pptx"))) {
                        $("#asset-file-display-name").html(fileName);
                        $("#choose-asset-button").hide(10, function() { $("#asset-file-chosen-row").fadeIn(200); });
                        $("#choose-asset-button").addClass("is-hidden");
                    } else if (assetType === "preprint" && fileType === "pdf") {
                        $("#asset-file-display-name").html(fileName);
                        $("#choose-asset-button").hide(10, function() { $("#asset-file-chosen-row").fadeIn(200); });
                        $("#choose-asset-button").addClass("is-hidden");
                    } else {
                        fileField.value = "";
                        errorMessage = "Your file needs to be in PDF, PPT or PPTX format.";
                        if (assetType === "poster" || assetType === "preprint" || assetType === "document") {
                            errorMessage = "Your file needs to be in PDF format.";
                        }
                        errorContainer.html(errorMessage).css({ "display": "inline-block" });
                        setTimeout(function () { errorContainer.hide(500); }, 5000);
                    }
                }
            }
        });
    } // End of bindFileUploadHandlers

    function enableCcByNcSa() {
        $('#ccByNcSaLicenseAgreedContainer')
            .show();

        $('#ccByNcSaLicenseEnabled')
            .val(true);
    }

    function disableCcByNcSa() {
        $('#ccByNcSaLicenseAgreedContainer')
            .hide()
            .find('.form-check-box.checkbox-selected')
            .click();

        $('#ccByNcSaLicenseEnabled')
            .val(false);
    }

    function getAffiliationString(theRow) {
        if (debugMode) { debugConsole.append("<br>running getAffiliationString. See 'real' console for data."); console.log(theRow); }
        var affiliationString = "",
            institution = theRow.find("input[name$='.institution']").val(),
            department = theRow.find("input[name$='.department']").val(),
            place = theRow.find("input[name$='.place']").val(),
            state = theRow.find("input[name$='.state']").val(),
            country = theRow.find("[name$='.countryCode'] option").filter(':selected').text();
        affiliationString = institution;
        if (department !== "") { affiliationString += ", " + department; }
        affiliationString += ", " + place;
        if (state !== "") { affiliationString += ", " + state; }
        affiliationString += ", " + country;
        return affiliationString;
    }

    function bindAssetFormHandlers() {
        if (debugMode) { debugConsole.append("<br>starting bindAssetFormHandlers"); }

        //delete all BR's + white spaces from end of textarea
        function cleanDescription(){
            var desc = $("#asset-description-field").val().replace(/(&nbsp;|<br>|<br\s\/>)*$/g, '');
            $("#asset-description-field").val(desc);
        }

        //
        $('#in-collection-wrapper').change(function(evt) {
            var ccByNcSa = !!$(this).find('#collection-selector :selected').data('cc-by-nc-sa');

            if(ccByNcSa) {
                enableCcByNcSa();
            } else {
                disableCcByNcSa();
            }
        });

        // Handle the SUBMIT, PREVIEW buttons etc.
        $("#form-buttons button").on("click", function(e) {
            var isIE = false;
            if($(this).attr("data-action") === 'cancel'){
                return;
            }
            e.preventDefault();
            if (iecontroller.isIE6 || iecontroller.isIE7 || iecontroller.isIE8 || iecontroller.isIE9 || iecontroller.isIE10 || iecontroller.isIE11 || iecontroller.isEdge) {
                isIE = true;
            }
            if (!isIE) { cleanDescription(); }
            var action = $(this).attr("data-action"),
                type = formContainer.attr("data-type"),
                formAction = "/author/" + type + "/" + action,
                fName = $("#new-author-first-name").val(),
                sName = $("#new-author-last-name").val(),
                eMail = $("#new-author-email").val(),
                cAuth = $("#new-author-corresponding").parent().hasClass("checkbox-selected"),
                collectiveName = $("#new-author-collective-name").val(),
                collectiveEmail = $("#new-author-collective-email").val(),
                collectiveCorresponding = $("#new-author-collective-corresponding").parent().hasClass("checkbox-selected"),
                conferenceName = $("#new-conference-name").val(),
                theTitle = trimEditorData($("#article-title-input").val()),
                theDesc = $("#asset-description-field").val(),
                error = "",
                formReady = false,
                bgMask = $("#rhelper-background-mask"),
                maskMsg = $("#rhelper-background-message"),
                tryCounter = 0,
                maxTries = 5,
                tryAgain = true;
            rebuildAuthorRows();

            if (fName !== "" || sName !== "" || eMail !== "" || cAuth === true) {
                if (validateNewAssetAuthorRow()) {
                    $("#add-author").click();
                    formReady = true;
                }
            } else if(collectiveName.trim() !== "" || collectiveEmail.trim() !== "" || collectiveCorresponding === true) {
                if (validateNewAssetCollectiveRow()) {
                    $('#add-collective-author').click();
                    formReady = true;
                }
            } else if(conferenceName.trim() !== "") {
                if (conferenceName.length > maxTextFieldLength) {
                    $("#conferences-error").html("The conference name field exceeds the maximum length of 255 characters.").fadeIn(200);
                    setTimeout(function () { $("#conferences-error").hide(500); }, 5000);
                    scrollToElement($("#conferences-error"), 400, -200);
                } else {
                    $('#add-new-conference').click();
                    formReady = true;
                }
            } else if(F1000platform.name === "gates") {
                var grantNumberEl = document.querySelector('[name="grantNumber"]'),
                    grantNumber = grantNumberEl ? grantNumberEl.value : '';

                if (grantNumber.trim() !== '') {
                    var grantNumberError = document.querySelector('.js-grants-platform-error');
                    grantNumberError.innerHTML = 'Please validate this Gates Foundation grant number by clicking on the "Add Another Gates Foundation Grant" button';
                    F1000.ShowElement(grantNumberError);
                    grantNumberEl.focus();
                } else {
                    formReady = true;
                }
            } else {
                formReady = true;
            }

            if (formReady) {
                $("body").css({ "cursor": "wait" });
                maskMsg.html("Saving . . . Please Wait.");
                bgMask.fadeIn(200);
                formContainer.attr("action", formAction);
                if (iecontroller.isIE6 || iecontroller.isIE7 || iecontroller.isIE8 || iecontroller.isIE9 || iecontroller.isIE10 || iecontroller.isEdge) {
                    // HORRIBLE WORKAROUND FOR SECURITY ISSUES WITH IE10
                    while (tryAgain) {
                        tryCounter++;
                        document.getElementById("article-title-input").innerHTML = theTitle;
                        document.getElementById("asset-description-field").innerHTML = theDesc;
                        try {
                            document.getElementById(formContainer.attr("id")).submit();
                            tryAgain = false;
                        } catch(err) {
                            console.log("ERROR: " + err);
                        } finally {
                            if (tryCounter >= maxTries) {
                                tryAgain = false;
                                bgMask.fadeOut(50);
                                $("body").css({ "cursor": "default" });
                                messenger.addWarning("I'm sorry but an error has occurred with your submission. Please try again. If the problem persists please contact research@f1000.com.");
                            }
                        }
                    }
                } else {
                    $("#article-title-input").val(theTitle);
                    $('#sortable-author-list .js-affiliations-form input[disabled]').prop("disabled", false);
                    $('#sortable-author-list .js-affiliations-form select[disabled]').prop("disabled", false);
                    formContainer.submit();
                }
            }
        });

        // Populate any existing related articles
        $(".existing-related-article").each(function (idx, el) {
            var theID = $(this).attr("data-related-article-id");
            getRelatedArticleData(theID, "add-related-article");
            $(el).remove();
        });

        // Pressing ENTER in the related articles field starts the AJAX call
        $("#related-article-id").keyup(function (e) {
            if (e.keyCode == 13) { $("#add-related-article").click(); }
        });

        // Pressing ENTER in the update related articles field starts the AJAX call
        $("body").on("keyup", ".update-related-article-field", function(e) {
            if (e.keyCode === 13) {
                $(this).closest(".group-item-row").find("button.update-related-article").click();
            }
        });

        // Changing the update related articles field starts the AJAX call
        $("body").on("change", ".update-related-article-field", function(e) {
            $(this).closest(".group-item-row").find("button.update-related-article").click();
        });

        // Set the autocomplete on the new conference row
        if($("#new-conference-name").length) {
            conferenceAutocomplete("#new-conference-name");
        }

        // Set the WYSIWYG editor on the required fields
        $("#asset-description-field").html($("#summary-text").val());
        // if (canUseTextEditor) {
        //     // createSingleRowEditor("article-title-input", "wysiwyg-title-display");
        //     createMultiRowEditor("asset-description-field", "wysiwyg-error-display");
        // }

        // Show title tooltip on added conferences
        $("body").on("mouseenter", ".show-title-tooltip", function () {
            $(this).closest("li").find(".tooltip").fadeIn(100);
        }).on("mouseleave", ".show-title-tooltip", function () {
            $(this).closest("li").find(".tooltip").fadeOut(100);
        });

        // Hide error on competing interests if required
        $(".author-asset-radio-button").on("click", function () {
            var topContainer = $(this).closest(".form-input-wrapper"),
                errorMessage = topContainer.find(".competing-interests-unselected-error");
            if (errorMessage.is(":visible")) { errorMessage.hide(); }
        });
    } // End of bindAssetFormHandlers


    function bindAssetFormAuthorHandlers() {
        if (debugMode) { debugConsole.append("<br>starting bindAssetFormAuthorHandlers"); }
        var that = this;
        // Press RETURN IN NEW AUTHOR FIELDS TO ADD THE AUTHOR
        $("#new-author-last-name, #new-author-first-name, #new-author-email").keyup(function (e) {
            if (e.keyCode == 13) { $("#add-author").click(); }
        });
        // ADD AUTHOR CLICK ------------------------------------------------------------
        $("#add-author").on("click", function () {
            var fName = $("#new-author-first-name").val(),
                sName = $("#new-author-last-name").val(),
                eMail = $("#new-author-email").val(),
                cAuth = $("#new-author-corresponding").parent().hasClass("checkbox-selected"),
                department = $("#authorDetailsFormNew").find("[name='department']").val(),
                institution = $("#authorDetailsFormNew").find("[name='institution']").val(),
                ringgoldInstitutionId = $("#authorDetailsFormNew").find(".js-affiliation-institution-id").val(),
                place = $("#authorDetailsFormNew").find("[name='place']").val(),
                state = $("#authorDetailsFormNew").find("[name='state']").val(),
                zipCode = $("#authorDetailsFormNew").find("[name='zipCode']").val(),
                countryCode = $("#authorDetailsFormNew").find("[name='countryCode'] option:selected").val(),
                country = $("#authorDetailsFormNew").find("[name='countryCode'] option:selected").text(),
                formId = "",
                instFieldID = "",
                theNewRow = "";

            rebuildAuthorRows();

            if (validateNewAssetAuthorRow()) {
                theNewRow = getAssetAuthorRowTemplate();
                theNewRow.find("input[name$='.firstName']").attr("value", fName);
                theNewRow.find("input[name$='.lastName']").attr("value", sName);
                theNewRow.find("input[name$='.email']").attr("value", eMail);
                theNewRow.find("input[name$='.corresponding']").attr("value", cAuth);
                theNewRow.find("input[name='firstName-edit']").attr("value", fName);
                theNewRow.find("input[name='lastName-edit']").attr("value", sName);
                theNewRow.find("input[name='email-edit']").attr("value", eMail);
                theNewRow.find("input[name='corresponding-edit']").attr("value", cAuth);
                theNewRow.find(".js-affiliation-department").val(department);
                theNewRow.find(".js-affiliation-institution").val(institution);
                theNewRow.find(".js-affiliation-institution-id").val(ringgoldInstitutionId);
                theNewRow.find(".js-affiliation-place").val(place);
                theNewRow.find(".js-affiliation-state").val(state);
                theNewRow.find(".js-affiliation-zip-code").val(zipCode);
                theNewRow.find(".js-affiliation-country").find(":selected").removeAttr("selected");
                theNewRow.find(".js-affiliation-country").find("option[value='" + countryCode + "']").attr("selected", "selected");

                instFieldID = "#" + theNewRow.find("input[name$='.institution']").attr("id");
                theNewRow.find("input[name$='.institution']");
                theNewRow.find(".author-fullname").html(fName + " " + sName);
                if(!eMail || eMail.trim() === '') {
                    theNewRow.find(".author-email").html("(" + eMail + ")");
                    theNewRow.find(".author-email").hide();
                } else {
                    theNewRow.find(".author-email").show();
                }
                if (institution !== "") {
                    theNewRow.find(".js-affiliation-institution").next('.c-affiliation-clear').addClass('enabled');
                    theNewRow.find(".author-affiliation").html(getAffiliationString(theNewRow));
                }
                theNewRow.find(".author-affiliations-edit-row").hide();
                theNewRow.find(".author-affiliations-display-row").hide();
                if (cAuth) {
                    theNewRow.find("input:checkbox").each(function () {
                        $(this).attr("checked", "checked");
                        $(this).closest(".form-check-box").addClass("checkbox-selected");
                    });
                    theNewRow.find(".author-affiliations-display-row").show();
                }
                formId = 'authorDetailsForm_' + $("#sortable-author-list > li").length;
                theNewRow.find('.js-affiliations-form').attr('id', formId);
                if (!cAuth) {
                    theNewRow.find('.js-affiliations-form').hide();
                }
                $("#sortable-author-list").append(theNewRow);
                new AffiliationForm({
                    formId: formId
                }).init();
                $("#sortable-author-list > li").last().find(".faux-option[data-value='" + countryCode + "']").click();
                $("#add-new-author-row input").val("");
                $("#new-author-corresponding").val(false).removeAttr("checked");
                $("#new-author-corresponding").closest(".form-check-box").removeClass("checkbox-selected");
                $("#add-new-author-row .c-affiliation-clear").trigger("click");
                formNewAuthorInstitution.hide();
            }
        });
        // ADD COLLECTIVE AUTHOR CLICK ------------------------------------------------------------
        $("#add-collective-author").on("click", function () {
            var cName = $("#new-author-collective-name").val(),
                eMail = $("#new-author-collective-email").val(),
                cAuth = $("#new-author-collective-corresponding").parent().hasClass("checkbox-selected"),
                theNewRow = "";

            rebuildAuthorRows();

            if (validateNewAssetCollectiveRow()) {
                theNewRow = getAssetAuthorRowTemplate(true);
                theNewRow.find("input[name$='.collectiveName']").attr("value", cName);
                theNewRow.find("input[name$='.email']").attr("value", eMail);
                theNewRow.find("input[name$='.corresponding']").attr("value", cAuth);
                theNewRow.find("input[name='collectiveName-edit']").attr("value", cName);
                theNewRow.find("input[name='email-edit']").attr("value", eMail);
                theNewRow.find("input[name='corresponding-edit']").attr("value", cAuth);
                theNewRow.find(".author-fullname").html(cName);

                if(!eMail || eMail.trim() === '') {
                    theNewRow.find(".author-email").hide();
                } else {
                    theNewRow.find(".author-email").html("(" + eMail + ")");
                    theNewRow.find(".author-email").show();
                }
                if (cAuth) {
                    theNewRow.find("input:checkbox").each(function () {
                        $(this).attr("checked", "checked");
                        $(this).closest(".form-check-box").addClass("checkbox-selected");
                    });
                }
                $("#sortable-author-list").append(theNewRow);
                $("#new-author-collective-name").val("");
                $("#new-author-collective-email").val("");
                $("#new-author-collective-corresponding").val(false).removeAttr("checked");
                $("#new-author-collective-corresponding").closest(".form-check-box").removeClass("checkbox-selected");
                $("#show-new-author").click();
            }
        });
        // SHOW NEW AUTHOR CLICK ------------------------------------------------------------
        $("#show-new-author").on("click", function (e) {
            e.preventDefault();

            // check if any of the fields are empty
            var fields = [
                $('#new-author-collective-name'),
                $('#new-author-collective-email')
            ];
            var allFieldsEmpty = true;
            fields.forEach(function($input) {
                if($input.val().trim() !== '') {
                    allFieldsEmpty = false;
                }
            });

            // if they aren't all empty, do validation (c+p from add author click)
            if (!allFieldsEmpty) {
                rebuildAuthorRows();

                var isValid = validateNewAssetCollectiveRow();
                $('#add-collective-author').click();

                if (!isValid) {
                    return false;
                }
            }

            $("#add-collective-author-row").slideUp(200, function () {
                $("#add-new-author-row").slideDown(200);
            });
            $("#add-collective-container").fadeOut(200, function () {
                $("#add-author-container").fadeIn(200);
            });
        });
        // SHOW COLLECTIVE AUTHOR CLICK  --------------------------------------------
        $("#show-collective-author").on("click", function(e) {
            e.preventDefault();

            // check if any of the fields are empty
            var fields = [
                $('#new-author-last-name'),
                $('#new-author-first-name'),
                $('#authorDetailsFormNew_department'),
                $('#authorDetailsFormNew_institution')
            ];
            var allFieldsEmpty = true;
            fields.forEach(function($input) {
                if($input.val().trim() !== '') {
                    allFieldsEmpty = false;
                }
            });

            // if they aren't all empty, do validation (c+p from add author click)
            if (!allFieldsEmpty) {
                rebuildAuthorRows();

                var isValid = validateNewAssetAuthorRow();
                $('#add-author').click();

                if (!isValid) {
                    return false;
                }
            }

            $("#add-new-author-row").slideUp(200, function() {
                $("#add-collective-author-row").slideDown(200);
            });
            $("#add-author-container").fadeOut(200, function() {
                $("#add-collective-container").fadeIn(200);
            });
        });
        // NEW CORRESPONDING AUTHOR CHECKBOX
        $("#add-new-author-row .form-check-box").on("click", function(e) {
            var hiddenRow = $(this).hasClass("checkbox-selected");
            if (hiddenRow) {
                clearCorrespondingAuthorFields($("#add-new-author-row"));
            }
            formNewAuthorInstitution.slideToggle(300);
        });
        // EDIT AUTHOR ICON CLICK  ------------------------------------------------------------
        $("body").on("click", ".f1r-icon.edit-author", function () {
            var theMainRow = $(this).closest("li"),
                theDisplayRow = theMainRow.find("div[id$='-display']"),
                theHiddenRow = theMainRow.find("div[id$='-edit']"),
                cName = "",
                fName = "",
                lName = "",
                eMail = "";

            if (theHiddenRow.find("input[name$='.collectiveName']").length > 0) {
                cName = theHiddenRow.find("input[name$='.collectiveName']").val();
                //Fill with the real data
                theHiddenRow.find("input[name='collectiveName-edit']").attr("value", cName);
            } else {
                fName = theHiddenRow.find("input[name$='.firstName']").val();
                lName = theHiddenRow.find("input[name$='.lastName']").val();
                //Fill with the real data
                theHiddenRow.find("input[name='firstName-edit']").attr("value", fName);
                theHiddenRow.find("input[name='lastName-edit']").attr("value", lName);
            }

            eMail = theHiddenRow.find("input[name$='.email']").val();
            theHiddenRow.find("input[name='email-edit']").attr("value", eMail);
            if (theDisplayRow.find(".corresponding-author-checkbox").hasClass("checkbox-selected")) {
                theHiddenRow.find(".author-institution-row").show();
                theHiddenRow.find(".author-institution-display-row").show();
            }else{
                theHiddenRow.find(".js-affiliations-form").hide();
                theHiddenRow.find(".author-institution-display-row").hide();
            }

            theDisplayRow.fadeToggle(250, function () { theHiddenRow.fadeIn(250); });
        });
        // SAVE AUTHOR ICON CLICK ------------------------------------------------------------
        $("body").on("click", ".f1r-icon.save-author", function () {
            var theEditRow = $(this).closest("li").find("div[id$='-edit']"),
                theRow = theEditRow.parent(),
                indexRow = $(this).parents(".author-display-row").attr("data-author-index"),
                theDisplayRow = $(this).closest("li").find("div[id$='-display']"),
                isCollective = theEditRow.find("input[name='collectiveName-edit']"),
                isCorrespondingAuthor = theEditRow.find(".form-check-box").hasClass("checkbox-selected"),
                cName = "",
                cAuth = $(this).parents(".author-display-row").find('.corresponding-author-checkbox').hasClass("checkbox-selected"),
                forename = "",
                surname = "",
                institution = "",
                institutionCountryCode = "",
                email = "",
                error = "",
                errorContainer = $("#author-row" + indexRow + "-edit-error-displaymsg");
            //console.log('doing author save');
            theRow.find('.be-error').remove();

            email = theEditRow.find("input[name='email-edit']").val();
            if(isCollective.size() == 0 || isCorrespondingAuthor || (email && email.length)) {
                if(cAuth && !F1000.ValidateEmail(email)) {
                    error = "Please enter a valid e-mail address";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    //formMessenger.showError($("#author-row" + indexRow + "-edit-error-displaymsg"), error);
                    return false;
                }

                var foundDuplicate = false;
                $(this).closest("li").siblings().each(function() {
                    var theEmailCheck = $(this).find(".the-email-field").val() || "";
                    if (theEmailCheck.trim() === email.trim()) {
                        foundDuplicate = true;
                    }
                });

                if(foundDuplicate) {
                    error = "This email address has already been associated with another author, please associate each author a unique email address ";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    return false;
                }
            }

            if (isCollective.size() > 0) {
                cName = isCollective.val();
                if (cName === "") {
                    error = "Please enter a name for the collective or just leave blank if not required.";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    //formMessenger.showError($("#author-row" + indexRow + "-edit-error-displaymsg"), error);
                    return false;
                }
                theEditRow.find("input[name$='.collectiveName']").attr("value", cName);
                theDisplayRow.find(".author-fullname").text(cName);
            } else {
                forename = theEditRow.find("input[name='firstName-edit']").val();
                surname = theEditRow.find("input[name='lastName-edit']").val();

                institution = theEditRow.find(".js-affiliation-institution").val();
                institutionCountryCode = theEditRow.find("select[name$='.countryCode'] option:selected").val();
                if (isCorrespondingAuthor && (institution === "" || institutionCountryCode === "" || institutionCountryCode === "-1")) {
                    error = "A corresponding author must have a valid institution and country/region.";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    //formMessenger.showError($("#author-row" + indexRow + "-edit-error-displaymsg"), error);
                    return false;
                }
                if (forename === "" || surname === "") {
                    error = "Please complete all fields and select at least one corresponding author.";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    //formMessenger.showError($("#author-row" + indexRow + "-edit-error-displaymsg"), error);
                    return false;
                }
                if (!F1000.ValidateNoFullStopFirstCharacter(surname)) {
                    error = "Please enter a last name for this author consisting of alphabetical characters.";
                    errorContainer.html(error).css({ "display": "inline-block" });
                    setTimeout(function () { errorContainer.hide(500); }, 5000);
                    return false;
                }
                theEditRow.find("input[name$='.firstName']").attr("value", forename);
                theEditRow.find("input[name$='.lastName']").attr("value", surname);
                theDisplayRow.find(".author-fullname").text(forename + " " + surname);
                if (cAuth) {
                    theDisplayRow.find(".author-affiliation").html(getAffiliationString(theEditRow));
                } else {
                    theDisplayRow.find(".author-affiliation").html("");
                }
            }

            theEditRow.find("input[name$='.email']").attr("value", email);
            theDisplayRow.find(".author-email").text("(" + email + ")");
            if(!email || email.trim() === '') {
                theDisplayRow.find(".author-email").hide();
            } else {
                theDisplayRow.find(".author-email").show();
            }
            theEditRow.fadeToggle(200, function () { theDisplayRow.fadeIn(200); });
        });
        // CANCEL AUTHOR ICON CLICK ------------------------------------------------------------
        $("body").on("click", ".f1r-icon.cancel-author", function () {
            var theDisplayRow = $(this).closest("li").find("div[id$='-display']"),
                theEditRow = $(this).closest("li").find("div[id$='-edit']");

            if (theEditRow.find("input[name$='corresponding']:checked") && theEditRow.find("input[name*='email']").val().trim() === "") {
                theEditRow.find("input[name$='corresponding']").removeAttr("checked");
                theEditRow.find("input[name$='corresponding']").closest(".form-check-box").removeClass("checkbox-selected");
                theEditRow.find("input[name*='email']").attr('placeholder', 'Email (Optional)');
                theDisplayRow.find("input[name$='corresponding']").removeAttr("checked");
                theDisplayRow.find("input[name$='corresponding']").closest(".form-check-box").removeClass("checkbox-selected");
            }
            theEditRow.fadeToggle(200, function () { theDisplayRow.fadeIn(200); });
        });
        // DELETE EXISTING AUTHOR ROW ------------------------------------------------------------
        $("body").on("click", ".f1r-icon.delete-author-row", function (e) {
            e.preventDefault();
            var authorContainer = $(this).closest("li");
            R.ui.confirmCallbacks.onYes = function() {
                authorContainer.remove();
            };
        });
        // CORRESPONDING AUTHOR CHECKBOX ------------------------------------------------------------
        $("body").on("click", ".corresponding-author-checkbox", function (e) {
            e.preventDefault();
            var authorContainer = $(this).closest(".group-item.author-display-row"),
                authorEditRow = authorContainer.children("div[id$='-edit']"),
                editRowCheckboxContainer = authorEditRow.find(".corresponding-author-checkbox"),
                authorDisplayRow = authorContainer.children("div[id$='-display']"),
                displayRowCheckboxContainer = authorDisplayRow.find(".corresponding-author-checkbox"),
                institutionRow = authorEditRow.find(".js-affiliations-form"),
                toBeSelected = $(this).hasClass("checkbox-selected"),
                institutionField = institutionRow.find(".author-institution"),
                institutionCountry = institutionRow.find("select"),
                hasDefaults = institutionField.attr("data-default") ? true : false;
            if ($(this).hasClass("for-display-row")) {
                if (hasDefaults && institutionField.attr("data-default") !== "") {
                    setDefaultInstitution(institutionField, institutionCountry, institutionRow);
                }
                if (toBeSelected) {
                    institutionRow.show();
                    authorDisplayRow.fadeToggle(250, function () { authorEditRow.fadeIn(250); });
                } else {
                    clearCorrespondingAuthorFields(authorContainer);
                    authorContainer.find(".author-institution-row").hide();
                    institutionRow.hide();
                }
                updateAuthorCheckbox(editRowCheckboxContainer, toBeSelected);
            } else {
                if (toBeSelected) {
                    if (hasDefaults && institutionField.attr("data-default") !== "") {
                        setDefaultInstitution(institutionField, institutionCountry, institutionRow);
                    }
                    institutionRow.show();
                } else {
                    clearCorrespondingAuthorFields(authorContainer);
                    authorContainer.find(".author-institution-row").hide();
                    institutionRow.hide();
                }
                updateAuthorCheckbox(displayRowCheckboxContainer, toBeSelected);
            }
        });
        // ADD NEW INSTITUTION LINK ------------------------------------------------------------
        $("body").on("click", ".add-new-institution", function(e) {
            e.preventDefault();
            var institution = "",
                country = "",
                errorContainer = "",
                authorIndex = 0,
                affilIndex = 0,
                theNewRow = "";
            if ($(this).hasClass("new-author")) {
                institution = $("#new-author-institution");
                country = $(this).closest(".new-author-institution-row").find(".faux-option.is-selected").attr("data-value");
                errorContainer = $("#add-author-error-displaymsg");
            } else {
                institution = $(this).closest(".author-institution-row").find("input[name$='.institution']");
                country = $(this).closest(".author-institution-row").find(".faux-option.is-selected").attr("data-value");
                errorContainer = $(this).closest("div[id$='-edit']").find(".submission-form-error");
            }
            if (institution.val() === "" || country === "") {
                formMessenger.showError(errorContainer, "Please complete the current institution first.");
                institution.focus();
            } else {
                authorIndex = $(this).closest(".author-display-row").attr("data-author-index");
                affilIndex = $(this).closest(".author-institution-row").find(".the-institution-row").size();
                theNewRow = getAuthorInstitutionRow(authorIndex, affilIndex);
                $(this).closest(".author-institution-row").find(".add-institution-row").before(theNewRow);
            }
        });

        $("body").on("click", ".corresponding-author-checkbox.for-display-row", function() {
            var row = $(this).closest("li"),
                editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-edit-row"),
                editCheckbox = editCheckboxWrapper.find("input:checkbox");

            if ($(this).hasClass("checkbox-selected")) {
                editCheckboxWrapper.addClass("checkbox-selected");
                editCheckbox.attr("checked", "checked").val("true");
            } else {
                editCheckboxWrapper.removeClass("checkbox-selected");
                editCheckbox.removeAttr("checked").val("false");
            }

            checkCollectiveEmailRequired(row);
        });
        $("body").on("click", ".corresponding-author-checkbox.for-edit-row", function() {
            var row = $(this).closest("li"),
                editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-display-row"),
                editCheckbox = editCheckboxWrapper.find("input:checkbox");
            if ($(this).hasClass("checkbox-selected")) {
                editCheckboxWrapper.addClass("checkbox-selected");
                editCheckbox.attr("checked", "checked").val("true");
            } else {
                editCheckboxWrapper.removeClass("checkbox-selected");
                editCheckbox.removeAttr("checked").val("false");
            }

            checkCollectiveEmailRequired(row);
        });
        $("body").on("click", ".the-new-author-corresponding-checkbox .form-check-box", function() {
            var row = $(this).closest("#add-collective-author-row");
            checkCollectiveEmailRequired(row);
        });
    } // End of bindAssetFormAuthorHandlers




//  =================================================================================================
//  THE CONTROLLER FOR THE ASSETS FORM IS BELOW
//  -------------------------------------------------------------------------------------------------
    var assetFormController = {
        formID: "authorAssetSubmissionForm",
        authorValidationError: "Please supply last name, first name, email address and all affiliation fields that are not marked (optional)",

        initialize: function () {
            if (debugMode) { debugConsole.append("<br>initializing assetFormController. See 'real' console for data."); }
            this.bindAssetFormConferenceHandlers();
            this.bindAssetFormRelatedArticleHandlers();
            this.initializeAffiliationForms();
        },

        initializeAffiliationForms: function() {
            $('.js-affiliations-form').each(function() {
                new AffiliationForm({
                    formId: $(this).attr('id')
                }).init();
            });
        },

        bindAssetFormConferenceHandlers: function() {
            if (debugMode) { debugConsole.append("<br>starting bindAssetFormConferenceHandlers"); }
            // ADD NEW CONFERENCE CLICK ------------------------------------------------------------
            $("#add-new-conference").on("click", function(e) {
                e.preventDefault();
                var confValue = $("#new-conference-name").val();
                if (confValue.length > maxTextFieldLength) {
                    $("#conferences-error").html("The conference name field exceeds the maximum length of 255 characters.").fadeIn(200);
                    setTimeout(function () { $("#conferences-error").hide(500); }, 5000);
                    return false;
                } else {
                    addConferenceRow();
                }
            });
            // SET UP AUTOCOMPLETE ON THE CONFERENCE ROWS
            $("#conference-list li").each(function () {
                conferenceAutocomplete("#" + $(this).find("input[name$='conference.name']").attr("id"));
            });
            // DISABLE THE YEAR 'FAUX OPTIONS' ON CONFERENCES THAT WERE SELECTED FROM THE DROP DOWN
            $("#conference-list li").find("input[name$='approved'][value='true']").each(function () {
                $(this).closest("li").find(".faux-option:not(.is-selected)").removeClass("faux-option").addClass("disabled-faux-option");
            });
            // DELETE EXISTING CONFERENCE ROW ------------------------------------------------------------
            $("body").on("click", ".f1r-icon.delete-conference-row", function (e) {
                e.preventDefault();
                var rowContainer = $(this).closest("li");
                R.ui.confirmCallbacks.onYes = function () {
                    rowContainer.remove();
                    rebuildConferenceRows();
                };
            });

            function getConferenceRowTemplate() {
                if (debugMode) { debugConsole.append("<br>starting getConferenceRowTemplate"); }
                var rowIndex = $("#conference-list li").size(),
                    theTemplate = newConferenceTemplate,
                    theNewRow = "";
                theNewRow = theTemplate.clone();
                theNewRow.find("input[name$='conference.name']").attr("id", "conf-name-" + rowIndex);
                theNewRow.find(".tooltip").attr("id", "tooltip-conference-title-" + rowIndex);
                rebuildFormFieldName(theNewRow.find("select[name$='.year']"), rowIndex);
                theNewRow.find("input[type='text'], input[type='hidden']").each(function (idx, element) {
                    if ($(element).attr("name")) {
                        rebuildFormFieldName($(element), rowIndex);
                    }
                });
                return theNewRow;
            } // End of getConferenceRowTemplate

            function getConferenceIndex() {
                if (debugMode) { debugConsole.append("<br>starting getConferenceIndex."); }
                return $("#new-conference").attr("data-conference-index");
            } // End of getConferenceIndex

            function setConferenceIndex() {
                if (debugMode) { debugConsole.append("<br>starting setConferenceIndex."); }
                var newIndex = $("#conference-list li").size() + 1;
                $("#new-conference").attr("data-conference-index", newIndex);
            } // End of setConferenceIndex

            function resetAddConference() {
                if (debugMode) { debugConsole.append("<br>starting resetAddConference."); }
                $("#new-conference li").find(".is-selected").removeClass("is-selected");
                $("#new-conference li").find(".disabled-faux-option").removeClass("disabled-faux-option").addClass("faux-option");
                $("#new-conference-ref").val("");
                $("#new-conference-id").val("");
                $("#new-conference-name").val("");
                $("#new-conference-id").closest("li").find(".faux-option").first().click();
                $("#new-conference").find(".is-defaulted").removeClass("is-defaulted");
            } // End of resetAddConference

            function addConferenceRow() {
                if (debugMode) { debugConsole.append("<br>starting addConferenceRow."); }
                var theNewRow = getConferenceRowTemplate(),
                    theID = $("#new-conference-id").val(),
                    theName = $("#new-conference-name").val(),
                    theRef = "",
                    theYear = $("#new-conference-year option:selected").val(),
                    wasConferenceChosen = $("#new-conference-chosen").val() === "true" ? true : false,
                    addedRow = "";
                theNewRow.find("input[name$='].id']").val(theRef);
                theNewRow.find("input[name$='conference.id']").val(theID);
                theNewRow.find("input[name$='conference.name']").val(theName);
                theNewRow.find("select[name$='.year'] option[value='" + theYear + "']").attr("selected", "selected").addClass("is-selected");
                theNewRow.find(".tooltip").html(theName);
                if (theYear) {
                    if (wasConferenceChosen) {
                        theNewRow.find(".faux-options-container").addClass("is-defaulted");
                        theNewRow.find(".asset-form-conference-year").addClass("is-defaulted");
                        theNewRow.find(".faux-option").removeClass("faux-option is-selected").addClass("disabled-faux-option");
                        theNewRow.find(".disabled-faux-option[data-value='" + theYear + "']").removeClass("disabled-faux-option").addClass("faux-option is-selected");
                    } else {
                        theNewRow.find(".faux-option[data-value='" + theYear + "']").addClass("is-selected");
                    }
                }
                $("#conference-list").append(theNewRow);
                addedRow = $("#conference-list li").last();
                addedRow.find(".faux-option.is-selected").click();
                rebuildConferenceRows();
                conferenceAutocomplete("#" + addedRow.find("input[name$='conference.name']").attr("id"));
                resetAddConference();
            } // End of addConferenceRow

            function rebuildConferenceRows() {
                if (debugMode) { debugConsole.append("<br>starting rebuildConferenceRows."); }
                var indexNew = $("#conference-list li").size();
                $("#conference-list li").each(function (idx, el) {
                    $(el).find("input[name$='conference.name']").attr("id", "conf-name-" + idx);
                    rebuildFormFieldName($(el).find("input[name$='].id']"), idx);
                    rebuildFormFieldName($(el).find("input[name$='conference.id']"), idx);
                    rebuildFormFieldName($(el).find("input[name$='conference.name']"), idx);
                    rebuildFormFieldName($(el).find("select[name$='.year']"), idx);
                });
                rebuildFormFieldName($("#new-conference-ref"), indexNew);
                rebuildFormFieldName($("#new-conference-id"), indexNew);
                rebuildFormFieldName($("#new-conference-name"), indexNew);
                rebuildFormFieldName($("#new-conference-year"), indexNew);
            } // End of rebuildConferenceRows
        },

        bindAssetFormRelatedArticleHandlers: function () {
            if (debugMode) { debugConsole.append("<br>starting bindAssetFormRelatedArticleHandlers"); }
            // ADD RELATED ARTICLE CLICK ------------------------------------------------------------
            $("#add-related-article").on("click", function (e) {
                e.preventDefault();
                var theID = $("#related-article-id").val().trim(),
                    data = "";
                if (debugMode) {
                    data = {
                        "title": "This is the name of the test article. Article titles can be quite long.",
                        "version": "2",
                        "authors": "James Hall, Eric Equality",
                        "journal": "F1000Research",
                        "journalVolume": "3",
                        "journalIssue": "288",
                        "publishedDate": "14 JULY 2014",
                        "doi": "10.12688/f1000research.5794.2",
                        "shortLink": "http://f1000r.es/53b"
                    };
                    addNewRelatedArticle(data, theID);
                } else {
                    getRelatedArticleData(theID, e.target.id);
                }
            });
            // EDIT RELATED ARTICLE CLICK ------------------------------------------------------------
            $("body").on("click", ".f1r-icon.edit-related-article", function (e) {
                e.preventDefault();
                var theMainRow = $(this).closest("li"),
                    theDisplayRow = theMainRow.find("div[id$='-display']"),
                    theEditRow = theMainRow.find("div[id$='-edit']"),
                    theInputValue = theEditRow.find("input.update-related-article-field").val();
                if (theInputValue === "") {
                    theInputValue = theMainRow.find(".author-display-row").attr("data-related-article-id");
                    theEditRow.find("input.update-related-article-field").val(theInputValue);
                }
                theDisplayRow.fadeToggle(250, function () { theEditRow.fadeIn(250); });
            });
            // SAVE RELATED ARTICLE CLICK ------------------------------------------------------------
            $("body").on("click", ".f1r-icon.save-related-article", function (e) {
                e.preventDefault();
                var theRow = $(this).closest(".author-display-row"),
                    editWrapper = theRow.find("div[id$='-edit']"),
                    displayWrapper = theRow.find("div[id$='-display']");
                // Make sure display fields are OK
                displayWrapper.find(".related-article-title-display").html(editWrapper.find(".ra-title").html());
                displayWrapper.find(".related-article-authors-display").html(editWrapper.find(".ra-authors").html());
                displayWrapper.find(".related-article-info-display").html(editWrapper.find(".ra-info").html());
                editWrapper.fadeToggle(250, function () { displayWrapper.fadeIn(250); });
            });
            // UPDATE RELATED ARTICLE CLICK ------------------------------------------------------------
            $("body").on("click", ".update-related-article", function (e) {
                e.preventDefault();
                var newIDField = $(this).closest(".group-item-row").find("input[name^='relatedArticleIds']"),
                    editWrapper = $(this).closest("div[id$='-edit']"),
                    rowNumber = $(this).closest(".author-display-row").attr("data-related-article-index");
                if (newIDField.val() === "") {
                    formMessenger.showError(editWrapper.find(".form-error-display"), "Please enter a valid ID or click the trash icon to remove this article.");
                    newIDField.focus();
                } else if (newIDField.val().toLowerCase() === "error" && debugMode) {
                    formMessenger.showError(editWrapper.find(".form-error-display"), "Testing error messages.");
                    newIDField.focus();
                } else {
                    getRelatedArticleData(newIDField.val(), "update-related-article-" + rowNumber);
                }
            });
            // CANCEL RELATED ARTICLE EDIT CLICK ------------------------------------------------------------
            $("body").on("click", ".f1r-icon.cancel-related-article", function (e) {
                e.preventDefault();
                var theCurrentRow = $(this).closest("li"),
                    theID = theCurrentRow.find(".author-display-row").attr("data-related-article-id"),
                    rowNumber = theCurrentRow.find(".author-display-row").attr("data-related-article-index"),
                    theDisplayRow = "",
                    theEditRow = "";
                getRelatedArticleData(theID, "update-related-article-" + rowNumber);
                theDisplayRow = theCurrentRow.find("div[id$='-display']");
                theEditRow = theCurrentRow.find("div[id$='-edit']");
                theEditRow.fadeToggle(250, function () { theDisplayRow.fadeIn(250); });
            });
            // DELETE RELATED ARTICLE CLICK ------------------------------------------------------------
            $("body").on("click", ".f1r-icon.delete-related-article", function (e) {
                e.preventDefault();
                var itemWrapper = $(this).parents("li");
                R.ui.confirmCallbacks.onYes = function () {
                    itemWrapper.remove();
                    rebuildRelatedArticleRows();
                };
            });
        } // End of bindAssetFormRelatedArticleHandlers
    };
//  -------------------------------------------------------------------------------------------------
//  END OF THE ASSETS FORM CONTROLLER
//  =================================================================================================

//  =================================================================================================
//  THE CONTROLLER FOR THE DOCUMENTS FORM IS BELOW
//  -------------------------------------------------------------------------------------------------
    var documentsFormController = {
        formID: "authorAssetSubmissionForm",
        isDraft: $('#isDraft').val() === 'true',
        formValidators: [
            { "field": "article-title-input", "error": "Please enter a title for your document.", "container": "wysiwyg-title-display" },
            { "field": "asset-description-field", "error": "Please enter the description text.", "container": "wysiwyg-error-display" },
            { "field": "document-keywords-input", "error": "Please enter at least one keyword.", "container": "keywords-error-display" },
            { "field": "document-grant-number", "error": "Please enter a Gates Foundation grant number.", "container": "grant-number-error-display" }
        ],
        authorValidationError: "Please supply last name, first name and all affiliation fields that are not marked (optional)",
        authorValidationErrorWithEmail: "Please supply last name, first name, email address and all affiliation fields that are not marked (optional)",
        collectiveValidationError: "Please enter a name for the collective or just leave blank if not required.",
        authorValidationErrorLastname: "Please enter a last name for this author consisting of alphabetical characters.",
        collectiveValidationErrorWithEmail: "Please enter a name for the collective and an email address.",
        duplicateCollectiveError: "This collective name has already been added to the list. Please try another name.",
        duplicateEmailError: "This email address has already been associated with another author, please associate each author a unique email address ",
        errorType: 'authorValidationError',

        initialize: function () {
            if (debugMode) { debugConsole.append("<br>initializing assetFormController. See 'real' console for data."); }

            this.bindAssetFormHandlers(); // needed as everything breaks without it
            this.bindFormHandlers();
            this.buildPreprintAuthors();
        },

        checkEmailRequired: function(theRow) {
            var theEmail = theRow.find('.the-email-field'),
                corresponding = theRow.find('.author-corresponding, #new-author-corresponding, #new-author-collective-corresponding');

            if(corresponding.is(':checked')) {
                theEmail
                    .addClass('field-mandatory')
                    .attr('placeholder', 'Email');
                return true;
            } else {
                theEmail
                    .removeClass('field-mandatory')
                    .attr('placeholder', 'Email (Optional)');
                return false;
            }
        },

        getAffiliationString: function(theRow) {
            if (debugMode) { debugConsole.append("<br>running getAffiliationString. See 'real' console for data."); console.log(theRow); }
            var affiliationString = "",
                institution = theRow.find("input[name$='.institution']").val(),
                department = theRow.find("input[name$='.department']").val(),
                place = theRow.find("input[name$='.place']").val(),
                state = theRow.find("input[name$='.state']").val(),
                country = theRow.find("[name$='.countryCode'] option").filter(':selected').text();
            affiliationString = institution;
            if (department !== "") { affiliationString += ", " + department; }
            affiliationString += ", " + place;
            if (state !== "") { affiliationString += ", " + state; }
            affiliationString += ", " + country;
            return affiliationString;
        },

        validateAuthorRow: function(theRow, hideErrors) {
            if (debugMode) { debugConsole.append("<br>running validateAuthorRow. See 'real' console for data."); console.log(theRow); }
            var isEmailRequired = this.checkEmailRequired(theRow),
                validationOK = true,
                valueCheck = "",
                fields = theRow.find("input.field-mandatory, select.field-mandatory"),
                theSelect = theRow.find("select"),
                theEmail = theRow.find('.the-email-field'),
                theLastname = theRow.find('.the-surname-field'),
                corresponding = theRow.find('.author-corresponding'),
                beErrors = theRow.find('.js-author-validation-error'),
                that = this;
            if (this.noValidation) { return validationOK; }
            if (theRow.find(".form-check-box").hasClass("checkbox-selected")) {
                $("#new-author-corresponding").val("true");
            } else {
                $("#new-author-corresponding").val("false");
            }

            if(isEmailRequired) {
                that.errorType = 'authorValidationErrorWithEmail';
            } else {
                that.errorType = 'authorValidationError';
            }

            fields.each(function(idx, el) {
                valueCheck = $(el).val().trim();
                if (valueCheck === "" || valueCheck === "-1") {
                    if(!hideErrors) {

                        $(el).addClass("form-field-error");
                    }
                    validationOK = false;
                    //return false;
                } else {
                    $(el).removeClass('form-field-error');
                }
            });

            if(isEmailRequired || theEmail.val().trim() !== '') {
                if(!F1000.ValidateEmail(theEmail.val())) {
                    validationOK = false;
                    if(!hideErrors) {
                        theEmail.addClass("form-field-error");
                    }
                } else if(theEmail.val().trim() !== '') {
                    var foundDuplicate = false;
                    var myEmail = theEmail.val();
                    $('#existing-authors-container #sortable-author-list > li').not(theRow).each(function() {
                        var theEmailCheck = $(this).find(".the-email-field").val() || "";
                        if (theEmailCheck.trim() === myEmail.trim()) {
                            foundDuplicate = true;
                        }
                    });

                    if(foundDuplicate) {
                        // var error = "This email address has already been associated with another author, please associate each author a unique email address ";
                        // errorContainer.html(error).css({ "display": "inline-block" });
                        // setTimeout(function () { errorContainer.hide(500); }, 5000);
                        validationOK = false;
                        if(!hideErrors) {
                            that.errorType = 'duplicateEmailError';
                            theEmail.addClass("form-field-error");
                        }
                    }
                }
            }

            if (theSelect.length > 0 && theSelect.val().trim() === "") {
                theRow.find(".new-select-standard-wrapper").addClass("form-field-error");
                validationOK = false;
            }
            if (!F1000.ValidateNoFullStopFirstCharacter(theLastname.val())) {
                that.errorType = 'authorValidationErrorLastname';
                validationOK = false;
            }
            return validationOK;
        },

        validateCollectiveRow: function(theRow, hideErrors) {
            if (debugMode) { debugConsole.append("<br>running validateCollectiveRow. See 'real' console for data."); console.log(theRow); }
            var isEmailRequired = this.checkEmailRequired(theRow),
                collectiveName = theRow.find(".the-collective-field").last(),
                validationOK = true,
                valueCheck = "",
                fields = theRow.find("input.field-mandatory"),
                theEmail = theRow.find('.the-email-field'),
                that = this;

            if (this.noValidation) {
                return validationOK;
            }

            if (theRow.find(".form-check-box").hasClass("checkbox-selected")) {
                $("#new-author-corresponding").val("true");
            } else {
                $("#new-author-corresponding").val("false");
            }

            if (isEmailRequired) {
                that.errorType = 'collectiveValidationErrorWithEmail';
            } else {
                that.errorType = 'collectiveValidationError';
            }

            fields.each(function(idx, el) {
                valueCheck = $(el).val().trim();
                if (valueCheck === "") {
                    if (!hideErrors) {
                        $(el).addClass("form-field-error");
                    }
                    validationOK = false;
                    //return false;
                } else {
                    $(el).removeClass('form-field-error');
                }
            });

            if (isEmailRequired || theEmail.val().trim() !== '') {
                if(!F1000.ValidateEmail(theEmail.val())) {
                    validationOK = false;
                    if (!hideErrors) {
                        theEmail.addClass("form-field-error");
                    }
                } else if (theEmail.val().trim() !== '') {
                    var foundDuplicate = false;
                    var myEmail = theEmail.val();
                    $('#existing-authors-container #sortable-author-list > li').not(theRow).each(function() {
                        var theEmailCheck = $(this).find(".the-email-field").val() || "";
                        if (theEmailCheck.trim() === myEmail.trim()) {
                            foundDuplicate = true;
                        }
                    });

                    if (foundDuplicate) {
                        // var error = "This email address has already been associated with another author, please associate each author a unique email address ";
                        // errorContainer.html(error).css({ "display": "inline-block" });
                        // setTimeout(function () { errorContainer.hide(500); }, 5000);
                        validationOK = false;
                        if (!hideErrors) {
                            that.errorType = 'duplicateEmailError';
                            theEmail.addClass("form-field-error");
                        }
                    }
                }
            }

            if (collectiveName.val() === "") {
                that.errorType = 'collectiveValidationError';
                validationOK = false;
            }

            $('#existing-authors-container #sortable-author-list > li').not(theRow).each(function() {
                var theName = $(this).find(".the-collective-field");
                if (theName) {
                    if (theName.val() === collectiveName.val()) {
                        that.errorType = 'duplicateCollectiveError';
                        collectiveName.addClass("form-field-error");
                    }
                }
            });

            return validationOK;
        },

        resetNewAuthorRow: function() {
            if (debugMode) { debugConsole.append("<br>running resetNewAuthorRow"); }
            $("#add-new-author-row input").val("");
            $("#new-author-corresponding").val(false).removeAttr("checked");
            $("#new-author-corresponding").closest(".form-check-box").removeClass("checkbox-selected");
            $("#add-new-author-row .c-affiliation-clear").trigger("click");
        },

        getAuthorRowTemplate: function(rowNumber, collective) {
            var theRow = "",
                editRow = "",
                dispRow = "",
                formId = "";
            collective = !!collective;

            if (debugMode) { debugConsole.append("<br>running getAuthorRowTemplate for row " + rowNumber); }
            if (debugMode && collective) { debugConsole.append("<br>Row " + rowNumber + " is a collective"); }

            if(collective) {
                theRow = $("#f1r-form-templates-container #collective-row-template").clone(true);
                editRow = theRow.find("div[id='template-collective-author-row0-edit']");
                dispRow = theRow.find("div[id='template-collective-author-row0-display']");
                theRow.find("li").removeClass("template-collective-author-list-item").addClass("author-list-item");
                theRow.find("div[id='template-collective-author-list-row0']").attr({ "id": "author-list-row" + rowNumber, "data-author-index": rowNumber });
                theRow.find("div[id='template-collective-author-row0-edit']").attr("id", "author-row" + rowNumber + "-edit");
                theRow.find("div[id='template-collective-author-row0-display']").attr("id", "author-row" + rowNumber + "-display");
                editRow.find("input[type='text'], input[type='hidden'], select").each(function(idx, el) {
                   rebuildFormFieldName($(el), rowNumber);
                });
                dispRow.find("input[type='text'], input[type='hidden']").each(function(idx, el) {
                   rebuildFormFieldName($(el), rowNumber);
                });
                theRow.find(".for-edit-row > input:checkbox").attr({ "id": "author-corresponding-" + rowNumber, "author-index": rowNumber });
                theRow.find(".corresponding-author-checkbox.for-edit-row > input:checkbox").attr("name", "authors[" + rowNumber + "].corresponding");
                theRow.find(".corresponding-author-checkbox.for-display-row > input:checkbox").attr("name", "corresponding-author").removeAttr('id');
                this.checkEmailRequired(theRow);
                return theRow;
            } else  {
                theRow = $("#f1r-form-templates-container #author-row-template").clone(true);
                editRow = theRow.find("div[id='template-author-row0-edit']");
                dispRow = theRow.find("div[id='template-author-row0-display']");
                theRow.find("li").removeClass("template-author-list-item").addClass("author-list-item");
                theRow.find("div[id='template-author-list-row0']").attr({ "id": "author-list-row" + rowNumber, "data-author-index": rowNumber });
                theRow.find("div[id='template-author-row0-edit']").attr("id", "author-row" + rowNumber + "-edit");
                theRow.find("div[id='template-author-row0-display']").attr("id", "author-row" + rowNumber + "-display");
                editRow.find("input[type='text'], input[type='hidden'], select").each(function(idx, el) {
                   rebuildFormFieldName($(el), rowNumber);
                });
                editRow.find("input.author-institution").attr("id", "authors" + rowNumber + "-affiliations0-institution");
                dispRow.find("input[type='text'], input[type='hidden']").each(function(idx, el) {
                   rebuildFormFieldName($(el), rowNumber);
                });
                theRow.find(".for-edit-row > input:checkbox").attr({ "id": "author-corresponding-" + rowNumber, "author-index": rowNumber });
                theRow.find(".corresponding-author-checkbox.for-edit-row > input:checkbox").attr("name", "authors[" + rowNumber + "].corresponding");
                theRow.find(".corresponding-author-checkbox.for-display-row > input:checkbox").attr("name", "corresponding-author");
                this.checkEmailRequired(theRow);
                theRow.find("[id^='authorDetailsForm']").each(function() {
                    formId = $(this).attr("id");
                    formId = formId.replace("authorDetailsForm", "authorDetailsForm_" + rowNumber);
                    $(this).attr("id", formId);
                });
                theRow.find("[for^='authorDetailsForm']").each(function() {
                    formId = $(this).attr("for");
                    formId = formId.replace("authorDetailsForm", "authorDetailsForm_" + rowNumber);
                    $(this).attr("for", formId);
                });

                return theRow;
            }
        },

        buildPreprintAuthors: function() {
            if (debugMode) { debugConsole.append("<br>running buildPreprintAuthors"); }
            var authorsWrapper = $("#sortable-author-list"),
                newRow = "",
                formId = "",
                that = this;
            $("#authors-list > div").each(function(idx, el) {
                if($(this).hasClass('is-collective')) {
                    newRow = that.getAuthorRowTemplate(idx, true);
                    newRow.find(".author-id-field").val($(el).find("input[name*='.idauthor']").val());
                    newRow.find(".the-collective-field").val($(el).find("input[name*='.collectiveName']").val());
                    newRow.find(".template-collective-name").val($(el).find("input[name*='.collectiveName']").val());
                    newRow.find(".author-fullname").html($(el).find("input[name*='.collectiveName']").val());
                    // newRow.find("input[name*='.collectiveName']").attr('name', 'authors[' + idx + '].collectiveName');
                } else {
                     // First get the template
                    newRow = that.getAuthorRowTemplate(idx);
                    // Set the values on the existing authors
                    newRow.find(".author-id-field").val($(el).find("input[name*='.idauthor']").val());
                    newRow.find(".affiliation-id-field").val($(el).find("input[name*='affiliations[0].id']").val());
                    newRow.find(".country-name-field").val($(el).find("input[name*='.countryName']").val());
                    newRow.find(".the-surname-field").val($(el).find("input[name*='.lastName']").val());
                    newRow.find(".the-firstname-field").val($(el).find("input[name*='.firstName']").val());
                    newRow.find(".js-affiliation-department").val($(el).find("input[name*='.department']").val());
                    newRow.find(".js-affiliation-institution").val($(el).find("input[name*='.institution']").val());
                    newRow.find(".js-affiliation-institution-id").val($(el).find("input[name*='.ringgoldInstitutionId']").val());
                    newRow.find(".js-affiliation-place").val($(el).find("input[name*='.place']").val());
                    newRow.find(".js-affiliation-state").val($(el).find("input[name*='.state']").val());
                    newRow.find(".js-affiliation-zip-code").val($(el).find("input[name*='.zipCode']").val());
                    newRow.find(".js-affiliation-country").val($(el).find("input[name*='.countryCode']").val());
                    newRow.find(".js-affiliation-institution").siblings(".c-affiliation-clear").addClass('enabled');
                    // Now populate the display fields
                    newRow.find(".author-fullname").html($(el).find("input[name$='.firstName']").val() + " " + $(el).find("input[name$='.lastName']").val());
                    newRow.find(".author-affiliation").html(that.getAffiliationString(newRow));
                }

                newRow.find(".the-email-field").val($(el).find("input[name*='.email']").val());
                if($(el).find("input[name$='.email']").val().trim() !== '') {
                    newRow.find(".author-email").html("(" + $(el).find("input[name$='.email']").val() + ")");
                    newRow.find(".author-email").show();
                } else {
                    newRow.find(".author-email").hide();
                }

                if ($(el).find("input[name*='.corresponding']").val() === "true") {
                    newRow.find(".corresponding-author-checkbox").addClass("checkbox-selected");
                    newRow.find(".corresponding-author-checkbox > input:checkbox").val("true").attr("checked", "checked");
                } else {
                    newRow.find(".corresponding-author-checkbox > input:checkbox").val("false");
                }

                // Get Affiliation form id
                if (newRow.find('.js-affiliations-form').length) {
                    formId = newRow.find('.js-affiliations-form').attr('id');
                }

                // add the row to the list and delete the hidden row
                authorsWrapper.append(newRow.contents());
                
                // Initialize Affiliation Form
                new AffiliationForm({
                    formId: formId
                }).init();

                $(el).remove();

                if (!$(this).hasClass('is-collective')) {
                    $("#author-row" + idx + "-edit").find(".new-select-standard-wrapper").find(".faux-option[data-value='" + $(el).find("input[name*='.countryCode']").val() + "']").click();
                    $("#author-row" + idx + "-edit").find(".new-select-standard-wrapper").find(".selected-option input").trigger("blur");


                    // Set the 'default' author to be in edit mode (try to force the user to enter the place field)
                    var beErrors = $('.js-author-validation-error[data-index=' + idx + ']');
                    if ($(el).attr("data-defaultuser") === "true" || !that.validateAuthorRow($("#author-list-row" + idx).closest('li'), that.isDraft) || beErrors.length > 0) {
                        $("#author-list-row" + idx).find("div[id$='-edit']").find("input[name$='.place']");
                        $("#author-list-row" + idx).find("div[id$='-display']").hide();
                        $("#author-list-row" + idx).find("div[id$='-edit']").show();
                        $("#author-list-row" + idx).find("div[id$='-edit']").append(beErrors);
                    }
                }
            });
        },

        addPreprintAuthor: function(rowNumber, collective) {
            if (debugMode) { debugConsole.append("<br>running addPreprintAuthor on row " + rowNumber); }
            var that = this,
                formId = "",
                authorsWrapper = $("#sortable-author-list"),
                newRow = that.getAuthorRowTemplate(rowNumber, collective),
                collectiveName = $("#new-author-collective-name").val() || false,
                firstName = $("#new-author-first-name").val(),
                lastName = $("#new-author-last-name").val(),
                email = (collectiveName) ? $("#new-author-collective-email").val() : $("#new-author-email").val(),
                isCorresponding = $("#new-author-corresponding").val(),
                department = $("#authorDetailsFormNew").find("[name='department']").val(),
                institution = $("#authorDetailsFormNew").find("[name='institution']").val(),
                ringgoldInstitutionId = $("#authorDetailsFormNew").find(".js-affiliation-institution-id").val(),
                institutionAutocompleteID = "#" + newRow.find("input.author-institution").attr("id"),
                place = $("#authorDetailsFormNew").find("[name='place']").val(),
                state = $("#authorDetailsFormNew").find("[name='state']").val(),
                zipCode = $("#authorDetailsFormNew").find("[name='zipCode']").val(),
                countryId = $("#authorDetailsFormNew").find("[name='countryCode'] option:selected").val(),
                country = $("#authorDetailsFormNew").find("[name='countryCode'] option:selected").text(),
                fullName = (collectiveName) ? collectiveName : firstName + " " + lastName;

            // Populate the new row with the data
            if (collectiveName) {
                newRow.find('.the-collective-field').val(collectiveName)
            } else {
                newRow.find(".country-name-field").val(country);
                newRow.find(".the-surname-field").val(lastName);
                newRow.find(".the-firstname-field").val(firstName);
                newRow.find(".js-affiliation-department").val(department);
                newRow.find(".js-affiliation-institution").val(institution);
                newRow.find(".js-affiliation-institution-id").val(ringgoldInstitutionId);
                newRow.find(".js-affiliation-place").val(place);
                newRow.find(".js-affiliation-state").val(state);
                newRow.find(".js-affiliation-zip-code").val(zipCode);
                newRow.find(".js-affiliation-country").find(":selected").removeAttr("selected");
                newRow.find(".js-affiliation-country").find("option[value='" + countryId + "']").attr("selected", "selected");
                if (institution) {
                    newRow.find(".js-affiliation-institution").next('.c-affiliation-clear').addClass('enabled');
                }
            }

            newRow.find(".the-email-field").val(email);
            if (isCorresponding === "true") {
                newRow.find(".corresponding-author-checkbox").addClass("checkbox-selected");
                newRow.find("input.author-corresponding").attr("checked", "checked").val("true");
            } else {
                newRow.find(".corresponding-author-checkbox").removeClass("checkbox-selected");
                newRow.find("input.author-corresponding").removeAttr("checked").val("false");
            }

            // Populate the display fields
            newRow.find(".author-fullname").html(fullName);

            var authorEmail = newRow.find(".author-email");
            authorEmail.html("(" + email + ")");
            if(!email || email.trim() === '') {
                authorEmail.hide();
            } else {
                authorEmail.show();
            }

            if (!collectiveName) {
                newRow.find(".author-affiliation").html(that.getAffiliationString(newRow));
            }
            formId = 'authorDetailsForm_' + $("#sortable-author-list > li").length;
            newRow.find('.js-affiliations-form').attr('id', formId);

            // Now add the row to the existing authors and reset the 'new' fields
            authorsWrapper.append(newRow.contents());
            if (!collectiveName) {
                new AffiliationForm({
                    formId: formId
                }).init();
            }
            that.resetNewAuthorRow();
        },

        validateForm: function() {
            if (debugMode) { debugConsole.append("<br>running validateForm for Documents"); }
            // validate the form before submission
            var that = this,
                validationOK = true,
                valueCheck = "",
                errorContainer = "",
                i = 0,
                validationCount = that.formValidators.length;
            if (this.noValidation) { return validationOK; }
            // Validate the existing author list
            if ($("#sortable-author-list > li").size() < 1) {
                showErrorMessage($("#existing-authors-error-display"), "You must add at least one author.");
                scrollToElement($("#existing-authors-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            }
            $("#sortable-author-list > li").each(function(idx, el) {
                var i = 0;
                if (!that.validateAuthorRow($(el))) {
                    showErrorMessage($(el).find(".form-error-message-js"), that[that.errorType]);
                    scrollToElement($(el).find(".form-error-message-js"), 400, -200);
                    validationOK = false;
                    return validationOK;
                }
            });
            // At least one author must have the corresponding flag set
            if ($("#sortable-author-list input:checkbox[name$='.corresponding']:checked").size() < 1) {
                showErrorMessage($("#existing-authors-error-display"), "You must flag at least one author as a corresponding author.");
                scrollToElement($("#existing-authors-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            }
            // Now validate the data fields
            if (validationOK) {
                for (i = 0; i < validationCount; i++) {
                    valueCheck = $("#" + that.formValidators[i].field).val().trim();
                    errorContainer = $("#" + that.formValidators[i].container);
                    if (valueCheck === "") {
                        if ($("#cke_" + that.formValidators[i].field).size() > 0) {
                            $("#cke_" + that.formValidators[i].field).find(".cke_inner > .cke_contents").first().addClass("form-field-error");
                            $("#cke_" + that.formValidators[i].field).find(".cke_bottom").addClass("has-error");
                        } else {
                            $("#" + that.formValidators[i].field).addClass("form-field-error");
                        }
                        validationOK = false;
                        showErrorMessage(errorContainer, that.formValidators[i].error);
                        scrollToElement(errorContainer, 400, -200);
                        break;
                    }
                }
                if (validationOK) {
                    if ($("input.mandatory-cb:checked").size() < $("input.mandatory-cb").size()) {
                        validationOK = false;
                        $("input.mandatory-cb:not(:checked)").each(function(idx, el) {
                            $(el).closest(".form-check-box").addClass("checkbox-error");
                            errorContainer = $(el).closest(".form-input-wrapper").find(".form-error-message-js");
                            showErrorMessage(errorContainer, "Please confirm that you accept these terms and declarations.");
                            if (idx === 0) { scrollToElement(errorContainer, 400, -200); }
                        });
                    }
                }
            }
            return validationOK;
        },

        bindAssetFormHandlers: function() {
            if (debugMode) { debugConsole.append("<br>starting bindAssetFormHandlers from Documents"); }

            var that = this;

            //delete all BR's + white spaces from end of textarea
            function cleanDescription(){
                var desc = $("#asset-description-field").val().replace(/(&nbsp;|<br>|<br\s\/>)*$/g, '');
                $("#asset-description-field").val(desc);
            }

            // Check if the channel supports ccbyncsa. If it does, show the checkbox
            $('#in-collection-wrapper').change(function(evt) {
                var ccByNcSa = !!$(this).find('#collection-selector :selected').data('cc-by-nc-sa');

                if(ccByNcSa) {
                    enableCcByNcSa();
                } else {
                    disableCcByNcSa();
                }
            });

            // Set the WYSIWYG editor on the required fields
            $("#asset-description-field").html($("#summary-text").val());
            // if (canUseTextEditor) {
            //     // createSingleRowEditor("article-title-input", "wysiwyg-title-display");
            //     createMultiRowEditor("asset-description-field", "wysiwyg-error-display");
            // }

            // Hide error on competing interests if required
            $(".author-asset-radio-button").on("click", function () {
                var topContainer = $(this).closest(".form-input-wrapper"),
                    errorMessage = topContainer.find(".competing-interests-unselected-error");
                if (errorMessage.is(":visible")) { errorMessage.hide(); }
            });

            // form submission
            $("#form-buttons button").on("click", function(e) {
                var isIE = false;
                if($(this).attr("data-action") === 'cancel'){
                    return;
                }
                e.preventDefault();
                var theForm = $("#" + that.formID),
                    addAuthor = false,
                    action = $(this).attr("data-action"),
                    type = formContainer.attr("data-type"),
                    formAction = "/author/" + type + "/" + action,
                    formReady = false,
                    bgMask = $("#rhelper-background-mask"),
                    theTitle = trimEditorData($("#article-title-input").val()),
                    theDesc = $("#asset-description-field").val(),
                    maskMsg = $("#rhelper-background-message"),
                    tryCounter = 0,
                    maxTries = 5,
                    tryAgain = true;

                if (iecontroller.isIE6 || iecontroller.isIE7 || iecontroller.isIE8 || iecontroller.isIE9 || iecontroller.isIE10 || iecontroller.isIE11) {
                    isIE = true;
                }
                if (!isIE) {
                    cleanDescription();
                }

                if ($('#new-author-first-name').val() !== "" || $('#new-author-last-name').val() !== "" || $('#new-author-email').val() !== "" || $('#authorDetailsFormNew_department').val() !== "" || $('#authorDetailsFormNew_institution').val() !== "" || $("#new-author-corresponding").parent().hasClass("checkbox-selected") === true) {
                    if (that.validateAuthorRow($("#add-new-author-row"))) {
                        that.addPreprintAuthor($("#sortable-author-list > li").size());
                    } else {
                        showErrorMessage($("#add-author-error-displaymsg"), that[that.errorType]);
                        scrollToElement($("#add-author-error-displaymsg"), 400, -200);
                        return false;
                    }
                } else if ($('#new-author-collective-name').val() !== "" || $('#new-author-collective-email').val() !== "" || $("#new-author-collective-corresponding").parent().hasClass("checkbox-selected") === true) {
                    if (that.validateCollectiveRow($("#add-collective-author-row"))) {
                        that.addPreprintAuthor($("#sortable-author-list > li").size(), true);
                    } else {
                        showErrorMessage($("#add-author-error-displaymsg"), that[that.errorType]);
                        scrollToElement($("#add-author-error-displaymsg"), 400, -136);
                        return false;
                    }
                } else if(F1000platform.name === "gates") {
                    var grantNumberEl = document.querySelector('[name="grantNumber"]'),
                        grantNumber = grantNumberEl ? grantNumberEl.value : '';

                    if (grantNumber.trim() !== '') {
                        var grantNumberError = document.querySelector('.js-grants-platform-error');
                        grantNumberError.innerHTML = 'Please validate this Gates Foundation grant number by clicking on the "Add Another Gates Foundation Grant" button';
                        F1000.ShowElement(grantNumberError);
                        grantNumberEl.focus();
                        return false;
                    }
                }

                // if (action === 'draft' || that.validateForm()) {
                    $("body").css({ "cursor": "wait" });
                    maskMsg.html("Saving . . . Please Wait.");
                    bgMask.fadeIn(200);
                    theForm.attr("action", formAction);
                    if (iecontroller.isIE6 || iecontroller.isIE7 || iecontroller.isIE8 || iecontroller.isIE9 || iecontroller.isIE10 || iecontroller.isEdge) {
                        // HORRIBLE WORKAROUND FOR SECURITY ISSUES WITH IE10
                        while (tryAgain) {
                            tryCounter++;
                            document.getElementById("article-title-input").innerHTML = theTitle;
                            document.getElementById("asset-description-field").innerHTML = theDesc;
                            try {
                                document.getElementById(theForm.attr("id")).submit();
                                tryAgain = false;
                            } catch(err) {
                                console.log("ERROR: " + err);
                            } finally {
                                if (tryCounter >= maxTries) {
                                    tryAgain = false;
                                    bgMask.fadeOut(50);
                                    $("body").css({ "cursor": "default" });
                                    messenger.addWarning("I'm sorry but an error has occurred with your submission. Please try again. If the problem persists please contact research@f1000.com.");
                                }
                            }
                        }
                    } else {
                        console.log('submitting...', theTitle);
                        $("#article-title-input").val(theTitle);
                        $('#sortable-author-list .js-affiliations-form input[disabled]').prop("disabled", false);
                        $('#sortable-author-list .js-affiliations-form select[disabled]').prop("disabled", false);
                        theForm.submit();
                    }
                // }
            });
        },

        bindFormHandlers: function() {
            if (debugMode) { debugConsole.append("<br>running bindFormHandlers (Documents)"); }
            var that = this;

            $("#show-collective-author").on("click", function(e) {
                e.preventDefault();
                var fields = [
                    $('#new-author-last-name'),
                    $('#new-author-first-name'),
                    $('#new-author-email'),
                    $('#authorDetailsFormNew_department'),
                    $('#authorDetailsFormNew_institution')
                ];
                var allFieldsEmpty = true;
                fields.forEach(function($input) {
                    if($input.val() !== '') {
                        allFieldsEmpty = false;
                    }
                });

                var showCollective = true;
                if (!allFieldsEmpty) {
                    var row = $("#add-new-author-row"),
                        errorContainer = $("#add-author-error-displaymsg");
                    if (that.validateAuthorRow(row)) {
                        that.addPreprintAuthor($("#sortable-author-list > li").size());
                        $("#add-author").click();
                    } else {
                        showErrorMessage(errorContainer, that.authorValidationError);
                        showCollective = false;
                    }
                }
                if (showCollective) {
                    $("#add-new-author-row").slideUp(200, function() {
                        $("#add-collective-author-row").slideDown(200);
                    });
                    $("#add-author-container").fadeOut(200, function() {
                        $("#add-collective-container").fadeIn(200);
                    });
                }
            });

            $("#show-new-author").on("click", function(e) {
                e.preventDefault();
                var fields = [
                    $('#new-author-collective-name'),
                    $('#new-author-collective-email')
                ];
                var allFieldsEmpty = true;
                fields.forEach(function($input) {
                    if($input.val() !== '') {
                        allFieldsEmpty = false;
                    }
                });

                var showAuthor = true;
                if (!allFieldsEmpty) {
                    var row = $("#add-collective-author-row"),
                        errorContainer = $("#add-author-error-displaymsg");
                    if (that.validateCollectiveRow(row)) {
                        that.addPreprintAuthor($("#sortable-author-list > li").size());
                        $("#add-collective-author").click();
                    } else {
                        showErrorMessage(errorContainer, that.authorValidationError);
                        showAuthor = false;
                    }
                }
                if (showAuthor) {
                    $("#add-collective-author-row").slideUp(200, function() {
                        $("#add-new-author-row").slideDown(200);
                    });
                    $("#add-collective-container").fadeOut(200, function() {
                        $("#add-author-container").fadeIn(200);
                    });
                }
            });

            $("#add-collective-author").on("click", function (e) {
                e.preventDefault();
                var row = $("#add-collective-author-row"),
                    errorContainer = $("#add-author-error-displaymsg");

                if (that.validateCollectiveRow(row)) {
                    that.addPreprintAuthor($("#sortable-author-list > li").size(), true);
                    $("#new-author-collective-name").val("");
                    $("#new-author-collective-email").val("");
                    $("#new-author-collective-corresponding").val(false).removeAttr("checked");
                    $("#new-author-collective-corresponding").closest(".form-check-box").removeClass("checkbox-selected");
                } else {
                    showErrorMessage(errorContainer, that[that.errorType]);
                    return false;
                }
            });

            $("#add-author").on("click", function(e) {
                e.preventDefault();
                var row = $("#add-new-author-row"),
                    errorContainer = $("#add-author-error-displaymsg");
                if (that.validateAuthorRow(row)) {
                    that.addPreprintAuthor($("#sortable-author-list > li").size());
                } else {
                    showErrorMessage(errorContainer, that[that.errorType]);
                    return false;
                }
            });

            // BIND ICONS
            $("body").on("click", ".edit-author", function() {
                var row = $(this).closest("li");
                row.find("div[id$='-display']").slideToggle(200, function () {
                    row.find("div[id$='-edit']").slideToggle(200);
                });
            });
            $("body").on("click", ".cancel-author", function() {
                var theDisplayRow = $(this).closest("li").find("div[id$='-display']"),
                    theEditRow = $(this).closest("li").find("div[id$='-edit']");

                if (theEditRow.find("input[name$='corresponding']:checked") && theEditRow.find("input[name*='email']").val().trim() === "") {
                    theEditRow.find("input[name$='corresponding']").removeAttr("checked");
                    theEditRow.find("input[name$='corresponding']").closest(".form-check-box").removeClass("checkbox-selected");
                    theEditRow.find("input[name*='email']").attr('placeholder', 'Email (Optional)');
                    theDisplayRow.find("input[name='corresponding-author']").removeAttr("checked");
                    theDisplayRow.find("input[name='corresponding-author']").closest(".form-check-box").removeClass("checkbox-selected");
                }

                theEditRow.fadeToggle(200, function () { theDisplayRow.fadeIn(200); });
            });
            $("body").on("click", ".save-author", function() {
                var row = $(this).closest("li"),
                    $indexRow = $(this).parents(".author-display-row").attr("data-author-index"),
                    $theDisplayRow = row.find("div[id$='-display']"),
                    $isCollective = row.find("input[name='collectiveName-edit']"),
                    cName = "",
                    forename = "",
                    surname = "",
                    affiliation = "",
                    affiliationHTML = "",
                    email = "",
                    error = "",
                    errorContainer = row.find(".form-error-message-js");

                $('.js-author-validation-error[data-index="' + $indexRow + '"]').remove();

                var valid = ($isCollective.size() > 0) ? that.validateCollectiveRow(row) : that.validateAuthorRow(row);

                if (valid) {
                    if ($isCollective.size() > 0) {
                        cName = $isCollective.val();
                        row.find("input[name$='.collectiveName']").attr("value", cName);
                        $theDisplayRow.find(".author-fullname").text(cName);
                    } else {
                        row.find(".author-fullname").html(row.find(".the-firstname-field").val() + " " + row.find(".the-surname-field").val());
                        row.find(".author-affiliation").html(that.getAffiliationString(row));
                    }

                    var authorEmail = row.find(".author-email"),
                        cEmail = row.find(".the-email-field").last().val();
                    if (cEmail.trim() !== '') {
                        row.find("input[name$='.email']").attr("value", cEmail);
                        authorEmail.show();
                        authorEmail.html("(" + cEmail + ")");
                        // authorEmail.parent().next().show();
                    } else {
                        authorEmail.hide();

                        // if ($isCollective.size() > 0) {
                        //     authorEmail.parent().next().hide();
                        // }
                    }

                    row.find("div[id$='-edit']").slideToggle(200, function () {
                        row.find("div[id$='-display']").slideToggle(200);
                    });
                } else {
                    showErrorMessage(errorContainer, that[that.errorType]);
                    return false;
                }
            });
            $("body").on("click", ".delete-author-row", function (e) {
                e.preventDefault();
                var authorContainer = $(this).closest("li");
                R.ui.confirmCallbacks.onYes = function() { removeAuthorRow(authorContainer); };
            });

            // Pressing enter in the edit fields will 'save' the author
            $("body").on("keyup", ".author-display-row input:text", function(e) {
                if (e.keyCode === 13) {
                    $(this).closest(".author-display-row").find("span.f1r-icon.save-author").click();
                }
            });
            $("body").on("click", ".remove-other-file", function() {
                var theRow = $(this).closest("li.uploaded-other-row");
                theRow.remove();
                that.rebuildOtherFilesList();
            });

            $("body").on("click", ".corresponding-author-checkbox", function (e) {
                e.preventDefault();
                var authorContainer = $(this).closest(".group-item.author-display-row"),
                    authorEditRow = authorContainer.children("div[id$='-edit']"),
                    editRowCheckboxContainer = authorEditRow.find(".corresponding-author-checkbox"),
                    authorDisplayRow = authorContainer.children("div[id$='-display']"),
                    displayRowCheckboxContainer = authorDisplayRow.find(".corresponding-author-checkbox"),
                    toBeSelected = $(this).hasClass("checkbox-selected");

                if ($(this).hasClass("for-display-row")) {
                    if (toBeSelected) {
                        authorDisplayRow.fadeToggle(250, function () { authorEditRow.fadeIn(250); });
                    }
                    updateAuthorCheckbox(editRowCheckboxContainer, toBeSelected);
                } else {
                    updateAuthorCheckbox(displayRowCheckboxContainer, toBeSelected);
                }
            });
            $("body").on("click", ".corresponding-author-checkbox.for-display-row", function() {
                var row = $(this).closest("li"),
                    editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-edit-row"),
                    editCheckbox = editCheckboxWrapper.find("input:checkbox");
                if ($(this).hasClass("checkbox-selected")) {
                    editCheckboxWrapper.addClass("checkbox-selected");
                    editCheckbox.attr("checked", "checked").val("true");
                } else {
                    editCheckboxWrapper.removeClass("checkbox-selected");
                    editCheckbox.removeAttr("checked").val("false");
                }
                
                that.checkEmailRequired(row);
            });
            $("body").on("click", ".the-new-author-corresponding-checkbox .form-check-box", function() {
                var row = $(this).closest("#add-new-author-row, #add-collective-author-row");
                that.checkEmailRequired(row);
            });
            $("body").on("click", ".corresponding-author-checkbox.for-edit-row", function() {
                var row = $(this).closest("li"),
                    editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-display-row"),
                    editCheckbox = editCheckboxWrapper.find("input:checkbox");
                if ($(this).hasClass("checkbox-selected")) {
                    editCheckboxWrapper.addClass("checkbox-selected");
                    editCheckbox.attr("checked", "checked").val("true");
                } else {
                    editCheckboxWrapper.removeClass("checkbox-selected");
                    editCheckbox.removeAttr("checked").val("false");
                }

                that.checkEmailRequired(row);
            });
            $("body").on("focus", "input[name$='.place'].form-field-required", function() {
                $(this).removeClass("form-field-required");
            }).on("blur", "input[name$='.place']", function() {
                if ($(this).val() === "") { $(this).addClass("form-field-required"); }
            });
            // BUILD THE TEXT EDITORS
            // if (canUseTextEditor) {
            //     createSingleRowEditor("preprint-title-input", "wysiwyg-title-display");
            //     createMultiRowEditor("preprint-description-field", "wysiwyg-error-display");
            //     createMultiRowEditor("author-contributions-field", "wysiwyg-authcont-display");
            // }
            // SET THE DATA AVAILABILITY FIELD TO AUTO RESIZE DEPENDING ON HEIGHT
            $("#data-avail").on("keyup", "textarea", function () {
                $(this).height(0);
                $(this).height(this.scrollHeight);
            });
            $("#data-avail").find("textarea").keyup();
        }
    };
//  -------------------------------------------------------------------------------------------------
//  END OF THE DOCUMENTS FORM CONTROLLER
//  =================================================================================================


//  =================================================================================================
//  THE CONTROLLER FOR THE PREPRINTS FORM IS BELOW
//  -------------------------------------------------------------------------------------------------
    var preprintFormController = {
        formID: "authorPreprintSubmissionForm",
        noValidation: false,
        formValidators: [
            { "field": "preprint-title-input", "error": "Please enter a title for your preprint.", "container": "wysiwyg-title-display" },
            { "field": "preprint-description-field", "error": "Please enter the abstract text.", "container": "wysiwyg-error-display" },
            { "field": "author-contributions-field", "error": "Please complete the author contributions field.", "container": "wysiwyg-authcont-display" },
            { "field": "preprint-keywords", "error": "Please enter at least one keyword.", "container": "keywords-error-display" }
        ],
        authorValidationError: "Please supply last name, first name, email address and all affiliation fields that are not marked (optional)",
        initialize: function (options) {
            if (debugMode) { debugConsole.append("<br>initializing preprintFormController. See 'real' console for options"); console.log(options); }
            this.noValidation = options.noValidation || false;
            if (this.noValidation || debugMode) {
                $("body").prepend("<div id='f1r-debug-options' style='width: 300px; height: 40px; position: fixed; Left: 0; bottom: 0; border: 0; border-top: 1px solid #000; border-right: 1px solid #000; background-color: #dedede; font: normal normal bold 12px/15px sans-serif; padding: 5px; z-index: 10000;' title='JS Page Options.'><span style='font-size: 16px;'>PAGE OPTIONS</span><br />DEBUG ON: " + debugMode + " | NO JS VALIDATION: " + this.noValidation + "</div>");
            }
            this.bindFormHandlers();
            this.bindOtherFileUploadHandlers();
            this.buildPreprintAuthors();
            if (options.stickyButtons === true) { this.addStickyFormButtons(); }
        },
        addStickyFormButtons: function() {
            if (debugMode) { debugConsole.append("<br>running addStickyFormButtons"); }
            var formButtons = $("#form-buttons"),
                stickyHTML = $("<div></div>", { "class": "sticky-button-wrapper", "id": "sticky-buttons-wrapper" }).insertAfter(formButtons),
                stickyButtons = $("#sticky-buttons-wrapper"),
                stickyPoint = parseInt($(document).outerHeight(true) - $(window).outerHeight(true), 10);
            if (stickyButtons.size() > 0) { formButtons.detach().appendTo(stickyButtons); }
            $(window).on("scroll", function(e) {
                var m = $(this).scrollTop() + 81;
                if (m >= stickyPoint) {
                    stickyButtons.addClass("not-active");
                } else {
                    stickyButtons.removeClass("not-active");
                }
            }).on("resize", function (e) {
                stickyPoint = parseInt($(document).outerHeight(true) - $(window).outerHeight(true), 10);
            });
        },
        rebuildOtherFilesList: function() {
            if (debugMode) { debugConsole.append("<br>running rebuildOtherFilesList"); }
            var listWrapper = $("#other-files-list"),
                rows = listWrapper.find("li"),
                rowNumber = 0,
                nextRowNumber = 0;
            if (rows.size() > 0) {
                rows.each(function(idx, el) {
                    rowNumber = parseInt($(el).attr("data-counter"), 10);
                    if (rowNumber !== idx) {
                        $(el).attr({ "id": "supplementary-file-" + idx, "data-counter": idx });
                        $(el).find("input:file, input:text").each(function(fidx, fieldEl) {
                            rebuildFormFieldName($(fieldEl), idx);
                        });
                    }
                });
                // Now reset the NEW supplementary file fields
                nextRowNumber = $("#other-files-list li").size();
                $("#choose-files-container input:file").attr({ "id": "supp-file-" + nextRowNumber, "data-fileposition": nextRowNumber });
            }
        },
        validateForm: function() {
            if (debugMode) { debugConsole.append("<br>running validateForm for Preprints"); }
            // validate the form before submission
            var that = this,
                validationOK = true,
                valueCheck = "",
                errorContainer = "",
                i = 0,
                validationCount = that.formValidators.length;
            if (this.noValidation) { return validationOK; }
            // Validate the existing author list
            if ($("#sortable-author-list > li").size() < 1) {
                showErrorMessage($("#existing-authors-error-display"), "You must add at least one author.");
                scrollToElement($("#existing-authors-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            }
            $("#sortable-author-list > li").each(function(idx, el) {
                if (!that.validateAuthorRow($(el))) {
                    showErrorMessage($(el).find(".form-error-message-js"), that.authorValidationError);
                    scrollToElement($(el).find(".form-error-message-js"), 400, -200);
                    validationOK = false;
                    return validationOK;
                }
            });
            // At least one author must have the corresponding flag set
            if ($("#sortable-author-list input:checkbox[name$='.corresponding']:checked").size() < 1) {
                showErrorMessage($("#existing-authors-error-display"), "You must flag at least one author as a corresponding author.");
                scrollToElement($("#existing-authors-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            }
            // Check the competing interests fields
            if ($("#has-competing-interests input:radio:checked").size() < 1) {
                showErrorMessage($("#competing-interests-error-display"), "Please specify whether you have any competing interests to disclose.");
                scrollToElement($("#competing-interests-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            } else {
                if ($("#competing-interests-yes").is(":checked") && $("#competing_interests_area textarea").val().trim() === "") {
                    $("#competing_interests_area textarea").addClass("form-field-error");
                    showErrorMessage($("#competing-interests-field-error-display"), "Please enter the details of the competing interests.");
                    scrollToElement($("#competing-interests-field-error-display"), 400, -200);
                    validationOK = false;
                    return validationOK;

                }
            }
            // Check the grant/funder support fields
            if ($("#has-grant-support input:radio:checked").size() < 1) {
                showErrorMessage($("#funder-error-display"), "Please specify whether you received any grant or funder support.");
                scrollToElement($("#funder-error-display"), 400, -200);
                validationOK = false;
                return validationOK;
            } else {
                if ($("#funder-yes").is(":checked") && $("#grant_funder_area textarea").val().trim() === "") {
                    $("#grant_funder_area textarea").addClass("form-field-error");
                    showErrorMessage($("#funder-field-error-display"), "Please enter the details of the grant/funder support you received.");
                    scrollToElement($("#funder-field-error-display"), 400, -200);
                    validationOK = false;
                    return validationOK;

                }
            }
            // Now validate the data fields
            if (validationOK) {
                if (document.getElementById("originalFile").files.length < 1) {
                    validationOK = false;
                    showErrorMessage($("#file-upload-type-error"), "You must attach your preprint file in PDF format.");
                    scrollToElement($("#file-upload-type-error"), 400, -100);
                } else {
                    for (i = 0; i < validationCount; i++) {
                        valueCheck = $("#" + that.formValidators[i].field).val().trim();
                        errorContainer = $("#" + that.formValidators[i].container);
                        if (valueCheck === "") {
                            if ($("#cke_" + that.formValidators[i].field).size() > 0) {
                                $("#cke_" + that.formValidators[i].field).find(".cke_inner > .cke_contents").first().addClass("form-field-error");
                                $("#cke_" + that.formValidators[i].field).find(".cke_bottom").addClass("has-error");
                            } else {
                                $("#" + that.formValidators[i].field).addClass("form-field-error");
                            }
                            validationOK = false;
                            showErrorMessage(errorContainer, that.formValidators[i].error);
                            scrollToElement(errorContainer, 400, -200);
                            break;
                        }
                    }
                    if (validationOK) {
                        if ($("input.mandatory-cb:checked").size() < $("input.mandatory-cb").size()) {
                            validationOK = false;
                            $("input.mandatory-cb:not(:checked)").each(function(idx, el) {
                                $(el).closest(".form-check-box").addClass("checkbox-error");
                                errorContainer = $(el).closest(".form-input-wrapper").find(".form-error-message-js");
                                showErrorMessage(errorContainer, "Please confirm that you accept these terms and declarations.");
                                if (idx === 0) { scrollToElement(errorContainer, 400, -200); }
                            });
                        }
                    }
                }
            }
            return validationOK;
        },
        getAffiliationString: function(theRow) {
            if (debugMode) { debugConsole.append("<br>running getAffiliationString. See 'real' console for data."); console.log(theRow); }
            var affiliationString = "",
                institution = theRow.find("input[name$='.institution']").val(),
                department = theRow.find("input[name$='.department']").val(),
                place = theRow.find("input[name$='.place']").val(),
                state = theRow.find("input[name$='.state']").val(),
                country = theRow.find("input[name$='.countryName']").val();
            affiliationString = institution;
            if (department !== "") { affiliationString += ", " + department; }
            affiliationString += ", " + place;
            if (state !== "") { affiliationString += ", " + state; }
            affiliationString += ", " + country;
            return affiliationString;
        },
        validateAuthorRow: function(theRow) {
            if (debugMode) { debugConsole.append("<br>running validateAuthorRow. See 'real' console for data."); console.log(theRow); }
            var validationOK = true,
                valueCheck = "",
                fields = theRow.find("input.field-mandatory"),
                theSelect = theRow.find("select");
            if (this.noValidation) { return validationOK; }
            if (theRow.find(".form-check-box").hasClass("checkbox-selected")) {
                $("#new-author-corresponding").val("true");
            } else {
                $("#new-author-corresponding").val("false");
            }
            fields.each(function(idx, el) {
                valueCheck = $(el).val().trim();
                if (valueCheck === "") {
                    $(el).addClass("form-field-error");
                    validationOK = false;
                    //return false;
                }
            });
            if (theSelect.val().trim() === "") {
                theRow.find(".new-select-standard-wrapper").addClass("form-field-error");
                validationOK = false;
            }
            return validationOK;
        },
        resetNewAuthorRow: function() {
            if (debugMode) { debugConsole.append("<br>running resetNewAuthorRow"); }
            $("#add-new-author-row input").val("");
            $("#add-new-author-row .c-affiliation-clear").trigger("click");
        },
        getAuthorRowTemplate: function(rowNumber) {
            if (debugMode) { debugConsole.append("<br>running getAuthorRowTemplate for row " + rowNumber); }
            var theRow = $("#f1r-form-templates-container #author-row-template").clone(true),
                editRow = theRow.find("div[id='template-author-row0-edit']"),
                dispRow = theRow.find("div[id='template-author-row0-display']");
            theRow.find("li").removeClass("template-author-list-item").addClass("author-list-item");
            theRow.find("div[id='template-author-list-row0']").attr({ "id": "author-list-row" + rowNumber, "data-author-index": rowNumber });
            theRow.find("div[id='template-author-row0-edit']").attr("id", "author-row" + rowNumber + "-edit");
            theRow.find("div[id='template-author-row0-display']").attr("id", "author-row" + rowNumber + "-display");
            editRow.find("input[type='text'], input[type='hidden'], select").each(function(idx, el) {
               rebuildFormFieldName($(el), rowNumber);
            });
            dispRow.find("input[type='text'], input[type='hidden']").each(function(idx, el) {
               rebuildFormFieldName($(el), rowNumber);
            });
            theRow.find(".for-edit-row > input:checkbox").attr({ "id": "author-corresponding-" + rowNumber, "author-index": rowNumber });
            theRow.find(".corresponding-author-checkbox.for-edit-row > input:checkbox").attr("name", "authors[" + rowNumber + "].corresponding");
            theRow.find(".corresponding-author-checkbox.for-display-row > input:checkbox").attr("name", "corresponding-author");
            return theRow;
        },
        buildPreprintAuthors: function() {
            if (debugMode) { debugConsole.append("<br>running buildPreprintAuthors"); }
            var authorsWrapper = $("#sortable-author-list"),
                newRow = "",
                that = this;
            $("#authors-list div").each(function(idx, el) {
                // First get the template
                newRow = that.getAuthorRowTemplate(idx);
                // Set the values on the existing authors
                newRow.find(".author-id-field").val($(el).find("input[name*='.idauthor']").val());
                newRow.find(".affiliation-id-field").val($(el).find("input[name*='affiliations[0].id']").val());
                newRow.find(".country-name-field").val($(el).find("input[name*='.countryName']").val());
                newRow.find(".the-surname-field").val($(el).find("input[name*='.lastName']").val());
                newRow.find(".the-firstname-field").val($(el).find("input[name*='.firstName']").val());
                newRow.find(".the-email-field").val($(el).find("input[name*='.email']").val());
                newRow.find(".the-department-field").val($(el).find("input[name*='.department']").val());
                newRow.find(".the-institution-field").val($(el).find("input[name*='.institution']").val());
                newRow.find(".the-place-field").val($(el).find("input[name*='.place']").val());
                newRow.find(".the-state-field").val($(el).find("input[name*='.state']").val());
                newRow.find(".the-country-id").val($(el).find("input[name*='.countryId']").val());
                if ($(el).find("input[name*='.corresponding']").val() === "true") {
                    newRow.find(".corresponding-author-checkbox").addClass("checkbox-selected");
                    newRow.find(".corresponding-author-checkbox > input:checkbox").val("true").attr("checked", "checked");
                } else {
                    newRow.find(".corresponding-author-checkbox > input:checkbox").val("false");
                }
                // Now populate the display fields
                newRow.find(".author-fullname").html($(el).find("input[name$='.firstName']").val() + " " + $(el).find("input[name$='.lastName']").val());
                newRow.find(".author-email").html("(" + $(el).find("input[name$='.email']").val() + ")");
                newRow.find(".author-affiliation").html(that.getAffiliationString(newRow));
                // Finally add the row to the list and delete the hidden row
                authorsWrapper.append(newRow.contents());
                $("#author-row" + idx + "-edit").find(".new-select-standard-wrapper").find(".faux-option[data-value='" + $(el).find("input[name*='.countryId']").val() + "']").click();
                $("#author-row" + idx + "-edit").find(".new-select-standard-wrapper").find(".selected-option input").trigger("blur");
                // Set the 'default' author to be in edit mode (try to force the user to enter the place field)
                if ($(el).attr("data-defaultuser") === "true") {
                    $("#author-list-row" + idx).find("div[id$='-edit']").find("input[name$='.place']").addClass("form-field-required");
                    $("#author-list-row" + idx).find("div[id$='-display']").hide();
                    $("#author-list-row" + idx).find("div[id$='-edit']").show();
                }
                $(el).remove();
            });
        },
        addPreprintAuthor: function(rowNumber) {
            if (debugMode) { debugConsole.append("<br>running addPreprintAuthor on row " + rowNumber); }
            var that = this,
                authorsWrapper = $("#sortable-author-list"),
                newRow = that.getAuthorRowTemplate(rowNumber),
                firstName = $("#new-author-first-name").val(),
                lastName = $("#new-author-last-name").val(),
                email = $("#new-author-email").val(),
                isCorresponding = $("#new-author-corresponding").val(),
                department = $("#new-author-department").val(),
                institution = $("#new-author-institution").val(),
                place = $("#new-author-place").val(),
                state = $("#new-author-state").val(),
                countryId = $("#new-author-country option:selected").val(),
                country = $("#new-author-country option:selected").text(),
                fullName = firstName + " " + lastName;
            // Populate the new row with the data
            newRow.find(".country-name-field").val(country);
            newRow.find(".the-surname-field").val(lastName);
            newRow.find(".the-firstname-field").val(firstName);
            newRow.find(".the-email-field").val(email);
            newRow.find(".the-department-field").val(department);
            newRow.find(".the-institution-field").val(institution);
            newRow.find(".the-place-field").val(place);
            newRow.find(".the-state-field").val(state);
            newRow.find(".the-country-id").find(":selected").removeAttr("selected");
            newRow.find(".the-country-id").find("option[value='" + countryId + "']").attr("selected", "selected");
            if (isCorresponding === "true") {
                newRow.find(".corresponding-author-checkbox").addClass("checkbox-selected");
                newRow.find("input.author-corresponding").attr("checked", "checked").val("true");
            } else {
                newRow.find(".corresponding-author-checkbox").removeClass("checkbox-selected");
                newRow.find("input.author-corresponding").removeAttr("checked").val("false");
            }
            // Populate the display fields
            newRow.find(".author-fullname").html(fullName);
            newRow.find(".author-email").html("(" + email + ")");
            newRow.find(".author-affiliation").html(that.getAffiliationString(newRow));
            // Now add the row to the existing authors and reset the 'new' fields
            authorsWrapper.append(newRow.contents());
            $("#author-row" + rowNumber + "-edit").find(".new-select-standard-wrapper").find(".faux-option[data-value='" + countryId + "']").click();
            $("#author-row" + rowNumber + "-edit").find(".new-select-standard-wrapper").find(".selected-option input").trigger("blur");
            that.resetNewAuthorRow();
        },
        bindFormHandlers: function() {
            if (debugMode) { debugConsole.append("<br>running bindFormHandlers (Preprints)"); }
            var that = this;
            // BIND ICONS
            $("body").on("click", ".edit-author", function() {
                var row = $(this).closest("li");
                row.find("div[id$='-display']").slideToggle(200, function () {
                    row.find("div[id$='-edit']").slideToggle(200);
                });
            });
            $("body").on("click", ".save-author", function() {
                var row = $(this).closest("li"),
                    errorContainer = row.find(".form-error-message-js");
                if (that.validateAuthorRow(row)) {
                    row.find(".author-fullname").html(row.find(".the-firstname-field").val() + " " + row.find(".the-surname-field").val());
                    if(row.find(".the-email-field").val().trim() !== '') {
                        row.find(".author-email").html("(" + row.find(".the-email-field").val() + ")");
                        row.find(".author-email").show();
                    } else {
                        row.find(".author-email").hide();
                    }
                    row.find(".author-affiliation").html(that.getAffiliationString(row));
                    row.find("div[id$='-edit']").slideToggle(200, function () {
                        row.find("div[id$='-display']").slideToggle(200);
                    });
                } else {
                    showErrorMessage(errorContainer, that.authorValidationError);
                    return false;
                }
            });
            $("body").on("click", ".f1r-icon.delete-author-row", function (e) {
                e.preventDefault();
                var authorContainer = $(this).closest("li");
                R.ui.confirmCallbacks.onYes = function() { removeAuthorRow(authorContainer); };
            });
            // Pressing enter in the edit fields will 'save' the author
            $("body").on("keyup", ".author-display-row input:text", function(e) {
                if (e.keyCode === 13) {
                    $(this).closest(".author-display-row").find("span.f1r-icon.save-author").click();
                }
            });
            $("body").on("click", ".remove-other-file", function() {
                var theRow = $(this).closest("li.uploaded-other-row");
                theRow.remove();
                that.rebuildOtherFilesList();
            });
            $("#submitButton").on("click", function(e) {
                e.preventDefault();
                var theForm = $("#authorPreprintSubmissionForm"),
                    addAuthor = false;
                if ($("#new-author-last-name").val() !== "" || $("#new-author-first-name").val() !== "" || $("#new-author-email").val() !== "" || $("#new-author-institution").val() !== "" || $("#new-author-place").val() !== "" || $("#new-author-country").val() !== "") {
                    if (that.validateAuthorRow($("#add-new-author-row"))) {
                        that.addPreprintAuthor($("#sortable-author-list > li").size());
                    } else {
                        showErrorMessage($("#add-author-error-displaymsg"), that.authorValidationError);
                        return false;
                    }
                }
                if (that.validateForm()) {
                    theForm.attr("action", $(this).closest("a").attr("href"));
                    theForm.submit();
                }
            });
            $("#add-author").on("click", function(e) {
                e.preventDefault();
                var row = $("#add-new-author-row"),
                    errorContainer = $("#add-author-error-displaymsg");
                if (that.validateAuthorRow(row)) {
                    that.addPreprintAuthor($("#sortable-author-list > li").size());
                } else {
                    showErrorMessage(errorContainer, that.authorValidationError);
                    return false;
                }
            });
            $("body").on("click", ".corresponding-author-checkbox.for-display-row", function() {
                var row = $(this).closest("li"),
                    editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-edit-row"),
                    editCheckbox = editCheckboxWrapper.find("input:checkbox");
                if ($(this).hasClass("checkbox-selected")) {
                    editCheckboxWrapper.addClass("checkbox-selected");
                    editCheckbox.attr("checked", "checked").val("true");
                } else {
                    editCheckboxWrapper.removeClass("checkbox-selected");
                    editCheckbox.removeAttr("checked").val("false");
                }
            });
            $("body").on("click", ".corresponding-author-checkbox.for-edit-row", function() {
                var row = $(this).closest("li"),
                    editCheckboxWrapper = row.find(".corresponding-author-checkbox.for-display-row"),
                    editCheckbox = editCheckboxWrapper.find("input:checkbox");
                if ($(this).hasClass("checkbox-selected")) {
                    editCheckboxWrapper.addClass("checkbox-selected");
                    editCheckbox.attr("checked", "checked").val("true");
                } else {
                    editCheckboxWrapper.removeClass("checkbox-selected");
                    editCheckbox.removeAttr("checked").val("false");
                }
            });
            $("body").on("focus", "input[name$='.place'].form-field-required", function() {
                $(this).removeClass("form-field-required");
            }).on("blur", "input[name$='.place']", function() {
                if ($(this).val() === "") { $(this).addClass("form-field-required"); }
            });
            // BUILD THE TEXT EDITORS
            // if (canUseTextEditor) {
            //     createSingleRowEditor("preprint-title-input", "wysiwyg-title-display");
            //     createMultiRowEditor("preprint-description-field", "wysiwyg-error-display");
            //     createMultiRowEditor("author-contributions-field", "wysiwyg-authcont-display");
            // }
            // SET THE DATA AVAILABILITY FIELD TO AUTO RESIZE DEPENDING ON HEIGHT
            $("#data-avail").on("keyup", "textarea", function () {
                $(this).height(0);
                $(this).height(this.scrollHeight);
            });
            $("#data-avail").find("textarea").keyup();
        },
        bindOtherFileUploadHandlers: function() {
            if (debugMode) { debugConsole.append("<br>starting bindOtherFileUploadHandlers"); }
            //  Function object for uploading files
            var fileUploadControl = {
                otherFileSelected: function(filename, counter) {
                    var theHTML = "<li id='supplementary-file-" + counter + "' " +
                                  "class='display-other-file-name uploaded-other-row' data-counter='" + counter + "'>" +
                                  "<div class='is-hidden'></div>" +
                                  "<div class='form-input-wrapper sixty-percent-wide heading10'>" + filename + "</div>" +
                                  "<div class='form-input-wrapper forty-percent-wide file-delete-wrapper'>" +
                                  "<span class='f1r-icon icon-5_delete biggest float-right remove-other-file'></span>" +
                                  "</div>" +
                                  "<div class='form-input-wrapper eighty-percent-wide padding-bottom'>" +
                                  "<input type='text' class='form-input-field full-width' value='' " +
                                  "name='supplementaryFilesInfo[" + counter + "].description' " +
                                  "placeholder='Add a brief description of the file'>" +
                                  "</div>" +
                                  "</li>",
                        theField = $("#supp-file-" + counter),
                        newFileNumber = parseInt(counter, 10) + 1,
                        newFieldHTML = "<input id=\"supp-file-" + newFileNumber + "\" name=\"new-supplementary-file\" class=\"upload-supplementary-file\" type=\"file\" data-fileposition=\"" + newFileNumber + "\" />";
                    $("#other-files-list").append(theHTML);
                    theField.detach().attr("name", "supplementaryFilesInfo[" + counter + "].supplementaryFile").appendTo($("#supplementary-file-" + counter).find(".is-hidden"));
                    $("#choose-files-container .is-hidden").append(newFieldHTML);
                }
            };
            // HANDLE THE OTHER FILE UPLOADS
            $("body").on("click", ".choose-files-button", function(e) {
                e.preventDefault();
                $("#choose-files-container").find("input.upload-supplementary-file").click();
            });
            $("body").on("change", ".upload-supplementary-file", function(e) {
                e.preventDefault();
                var filePosition = $(this).attr("data-fileposition"),
                    fileField = document.getElementById("supp-file-" + filePosition),
                    numberOfFiles = 0;
                if (fileField.files) {
                    numberOfFiles = fileField.files.length;
                    if (numberOfFiles > 0) {
                        fileUploadControl.otherFileSelected(fileField.files[0].name, filePosition);
                    }
                }
            });
        }
    }; // End of preprintFormController
//  -------------------------------------------------------------------------------------------------
//  END OF THE PREPRINTS CONTROLLER
//  =================================================================================================


//  ----------------------------
//  END OF THE PRIVATE FUNCTIONS
//  ============================


//  =============================
//  START OF THE PUBLIC FUNCTIONS
//  -----------------------------
    function init(initOptions) {
        var option = "",
            optionValue = "",
            formType = "";

        initOptions = initOptions || "";
        debugMode = initOptions.debug || false;
        formType = initOptions.formType || "";

        if (debugMode) {
            $("body").prepend("<div id='f1r-debug-console' style='width: 600px; height: 50%; position: fixed; overflow-y: scroll; right: 0; top: 10px; border: 2px solid #ccc; background-color: #dedede; font: normal normal normal 12px/16px sans-serif; padding: 5px; z-index: 10000; box-shadow: 0 0 20px #aaa; border-radius: 5px;' title='Hover over this window to show the console.'><span class='bold' style='font-size: 16px;'>DEBUG WINDOW</span></div>");
            debugConsole = $("#f1r-debug-console");
            debugConsole.append("<br>starting init: See 'real' console for options");
            debugConsole.animate({ "opacity": 0.2, "right": -270 }, 4000, "easeInCubic");
            debugConsole.on("mouseenter", function () {
                debugConsole.stop().animate({ "opacity": 1, "right": 0 }, 500, "easeOutBack");
            }).on("mouseleave", function () {
                debugConsole.stop().animate({ "opacity": 0.2, "right": -270 }, 4000, "easeInCubic");
            });
            console.log(initOptions);
        }

        bindGlobalFormHandlers();
        bindFileUploadHandlers();

        switch (formType) {
            case "document":
                formContainer = $("#" + initOptions.formID) || "";
                if (formContainer.size() < 1) {
                    formMessenger.showError(formErrorContainer, "The requested form ID could not be found.");
                    return false;
                }
                documentsFormController.formID = initOptions.formID;
                documentsFormController.initialize();

                break;
            case "asset":
                formContainer = $("#" + initOptions.formID) || "";
                if (formContainer.size() < 1) {
                    formMessenger.showError(formErrorContainer, "The requested form ID could not be found.");
                    return false;
                }
                formAuthorsSection = $("#" + initOptions.authorSectionID).size() > 0 ? $("#" + initOptions.authorSectionID) : "";
                // Initialize the asset form handlers
                bindAssetFormHandlers();
                if (formAuthorsSection.size() > 0) { bindAssetFormAuthorHandlers(); }
                assetFormController.initialize();
                break;

            case "preprint":
                preprintFormController.initialize(initOptions);
                break;

            default:
                formMessenger.showError(formErrorContainer, "Unknown form type.");
                return false;
        }
    }
//  ---------------------------
//  END OF THE PUBLIC FUNCTIONS
//  ===========================


//  ==========================================================
//  REVEAL PUBLIC POINTERS TO PRIVATE FUNCTIONS AND PROPERTIES
//  ----------------------------------------------------------
    return {
        init: init
    };

}());
// --------------------------------------------------------------------------------
// END OF THE NEW OBJECT CODE FOR F1000RESEARCH FORMS
// ================================================================================