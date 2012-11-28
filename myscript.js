if( $('input#BarCode').attr('name') == 'BarCode' ) {

    function update(barcode, vals) {
        chrome.storage.sync.get(barcode, function (items) {
            for(key in vals) {
                items[barcode][key] = vals[key];
            }
            chrome.storage.sync.set(items);
        })
    }

    function cmp(a,b) {
        if (a>b) {
            return 1;
        } else if (a<b) {
            return -1;
        } else {
            return 0;
        }
    }

    function parse_date(d) {
        return d.split(" ")[0].split(".").reverse().join("-");
    }

    // убираем все лишнее
    $('#header_common').remove();
    $('#block_left').remove();
    $('.containermenu').remove();
    $('#block_ma2>div.container7>div[id!="PRINTBODY"]').remove();
    $('#PRINTBODY>table:first').remove();
    $('#PRINTBODY>p:first').remove();
    $('#PRINTBODY>p:first').remove();
    $('#PRINTBODY>p:first').remove();
    $('#PRINTBODY>p:first').remove();
    $('#PRINTBODY>p:first').remove();
    $('#PRINTBODY>h5').remove();
    for(var i=0; i<6; i++) {
        $('#entryBarCode').unwrap();
    }
    $('p>:input').unwrap();
    var main_table = $('form[name="F1"]>table:first>tbody>tr:first');
    main_table.parent().find('table td').appendTo(main_table);
    main_table.parent().find('table').parent().parent().remove();
    main_table.append('<td></td>');
    main_table.find('td:last').append($('input[name="searchbarcode"]').detach());
    $('#lblBrcdErrMsg').parent().parent().detach().find('td').appendTo(main_table);

    // запоминаем результаты поиска
    barcode = $('th:contains("Внутрироссийский почтовый идентификатор:")+td').text();
    if( barcode ) {
        update(barcode, { html:$('.pagetext').html(), upd_date:Date.now() });
        $('h2:contains("Результат поиска:")+table').remove();
        $('h2:contains("Результат поиска:")+br').remove();
        $('h2:contains("Результат поиска:")+table').remove();
        $('h2:contains("Результат поиска:")').remove();
    } else {
        // если информации о посылке нет - все равно запоминаем
        barcode = $('form[name="F1"] input[name="BarCode"]').get()[0].value;
        err_text = 'К сожалению, информация о почтовом отправлении с номером '+barcode+' не найдена.';
        err_tag = $('form[name="F1"]>p.red');
        if( barcode && $(err_tag.filter(':contains("'+err_text+'")') ).text() ) {
            update(barcode, {
                html : '<tr><td>' + err_tag.html() + '</td></tr>',
                upd_date : Date.now()
            });
            $('h2:contains("Результат поиска:")+p.red').remove();
            $('h2:contains("Результат поиска:")').remove();
        }
    }

    // выводим сохраненные результаты
    chrome.storage.sync.get(null, function (items) {
        keys = Object.keys(items).sort(function(a, b) {
            var val_a = $(items[a].html).find('tr:last');
            var val_b = $(items[b].html).find('tr:last');
            var done_a = val_a.find('td:contains("Вручение адресату")').text() ? 1 : 0;
            var done_b = val_b.find('td:contains("Вручение адресату")').text() ? 1 : 0;
            if( cmp(done_a, done_b) != 0 ) {
                return cmp(done_a, done_b);
            } else {
                var date_a = parse_date(val_a.find('td:nth-child(2)').text());
                var date_b = parse_date(val_b.find('td:nth-child(2)').text());
                return cmp(date_a, date_b);
            }
        });
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            $('body').append(
                '<hr><h2><form class="package_meta">&nbsp;&nbsp;&nbsp;'
                + '<a class="BarCodeHeader">' + key + '</a>&nbsp;&nbsp;&nbsp;'
                + '<input type="text" size="100%" value="' + items[key].name + '">'
                + '</form></h2>'
            );
            $('body').append(
                '<div id="block_ma2"><table class="pagetext">' +
                items[key].html + 
                '</table></div>'
            );
        }
        $('form.package_meta>input').css("border", "0px");
        $('form.package_meta>input').css("font-size", "17px");
        $('form.package_meta>input').css("color", "darkblue");
        $('form.package_meta>input[type="text"]').focus(function() {
            $(this).css("color", "black");
        });
        $('form.package_meta').submit(function() {
            update(
                $(this).find('.BarCodeHeader').text().trim(),
                { name : $(this).find('input').get()[0].value }
            );
            $(this).find('input').css("color", "darkblue");
            $(this).find('input').blur();
            return false;
        });
        $('.BarCodeHeader').click(function() {
            $('input[name="BarCode"]').prop('value', $(this).contents().text().trim());
            $('input[name="InputedCaptchaCode"]').get()[0].focus();
        });

    });

}

