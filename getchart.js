function executeQuery(qcode){
    $.post( "zorbaproxy.php", { query: qcode })
        .done(function( data ) {
            var s = data;
            // preserve newlines, etc - use valid JSON
            s = s.replace(/\\n/g, "\\n")
                .replace(/\\'/g, "\\'")
                .replace(/\\"/g, '\\"')
                .replace(/\\&/g, "\\&")
                .replace(/\\r/g, "\\r")
                .replace(/\\t/g, "\\t")
                .replace(/\\b/g, "\\b")
                .replace(/\\f/g, "\\f");
            // remove non-printable and other non-valid JSON chars
            s = s.replace(/[\u0000-\u0019]+/g,"");

            // $('#tab3link').click();
            try {
                qResult = JSON.parse(s);
                return qResult;
            }
            catch (err){
                return {};
            }

        });
}

function loadQuery(qid, force){




}