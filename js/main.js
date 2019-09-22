(function($) {
  'use strict';

  /*==================================================================
    [ Validate ]*/

  const token = localStorage.getItem('myapp_token');

  if (token) {
    window.location = 'home.html';
  }

  var input = $('.validate-input .input100');

  $('.validate-form').on('submit', function(e) {
    e.preventDefault();
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    if (check) {
      const email = $('input[name="email"]').val();
      const password = $('input[name="pass"]').val();

      login(email, password);
    }
  });

  $('.validate-form .input100').each(function() {
    $(this).focus(function() {
      hideValidate(this);
    });
  });

  function validate(input) {
    const regExpDic = {
      email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/,
      password: /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{6,}$/,
    };

    const regExpName = $(input).attr('data-required');

    if (regExpDic[regExpName]) {
      return regExpDic[regExpName].test($(input).val());
    }

    return true;
  }

  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass('alert-validate');
  }

  function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass('alert-validate');
  }

  async function login(email, password) {
    const url = 'https://mlp-demo.herokuapp.com/api/public/auth/login';
    const data = JSON.stringify({ email, password });
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await $.ajax({
        url,
        data,
        headers,
        method: 'POST',
      });

      localStorage.setItem('myapp_id', response.id);
      localStorage.setItem('myapp_token', response.token);

      window.location = 'home.html';
    } catch (err) {
      console.log(err);
    }
  }
})(jQuery);
