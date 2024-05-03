import { faker } from "@faker-js/faker";
import ls from "localstorage-slim";

let id = 0;
export function generateRandomData() {
  return {
    id: id++,
    location: faker.location.city(),
    name: faker.company.name(),
    score: {
      dislikes: faker.number.int({ min: 0, max: 1000 }).toString(),
      likes: faker.number.int({ min: 0, max: 1000 }).toString(),
      score: parseFloat(faker.number.float({ min: 1, max: 5 }).toFixed(2)),
      stars: faker.location.streetAddress(),
    },
    typeOfFood: faker.helpers.arrayElement([
      "british",
      "french",
      "korean",
      "spanish",
      "other",
    ]),
  };
}

export function saveToLocalStorage(key, value) {
  // Merge existing value with new one
  const existingValue = ls.get(key);
  const newValue = { ...existingValue, ...value };
  ls.set(key, newValue);
}

export function getFromLocalStorage(key) {
  return ls.get(key);
}
