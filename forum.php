<!--<script src = "{{ app.request.getBaseURL() ~ '/resources/assets/js/jquery-1.8.3.min.js' }}" ></script>-->
<!--<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>-->
<!--<script src = "{{ app.request.getBaseURL() ~ '/resources/assets/js/app.js' }}" ></script>-->

<div class="box_list_radio">
    <table class="config_select_type">
        <tbody><tr>
            <td id="select_type">Select type</td>
            <td align="left">
                <span><input type="radio" id="form1" name="content_type" value="1">Image</span>
                <span><input type="radio" id="form2" name="content_type" value="2">Html</span>
                <span><input type="radio" id="form3" name="content_type" value="3">Iframe</span>
            </td>
        </tr>
    </tbody></table>
</div>

<!--<div id="form-1" class="group-hidden" style="display:none">
  <form action="#" method="post" {{ form_enctype(image) }}>
      {{ form_widget(image) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>

<div id="form-2" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(html) }}>
      {{ form_widget(html) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>

<div id="form-3" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(iframe) }}>
      {{ form_widget(iframe) }}
      <input type="submit"  name="submit" value="Save changes" />
  </form>
</div>-->




<!--<div id="form-1" class="group-hidden" style="display:none">
  <form action="#" method="post" {{ form_enctype(form_image) }}>
      {{ form_widget(form_image) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>-->

<!--<div id="form-2" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(form_html) }}>
      {{ form_widget(form_html) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>

<div id="form-3" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(form_iframe) }}>
      {{ form_widget(form_iframe) }}
      <input type="submit"  name="submit" value="Save changes" />
  </form>
</div>-->




<div id="form-1" class="group-hidden" style="display:none">
  <form action="#" method="post" {{ form_enctype(form_image) }}>
      {{ form_widget(form_image) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>
  
<div id="form-2" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(form_html) }}>
      {{ form_widget(form_html) }}
      <input type="submit" name="submit" value="Save changes" />
  </form>
</div>
  
<div id="form-3" class="group-hidden" style="display:none">
  <form action="#" class="form-image" method="post" {{ form_enctype(form_iframe) }}>
      {{ form_widget(form_iframe) }}
      <input type="submit"  name="submit" value="Save changes" />
  </form>
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
<script src = "{{ app.request.getBaseURL() ~ '/resources/assets/js/app.js' }}" ></script>


{% if user %}
      <h3>You</h3>
      <img src="https://graph.facebook.com/<?php echo $user; ?>/picture">

      <h3>Your User Object (/me)</h3>
      <pre><?php print_r($user_profile); ?></pre>
    {% else %}
      <strong><em>You are not Connected.</em></strong>
    {% endif %}

    <h3>Public profile of Naitik</h3>
    <img src="https://graph.facebook.com/naitik/picture">
    <?php echo $naitik['name']; ?>
//  $sql = "SELECT * FROM fb_app WHERE id = ?";
//  $result = $app['db']->fetchAll($sql, array('4'));
//  var_dump($result);
//  return $result[0]['html'];
  
$facebook = new Facebook(array(
    'appId'  => '130388247122711',
    'secret' => '992afca98a9b2bda2f9459d9e110f570',
  ));
  
  
  
  