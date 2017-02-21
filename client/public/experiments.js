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


function plot() {
    var xlabel = $('#detailed-plot-x').val();
    var ylabel = $('#detailed-plot-y').val();

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
    $('#detailed-container')
        .prepend($('<input>')
            .attr('id', 'detailed-plot-y')
            .attr('placeholder', 'Y'))
            .attr('value', 'score')
        .prepend($('<input>')
            .attr('id', 'detailed-plot-x')
            .attr('placeholder', 'X'))
            .attr('value', 'iteration')
        .prepend($('<button>')
            .addClass('btn')
            .addClass('btn-primary')
            .text('Plot')
            .attr('onclick', 'plot()')
        )
        .prepend($('<button>')
            .addClass('btn')
            .addClass('btn-danger')
            .text('Close')
            .attr('onclick', 'close_experiment()')
        )
        .prepend($('<h2>').text('Experiment ' + name));

    firebase.database().ref('experiments/' + name).once('value').then(function(s) {
        var log = order_log(s.val());
        make_header(header, log.header);
        for (var i=0; i<log.rows.length; i++) {
            body.append(make_row(log.rows[i], log.header));
        }
        table.DataTable();
        $('#detailed-container').append($('<div>').attr('id', 'detailed-plot').data('log', log));
    });
}


function add_experiment_to_list(table, name, size) {
    table.append($('<tr>')
        .append($('<td>').text(name))
        .append($('<td>').text(size))
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
        $('#experiments-container').prepend($('<h2>').text('Experiments'))
        var table = $('#experiments');
        var header = $('#experiments-header');
        var body = $('#experiments-body');
        make_header(header, ['Name', '# Entries', 'Open']);
        var experiments = s.val();
        for (var name in experiments) {
            add_experiment_to_list(body, name, Object.keys(experiments[name]).length);
        }
        table.DataTable();
    });
}