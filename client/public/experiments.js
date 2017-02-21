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
    container
        .append($('<div>').attr('id', 'detailed-plot-control'))
        .append($('<div>').attr('id', 'detailed-plot'))
        .append($('<table>')
            .attr('id', 'detailed')
            .addClass('table')
            .append($('<thead>').attr('id', 'detailed-header'))
            .append($('<tbody>').attr('id', 'detailed-body'))
        );
}


function plot(name) {
    console.log($('#detailed-plot-x'));
    var xlabel = $('#detailed-plot-x').find(':selected').text();
    var ylabel = $('#detailed-plot-y').find(':selected').text();

    var log = $('#detailed-plot').data('log');
    var xs = [];
    var ys = [];
    for (var i=0; i<log.rows.length; i++) {
        var row = log.rows[i];
        var x = row[xlabel];
        var y = row[ylabel];
        if (x != null && y != null) {
            xs.push(x);
            ys.push(y);
        }
    }

    console.log(xs);
    console.log(ys);

    var trace = {
        x: xs,
        y: ys,
        type: 'scatter',
        name: ylabel,
    }

    var layout = {
        title: 'Plot for ' + name,
        xaxis: {title: xlabel},
        showlegend: true,
    }

    var plot_div = 'detailed-plot';
    if (plot_div.data == null) {
        Plotly.plot(plot_div, [trace], layout);
    } else {
        Plotly.extendTraces(plot_div, trace);
        Plotly.redraw(plot_div);
    }
}


function get_choice_list(id, label, options, selected) {
    var selection = $('<select>')
        .attr('id', id + '-selected')
        .addClass('form-control')
    for (var i=0; i<options.length; i++) {
        var o = $('<option>').text(options[i]);
        if (i == selected) { o.attr('selected', 'selected'); }
        selection.append(o);
    }
    var list = $('<div>')
        .addClass('form-group')
        .append($('<div>')
            .attr('id', id)
            .addClass('form-group')
            .append($('<label>')
                .addClass('for', id + '-selected')
                .text(label)
            )
            .append(selection)
        );
    return list;
}


function get_detailed_plot_control(name, log) {
    $('#detailed-plot-control')
        .append($('<h2>').text('Experiment ' + name))
        .append($('<form>')
            .addClass('form-inline')
            .append(get_choice_list('detailed-plot-x', 'X axis:', log.header, 0))
            .append(get_choice_list('detailed-plot-y', 'Y axis:', log.header, 1))
            .append($('<a>')
                .addClass('btn')
                .addClass('btn-danger')
                .addClass('pull-right')
                .text('Close')
                .attr('onclick', 'close_experiment()')
            )
            .append($('<a>')
                .addClass('btn')
                .addClass('btn-primary')
                .addClass('pull-right')
                .text('Plot')
                .attr('onclick', 'plot("' + name + '")')
            )

        )
        .append($('<div>').attr('id', 'detailed-plot').data('log', log))
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

    firebase.database().ref('experiments/' + name).once('value').then(function(s) {
        var log = order_log(s.val());
        make_header(header, log.header);
        for (var i=0; i<log.rows.length; i++) {
            body.append(make_row(log.rows[i], log.header));
        }
        table.DataTable();
        get_detailed_plot_control(name, log);
    });
}


function add_experiment_to_list(table, name, size) {
    table.append($('<tr>')
        .append($('<td>').text(name))
        .append($('<td>').text(size))
        .append($('<td>')
            .append($('<a>')
                .addClass('btn')
                .addClass('btn-danger')
                .addClass('pull-right')
                .attr('onclick', 'delete_experiment("' + name + '")')
                .attr('href', '#')
                .text('Delete')
            )
            .append($('<a>')
                .addClass('btn')
                .addClass('btn-primary')
                .addClass('pull-right')
                .attr('onclick', 'show_experiment("' + name + '")')
                .attr('href', '#')
                .text('Show')
            )
        )
    );
}


function delete_experiment(name) {
    firebase.database().ref('experiments/' + name).remove();
    list_experiments();
}


function list_experiments() {
    $('#experiments-header').html('');
    $('#experiments-body').html('');

    firebase.database().ref('experiments').once('value').then(function(s) {
        var table = $('#experiments');
        var header = $('#experiments-header');
        var body = $('#experiments-body');
        make_header(header, ['Name', '# Entries', 'Options']);
        var experiments = s.val();
        for (var name in experiments) {
            add_experiment_to_list(body, name, Object.keys(experiments[name]).length);
        }
        table.DataTable();
    });
}