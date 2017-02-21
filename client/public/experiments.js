function make_header(header, labels) {
    var row = $('<tr>');
    for (var i=0; i<labels.length; i++) {
        row.append($('<th>').text(labels[i]));
    }
    header.append(row);
}


function close_experiment() {
    var container = $('#detailed-container');
    container.html('');
    container.append($('<table>')
        .attr('id', 'detailed')
        .addClass('table')
        .append($('<thead>').attr('id', 'detailed-header'))
        .append($('<tbody>').attr('id', 'detailed-body'))
    );
}


function show_experiment(name) {
    var order_log = function(log) {
        var keys = Object.keys(log);
        keys.sort();
        var all_keys = {};
        var rows = [];
        for (var i=0; i<keys.length; i++) {
            var row = log[keys[i]];
            for (var kk in row) {
                all_keys[kk] = true;
            }
            rows.push(row);
        }
        all_keys = Object.keys(all_keys);
        all_keys.sort();
        return {header: all_keys, rows: rows};
    }

    var make_row = function(entry, header) {
        var row = $('<tr>')
        for (var i=0; i<header.length; i++) {
            row.append($('<td>').text(entry[header[i]]));
        }
        return row;
    }

    close_experiment();
    var table = $('#detailed');
    var header = $('#detailed-header');
    var body = $('#detailed-body');
    $('#detailed-container').prepend($('<button>')
        .addClass('btn')
        .addClass('btn-danger')
        .text('Close')
        .attr('onclick', 'close_experiment()')
    );
    console.log('showing experiment ' + name);
    firebase.database().ref('experiments/' + name).once('value').then(function(s) {
        var log = order_log(s.val());
        make_header(header, log.header);
        for (var i=0; i<log.rows.length; i++) {
            body.append(make_row(log.rows[i], log.header));
        }
        table.DataTable();
    });
    console.log(table);
}


function add_experiment_to_list(table, name) {
    table.append($('<tr>')
        .append($('<td>').text(name))
        .append($('<td>')
            .append($('<a>')
                .attr('onclick', 'show_experiment("' + name + '")')
                .attr('href', '#')
                .text('show')
            )
        )
    )
}


function list_experiments() {
    firebase.database().ref('experiments').once('value').then(function(s) {
        var table = $('#experiments');
        var header = $('#experiments-header');
        var body = $('#experiments-body');
        make_header(header, ['Name', 'Open']);
        var experiments = s.val();
        for (var name in experiments) {
            add_experiment_to_list(body, name);
        }
        table.DataTable();
    });
}