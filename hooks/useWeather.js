import { useEffect, useState } from 'react';

export default function useWeather(lat, lon) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const API_KEY = 'b358ee41ff33453c97830220250507';

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1`
        );
        const data = await res.json();

        const forecast = data.forecast.forecastday[0].astro;
        const clouds = data.current.cloud;

        setWeather({
          sunrise: forecast.sunrise,
          sunset: forecast.sunset,
          cloud: clouds,
          condition: data.current.condition.text,
          isDay: data.current.is_day === 1,
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return { weather, error };
}


// import { useEffect, useState } from 'react';

// const GYMPIE_COORDS = { lat: -26.1898, lon: 152.6655 };

// export default function useWeather() {
//   const [weather, setWeather] = useState(null);
//   const [error, setError] = useState(null);

//   const API_KEY = 'b358ee41ff33453c97830220250507';

//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         const res = await fetch(
//           `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${GYMPIE_COORDS.lat},${GYMPIE_COORDS.lon}&days=1`
//         );
//         const data = await res.json();

//         const forecast = data.forecast.forecastday[0].astro;
//         const clouds = data.current.cloud;

//         setWeather({
//           sunrise: forecast.sunrise,
//           sunset: forecast.sunset,
//           cloud: clouds,
//           condition: data.current.condition.text,
//           isDay: data.current.is_day === 1,
//         });
//       } catch (err) {
//         console.error('Weather fetch error:', err);
//         setError(err);
//       }
//     };

//     fetchWeather();
//   }, []);

//   return { weather, error };
// }

