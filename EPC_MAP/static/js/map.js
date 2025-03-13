function clickZoom(e) {
    map.setView(e.target.getLatLng(), 14);
};
function get_map_objects(filter) {
    $.ajax({
      url: `/api/map/`,
      type: "GET",
      async: false,
      success: function(data){
        var map_data={
            'object_list':data
        }
        clear_map_data();
        add_to_map(map_data)
      },
    });
}
$('#id_filter').on('select2:select', function (event) {
    filter = event.target.value
    $.ajax({
      url: "/api/filters/",
      data: {
          'slug': filter,
          'map': true
      },
      type: "GET",
      async: false,
      success: function(data){
        get_map_objects(data)
        show_toast('Loaded to Map')
      },
    });
});
function add_to_map(map_data) {
    const unique = (value, index, self) => {
        return self.indexOf(value) === index
    }
    var overlay_select = $('#id_map_overlay').value;

    function createicon(color) {
        return new L.divIcon({
                        className: "",
                        iconSize:[20, 20],
                        iconAnchor: [11, 24],
                        labelAnchor: [-6, 0],
                        popupAnchor: [0, -36],
                        html: '<svg width="24px" height="24px" viewBox="0 0 24 24" <g><path fill="'+color+'" stroke="black" stroke-width="1" d="M11.9,1a8.6,8.6,0,0,0-8.6,8.6c0,4.35,7.2,12.05,8.42,13.33a0.24,0.24,0,0,0,.35,0c1.22-1.27,8.42-9,8.42-13.33A8.6,8.6,0,0,0,11.9,1Zm0,11.67A3.07,3.07,0,1,1,15,9.6,3.07,3.07,0,0,1,11.9,12.67Z"/></g></svg>'
                    });
    }
    const legend_labels = [];

    function createmarker(object) {
        legend_labels.push([object.leadstatus_name, object.leadstatus_colour])
        return createicon(object.leadstatus_colour)
    };

    function create_legend(labels) {
        let set  = new Set(legend_labels.map(JSON.stringify));
        let unique_labels = Array.from(set).map(JSON.parse);

        legend = L.control({position: 'topright'});
        legend.onAdd = function (map) {
            if (unique_labels.length > 0) {
            var div = L.DomUtil.create('div', 'legend');
            labels = ['<strong>Categories</strong>'];
            for (var i = 0; i < unique_labels.length; i++) {
                    div.innerHTML +=
                    labels.push(
                        '<span style="background:' + unique_labels[i][1] + '"></span> ' +
                        '<p>' + (unique_labels[i][0] ? unique_labels[i][0] : '+')+'</p>');
                };
            div.innerHTML = labels.join('<br>');
            return div;
            } else {
                return
            };
        };
        legend.addTo(map);
    };

    function get_marker_info(model, object) {
        var text;
        switch (model) {
            case 'companies':
                text =
                `
                <a href='/contacts/companies/${object.company_slug}/'>${object.company_name}</a></br>
                <a href='/contacts/addresses/${object.address_slug}/'>${object.full_address}</a></br>
                RV - ${object.rateable_value}</br>
                `
                break;
            case 'addresses':
                text =
                `
                <a href='/contacts/companies/${object.company_slug}/'>${object.company_name}</a></br>
                <a href='/contacts/addresses/${object.address_slug}/'>${object.full_address}</a></br>
                RV - ${object.rateable_value}</br>
                `
                break;
            case 'summary valuations':
                text =
                `
                <a href='/contacts/companies/${object.company_slug}/'>${object.company_name}</a></br>
                <a href='/contacts/addresses/${object.address_slug}/'>${object.full_address}</a></br>
                RV - ${object.rateable_value}</br>
                `
                break;
            case 'jobs':
                text =
                `
                <a href='/contacts/companies/${object.company_slug}/'>${object.company_name}</a></br>
                <a href='/contacts/addresses/${object.address_slug}/'>${object.full_address}</a></br>
                RV - ${object.rateable_value}</br>
                ${object.jobtype_name}, ${object.jobstatus_name}</br>
                <a href='/backoffice/jobs/${object.job_slug}/'>${object.job_name}</a></br>
                `
                break;
            case 'invoices':
                text =
                `
                <a href='/contacts/companies/${object.company_slug}/'>${object.company_name}</a></br>
                <a href='/contacts/addresses/${object.address_slug}/'>${object.full_address}</a></br>
                RV - ${object.rateable_value}</br>
                ${object.jobtype_name}, ${object.jobstatus_name}</br>
                <a href='/backoffice/jobs/${object.job_slug}/'>${object.job_name}</a></br>
                ${object.payment_status} - ${object.amount_remaining}/${object.total_amount}</br>
                <a href='/backoffice/jobs/${object.job_slug}/invoices/${object.id}/'>View Invoice</a></br>
                `
                break;
            default:
                show_toast('Unrecognised model')
        };
        var marker = L.marker([object.latitude, object.longitude], {icon: createmarker(model, object)}).bindPopup(text)
        return marker
    };
    var markergroup = L.markerClusterGroup();
    for (let object of map_data.object_list) {
        markergroup.addLayer(get_marker_info(map_data.model, object))
    };
    map.addLayer(markergroup);
    if (legend_labels.length > 0) {
        create_legend(legend_labels)
    } else {};
};

function view_selection(e) {
    var ids = []
    var selected = $('.filter_object_select:checkbox:checked').each(function(){
        ids.push($(this).attr("id"))
    })
    return window.location.href = "/"+map_data.app_label+"/"+map_data.model+"/?ids="+ids
}

function clear_map_data(e) {
    try {
        markergroup.clearLayers();
        map.removeControl(legend);
    } catch(err){
    }
};
