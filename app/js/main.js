$(function(){
    var selected_element,
        font_family_selector = $('#font-family-selector'),
        font_size_selector = $('#font-size-selector'),
        text_align_selector = $('#text-align-selector'),
        font_element_creator = $('#font-element-creator'),
        font_elements = $('#editor #elements'),
        font_elements_template = $('.template', font_elements).html(),
        WebFontConfig = {
            loading: function() {
                console.debug('WebFont - loading');
            },
            active: function() {
                console.debug('WebFont - active');
            },
            inactive: function() {
                console.debug('WebFont - inactive');
            },
            fontloading: function(familyName, fvd) {
                console.debug('WebFont - fontloading', familyName);
            },
            fontactive: function(familyName, fvd) {
                console.debug('WebFont - fontactive', familyName);
                $('.text-node', selected_element).css({
                    fontFamily: familyName
                });
            },
            fontinactive: function(familyName, fvd) {
                console.debug('WebFont - fontinactive', familyName);
            }
        },
        loadFont = function(familyName){
            WebFont.load($.extend({}, WebFontConfig, {
                google: {
                    families: [ familyName ]
                }
            }));
        },
        selectFont = function(familyName){
            if (familyName.length) {
                selected_element.fontThru.family = familyName;
                loadFont(familyName);
            }
        },
        selectSize = function(fontSize){
            selected_element.fontThru.fontSize = fontSize;
            $('.text-node', selected_element).css({
                fontSize: fontSize
            });
        },
        selectAlign = function(textAlign){
            selected_element.fontThru.textAlign = textAlign;
            $('.text-node-wrapper', selected_element).css({
                textAlign: textAlign
            });
        },
        selectElement = function(e, element){
            selected_element = element;
            if (!element.hasOwnProperty('fontThru')) {
                element.fontThru = {};
            }
            if (!element.fontThru.selected) {
                element.fontThru.selected = true;

                $(element)
                    .addClass('selected')
                    .siblings('.font-element')
                    .removeClass('selected editing')
                    .each(function(){
                        if (!this.hasOwnProperty('fontThru')) {
                            this.fontThru = {};
                        }
                        this.fontThru.selected = false;
                        this.fontThru.editing = false;
                    })
                    .find('.text-node')
                    .attr('contenteditable', false);
            }
            else {
                if (e.target !== $('.text-node', element)[0]) {
                    $('.text-node', element).blur();
                }
            }
        },
        deselectElement = function(){
            selected_element.fontThru.selected = false;
            selected_element.fontThru.editing = false;
            $(selected_element)
                .removeClass('selected editing')
                .find('.text-node')
                .attr('contenteditable', false);

            selected_element = null;
        },
        editElement = function(element){
            if (!element.hasOwnProperty('fontThru')) {
                element.fontThru = {};
            }
            if (!element.fontThru.editing) {
                element.fontThru.editing = true;
            }
            $(element)
                .addClass('editing')
                .find('.text-node')
                .attr('contenteditable', 'true')
                .appendTo($('.text-node-wrapper', element))
                .trigger('focus');
        },
        createElement = function(){
            font_elements.append(font_elements_template);
        };
    
    $.ajax({
        url: '../json/font-thru.json',
        dataType: 'json',
        success: function(response){
            $.each(response.items, function(k, font){
                font_family_selector.append('<option value="'+font.name+'">'+font.name+' ('+font.category+')</option>');
            });
        }
    });

    font_family_selector.on({
        change: function(){
            selectFont(this.value);
        }
    });

    font_size_selector.on({
        change: function(){
            selectSize(this.value);
        }
    });

    text_align_selector.on({
        change: function(){
            selectAlign(this.value);
        }
    });

    font_element_creator.on({
        click: function(){
            createElement();
        }
    });

    font_elements
        .on({
            click: function(e){
                var element = $(e.target);

                if (!element.hasClass('font-element') && !element.closest('.font-element').length) {
                    deselectElement();
                }
            }
        })
        .on({
            click: function(e){
                selectElement(e, this);
                font_family_selector.val(selected_element.fontThru && selected_element.fontThru.family ? selected_element.fontThru.family : 'none');
                font_size_selector.val(selected_element.fontThru && selected_element.fontThru.fontSize ? selected_element.fontThru.fontSize : '12pt');
                text_align_selector.val(selected_element.fontThru && selected_element.fontThru.textAlign ? selected_element.fontThru.textAlign : 'left');
            }
        }, '.font-element')
        .on({
            click: function(){
                editElement($(this).closest('.font-element')[0]);
            }
        }, '.font-element.selected:not(.editing) .text-node')
        .on({
            keyup: function(){
                if ($(this).children().filter(':not(br)').length) {
                    $(this).html($(this).text());
                    $(this).appendTo($(this).parent()).focus();
                }
            }
        }, '.font-element.editing .text-node');
});
