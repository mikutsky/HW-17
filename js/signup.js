(function($) {
  // Модуль значений полей
  const valueStore = {
    countries: [],
    cities: [],
    day: [],
    month: [],
    year: [],

    // Метод инициализации списков
    init: async function() {
      // Заполняем дни месяца
      this.day = Array(31)
        .fill()
        .map((_, index) => {
          const codeDayStr = ("0" + (index + 1).toString()).slice(-2);
          const strDay = (index + 1).toString();
          return { code: codeDayStr, name: strDay };
        });
      // Заполняем список месяцев
      this.month = Array(12)
        .fill()
        .map((_, index) => {
          const monthNumStr = ("0" + (index + 1).toString()).slice(-2);
          const newDate = new Date(monthNumStr);
          const monthStrEn = newDate.toLocaleString("en", { month: "long" });
          return { code: monthNumStr, name: monthStrEn };
        });
      // Заполняем список с годами 19хх-2001, для пользователей от 18 до 56 лет
      this.year = Array(40)
        .fill()
        .map((_, index) => {
          const fullYear = new Date().getFullYear() - 18;
          const strYear = (fullYear - index).toString();
          return { code: strYear, name: strYear };
        });
      // Заполняем список городов и стран, использовал PromiseAll - так интереснее
      const args = ["countries", "cities"];
      const promises = args.map(
        request =>
          new Promise((resolve, reject) => {
            try {
              return $.ajax(`https://aviasales-api.herokuapp.com/${request}`, {
                type: "GET",
                success: data => resolve(data)
              });
            } catch (err) {
              return reject(err);
            }
          })
      );
      try {
        const response = await Promise.all(promises).then(value => {
          args.forEach(
            (arg, index) =>
              (this[arg] = value[index]
                .map(value => {
                  // Сразу приводим данные к нужному виду
                  const result = {
                    code: value.code,
                    name: value.name_translations.en
                  };
                  if (value["country_code"])
                    result["country_code"] = value.country_code;
                  return result;
                })
                .sort((AVal, BVal) => AVal.name.localeCompare(BVal.name)))
          );
        });
        return response;
      } catch (err) {
        console.log(err);
        return response.reject();
      }
    },

    // Возвращаем список городов с переданным Кодом страны
    getCitiesByCountryCode: function(code) {
      return this.cities
        .filter(city => city.country_code === code)
        .sort((AVal, BVal) => AVal.name.localeCompare(BVal.name));
    }
  };

  //Модуль работы с интерфейсом
  const ui = {
    passInput: $(`.input100[name="pass"]`),
    repeatPassInput: $(`.input100[name="repeat-pass"]`),
    validateInput: $(`.validate-input .input100`),
    // Метод выдает поля ввода по имени
    elemByName: name => $(`.input100[name="${name.toLowerCase()}"]`)[0],

    // Метод заполняет любой Select, выбранный по имени, указанным списком
    renderSelect: function(selectName, items) {
      if (typeof selectName !== "string" || !Array.isArray(items)) return;

      const anySelect = $(`.input100[name="${selectName}"]`);
      anySelect.empty();

      anySelect.append(`
    <option class="item-hint" value="not-selected" selected>
      ${selectName[0].toUpperCase() + selectName.slice(1).toLowerCase()}...
    </option>`);
      anySelect.addClass("not-selected");

      for (const item of items) {
        anySelect.append(`
        <option class="item-for-select" value="${item.code}">
          ${item.name}
        </option>`);
      }

      return anySelect;
    },

    // Проверка значений полей
    validate: function(input) {
      const regExpDic = {
        email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/,
        password: /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{6,}$/,
        phone: /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/,
        // Любое значение, кроме значения содержащее "not-selected"
        "not-emply-select": /^((?!not-selected).)*$/,
        // Только буквы, одна или более
        abc: /^([a-zA-Zа-яА-Я]+)$/,
        // Первый символ руская, латинская буквы любого регистра или "_",
        // остальные 1 и более символов - буквенно-цифровые, включая русские и "_"
        nickname: /^([a-zA-Zа-яА-Я\_][\wа-яА-Я]+)/,
        "repeat-password": /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{6,}$/
      };

      const regExpName = $(input).attr("data-required");
      // Проверяем значение поля в зависимости от атрибута
      switch (regExpName) {
        case "repeat-password":
          console.log($(input).val() === $(input).val());
        default:
          if (regExpDic[regExpName]) {
            return regExpDic[regExpName].test($(input).val());
          }
      }

      return true;
    },

    // Пометить неверно указанное значение поля
    showValidate: function(input) {
      var thisAlert = $(input).parent();

      $(thisAlert).addClass("alert-validate");
    },

    // Убрать пометку неверно указанное значение поля
    hideValidate: function(input) {
      var thisAlert = $(input).parent();

      $(thisAlert).removeClass("alert-validate");
    }
  };

  // События
  document.addEventListener("DOMContentLoaded", () => {
    initApp();

    //Событие меняет стиль Select-ов, если выбраны данные в них
    $(`select.input100`).on("change", ({ target: anySelect }) => {
      if (anySelect.value === "not-selected")
        $(anySelect).addClass("not-selected");
      else $(anySelect).removeClass("not-selected");
    });

    //Событие при выборе страны, заполняет города
    $(`[name="country"]`).on("change", ({ target: { value } }) => {
      const citySelect = $(`[name="city"]`);
      if (value === "not-selected") {
        ui.renderSelect("city", []);
        citySelect.prop("disabled", true);
      } else {
        //Заполняем список городов
        ui.renderSelect("city", valueStore.getCitiesByCountryCode(value));
        citySelect.prop("disabled", false);
      }
    });

    //Событие "Согласен с условиями" делаем активным Submit, если приняты условия
    $("#i-agree-with").on("click", e => {
      $("#submit-signup")[0].disabled = !e.target.checked;
    });

    //Событие Submit, проверяем введенные значения
    $(".validate-form").on("submit", function(e) {
      e.preventDefault();
      var check = true;

      for (var i = 0; i < ui.validateInput.length; i++) {
        if (ui.validate(ui.validateInput[i]) == false) {
          ui.showValidate(ui.validateInput[i]);
          check = false;
        }
      }

      //Проверка повторно введенного пароля
      if (ui.passInput.val() !== ui.repeatPassInput.val()) {
        ui.showValidate(ui.repeatPassInput);
        check = false;
      }

      if (check) {
        const userData = {
          nickname: ui.elemByName("nick-name").value,
          first_name: ui.elemByName("first-name").value,
          last_name: ui.elemByName("last-name").value,
          date_of_birth_day: ui.elemByName("day").value,
          date_of_birth_month: ui.elemByName("month").value,
          date_of_birth_year: ui.elemByName("year").value,

          city: ui.elemByName("city").selectedOptions[0].text,
          country: ui.elemByName("country").selectedOptions[0].text,

          phone: ui.elemByName("phone").value,
          gender_orientation: ui.elemByName("gender").value,

          email: ui.elemByName("email").value,
          password: ui.elemByName("pass").value
        };

        signUp(userData);
      }
    });

    //Событие убирает пометку о неверном значение если поле было выделено
    $(".validate-form .input100").each(function() {
      $(this).focus(function() {
        ui.hideValidate(this);
      });
    });
  });

  async function initApp() {
    await valueStore.init();
    //Заполняем select-ы
    ui.renderSelect("day", valueStore.day);
    ui.renderSelect("month", valueStore.month);
    ui.renderSelect("year", valueStore.year);
    ui.renderSelect("country", valueStore.countries);
    ui.renderSelect("city", []);
    //Делаем заполненные Select-ы активными
    ui.elemByName("day").disabled = false;
    ui.elemByName("month").disabled = false;
    ui.elemByName("year").disabled = false;
    ui.elemByName("country").disabled = false;
  }

  // Регистрация
  async function signUp(userData) {
    const url = "https://mlp-demo.herokuapp.com/api/public/auth/signup";
    const data = JSON.stringify(userData);
    const headers = {
      "Content-Type": "application/json"
    };

    try {
      const response = await $.ajax({
        url,
        data,
        headers,
        method: "POST"
      });

      if (!response.error) {
        const mainForm = $("form.login100-form");
        mainForm.empty();
        mainForm.append(`<span class="login100-form-subtitle p-b-55">
            ${response.message}
          </span>
          <span class=" p-b-55">
            Please wait, you will be redirected after 5 seconds.
        </span>`);
        setTimeout(() => (window.location = "index.html"), 5000);
      }
    } catch (err) {
      console.log(err);
    }
  }
})(jQuery);
