function set_inputs() {
    // DATE
    $("input[id*='_date'], input[id*='date_']").each(function(){
        if (this.type == 'None') {
            this.type = 'date';
        }
    });
    // TIME
    $("input[id*='time_']").each(function(){
        if (this.type == 'None') {
            this.type = 'time';
        }
    });
    // SET COLOUR INPUTS
    $("input[id*='colour']").each(function(){
        this.type = 'color';
    });
    // SET DECIMAL TO NUMBER + STEP = .01
    $("input[type='decimal']").each(function(){
        this.type = 'number';
        this.step = .01
    });
    // SET TEXT AREAS
    $("input[type='longtext']").each(function(){
        this.type = 'text';
        this.classList = 'longtext';
    });
    // SET BOOLEAN
    $("input[type='boolean']").each(function(){
        this.type = 'checkbox';
    });
};
function slugify(str) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -_]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}
function parameterise(str) {
  // Transforms the given string into a parameter as would be found as a field in the Django backend.
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -_]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '_') // replace spaces with underscores
    .replace(/-+/g, '_'); // remove consecutive underscores
}
function datetimeLocal(dt) {
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
};
function delete_handler(e, url, back=false, reload=false, remove=false) {
    e.preventDefault();
    var confirm_result = confirm("Are you sure you want to delete?");
    if (confirm_result == true) {
        $.ajax({
            url: url,
            async: false,
            type: "DELETE",
            success: function(data) {
                show_toast("Successfully deleted")
                if (back) {
                    setTimeout(() => {
                        window.location.href = document.referrer
                    }, 2000);
                } else if (reload) {
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else if (remove) {
                    element = document.getElementById(remove)
                    element.remove()
                } else if (data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 2000);
                } else {}
            },
            error: function(response) {
                $('#errorlist')[0].innerHTML = response.responseText
                $('#errors')[0].classList -= 'hidden'
                if (response.message) {
                    show_toast(response.message)
                } else {
                    show_toast("Error")
                }
            }
        });
    } else {}
};
function refresh_cache(key) {
    $.ajax({
        url: "/api/refresh_cache/" + key,
        async: false,
        type: "DELETE",
        success: function(data) {
            show_toast("Successfully refreshed")
            setTimeout(() => {
                location.reload();
            }, 2000);
        },
        error: function(response) {
            if (response.message) {
                show_toast(response.message)
            } else {
                show_toast("Error")
            }
        }
    })
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
function link_start_end_times() {
    $('#id_start').change(function(){
        start_time = new Date($(this).val())
        end_time = new Date()
        end_time.setTime(start_time.getTime() + 30 * 60 * 1000);
        document.getElementById('id_end').value = datetimeLocal(end_time)
    });
};
function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}
// RICH TEXT //
//function initialise_rich_text() {
//    $("textarea[id^='id_']").each(function(){ // replaces all textareas
//        CKEDITOR.replace( this );
//    });
//};
//function rich_text_handler(e) {
//    for (instance in CKEDITOR.instances) {
//        CKEDITOR.instances[instance].updateElement();
//    }
//};
// POP UPS //
function open_pop_up(url, search='') {
    var url, data, search;
    var data = {
        'pop_up':'true'
    }
    search = new URLSearchParams(search)
    for (let [key, value] of search.entries()) {
      data[key] = value;
    }
    $.ajax({
        url: url,
        type: "GET",
        async: false,
        data: data,
        success: function (response) {
            $('#modal-container')[0].style.display = "block"
            $("#modal-content")[0].innerHTML = response;
            // DATE AND TIME INPUTS //
            set_inputs()
//            initialise_rich_text()
            initialise_select2()
            link_start_end_times()
            // Append media CSS to the head
            $('#media-container link').each(function() {
                $(this).appendTo('head')
            })
            // Manually execute media scripts
            $('#media-container script').each(function() {
                $.getScript($(this).attr('src'))
            });
        },
        error: function(data){console.log("ERROR", data)},
    });
};
function close_pop_up() {
    $("#modal-content")[0].innerHTML = "";
    $('#modal-container')[0].style.display = "none";
};
// TOAST //
function show_toast(message) {
    var toast = $("#toast")[0]
    toast.innerText = message
    toast.classList.add("show");
    setTimeout(function(){ toast.classList.remove("show"); }, 3000);
}
function show_toast_and_reload(message) {
    show_toast(message)
    setTimeout(() => {
        location.reload();
    }, 2000);
}
// DIALOG //
const confirmUI = {
    confirm: async (message) => createConfirm(message)
}
const createConfirm = (message) => {
  return new Promise((complete, failed)=>{
    html = `
      <div>
        <div class="dialog-message">
            <span class="icon circled large fas fa-exclamation"></span>
            <p>${message}</p>
        </div>
        <hr>
        <div>
          <input id="confirmYes" type="button" value="Yes" />
          <input id="confirmNo" type="button" value="No" />
        </div>
      </div>
    `
    showDialog(html)
    $('#confirmYes').on('click', ()=> { close_pop_up(); complete(true); });
    $('#confirmNo').on('click', ()=> { close_pop_up(); complete(false); });
  });
}
function showDialog(content) {
    $("#modal-content")[0].innerHTML = content;
    $('#modal-container')[0].style.display = "block"
};
// DROPDOWN MENUS //
function open_dropdown(id) {
    try {
        $("#" + id).toggleClass('open')
        close_dropdown_handler()
    } catch(err) {
        show_toast('Could not load dropdown menu')
    }
};
// API CALLS //
function api_get(url, parameters) {
    return $.ajax({
        url: url,
        type: "GET",
        data: parameters,
        async: false,
        success: function(response){
            return response
        },
    });
}
function api_post(url, data) {
    return $.ajax({
        url: url,
        type: "POST",
        async: false,
        data: data,
        success: function(response){
            return response
        },
        error: function(response){
            return response
        }
    });
}
function api_patch(url, data) {
    return $.ajax({
        url: url,
        type: "PATCH",
        async: false,
        data: data,
        success: function(response){
            return response
        },
        error: function(response){
            return response
        }
    });
}
function api_delete(url, data) {
    return $.ajax({
        url: url,
        type: "DELETE",
        async: false,
        data: data,
        success: function (response) {
            return response
        },
        error: function (response) {
            return response
        },
    });
}
function dropdown_api_patch(event, url) {
    data = {};
    data[event.target.id] = event.target.value
    api_patch(url, data)
    show_toast_and_reload(event.target.name+" successfully changed")
};
// FORMS //
function serialize_form(data, remove_empty) {
    let obj = {};
    for (let [key, value] of data) {
        if (remove_empty === true & value.length === 0) {
            //pass
        } else {
            if (obj[key] !== undefined) {
                if (!Array.isArray(obj[key])) {
                    obj[key] = [obj[key]];
                }
                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        }
    }
    // Turn arrays into string.
    for (key in obj){
        if (
            typeof obj[key] === 'object' &&
            Array.isArray(obj[key]) &&
            obj[key] !== null
        ) {
            obj[key] = JSON.stringify(obj[key])
        }
    }
    return obj
}
async function submit_form(event, url=null, confirm=false) {
    event.preventDefault();
    var url = url || document.URL
    function submit() {
        const form = new FormData(event.target)
        // Handle Select2 fields explicitly to accommodate empty values.
        $(event.target).find('select[class*="select2"]').each(function() {
          var field = this.name;
          var value = $(`#${this.id}`).val() || ""; // Jquery selector accommodates array values from select2
          form.set(field, value);
        });
        // Handle checkbox inputs.
        $(`#${event.target.id}`+' input[type=checkbox]').each(function(){
            name = slugify(this.name)
            form.set(name, this.checked)
        });
        $.ajax({
            url: url,
            type:"POST",
            data: form,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.message) {
                    show_toast(response.message)
                } else {
                    show_toast('Success')
                }
                switch (event.target.id) {
                    case 'object_form':
                        return setTimeout(() => {
                            window.location = document.referrer;
                        }, 2000);
                    case 'modal_object_form':
                        return setTimeout(() => {
                            location.reload();
                        }, 2000);
                    default:
                        return setTimeout(() => {
                            location.reload();
                        }, 2000);
                }
            },
            error: function(response) {
                console.log(response)
                if (response.responseJSON) {
                    show_toast(response.responseJSON.message)
                    $('#errors')[0].innerHTML = response.responseJSON.errors
                    $('#errors-container')[0].classList -= 'hidden'
                } else if (response.responseText) {
                    show_toast("Something went wrong")
                    $('#errors')[0].innerHTML = JSON.parse(response.responseText).errors
                    $('#errors-container')[0].classList -= 'hidden'
                } else {
                    show_toast("Error")
                }
            }
        });
    }
    if (confirm) {
      const confirmed = await confirmUI.confirm(confirm);
      if (confirmed) {
        submit();
      } else {
        return
      }
    } else {
      submit();
    }
};
$("#filter_form").submit(function(event){
    event.preventDefault();
    var form = new FormData(event.target)
    // Handle ckeditor instances.
    rich_text_handler()
    // Handle Select2 fields explicitly to accommodate empty values.
    $(event.target).find('select[class*="select2"]').each(function() {
      var field = this.name;
      var value = $(`#${this.id}`).val() || ""; // Jquery selector accommodates array values from select2
      form.set(field, value);
    });
    // Handle checkbox inputs.
    $(`#${event.target.id}`+' input[type=checkbox]').each(function(){
        name = slugify(this.name)
        form.set(name, this.checked)
    });
    var data = serialize_form(form, true)
    var endpoint = event.target.dataset.endpoint

    url = new URL(window.location.origin + event.target.dataset.endpoint)
    url.search = new URLSearchParams(data).toString();
    window.location.href = url
})
function construct_url_from_filters(base_url=null) {
    // Constructs form data from all the available inputs on the form, or on the page if form not provided.
    var url;
    const querydict = {};
    const input_types = new Array('input.filter', 'select.filter', 'select[class*="select2"]');
    for (let input_type of input_types) {
        $(input_type).each(function() {
          var field = this.name;
          var value = $(`#${this.id}`).val(); // Jquery selector accommodates array values from select2
          // If the value is defined and not in the value array already
          if(typeof value !== "undefined" && value.length) {
            querydict[field] = value;
          }
        });
    }
    // Redirect to page
    if (base_url){
        url = new URL(base_url);
    } else {
        url = new URL(document.URL);
    }
    url.search = new URLSearchParams(querydict).toString();
    return url
};
// FILE HANDLING //
function uploadFiles(endpoint, form_id, files) {
  let url = new URL(window.location.origin + endpoint)
  let form = new FormData($('#'+form_id)[0])
  for (i in files) {
    form.append(files[i].name, files[i])
  }
  $.ajax({
    url: url,
    async: false,
    method: 'POST',
    data: form,
    success: function(data) {
        show_toast('File uploaded')
    },
    error: function(response) {
        var message = response.responseText.error;
        show_toast(message)
    },
    processData: false,
    contentType: false,
  });
};
// DRAG AND DROP //
if (typeof def_drag_and_drop !== 'undefined') {
    // Get drop-area
    const dropArea = document.getElementById('drop-area');
    endpoint = dropArea.dataset.endpoint;
    form_id = $(dropArea).find('form')[0].id
    // Prevent defaults
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    })

    // Highlight elements during drag interaction
    function highlight(e) {
      dropArea.classList.add('highlight')
    }
    function unhighlight(e) {
      dropArea.classList.remove('highlight')
    }

    ;['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false)
    })
    ;['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false)
    })

    let draggedItem = null;

    // Add event listeners for drag and drop events
    dropArea.addEventListener('dragstart', handleDragStart);
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('drop', handleDrop);

    // Drag start event handler
    function handleDragStart(event) {
      draggedItem = event.target;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', draggedItem.innerHTML);
      event.target.style.opacity = '0.5';
    }

    // Drag over event handler
    function handleDragOver(event) {
      event.dataTransfer.dropEffect = 'move';
      const targetItem = event.target;
      if (targetItem !== draggedItem && targetItem.classList.contains('drag-item')) {
        const boundingRect = targetItem.getBoundingClientRect();
        const offset = boundingRect.y + (boundingRect.height / 2);
        if (event.clientY - offset > 0) {
          targetItem.style.borderBottom = 'solid 2px #000';
          targetItem.style.borderTop = '';
        } else {
          targetItem.style.borderTop = 'solid 2px #000';
          targetItem.style.borderBottom = '';
        }
      }
    }

    // Drop event handler
    function previewFile(file) {
      let i = document.createElement('i')
      i.classList.add(get_filetype(file))
      document.getElementById('document_gallery').appendChild(i)
    }

    function handleFiles(files) {
      files = [...files]
      uploadFiles(endpoint, form_id, files)
      files.forEach(previewFile)
    }

    function handleDrop(event) {
      let dt = event.dataTransfer
      let files = dt.files
      handleFiles(files)
    }
}
// SELECT2 //
function initialise_select2(){
    $('select[class="select2"]').each(function(){
        var model = this.dataset.model || null
        var endpoint = this.dataset.endpoint;
        var search_field = this.dataset.search_field || "slug"
        var primary_key_field = this.dataset.primary_key_field;
        var minimum_input_length = typeof(this.dataset.minimum_input_length) != 'undefined' ? parseInt(this.dataset.minimum_input_length) : 5;
        var multiple = typeof(this.dataset.multiple) != 'undefined' ? 'multiple' : false;
        var display_field = typeof(this.dataset.display_field) != 'undefined' ? this.dataset.display_field : search_field.split("__")[0];
        var placeholder = this.dataset.placeholder || "Search";
        $(this).select2({
          ajax: {
            url: "/api/" + endpoint,
            dataType: 'json',
            delay: 450,
            data: function (params) {
              data = {page: params.page}
              data[search_field] = params.term
              return data
            },
            processResults: function (data, params) {
              if (typeof data.results !== 'undefined') {
                params.page = params.page || 1;
                return {
                  pagination: {more: data.count > (params.page * 50)},
                  results: $.map(JSON.parse(data.results), function(obj) {
                    obj.id = '' + obj[primary_key_field];
                    if (typeof(model) != 'undefined' && obj[model] != null) {
                        obj.text = `Already matched: ${obj[display_field]}`;
                        obj.disabled = true;
                    } else {
                        obj.text = obj[display_field];
                    }
                    return obj;
                  })
                };
              } else {
                return {
                  pagination: {more: false},
                  results: [{'id':null , 'text': 'No results found'}]
                };
              };
            },
            cache: true
          },
          allowClear: true,
          multiple: multiple,
          placeholder: placeholder,
          minimumInputLength: minimum_input_length,
          templateResult: function (result, container) {
            if (typeof(model) != 'undefined' && result[model] != null) {
                $(container).css({"background-color":'#F19D16', 'color':'white'});
            }
            try {
              return result.text || result
            } catch {
              show_toast('Cannot find the display field "' + display_field + '" in results.')
            };
          },
          templateSelection: function (result) {
            try {
              return result.text || result
            } catch {};
          },
          language: {
            "noResults": function() {
              return "No Results";
            }
          },
          escapeMarkup: function (markup) {
            return markup;
          }
        });
    });
    $('select[class="select2-singular"]').each(function(){
        var model = this.dataset.model;
        var endpoint = this.dataset.endpoint;
        var search_field = this.dataset.search_field || "slug"
        var primary_key_field = this.dataset.primary_key_field;
        var minimum_input_length = typeof(this.dataset.minimum_input_length) != 'undefined' ? parseInt(this.dataset.minimum_input_length) : 5;
        var multiple = typeof(this.dataset.multiple) != 'undefined' ? 'multiple' : false;
        var display_field = typeof(this.dataset.display_field) != 'undefined' ? this.dataset.display_field : search_field.split("__")[0];
        var placeholder = this.dataset.placeholder || "Search";
        $(this).select2({
          ajax: {
            url: "/api/" + endpoint,
            dataType: 'json',
            delay: 350,
            data: function (params) {
              data = {}
              data[search_field] = params.term
              return data
            },
            processResults: function (data, params) {
              if (typeof data !== 'undefined') {
                var obj = JSON.parse(data.results)
                if (typeof(model) != 'undefined' && obj[model] != null) {
                    obj.text = `Already matched: ${obj[display_field]}`;
                    obj.disabled = true;
                } else {
                    obj.text = obj[display_field];
                }
                obj.id = '' + obj[primary_key_field];
                return {
                  pagination: {more: false},
                  results: [obj]
                };
              } else {
                return {
                  pagination: {more: false},
                  results: [{'id':null , 'text': 'No results found'}]
                };
              };
            },
            cache: true
          },
          allowClear: true,
          multiple: false,
          placeholder: placeholder,
          minimumInputLength: minimum_input_length,
          templateResult: function (result, container) {
            if (typeof(model) != 'undefined' && result[model] != null) {
                $(container).css({"background-color":'#F19D16', 'color':'white'});
            }
            try {
              return result.text || result
            } catch {
              show_toast('Cannot find the display field "' + display_field + '" in results.')
            };
          },
          templateSelection: function (result) {
            try {
              return result.text || result
            } catch {};
          },
          language: {
            "noResults": function() {
              return "No Results";
            }
          },
          escapeMarkup: function (markup) {
            return markup;
          }
        });
    });
    $('select[class="select2-nosearch"]').each(function(){
        var multiple = typeof(this.dataset.multiple) != 'undefined' ? true : false;
        var tags = typeof(this.dataset.tags) != 'undefined' ? this.dataset.tags : false;
        var placeholder = this.dataset.placeholder || "Search";
        $(this).select2({
          allowClear: true,
          multiple: multiple,
          tags: tags,
          placeholder: placeholder,
          tokenSeparators: [',', ' '], // Not relevant if tags not enabled
        });
    });
};
// VIEW SPECIFIC //
if (typeof def_model_dashboard !== 'undefined') {
    function select_all() {
        $(':checkbox').prop('checked', true)
    }
    function select_none() {
        $(':checkbox').prop('checked', false)
    }
    function dashboard_selection_list() {
        return $('tbody#table_body td > input[type=checkbox]:checked').map(function(){
            return this.value
        }).get().join(",")
    }
    function bulk_action(event, url) {
        event.preventDefault();
        var form = new FormData(event.target)
        var data = new URLSearchParams(form)
        var objects = dashboard_selection_list()
        data.append('objects', objects)
        data = data.toString();
        $.ajax({
            url: url,
            type:"POST",
            data: data,
            success: function (response) {
                show_toast(response.message)
                close_pop_up()
            },
            error: function (response) {
                show_toast(response.message)
            },
        });
    };
    function load_more() {
        url = new URL(window.location)
        if (!url.searchParams.has('load_more')) {
            // should not already be in search parameters but just in case.
            url.searchParams.append('load_more', true)
        }
        page += 1
        url.searchParams.set("page", page)
        $.ajax({
            url: url,
            type:"GET",
            async: false,
            success: function (data) {
                var message = data.message
                show_toast(message)
                if (data.table_body) {
                    $("#table_body")[0].innerHTML += data.table_body
                }
            },
            error: function (data) {
                var message = JSON.parse(data.responseText).message
                show_toast(message)
            }
        });
    }
    function sort_table(value) {
        // Redirect to page
        url = new URL(document.URL);
        url.searchParams.set('order_by', value)
        window.location.href = url
    };
    // QUICK FILTERS //
    $(".object_filter").on('submit', function(event) {
        // Used on the model dashboard filters, where there may be several on the page at once.
        // Constructs the querydict on the front-end from elements that
        // are symmetrical to those constructed by the object filtersets
        event.preventDefault();
        const endpoint = typeof(this.dataset.endpoint) != 'undefined' ? this.dataset.endpoint : null;
        var url = new URL(window.location.origin + event.target.dataset.endpoint)
        var formData = new FormData(document.getElementById(this.id));
        for(let field of formData) {
            if(typeof field[1] !== "undefined" && field[1].length) {
              url.searchParams.set(field[0], field[1])
            }
        }
        window.location.href = url
    });
    // FILTERS //
    function load_filter(e) {
        var data = $("#load_filter_form").serialize()
        $.ajax({
            url: "/api/filters/load",
            type:"GET",
            dataType:'json',
            data: data,
            async: false,
            success: function (data) {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                }
            },
            error: function (data) {
                show_toast(data)
            }
        });
    };
    function save_filter(e) {
      e.preventDefault();
      var data = $("#modal_object_form").serialize()
      $.ajax({
        url:"/api/filters/save/",
        type:"POST",
        data:data,
        success: function (data) {
          $("#filter_modal_form").replaceWith(data.body)
        },
        error: function (data) {
          show_toast("Could not save filter due to an error.")
        }
      });
    };
    function save_filter(model) {
        var url = new URL(document.URL);
        query = url.pathname + url.search
        open_pop_up('/api/filters/save', {"type": "query", "model": model, "query":query})
    };
    function create_filter_from_selection(model) {
        var list = dashboard_selection_list()
        open_pop_up('/api/filters/save', {"type": "list", "model": model, "pk__in":list})
    };
    function model_dashboard_download() {
        current_url = new URL(window.location)
        if (!current_url.searchParams.has('download')) {
            current_url.searchParams.append('download', true)
        }
        downloadFiles(current_url)
    };
}
if (typeof def_object_view !== 'undefined') {
    // INFO TABS //
    function open_tab(e, content_id) {
        tab_class = e.target.classList[0]
        // Remove active status from all tabs
        $(`button.${tab_class}`).removeClass('active');
        // Hide all tab contents
        $(`div.${tab_class}_content`).addClass('hidden');
        // Show the selected tab as active
        e.currentTarget.classList.add('active')
        // Show the selected tab content
        $('#'+content_id).removeClass('hidden')
    };
}
if (typeof def_tags !== 'undefined') {
    function load_tag_info(slug) {
        const response = api_get(`/api/taggeditems/${slug}/`, {
            'tag_info':true,
        })
        var info_submodule = $('#info_submodule')[0]
        if (response.responseJSON) {
            tag_info = response.responseJSON.results
            info_submodule.innerHTML = tag_info
            info_submodule.classList.remove('hidden')
        } else {
            show_toast('Something went wrong.')
            if (!info_submodule.classList.contains("hidden")) {
                // Hides description if is unhidden
                info_submodule.classList.add('hidden')
            }
        }
    };
    function remove_tag(taggeditem_id) {
        const api_response = api_delete(`/api/taggeditems/${taggeditem_id}/`)
        switch (api_response.status) {
            case 200:
                return show_toast_and_reload("Tag Removed")
            default:
                return show_toast("Something went wrong")
        }
    }
if (typeof def_calendar !== 'undefined') {
}
    $('#id_event_category_filter').val(null);
    $('#id_attendee_filter').val(null);
    function eventPatch(info){
        rich_text_handler()
        $.ajax({
          url: "/api/calendar/events/" + info.event.id + "/", // Event 'id' is actually the event.slug, but fullCalendar uses id
          type: "PATCH",
          dataType: 'json',
          data: info.event.toJSON(),
          success: function (data) {
            show_toast("Event successfully updated")
          },
          error: function (data) {
            show_toast("Could not update Event")
          },
          complete: function (data) {}
        });
        return
    };
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      eventColor: 'white',
      editable: true,
      dayMaxEvents: 3,
      events: function(info, successCallback, failureCallback) {
        var categories_selected = Boolean($('#id_event_category_filter').val()) ? $('#id_event_category_filter').val() : new Array()
        var attendees_selected = Boolean($('#id_attendee_filter').val()) ? $('#id_attendee_filter').val() : new Array()
        var data = Object.assign({}, {
            'calendar': true,
            'start__gt': info.start.toISOString().slice(0,10),
            'start__lt': info.end.toISOString().slice(0,10)
        });
        if (categories_selected.length > 0) {
            data['category'] = categories_selected.map(
                value => encodeURIComponent(value)
            ).join(',')
        };
        if (attendees_selected.length > 0) {
            data['attendees'] = attendees_selected.map(
                value => encodeURIComponent(value)
            ).join(',')
        };
        $.ajax({
            url: "/api/calendar/events/",
            type: "GET",
            async: false,
            data: data,
            success: function (response) {
              events = JSON.parse(response)
              successCallback(events)
            },
            error: function (response) {
              show_toast('Could not retrieve events')
              failureCallback(response)
            }
          });
      },
      contentHeight: 800,
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth,listDay,listWeek,listMonth,listYear'
        },
        buttonText: {
          timeGridDay: 'Day',
          timeGridWeek: 'Week',
          dayGridMonth: 'Month',
          listDay: 'Day List',
          listWeek: 'Week List',
          listMonth: 'Month List',
          listYear: 'Year List'
        },
        selectable: true,
        dateClick: function(info) {
          if (typeof info !== 'undefined') {
            url = 'events/create/'
            search = {
              'start' : info.dateStr,
            }
            open_pop_up(url, search)
            link_start_end_times();
          };
        },
        eventClick: function(info) {
          url = 'events/'+info.event.id+'/update/' // Event 'id' is actually the event.slug, but fullCalendar uses id
          open_pop_up(url)
        },
        eventDrop: function(info) {
          if (typeof info !== 'undefined') {
            eventPatch(info)
          };
        },
      });
    calendar.render();
    $('.select2-nosearch').change(function() {
        calendar.refetchEvents();
    });
}
// ALWAYS ON //
$(document).ready(function() {
    var $csrf_token = getCookie('csrftoken')
    $.ajaxSetup({
      beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", $csrf_token);
      }
    });
    // SET INPUTS
    set_inputs()
    // SET RICH TEXT EDITORS //
//    initialise_rich_text()
    // SET SELECT2 FIELDS //
    initialise_select2()
    // SET COLOURS //
    $('*[data-backgroundcolor]').each(function(){
        this.style.backgroundColor = this.dataset.backgroundcolor
    });
    // COLLAPSIBLE //
    $('button.collapsible').each(function(index) {
        $(this).on('click', function(object) {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            content.classList.toggle("active");
        });
    });
    // CLOSE POPUP FUNTIONALITY //
    window.onclick = function(event) {
      if (event.target == $('#modal-container')[0]) {
        close_pop_up()
      }
    };
    // SUBMIT FEEDBACK FORM //
    $('.submit-feedback').on('click', function(object) {
        open_pop_up('/submit-feedback')
    });
});