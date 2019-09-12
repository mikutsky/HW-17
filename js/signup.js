(function($) {
  //Касс для получения списков для полей <select>
  const locationsURL = "https://aviasales-api.herokuapp.com";
  const valuesStore = {
    countries: (async function() {
      try {
        const response = await $.ajax(`${locationsURL}/countries`, {
          type: "GET"
        });
        console.log(response);
        return response;
      } catch (err) {
        console.log(err);
        return response.reject();
      }
    })().then(v => {
      return v;
    }),
    cities: [],
    days: Array(31)
      .fill()
      .map((_, index) => index + 1),
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    years: Array(30)
      .fill(new Date().getFullYear() - 18)
      .map((value, index) => value - index)
  };
  //   async countries() {
  //     try {
  //       const response = await $.ajax(`${this.url}/countries`);
  //       return response.data;
  //     } catch (err) {
  //       console.log(err);
  //       return Promise.reject(err);
  //     }
  //   }
  //   async cities() {
  //     try {
  //       const response = await this.http.get(`${this.url}/cities`);
  //       return response.data;
  //     } catch (err) {
  //       console.log(err);
  //       return Promise.reject(err);
  //     }
  //   }
  // }

  // valuesStore.countries.then((t)=>console.log(t));
  console.dir(valuesStore.countries);

  // Получить страны
  console.log($(".input100"));

  //Делаем активным Submit, если приняты условия
  $("#i-agree-with").on("click", e => {
    $("#submit-signup")[0].disabled = !e.target.checked;
  });

  // Получить страны
  async function getCountrys() {
    const response = await $.ajax();

    return response;
  }

  // Если договор подписан то Сабмит активен
  // Нажат сабмит проверяем поля -> данные
  // По результатам отправки выводим сообщение что зарегены
})(jQuery);
