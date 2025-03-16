import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth, JWT } from "google-auth-library";
function getRandomRgba() {
  const randomInt = (min:number, max:number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  const a = Math.random().toFixed(1); // Genera un número entre 0 y 1 con un decimal

  return `rgba(${r},${g},${b},${a})`;
}

const transformEventData = (eventData: any) => {
  // Obtener todas las fechas únicas
  const uniqueDates = [...new Set(eventData.map((item: any) => item.date))];

  // Crear un mapa para almacenar los datos de cada evento por fecha
  const eventMap: { [eventName: string]: { [date: string]: number } } = {};
  eventData.forEach((item: any) => {
    if (!eventMap[item.eventName]) {
      eventMap[item.eventName] = {};
    }
    eventMap[item.eventName][item.date] = item.eventCount;
  });

  const transformLabel = (label: string) => {
    return label
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Crear los datasets en el formato requerido
  const datasets = Object.keys(eventMap).map((eventName) => {
    const data = uniqueDates.map((date:any) => eventMap[eventName][date] || 0); // Si no hay dato para una fecha, usar 0
    return {
      label: transformLabel(eventName),
      data,
      borderColor: getRandomRgba(),
      fill: false,
    };
  });

  return {
    labels: uniqueDates,
    datasets,
  };
};

const formatDate = (dateString:any) => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
};

const auth = new GoogleAuth({
  keyFile: "./credentials2.json",
  scopes: "https://www.googleapis.com/auth/analytics.readonly",
});

export const fetchAnalyticsData = async (dateRanges:any) => {
  try {
    const authClient = (await auth.getClient()) as JWT;
    const analyticsDataClient = new BetaAnalyticsDataClient({
      authClient,
    });

    const [response1] = await analyticsDataClient.runReport({
      property: `properties/447136305`,
      dimensions: [
        {
          name: "date",
        },
        {
          name: "country",
        }
      ],
      metrics: [
        {
          name: "activeUsers",
        },
        {
          name: "newUsers",
        },
        {
          name: "eventCount",
        },
        
      ],
      dateRanges: [
        dateRanges,
      ],
    });

    const [response2] = await analyticsDataClient.runReport({
      property: `properties/447136305`,
      dimensions: [
          {
              name: "date",
          },
          {
              name: "eventName"
          },
      ],
      metrics: [
          {
              name: "eventCount",
          },
      ],
      dateRanges: [
          dateRanges,
      ],
  });
    
    if (response1.rows && response2.rows) {
      const eventCounts: { [eventName: string]: { [date: string]: number } } = {};
      response2.rows.forEach((row) => {
        const date = row.dimensionValues?.[0].value || "";
        const eventName = row.dimensionValues?.[1].value || "";
        const eventCount = parseInt(row.metricValues?.[0].value || "0", 10);

        if (!eventCounts[eventName]) {
          eventCounts[eventName] = {};
        }

        if (eventCounts[eventName][date]) {
          eventCounts[eventName][date] += eventCount;
        } else {
          eventCounts[eventName][date] = eventCount;
        }
      });

      // Crear el formato de datos para retornar
      const eventData: any = [];
      Object.keys(eventCounts).forEach((eventName) => {
        Object.keys(eventCounts[eventName]).forEach((date) => {
          eventData.push({
            eventName,
            date: formatDate(date),
            eventCount: eventCounts[eventName][date],
          });
        });
      });
      const transformedEventData = transformEventData(eventData);
      const labels = response1.rows.map(row => formatDate(row.dimensionValues?.[0].value) || "");
      const countries = response1.rows.map(row => row.dimensionValues?.[1].value || "");
      const activeUsers = response1.rows.map(row => parseInt(row.metricValues?.[0].value || "0",10));
      const newUsers = response1.rows.map(row => parseInt(row.metricValues?.[1].value || "0",10));
      const eventCount = response1.rows.map(row => row.metricValues?.[2].value || "");
      const countryUserMap: { [key: string]: number } = {};
      countries.forEach((country, index) => {
        if (!countryUserMap[country]) {
          countryUserMap[country] = 0;
        }
        countryUserMap[country] += newUsers[index];
      });

      const geoData = Object.keys(countryUserMap).map(key => ({
        id: key,
        value: countryUserMap[key],
      }));

      return {
        eventData:transformedEventData,
        lineChartData: {
          labels,
          datasets: [
            {
              label: "Active Users",
              data: activeUsers,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
            {
              label: "New Users",
              data: newUsers,
              borderColor: "rgba(153,102,255,1)",
              fill: false,
            },
            {
              label: "Event Count",
              data: eventCount,
              borderColor: "rgba(54,162,235,1)",
              fill: false,
            }
          ],
        },
        geoData,
      };
    } else {
      console.error("No rows returned in the response");
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
};


export function validateBackofficeStoryDetails(storyDetails: any): boolean {
  if (storyDetails && storyDetails["type_of_story"] === "life_story") {
      const requiredProperties = [
          "name",
          "donate",
          "marriage",
          "family_members",
          "funeral_details",
          "military_service",
          "schools_attended",
          "birth_information",
          "death_information",
          "known_social_media",
          "general_notes_section",
      ];
      
      const requiredPrompts = [
          "share_a_memory_life",
          "share_a_memory_person",
          "share_a_memory_working",
          "share_a_memory_other",
      ];

      if (storyDetails["general_info"]) {
          const generalInfoKeys = Object.keys(storyDetails["general_info"]);
          const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
          if (missingProperties.length === 0) {
              if (storyDetails["prompts"]) {
                  const promptKeys = Object.keys(storyDetails["prompts"]);
                  const missingPrompts = requiredPrompts.filter(prompt => !promptKeys.includes(prompt));
                  if (missingPrompts.length === 0) {
                      return true;
                  }
              }
          }
      }
  }
  if (storyDetails && storyDetails["type_of_story"] === "classmates_story") {
      const requiredProperties = [
          "class_purpose",
          "class_information",
          "classmates_involved"
      ];
      
      const requiredPrompts = [
          "share_a_memory_fun",
          "share_a_memory_challenge",
          "share_a_memory_group",
          "share_a_memory_other2"
      ];

      if (storyDetails["general_info"]) {
          const generalInfoKeys = Object.keys(storyDetails["general_info"]);
          const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
          if (missingProperties.length === 0) {
              if (storyDetails["prompts"]) {
                  const promptKeys = Object.keys(storyDetails["prompts"]);
                  const missingPrompts = requiredPrompts.filter(prompt => !promptKeys.includes(prompt));
                  if (missingPrompts.length === 0) {
                      return true;
                  }
              }
          }
      }
  }
  if (storyDetails && storyDetails["type_of_story"] === "teammates_story") {
      const requiredProperties = [
          "teammates_memory",
          "teammates_names",
          "general_notes"
      ];
      
      const requiredPrompts = [
          "share_a_memory_team",
          "share_a_memory_win",
          "share_a_memory_team2",
          "share_a_memory_fan"
      ];

      if (storyDetails["general_info"]) {
          const generalInfoKeys = Object.keys(storyDetails["general_info"]);
          const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
          if (missingProperties.length === 0) {
              if (storyDetails["prompts"]) {
                  const promptKeys = Object.keys(storyDetails["prompts"]);
                  const missingPrompts = requiredPrompts.filter(prompt => !promptKeys.includes(prompt));
                  if (missingPrompts.length === 0) {
                      return true;
                  }
              }
          }
      }
  }
  if (storyDetails && storyDetails["type_of_story"] === "none_of_this_story") {
      const requiredProperties = [
          "name_of_event",
          "location_event",
          "people_involved",
          "general_notes"
      ];
      
      const requiredPrompts = [
          "share_a_memory_other3",
          "share_a_memory_fun2",
          "share_a_memory_challenge2",
          "share_a_memory_other4"
      ];

      if (storyDetails["general_info"]) {
          const generalInfoKeys = Object.keys(storyDetails["general_info"]);
          const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
          if (missingProperties.length === 0) {
              if (storyDetails["prompts"]) {
                  const promptKeys = Object.keys(storyDetails["prompts"]);
                  const missingPrompts = requiredPrompts.filter(prompt => !promptKeys.includes(prompt));
                  if (missingPrompts.length === 0) {
                      return true;
                  }
              }
          }
      }
  }
  const emptyObject = storyDetails && Object.keys(storyDetails).length === 0;
  if (emptyObject) {
      return true;
  }
  return false;
}