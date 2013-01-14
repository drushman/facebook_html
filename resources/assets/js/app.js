$(function() {
  $("input:radio[name='content_type']").click(function() {
    $(".group-hidden").hide();
    $("#form-"+$(this).val()).show();
  });
});
