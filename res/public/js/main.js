$(document).ready(function () {

    $('input[id=lockfile]').change(function() {
        $('#cover').val($(this).val());
    });
});